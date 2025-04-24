import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Tabs,
  Tab,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  InputAdornment,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Settings,
  Notifications,
  Security,
  Language,
  Email,
  Payment,
  Save,
  VerifiedUser,
  Delete,
  Add,
  Info,
  School,
  MenuBook,
  DarkMode,
  LightMode,
  Refresh,
  CloudUpload,
  Check,
  Mail,
  Telegram,
  Facebook,
} from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    "aria-controls": `settings-tabpanel-${index}`,
  };
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Cài đặt chung
  const [siteName, setSiteName] = useState("E-Learning Platform");
  const [siteDescription, setSiteDescription] = useState(
    "Nền tảng học trực tuyến và quản lý đào tạo"
  );
  const [language, setLanguage] = useState("vi");
  const [darkMode, setDarkMode] = useState(false);
  const [maintainanceMode, setMaintainanceMode] = useState(false);

  // Cài đặt thông báo
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Cài đặt bảo mật
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState("medium");
  const [sessionTimeout, setSessionTimeout] = useState("30");

  // Cài đặt thanh toán
  const [paymentGateways, setPaymentGateways] = useState([
    { id: 1, name: "VNPay", active: true },
    { id: 2, name: "Momo", active: true },
    { id: 3, name: "Chuyển khoản ngân hàng", active: true },
    { id: 4, name: "PayPal", active: false },
  ]);

  // Cài đặt email
  const [emailFrom, setEmailFrom] = useState("support@elearning.com");
  const [emailService, setEmailService] = useState("smtp");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("support@elearning.com");
  const [smtpPassword, setSmtpPassword] = useState("******");

  // Mạng xã hội
  const [socialLinks, setSocialLinks] = useState([
    {
      id: 1,
      platform: "Facebook",
      url: "https://facebook.com/elearning",
      active: true,
    },
    {
      id: 2,
      platform: "Youtube",
      url: "https://youtube.com/elearning",
      active: true,
    },
    { id: 3, platform: "Instagram", url: "", active: false },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const saveSettings = () => {
    // Thực hiện lưu cài đặt vào CSDL hoặc API
    setSnackbarMessage("Đã lưu cài đặt thành công!");
    setSnackbarOpen(true);
  };

  const testEmailSettings = () => {
    // Thực hiện gửi email thử nghiệm
    setSnackbarMessage("Đã gửi email thử nghiệm!");
    setSnackbarOpen(true);
  };

  const togglePaymentGateway = (id: number) => {
    setPaymentGateways(
      paymentGateways.map((gateway) =>
        gateway.id === id ? { ...gateway, active: !gateway.active } : gateway
      )
    );
  };

  const toggleSocialLink = (id: number) => {
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === id ? { ...gateway, active: !gateway.active } : gateway
      )
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cài đặt hệ thống
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab
              icon={<Settings fontSize="small" />}
              label="Chung"
              {...a11yProps(0)}
            />
            <Tab
              icon={<Notifications fontSize="small" />}
              label="Thông báo"
              {...a11yProps(1)}
            />
            <Tab
              icon={<Security fontSize="small" />}
              label="Bảo mật"
              {...a11yProps(2)}
            />
            <Tab
              icon={<Payment fontSize="small" />}
              label="Thanh toán"
              {...a11yProps(3)}
            />
            <Tab
              icon={<Email fontSize="small" />}
              label="Email"
              {...a11yProps(4)}
            />
            <Tab
              icon={<Language fontSize="small" />}
              label="Mạng xã hội"
              {...a11yProps(5)}
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* Cài đặt chung */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên trang web"
                  variant="outlined"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Mô tả trang web"
                  variant="outlined"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Ngôn ngữ mặc định</InputLabel>
                  <Select
                    value={language}
                    label="Ngôn ngữ mặc định"
                    onChange={(e) => setLanguage(e.target.value as string)}
                  >
                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                    <MenuItem value="en">Tiếng Anh</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Giao diện người dùng
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {darkMode ? (
                          <DarkMode sx={{ mr: 1 }} fontSize="small" />
                        ) : (
                          <LightMode sx={{ mr: 1 }} fontSize="small" />
                        )}
                        <Typography>
                          {darkMode ? "Chế độ tối" : "Chế độ sáng"}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Bảo trì hệ thống
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintainanceMode}
                        onChange={(e) => setMaintainanceMode(e.target.checked)}
                      />
                    }
                    label="Bật chế độ bảo trì"
                  />

                  {maintainanceMode && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Khi bật chế độ bảo trì, người dùng sẽ không thể truy cập
                      vào hệ thống.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Cài đặt thông báo */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Kênh thông báo
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Thông báo qua email"
                      secondary="Gửi thông báo đến email người dùng"
                    />
                    <Switch
                      edge="end"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  </ListItem>

                  <Divider variant="inset" component="li" />

                  <ListItem>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary="Thông báo đẩy"
                      secondary="Hiển thị thông báo trong ứng dụng"
                    />
                    <Switch
                      edge="end"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                    />
                  </ListItem>

                  <Divider variant="inset" component="li" />

                  <ListItem>
                    <ListItemIcon>
                      <Mail />
                    </ListItemIcon>
                    <ListItemText
                      primary="Thông báo qua SMS"
                      secondary="Gửi tin nhắn SMS đến số điện thoại người dùng"
                    />
                    <Switch
                      edge="end"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Sự kiện thông báo
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Chọn các sự kiện sẽ gửi thông báo đến người dùng
                </Alert>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Thông báo khi có bài giảng mới"
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Thông báo khi giảng viên phản hồi"
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Thông báo khi có Bài trắc nghiệm"
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Thông báo khi có khóa học mới"
                  />

                  <FormControlLabel
                    control={<Switch />}
                    label="Thông báo khi có khuyến mãi"
                  />
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Cài đặt bảo mật */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Xác thực
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <VerifiedUser sx={{ mr: 1 }} fontSize="small" />
                        <Typography>Xác thực hai yếu tố</Typography>
                      </Box>
                    }
                  />

                  {twoFactorAuth && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Khi bật xác thực hai yếu tố, người dùng sẽ cần nhập mã xác
                      minh khi đăng nhập.
                    </Alert>
                  )}
                </Paper>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Chính sách mật khẩu</InputLabel>
                  <Select
                    value={passwordPolicy}
                    label="Chính sách mật khẩu"
                    onChange={(e) => setPasswordPolicy(e.target.value)}
                  >
                    <MenuItem value="low">Cơ bản (ít nhất 6 ký tự)</MenuItem>
                    <MenuItem value="medium">
                      Trung bình (ít nhất 8 ký tự, có chữ và số)
                    </MenuItem>
                    <MenuItem value="high">
                      Mạnh (ít nhất 10 ký tự, có chữ, số và ký tự đặc biệt)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Phiên đăng nhập
                </Typography>

                <TextField
                  fullWidth
                  label="Thời gian phiên (phút)"
                  type="number"
                  variant="outlined"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  margin="normal"
                  helperText="Thời gian tự động đăng xuất sau khi không hoạt động"
                />

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Refresh />}
                  >
                    Đăng xuất tất cả phiên
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Cài đặt thanh toán */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Cổng thanh toán
                </Typography>

                <List>
                  {paymentGateways.map((gateway) => (
                    <React.Fragment key={gateway.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Payment />
                        </ListItemIcon>
                        <ListItemText
                          primary={gateway.name}
                          secondary={
                            gateway.active ? "Đang hoạt động" : "Đã tắt"
                          }
                        />
                        <Switch
                          edge="end"
                          checked={gateway.active}
                          onChange={() => togglePaymentGateway(gateway.id)}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>

                <Button variant="outlined" startIcon={<Add />} sx={{ mt: 2 }}>
                  Thêm cổng thanh toán mới
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Cài đặt thanh toán
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Đơn vị tiền tệ</InputLabel>
                  <Select defaultValue="VND" label="Đơn vị tiền tệ">
                    <MenuItem value="VND">VND - Việt Nam Đồng</MenuItem>
                    <MenuItem value="USD">USD - Đô la Mỹ</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Định dạng số tiền"
                  defaultValue="#,##0 ₫"
                  margin="normal"
                  helperText="Định dạng hiển thị số tiền"
                />

                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Tự động xuất hóa đơn sau khi thanh toán"
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Cài đặt email */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Cấu hình SMTP
                </Typography>

                <TextField
                  fullWidth
                  label="Email gửi"
                  variant="outlined"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  margin="normal"
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Dịch vụ email</InputLabel>
                  <Select
                    value={emailService}
                    label="Dịch vụ email"
                    onChange={(e) => setEmailService(e.target.value)}
                  >
                    <MenuItem value="smtp">SMTP</MenuItem>
                    <MenuItem value="sendgrid">SendGrid</MenuItem>
                    <MenuItem value="mailchimp">Mailchimp</MenuItem>
                  </Select>
                </FormControl>

                {emailService === "smtp" && (
                  <>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      variant="outlined"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      margin="normal"
                    />

                    <TextField
                      fullWidth
                      label="SMTP Port"
                      variant="outlined"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      margin="normal"
                    />

                    <TextField
                      fullWidth
                      label="SMTP Username"
                      variant="outlined"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                      margin="normal"
                    />

                    <TextField
                      fullWidth
                      label="SMTP Password"
                      type="password"
                      variant="outlined"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      margin="normal"
                    />
                  </>
                )}

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={testEmailSettings}
                    startIcon={<Mail />}
                  >
                    Gửi email thử nghiệm
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Mẫu email
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Tùy chỉnh các mẫu email được gửi đến người dùng
                </Alert>

                <List>
                  <ListItem button>
                    <ListItemText
                      primary="Email chào mừng"
                      secondary="Gửi khi người dùng đăng ký tài khoản"
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem button>
                    <ListItemText
                      primary="Xác nhận đăng ký khóa học"
                      secondary="Gửi khi người dùng đăng ký khóa học mới"
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem button>
                    <ListItemText
                      primary="Xác nhận thanh toán"
                      secondary="Gửi khi người dùng hoàn tất thanh toán"
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem button>
                    <ListItemText
                      primary="Khôi phục mật khẩu"
                      secondary="Gửi khi người dùng yêu cầu đặt lại mật khẩu"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Cài đặt mạng xã hội */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Kết nối mạng xã hội
                </Typography>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">Facebook</Typography>
                      <TextField
                        fullWidth
                        placeholder="URL Facebook Page"
                        value="https://facebook.com/elearning"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Facebook />
                            </InputAdornment>
                          ),
                        }}
                        margin="normal"
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2">Youtube</Typography>
                      <TextField
                        fullWidth
                        placeholder="URL kênh Youtube"
                        value="https://youtube.com/elearning"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <School />
                            </InputAdornment>
                          ),
                        }}
                        margin="normal"
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2">Telegram</Typography>
                      <TextField
                        fullWidth
                        placeholder="URL Telegram"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Telegram />
                            </InputAdornment>
                          ),
                        }}
                        margin="normal"
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Đăng nhập bằng mạng xã hội
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Facebook />
                    </ListItemIcon>
                    <ListItemText
                      primary="Đăng nhập bằng Facebook"
                      secondary="Cho phép người dùng đăng nhập bằng tài khoản Facebook"
                    />
                    <Switch defaultChecked />
                  </ListItem>

                  <Divider variant="inset" component="li" />

                  <ListItem>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText
                      primary="Đăng nhập bằng Google"
                      secondary="Cho phép người dùng đăng nhập bằng tài khoản Google"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                </List>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Chia sẻ mạng xã hội
                  </Typography>

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Cho phép chia sẻ bài học lên mạng xã hội"
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Cho phép chia sẻ chứng chỉ lên mạng xã hội"
                  />
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>

        <Divider />

        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={saveSettings}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default AdminSettings;
