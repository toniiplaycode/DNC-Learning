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

    if (result.payload.error) {
      toast.error("Sai email hoặc mật khẩu !");
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Google login - chức năng chưa được triển khai");
    toast.info("Đăng nhập bằng Google chưa được triển khai");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        py: 4,
      }}
    >
      <ToastContainer position="top-right" autoClose={5000} />
      <Card sx={{ maxWidth: 480, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Đăng nhập
            </Typography>
            <Typography color="text.secondary">
              Chào mừng bạn quay trở lại!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mb: 3 }}
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
