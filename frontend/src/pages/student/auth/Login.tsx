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
import { login } from "../../../features/auth/authApiSlice";
import {
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from "../../../features/auth/authSelectors";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Get auth state from Redux store
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isLoading = status === "loading";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // // Redirect to home if already authenticated
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

  const handleEmailLogin = async () => {
    // Validate input
    if (!formData.email || !formData.password) {
      setFormError("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Vui lòng nhập email hợp lệ");
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }

    const result = await dispatch(
      login({
        email: formData.email,
        password: formData.password,
      })
    );
    console.log("result", result);

    if (result.payload?.message.includes("Bạn đang làm bài trắc nghiệm")) {
      toast.error(
        "Không thể đăng nhập trùng tài khoản khi đang làm bài kiểm tra!"
      );
    } else if (result.payload?.error) {
      toast.error("Sai email hoặc mật khẩu !");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      process.env.REACT_APP_API_URL || "http://localhost:3000"
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
        py: 4,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          mx: 2,
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
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Đăng nhập
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
              Chào mừng bạn quay trở lại!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
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
            <Box sx={{ textAlign: "right" }}>
              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                <Typography color="primary" variant="body2">
                  Quên mật khẩu?
                </Typography>
              </Link>
            </Box>
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={isLoading}
              onClick={handleEmailLogin}
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
                "Đăng nhập"
              )}
            </Button>
          </Stack>

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
            onClick={handleGoogleLogin}
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
            Đăng nhập với Google
          </Button>

          <Typography variant="body2" align="center">
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Typography component="span" color="primary">
                Đăng ký ngay
              </Typography>
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
