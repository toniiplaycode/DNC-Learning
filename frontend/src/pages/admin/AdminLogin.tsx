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
  Checkbox,
  FormControlLabel,
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
  const [rememberMe, setRememberMe] = useState(false);
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
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <CustomContainer maxWidth="sm">
        <Card
          sx={{
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 3,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AdminPanelSettings />
            <Typography variant="h5" component="h1">
              Đăng nhập Quản trị viên
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 3 }}>
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
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Ghi nhớ đăng nhập"
                  />
                  <Link
                    component={RouterLink}
                    to="/admin/forgot-password"
                    color="primary"
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
                  sx={{ py: 1.5 }}
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

            <Alert severity="info" icon={<Security />} sx={{ mb: 2 }}>
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
