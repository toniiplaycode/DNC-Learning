import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createPayment } from "../../features/payments/paymentsSlice";
import { enrollInCourse } from "../../features/enrollments/enrollmentsApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useAppSelector } from "../../app/hooks";

// Match backend enum values
const PAYMENT_METHOD = {
  E_WALLET: "e_wallet",
  CREDIT_CARD: "credit_card",
  BANK_TRANSFER: "bank_transfer",
  ZALOPAY: "zalopay",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(location.search);
      const status = params.get("status");
      const apptransid = params.get("apptransid");
      const amount = params.get("amount");
      const courseId = params.get("courseId");

      if (!currentUser) {
        toast.error("Bạn cần đăng nhập để hoàn tất thanh toán");
        navigate("/login");
        return;
      }

      if (status === "1" && apptransid && amount && courseId) {
        try {
          // Create payment record with correct enum values
          await dispatch(
            createPayment({
              userId: Number(currentUser.id), // Ensure this is a number
              courseId: parseInt(courseId, 10),
              amount: parseInt(amount, 10),
              paymentMethod: PAYMENT_METHOD.ZALOPAY, // Use correct enum value
              transactionId: apptransid,
              status: PAYMENT_STATUS.COMPLETED, // Use correct enum value
            })
          ).unwrap();

          // Enroll in course
          await dispatch(
            enrollInCourse({
              userId: Number(currentUser.id), // Ensure this is a number
              courseId: parseInt(courseId, 10),
            })
          ).unwrap();

          // Show success message and redirect
          toast.success(
            "Thanh toán thành công! Bạn đã được đăng ký vào khóa học."
          );
          navigate("/");
        } catch (error) {
          console.error("Payment processing error:", error);
          toast.error(
            "Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng liên hệ hỗ trợ."
          );
          navigate("/");
        }
      } else {
        // Payment failed
        toast.error("Thanh toán không thành công hoặc đã bị hủy.");
        navigate("/");
      }
    };

    // Short delay to ensure toasts are ready
    const timer = setTimeout(() => {
      processPayment();
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.search, dispatch, navigate, currentUser]);

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", py: 8 }}>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang xử lý thanh toán...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vui lòng không đóng trang này. Bạn sẽ được chuyển hướng tự động.
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentResult;
