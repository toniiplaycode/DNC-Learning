import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Avatar,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Close, PhotoCamera, Save } from "@mui/icons-material";

interface DialogAddInstructorProps {
  open: boolean;
  onClose: () => void;
  onSave: (instructorData: any) => void;
}

const DialogAddInstructor = ({
  open,
  onClose,
  onSave,
}: DialogAddInstructorProps) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    address: "",
    website: "",
    linkedin: "",
    bio: "",
    verified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Xử lý thay đổi giá trị trường input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Xử lý thay đổi select
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý thay đổi switch
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Xử lý tải lên avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Kiểm tra tên
    if (!formData.name.trim()) {
      newErrors.name = "Tên giảng viên không được để trống";
    }

    // Kiểm tra email
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Kiểm tra số điện thoại
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Kiểm tra chuyên môn
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Chuyên môn không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý lưu
  const handleSave = () => {
    if (validateForm()) {
      const newInstructor = {
        ...formData,
        avatar: avatar || "/src/assets/avatar.png",
        joinDate: new Date().toISOString(),
        status: "active",
        coursesCount: 0,
        studentsCount: 0,
        rating: 0,
      };

      onSave(newInstructor);
      handleReset();
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      address: "",
      website: "",
      linkedin: "",
      bio: "",
      verified: false,
    });
    setAvatar(null);
    setErrors({});
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Thêm giảng viên mới</Typography>
        <IconButton onClick={handleCloseDialog} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          {/* Phần avatar */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatar || "/src/assets/avatar.png"}
                sx={{ width: 100, height: 100 }}
              />
              <input
                accept="image/*"
                type="file"
                id="avatar-upload"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Tên giảng viên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Chuyên môn"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                error={!!errors.specialization}
                helperText={errors.specialization}
                placeholder="VD: Web Development, AI/ML"
              />
            </Grid>

            {/* Thông tin bổ sung */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin bổ sung
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Tiểu sử"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Mô tả kinh nghiệm và chuyên môn của giảng viên"
              />
            </Grid>

            {/* Trạng thái */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Trạng thái
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.verified}
                    onChange={handleSwitchChange}
                    name="verified"
                    color="primary"
                  />
                }
                label="Đã xác minh"
              />
              <FormHelperText>
                Giảng viên đã xác minh sẽ được đánh dấu và hiển thị nổi bật trên
                hệ thống
              </FormHelperText>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCloseDialog}>Hủy</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
          Lưu giảng viên
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddInstructor;
