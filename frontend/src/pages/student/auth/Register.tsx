import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { registerStudent } from "../../../features/auth/authApiSlice";
import {
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from "../../../features/auth/authSelectors";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Lấy trạng thái từ Redux store
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isLoading = status === "loading";

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Nếu đã đăng nhập, chuyển hướng đến trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setFormError("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới");
      toast.error("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setFormError("Mật khẩu phải có ít nhất 6 ký tự");
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setFormError("Mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Email không đúng định dạng");
      toast.error("Email không đúng định dạng");
      return;
    }

    try {
      // Dispatch action đăng ký
      await dispatch(
        registerStudent({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        })
      ).unwrap();

      // Hiển thị thông báo thành công
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      // Nếu thành công, navigate sẽ được xử lý bởi useEffect
    } catch (err) {
      // Lỗi sẽ được xử lý bởi Redux và hiển thị từ selectAuthError
      console.error("Registration failed:", err);
      toast.error(error || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${
      process.env.REACT_APP_API_URL || "http://127.0.0.1:3000"
    }/auth/google`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: "100%" }}>
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h5"
            fontWeight={"bold"}
            component="h1"
            align="center"
            gutterBottom
          >
            Đăng ký tài khoản
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 5 }}
          >
            Tạo tài khoản để bắt đầu học tập ngay hôm nay
          </Typography>

          {/* Hiển thị thông báo lỗi từ form hoặc từ API */}
          {(formError || error) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError || error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </Stack>
          </form>

          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography
                variant="body2"
                sx={{ px: 2, color: "text.secondary" }}
              >
                HOẶC
              </Typography>
            </Divider>
          </Box>

          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleRegister}
            sx={{ mb: 3 }}
          >
            Đăng ký với Google
          </Button>

          <Typography variant="body2" align="center">
            Đã có tài khoản?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography component="span" color="primary">
                Đăng nhập
              </Typography>
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
