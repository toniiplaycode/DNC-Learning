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
  School,
  Google,
  Facebook,
} from "@mui/icons-material";
import CustomContainer from "../../components/common/CustomContainer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login } from "../../features/auth/authApiSlice";
import { toast, ToastContainer } from "react-toastify";
import { selectCurrentUser } from "../../features/auth/authSelectors";

const InstructorLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (currentUser) {
      navigate("/instructor");
    }
  }, [currentUser]);

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
    dispatch(login(formData)).then((res) => {
      if (res.payload.error) {
        toast.error("Sai email hoặc mật khẩu !");
      }

      if (res.payload.user.role == "instructor") {
        navigate("/instructor");
      }
    });
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
            <School />
            <Typography variant="h5" component="h1">
              Đăng nhập dành cho Giảng viên
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
                  sx={{ py: 1.5 }}
                >
                  Đăng nhập
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                HOẶC
              </Typography>
            </Divider>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                sx={{ py: 1.5 }}
              >
                Đăng nhập với Google
              </Button>
            </Stack>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
