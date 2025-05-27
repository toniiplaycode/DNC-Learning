import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
} from "@mui/icons-material";
import CustomContainer from "../../components/common/CustomContainer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login, logout } from "../../features/auth/authApiSlice";
import { toast, ToastContainer } from "react-toastify";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { fetchUsersByInstructorId } from "../../features/users/usersApiSlice";
import { setCredentials } from "../../features/auth/authSlice";

const InstructorLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra xem có phải admin đang impersonate không
        const isAdminImpersonating =
          localStorage.getItem("adminImpersonating") === "true";
        const impersonatedInstructorId = localStorage.getItem(
          "impersonatedInstructorId"
        );

        if (isAdminImpersonating && impersonatedInstructorId) {
          // Tạo một mock user cho instructor khi admin impersonate
          const result = await dispatch(
            fetchUsersByInstructorId(parseInt(impersonatedInstructorId))
          ).unwrap();

          // Set credentials in Redux store
          dispatch(
            setCredentials({
              user: result,
              accessToken: localStorage.getItem("token") || "",
            })
          );

          // Set user in localStorage
          localStorage.setItem("user", JSON.stringify(result));

          // Chuyển hướng đến trang instructor
          navigate("/instructor");
          return;
        }

        if (currentUser) {
          if (currentUser.role === "instructor") {
            navigate("/instructor");
            return;
          } else {
            dispatch(logout());
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [currentUser, navigate, dispatch]);

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

      if (result.user.role !== "instructor") {
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Tài khoản không có quyền truy cập!");
        return;
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
        py: 4,
      }}
    >
      <CustomContainer
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Card
          sx={{
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
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
              backgroundImage: (theme) =>
                `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            }}
          />

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <School
                color="primary"
                sx={{
                  fontSize: 64,
                  p: 1.5,
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  borderRadius: "50%",
                  mb: 2,
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                sx={{ color: "primary.main" }}
              >
                Đăng nhập dành cho Giảng viên
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Truy cập vào hệ thống quản lý của giảng viên
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
                    to="/instructor/forgot-password"
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
                  sx={{
                    py: 1.5,
                    borderRadius: 1.5,
                    backgroundImage: (theme) =>
                      `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    "&:hover": {
                      backgroundImage: (theme) =>
                        `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      opacity: 0.9,
                    },
                  }}
                >
                  Đăng nhập
                </Button>
              </Stack>
            </form>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                <Link component={RouterLink} to="/login" color="primary">
                  Đăng nhập với tài khoản học viên
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </CustomContainer>
    </Box>
  );
};

export default InstructorLogin;
