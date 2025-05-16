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
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 8,
            width: "100%",
            backgroundImage: (theme) =>
              `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          }}
        />
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
            sx={{ mb: 5, fontSize: "0.95rem" }}
          >
            Tạo tài khoản để bắt đầu học tập ngay hôm nay
          </Typography>

          {/* Hiển thị thông báo lỗi từ form hoặc từ API */}
          {(formError || error) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  borderRadius: 1.5,
                  py: 1.2,
                  backgroundImage: (theme) =>
                    `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  "&:hover": {
                    backgroundImage: (theme) =>
                      `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    opacity: 0.9,
                  },
                }}
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
            startIcon={
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
            onClick={handleGoogleRegister}
            sx={{
              mb: 3,
              borderRadius: 1.5,
              py: 1.2,
              borderColor: "#dadce0",
              "&:hover": {
                borderColor: "#1a73e8",
                background: "rgba(66, 133, 244, 0.04)",
              },
            }}
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
