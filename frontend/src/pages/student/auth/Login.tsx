import React, { useState } from "react";
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
  Tab,
  Tabs,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
  Email,
  Phone,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </Box>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý đăng nhập bằng email
    console.log("Email login:", formData.email, formData.password);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý đăng nhập bằng số điện thoại
    console.log("Phone login:", formData.phone, formData.password);
  };

  const handleGoogleLogin = async () => {
    // Xử lý đăng nhập bằng Google
    console.log("Google login");
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

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              icon={<Email sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Email"
            />
            <Tab
              icon={<Phone sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Số điện thoại"
            />
          </Tabs>

          {/* Email Login Form */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={handleEmailLogin}>
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
                  <Link
                    to="/forgot-password"
                    style={{ textDecoration: "none" }}
                  >
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
                >
                  Đăng nhập
                </Button>
              </Stack>
            </form>
          </TabPanel>

          {/* Phone Login Form */}
          <TabPanel value={activeTab} index={1}>
            <form onSubmit={handlePhoneLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={formData.phone}
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
                  <Link
                    to="/forgot-password"
                    style={{ textDecoration: "none" }}
                  >
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
                >
                  Đăng nhập
                </Button>
              </Stack>
            </form>
          </TabPanel>

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
