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

// Thêm interface cho học kỳ
interface Semester {
  value: string; // Format: "YYYYT" (ví dụ: "20251" cho học kỳ 1 năm 2025)
  label: string; // Format: "Học kỳ T YYYY" (ví dụ: "Học kỳ 1 2025")
}

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
  existingSemesters?: string[]; // Thêm prop để nhận danh sách học kỳ hiện có
}

export const AddEditClassAcademicDialog = ({
  open,
  onClose,
  initialData,
  onSubmit,
  existingSemesters = [], // Mặc định là mảng rỗng
}: AddEditClassAcademicDialogProps) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || 0,
    classCode: initialData?.classCode || "",
    className: initialData?.className || "",
    semester: initialData?.semester || "",
    status: initialData?.status || AcademicClassStatus.ACTIVE,
  });

  // State cho danh sách học kỳ
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentYear] = useState(new Date().getFullYear());

  // Hàm tạo danh sách học kỳ
  const generateSemesters = (startYear: number, endYear: number) => {
    const newSemesters: Semester[] = [];
    for (let year = startYear; year <= endYear; year++) {
      newSemesters.push({
        value: `${year}1`,
        label: `Học kỳ 1 ${year}`,
      });
      newSemesters.push({
        value: `${year}2`,
        label: `Học kỳ 2 ${year}`,
      });
    }
    return newSemesters;
  };

  // Hàm lấy học kỳ từ dữ liệu hiện có
  const getExistingSemesters = () => {
    return existingSemesters.map((semester) => ({
      value: semester,
      label: `Học kỳ ${semester.slice(-1)} ${semester.slice(0, 4)}`,
    }));
  };

  // Khởi tạo danh sách học kỳ
  useEffect(() => {
    const existingSemesterList = getExistingSemesters();
    const nextTwoYears = generateSemesters(currentYear, currentYear + 2);

    const allSemesters = [...existingSemesterList, ...nextTwoYears];
    const uniqueSemesters = Array.from(
      new Map(allSemesters.map((item) => [item.value, item])).values()
    ).sort((a, b) => b.value.localeCompare(a.value));

    setSemesters(uniqueSemesters);
  }, [existingSemesters, currentYear]);

  // Reset form khi dialog mở/đóng hoặc initialData thay đổi
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
            disabled={isEditing}
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
              {semesters.map((semester) => (
                <MenuItem key={semester.value} value={semester.value}>
                  {semester.label}
                </MenuItem>
              ))}
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
