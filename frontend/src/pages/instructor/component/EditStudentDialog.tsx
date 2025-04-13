import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Avatar,
} from "@mui/material";
import { useState, useEffect } from "react";

export const EditStudentDialog = ({ open, onClose, student, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: "",
    userId: "",
    username: "",
    fullName: "",
    studentCode: "",
    academicYear: "",
    email: "",
    phone: "",
    status: "studying",
  });

  // Update form data when student prop changes
  useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        userId: student.user.id,
        username: student.user.username,
        fullName: student.fullName,
        studentCode: student.studentCode,
        academicYear: student.academicYear,
        email: student.user.email,
        phone: student.user.phone || "",
        status: student.status,
      });
    }
  }, [student]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "email") {
      // Create username from email
      const username = value
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      setFormData((prev) => ({
        ...prev,
        email: value,
        username: username, // Add username to form data
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={student?.user?.avatarUrl}>{student?.fullName[0]}</Avatar>
          <Typography variant="h6">Chỉnh sửa thông tin sinh viên</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <input type="hidden" name="username" value={formData.username} />
          <TextField
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Mã số sinh viên"
            name="studentCode"
            value={formData.studentCode}
            onChange={handleChange}
            fullWidth
            required
            helperText="Định dạng: SV + 6 số (VD: SV202501)"
          />
          <TextField
            label="Khóa"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            fullWidth
            required
            helperText="VD: K71"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            helperText="Email sẽ được dùng để tạo username tự động"
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              <MenuItem value="studying">Đang học</MenuItem>
              <MenuItem value="suspended">Nghỉ học</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !formData.fullName || !formData.studentCode || !formData.email
          }
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
};
