import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  Assignment,
  Quiz,
  LibraryBooks,
  ArrowBack,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseById } from "../../features/courses/coursesApiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCourseById } from "../../features/courses/coursesSelector";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  enrollInCourse,
  fetchUserEnrollments,
} from "../../features/enrollments/enrollmentsApiSlice";
import { toast } from "react-toastify";
import { createNotification } from "../../features/notifications/notificationsSlice";
import {
  createZaloPayOrder,
  PaymentMethod,
} from "../../features/payments/paymentsSlice";
import {
  selectZaloPayOrder,
  selectPaymentsStatus,
  selectPaymentsError,
} from "../../features/payments/paymentsSelectors";

const PurchaseCourse = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const currentCourse = useAppSelector(selectCourseById);
  const currentUser = useAppSelector(selectCurrentUser);
  const zaloPayOrder = useAppSelector(selectZaloPayOrder);
  const paymentStatus = useAppSelector(selectPaymentsStatus);
  const paymentError = useAppSelector(selectPaymentsError);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(Number(courseId)));
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (zaloPayOrder && zaloPayOrder.return_code === 1 && !redirecting) {
      setRedirecting(true);
      window.location.href = zaloPayOrder.order_url;
    }
  }, [zaloPayOrder, redirecting]);

  // Tính tổng số bài học và thời lượng từ dữ liệu thực
  const calculateCourseStats = () => {
    if (!currentCourse) return { totalLessons: 0, duration: 0 };

    let totalLessons = 0;
    let totalDuration = 0;

    currentCourse.sections?.forEach((section) => {
      totalLessons += section.lessons?.length || 0;

      section.lessons?.forEach((lesson) => {
        if (lesson.duration) {
          totalDuration += lesson.duration;
        }
      });
    });

    return {
      totalLessons,
      duration: totalDuration,
    };
  };

  const { totalLessons, duration } = calculateCourseStats();

  // Tạo dữ liệu khóa học từ data API và một số dữ liệu mặc định
  const courseData = {
    id: courseId,
    title: currentCourse?.title || "Khóa học",
    price: currentCourse?.price || 0,
    totalLessons: totalLessons || 32,
    features: [
      "Truy cập vĩnh viễn",
      "Chứng chỉ hoàn thành",
      "Bài tập thực hành",
      "Hỗ trợ 1-1 với giảng viên",
      "Cập nhật nội dung miễn phí",
    ],
    level: currentCourse?.level || "beginner",
    category: currentCourse?.category?.name || "Khóa học",
    instructor: currentCourse?.instructor?.fullName || "Giảng viên",
    thumbnailUrl: currentCourse?.thumbnailUrl || "/src/assets/logo.png",
    description: currentCourse?.description || "Mô tả khóa học",
    required: currentCourse?.required || "Yêu cầu khóa học",
    learned: currentCourse?.learned || "Những gì bạn sẽ học được",
  };

  const handlePurchase = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!courseId || !currentCourse) return;

    setOpenDialog(true);
  };

  const handleConfirmPurchase = () => {
    dispatch(
      createZaloPayOrder({
        courseId: Number(courseId),
        amount: currentCourse?.price || 0,
        description: `Thanh toán khóa học: ${
          currentCourse?.title || `#${courseId}`
        }`,
      })
    );
    setOpenDialog(false);
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === "loading") {
      return <Alert severity="info">Đang xử lý thanh toán...</Alert>;
    }

    if (paymentError) {
      return <Alert severity="error">Lỗi: {paymentError}</Alert>;
    }

    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/course/${courseId}`)}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      <Grid container spacing={3}>
        {/* Thông tin khóa học */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {courseData.title}
              </Typography>

              <Alert severity="info" sx={{ my: 2 }}>
                Sau khi mua khóa học, bạn sẽ có quyền truy cập vào tất cả nội
                dung của khóa học.
              </Alert>

              <Stack spacing={2}>
                <Typography variant="h6">Bao gồm:</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LibraryBooks />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${courseData.totalLessons} bài học`}
                      secondary="Video, bài đọc và tài liệu"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bài tập thực hành"
                      secondary="Củng cố kiến thức qua thực hành"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Quiz />
                    </ListItemIcon>
                    <ListItemText
                      primary="Kiểm tra đánh giá"
                      secondary="Đánh giá và chứng nhận năng lực"
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Đặc quyền:
                  </Typography>
                  <List>
                    {courseData.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Thanh toán */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: "sticky", top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng thanh toán
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(courseData.price)}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Phương thức thanh toán:
              </Typography>
              <Card
                variant="outlined"
                sx={{
                  mb: 3,
                  p: 2,
                  border: 2,
                  borderColor: "primary.main",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src="/src/assets/payments/zalopay.png"
                    variant="square"
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="subtitle2">ZaloPay</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thanh toán qua ví điện tử ZaloPay
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {renderPaymentStatus()}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handlePurchase}
                disabled={paymentStatus === "loading" || redirecting}
                sx={{ mt: 3 }}
              >
                {redirecting ? "Đang chuyển hướng..." : "Thanh toán ngay"}
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                Bạn sẽ được chuyển đến trang thanh toán ZaloPay
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog xác nhận */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Xác nhận mua khóa học</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn mua khóa học "{courseData.title}" với giá{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(courseData.price)}{" "}
            qua ZaloPay?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleConfirmPurchase}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PurchaseCourse;
