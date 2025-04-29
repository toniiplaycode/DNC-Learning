import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  Close,
  Notifications,
  VerifiedUser,
  Settings,
} from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DialogSettingProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

const DialogSetting: React.FC<DialogSettingProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // Cài đặt chung
    isPublished: true,
    allowPreview: true,
    requireCompletion: false,

    // Cài đặt quyền truy cập
    enrollmentDuration: 365, // số ngày
    allowGuestAccess: false,
    expiryAction: "restrict", // restrict, archive

    // Cài đặt thông báo
    notifyOnEnrollment: true,
    notifyOnCompletion: true,
    notifyOnNewContent: true, // Add these new notification settings
    notifyOnNewQuiz: true,
    notifyOnNewAssignment: true,
    notifyOnNewDocument: true,
    reminderFrequency: "weekly",

    // Cài đặt chứng chỉ
    enableCertificate: true,
    certificateTemplate: "default",
    certificateTitle: "",
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Cài đặt khóa học</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="course settings tabs"
          sx={{
            px: 5,
          }}
        >
          <Tab
            icon={<Settings />}
            iconPosition="start"
            label="Chung"
            id="settings-tab-0"
            aria-controls="settings-tabpanel-0"
          />
          <Tab
            icon={<Notifications />}
            iconPosition="start"
            label="Thông báo"
            id="settings-tab-3"
            aria-controls="settings-tabpanel-3"
          />
          <Tab
            icon={<VerifiedUser />}
            iconPosition="start"
            label="Chứng chỉ"
            id="settings-tab-4"
            aria-controls="settings-tabpanel-4"
          />
        </Tabs>
      </Box>
      <DialogContent dividers>
        {/* Cài đặt chung */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.isPublished}
                  onChange={(e) =>
                    handleSettingChange("isPublished", e.target.checked)
                  }
                />
              }
              label="Công khai khóa học"
            />

            <Divider />

            {settings.visibility === "password" && (
              <TextField
                label="Mật khẩu truy cập khóa học"
                type="password"
                fullWidth
                value={settings.password}
                onChange={(e) =>
                  handleSettingChange("password", e.target.value)
                }
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowPreview}
                  onChange={(e) =>
                    handleSettingChange("allowPreview", e.target.checked)
                  }
                />
              }
              label="Cho phép xem trước một số nội dung khóa học"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.requireCompletion}
                  onChange={(e) =>
                    handleSettingChange("requireCompletion", e.target.checked)
                  }
                />
              }
              label="Yêu cầu hoàn thành theo thứ tự"
            />
          </Stack>
        </TabPanel>

        {/* Cài đặt thông báo */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Thông báo cho giảng viên
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnEnrollment}
                  onChange={(e) =>
                    handleSettingChange("notifyOnEnrollment", e.target.checked)
                  }
                />
              }
              label="Thông báo khi có học viên đăng ký mới"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnCompletion}
                  onChange={(e) =>
                    handleSettingChange("notifyOnCompletion", e.target.checked)
                  }
                />
              }
              label="Thông báo khi học viên hoàn thành khóa học"
            />

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Thông báo cho học viên
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnNewContent}
                  onChange={(e) =>
                    handleSettingChange("notifyOnNewContent", e.target.checked)
                  }
                />
              }
              label="Thông báo khi có bài giảng mới"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnNewQuiz}
                  onChange={(e) =>
                    handleSettingChange("notifyOnNewQuiz", e.target.checked)
                  }
                />
              }
              label="Thông báo khi có trắc nghiệm mới"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnNewAssignment}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifyOnNewAssignment",
                      e.target.checked
                    )
                  }
                />
              }
              label="Thông báo khi có bài tập mới"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnNewDocument}
                  onChange={(e) =>
                    handleSettingChange("notifyOnNewDocument", e.target.checked)
                  }
                />
              }
              label="Thông báo khi có tài liệu mới"
            />

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Nhắc nhở học viên
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Tần suất nhắc nhở học viên</InputLabel>
              <Select
                value={settings.reminderFrequency}
                onChange={(e) =>
                  handleSettingChange("reminderFrequency", e.target.value)
                }
                label="Tần suất nhắc nhở học viên"
              >
                <MenuItem value="never">Không nhắc nhở</MenuItem>
                <MenuItem value="daily">Hàng ngày</MenuItem>
                <MenuItem value="weekly">Hàng tuần</MenuItem>
                <MenuItem value="monthly">Hàng tháng</MenuItem>
              </Select>
              <FormHelperText>
                Gửi nhắc nhở cho học viên chưa hoàn thành
              </FormHelperText>
            </FormControl>
          </Stack>
        </TabPanel>

        {/* Cài đặt chứng chỉ */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableCertificate}
                  onChange={(e) =>
                    handleSettingChange("enableCertificate", e.target.checked)
                  }
                />
              }
              label="Cấp chứng chỉ khi hoàn thành"
            />

            {settings.enableCertificate && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Mẫu chứng chỉ</InputLabel>
                  <Select
                    value={settings.certificateTemplate}
                    onChange={(e) =>
                      handleSettingChange("certificateTemplate", e.target.value)
                    }
                    label="Mẫu chứng chỉ"
                  >
                    <MenuItem value="default">Mẫu mặc định</MenuItem>
                    <MenuItem value="professional">Mẫu chuyên nghiệp</MenuItem>
                    <MenuItem value="modern">Mẫu hiện đại</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Tiêu đề chứng chỉ (để trống sẽ dùng tên khóa học)"
                  fullWidth
                  value={settings.certificateTitle}
                  onChange={(e) =>
                    handleSettingChange("certificateTitle", e.target.value)
                  }
                />
              </>
            )}
          </Stack>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave}>
          Lưu cài đặt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogSetting;
