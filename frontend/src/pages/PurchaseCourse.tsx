import React, { useState } from "react";
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
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  Assignment,
  Quiz,
  LibraryBooks,
  ArrowBack,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

// Thêm interface cho thông tin ngân hàng
interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
  content: string;
}

const PurchaseCourse = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");

  // Mock data
  const courseData = {
    id: courseId,
    title: "React & TypeScript Masterclass",
    price: 499000,
    originalPrice: 1499000,
    duration: "20 giờ",
    totalLessons: 32,
    features: [
      "Truy cập vĩnh viễn",
      "Chứng chỉ hoàn thành",
      "Bài tập thực hành",
      "Hỗ trợ 1-1 với giảng viên",
      "Cập nhật nội dung miễn phí",
    ],
    paymentMethods: [
      "Thẻ tín dụng/ghi nợ",
      "Chuyển khoản ngân hàng",
      "Ví điện tử",
    ],
  };

  const paymentMethods = [
    {
      id: "momo",
      name: "Ví MoMo",
      logo: "/src/assets/payments/momo.png",
      description: "Thanh toán qua ví điện tử MoMo",
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      logo: "/src/assets/payments/zalopay.png",
      description: "Thanh toán qua ví điện tử ZaloPay",
    },
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      logo: "/src/assets/payments/bank.png",
      description: "Chuyển khoản trực tiếp qua ngân hàng",
    },
    {
      id: "credit",
      name: "Thẻ tín dụng/ghi nợ",
      logo: "/src/assets/payments/credit.png",
      description: "Thanh toán qua thẻ Visa, Mastercard, JCB",
    },
  ];

  // Thêm thông tin ngân hàng
  const bankInfo: BankInfo = {
    bankName: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    accountNumber: "1234567890",
    accountHolder: "CONG TY TNHH EDUCATION",
    branch: "Chi nhánh Hà Nội",
    content: `EDU.${courseId}.${Date.now()}`, // Mã giao dịch unique
  };

  const handlePurchase = () => {
    // Xử lý mua khóa học
    setOpenDialog(true);
  };

  const handleConfirmPurchase = () => {
    // Xử lý xác nhận mua
    navigate(`/course/${courseId}/learn`);
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
              <Typography variant="h5" gutterBottom>
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
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${courseData.duration} học tập`}
                      secondary="Học mọi lúc, mọi nơi"
                    />
                  </ListItem>
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(courseData.originalPrice)}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Chọn phương thức thanh toán:
              </Typography>
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      variant="outlined"
                      sx={{
                        mb: 1,
                        border: selectedPayment === method.id ? 2 : 1,
                        borderColor:
                          selectedPayment === method.id
                            ? "primary.main"
                            : "divider",
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio />}
                        sx={{ m: 0, width: "100%" }}
                        label={
                          <Box sx={{ p: 1, width: "100%" }}>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Avatar
                                src={method.logo}
                                variant="square"
                                sx={{ width: 40, height: 40 }}
                              />
                              <Box>
                                <Typography variant="subtitle2">
                                  {method.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {method.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        }
                      />
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>

              {selectedPayment === "bank" && (
                <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" color="primary">
                      Thông tin chuyển khoản:
                    </Typography>

                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=transfer:${bankInfo.accountNumber}:${bankInfo.content}`}
                        alt="QR Code"
                        style={{ width: 200, height: 200 }}
                      />
                    </Box>

                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ngân hàng:
                        </Typography>
                        <Typography variant="body1">
                          {bankInfo.bankName}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Số tài khoản:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {bankInfo.accountNumber}
                          <Button
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                bankInfo.accountNumber
                              );
                            }}
                          >
                            Sao chép
                          </Button>
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Chủ tài khoản:
                        </Typography>
                        <Typography variant="body1">
                          {bankInfo.accountHolder}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Chi nhánh:
                        </Typography>
                        <Typography variant="body1">
                          {bankInfo.branch}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nội dung chuyển khoản:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {bankInfo.content}
                          <Button
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => {
                              navigator.clipboard.writeText(bankInfo.content);
                            }}
                          >
                            Sao chép
                          </Button>
                        </Typography>
                      </Box>
                    </Stack>

                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Lưu ý:
                        <br />• Vui lòng chuyển khoản đúng số tiền và nội dung
                        để được kích hoạt khóa học tự động
                        <br />• Thời gian xử lý từ 5-15 phút sau khi chuyển
                        khoản thành công
                      </Typography>
                    </Alert>
                  </Stack>
                </Card>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handlePurchase}
                disabled={!selectedPayment}
                sx={{ mt: 3 }}
              >
                {selectedPayment === "bank"
                  ? "Tôi đã chuyển khoản"
                  : "Thanh toán ngay"}
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                Bạn sẽ được chuyển đến trang thanh toán an toàn
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
            }).format(courseData.price)}
            ?
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
