import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import { School } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { AcademicClassStatus } from "../../../types/academic-class.types";

interface AddEditClassAcademicDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    id: number;
    classCode: string;
    className: string;
    semester: string;
    status: AcademicClassStatus;
  } | null;
  onSubmit: (classData: {
    id?: number;
    classCode: string;
    className: string;
    semester: string;
    status: AcademicClassStatus;
  }) => void;
}

export const AddEditClassAcademicDialog = ({
  open,
  onClose,
  initialData,
  onSubmit,
}: AddEditClassAcademicDialogProps) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || 0,
    classCode: initialData?.classCode || "",
    className: initialData?.className || "",
    semester: initialData?.semester || "",
    status: initialData?.status || AcademicClassStatus.ACTIVE,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        classCode: initialData.classCode,
        className: initialData.className,
        semester: initialData.semester,
        status: initialData.status,
      });
    } else {
      setFormData({
        id: 0,
        classCode: "",
        className: "",
        semester: "",
        status: AcademicClassStatus.ACTIVE,
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <School />
          </Avatar>
          <Typography variant="h6">
            {isEditing ? "Chỉnh Sửa Lớp Học" : "Thêm Lớp Học"}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Mã lớp"
            fullWidth
            value={formData.classCode}
            onChange={(e) =>
              setFormData({ ...formData, classCode: e.target.value })
            }
            required
            disabled={isEditing} // Không cho phép sửa mã lớp
          />
          <TextField
            label="Tên lớp"
            fullWidth
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Học kỳ</InputLabel>
            <Select
              value={formData.semester}
              label="Học kỳ"
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
            >
              <MenuItem value="20251">Học kỳ 1 2025</MenuItem>
              <MenuItem value="20252">Học kỳ 2 2025</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={formData.status}
              label="Trạng thái"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AcademicClassStatus,
                })
              }
            >
              <MenuItem value={AcademicClassStatus.ACTIVE}>
                Đang hoạt động
              </MenuItem>
              <MenuItem value={AcademicClassStatus.COMPLETED}>
                Đã hoàn thành
              </MenuItem>
              <MenuItem value={AcademicClassStatus.CANCELLED}>Đã hủy</MenuItem>
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
            !formData.classCode ||
            !formData.className ||
            !formData.semester ||
            !formData.status
          }
        >
          {isEditing ? "Cập nhật" : "Thêm lớp"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
