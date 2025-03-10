import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Edit,
  PhotoCamera,
  Notifications,
  Security,
  Language,
  Email,
} from "@mui/icons-material";

const InstructorSettings = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: "vi",
    twoFactorAuth: false,
  });

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Cài đặt tài khoản
      </Typography>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cập nhật thành công!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cá nhân
            </Typography>
            <form onSubmit={handleSaveProfile}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src="/src/assets/avatar.png"
                    sx={{ width: 100, height: 100 }}
                  />
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                    >
                      Thay đổi ảnh
                      <input type="file" hidden accept="image/*" />
                    </Button>
                    <Typography variant="caption" display="block" mt={1}>
                      Cho phép PNG, JPG. Kích thước tối đa 1MB
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      defaultValue="Nguyễn Văn A"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      defaultValue="nguyenvana@example.com"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      defaultValue="0987654321"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Chức danh"
                      defaultValue="Giảng viên"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Giới thiệu"
                      multiline
                      rows={4}
                      defaultValue="Giảng viên với hơn 5 năm kinh nghiệm trong lĩnh vực web development..."
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button type="submit" variant="contained">
                    Lưu thay đổi
                  </Button>
                </Box>
              </Stack>
            </form>
          </Card>
        </Grid>

        {/* Cài đặt khác */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Thông báo */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Notifications color="primary" />
                  <Typography variant="h6">Thông báo</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Email thông báo"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pushNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Thông báo đẩy"
                />
              </Stack>
            </Card>

            {/* Bảo mật */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Security color="primary" />
                  <Typography variant="h6">Bảo mật</Typography>
                </Box>
                <Button variant="outlined" fullWidth>
                  Đổi mật khẩu
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          twoFactorAuth: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Xác thực 2 lớp"
                />
              </Stack>
            </Card>

            {/* Ngôn ngữ */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Language color="primary" />
                  <Typography variant="h6">Ngôn ngữ</Typography>
                </Box>
                <TextField
                  select
                  fullWidth
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </TextField>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstructorSettings;
