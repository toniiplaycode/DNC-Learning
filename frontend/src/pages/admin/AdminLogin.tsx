import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Security,
} from "@mui/icons-material";
import CustomContainer from "../../components/common/CustomContainer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login, logout } from "../../features/auth/authApiSlice";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../../features/auth/authSelectors";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    // Nếu đã đăng nhập và là admin thì chuyển đến dashboard
    if (currentUser?.role === "admin") {
      navigate("/admin");
      return;
    }

    // Nếu đã đăng nhập nhưng không phải admin thì logout
    if (currentUser && currentUser.role !== "admin") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());
    }
  }, [currentUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setLoginError(null);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const result = await dispatch(login(formData)).unwrap();

      if (result.error) {
        toast.error("Sai email hoặc mật khẩu!");
        return;
      }

      if (result.user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Tài khoản không có quyền truy cập!");
        return;
      }

      // Nếu là admin thì chuyển đến dashboard
      navigate("/admin");
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <CustomContainer maxWidth="sm">
        <Card
          sx={{
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: "rgba(255, 255, 255, 0.97)",
            backdropFilter: "blur(15px)",
            maxWidth: 450,
            width: "100%",
            mx: "auto",
          }}
        >
          <Box
            sx={{
              height: 6,
              width: "100%",
              backgroundImage: "linear-gradient(to right, #d32f2f, #f44336)",
            }}
          />

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <AdminPanelSettings
                color="error"
                sx={{
                  fontSize: 64,
                  p: 1.5,
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                  borderRadius: "50%",
                  mb: 2,
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                sx={{ color: "error.main" }}
              >
                Đăng nhập Quản trị viên
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Truy cập vào hệ thống quản lý cao cấp
              </Typography>
            </Box>

            {loginError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Nhập email của bạn"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
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
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu của bạn"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          aria-label="toggle password visibility"
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

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Link
                    component={RouterLink}
                    to="/admin/forgot-password"
                    color="error"
                  >
                    Quên mật khẩu?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  color="error"
                  sx={{
                    py: 1.5,
                    borderRadius: 1.5,
                    backgroundImage:
                      "linear-gradient(to right, #d32f2f, #f44336)",
                    "&:hover": {
                      backgroundImage:
                        "linear-gradient(to right, #c62828, #e53935)",
                    },
                  }}
                >
                  Đăng nhập
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                THÔNG TIN BẢO MẬT
              </Typography>
            </Divider>

            <Alert
              severity="info"
              icon={<Security />}
              sx={{ mb: 2, borderRadius: 1.5 }}
              variant="outlined"
            >
              <Typography variant="body2">
                Khu vực này chỉ dành cho quản trị viên. Mọi hành động đều được
                ghi nhận và theo dõi để đảm bảo an toàn hệ thống.
              </Typography>
            </Alert>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                <Link component={RouterLink} to="/" color="primary">
                  Quay lại trang chủ
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/instructor/login"
                  color="primary"
                >
                  Đăng nhập với tài khoản giảng viên
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </CustomContainer>
    </Box>
  );
};

export default AdminLogin;
