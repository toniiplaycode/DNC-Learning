import React, { useState, useEffect } from "react";
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
  IconButton,
  Stack,
  FormHelperText,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Định nghĩa kiểu SectionItem
interface SectionItem {
  id: number;
  title: string;
  description?: string;
  position?: number;
  contents?: any[];
}

// Định nghĩa props cho component
interface DialogAddEditSectionProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (sectionData: SectionItem) => void;
  sectionToEdit?: SectionItem;
  sections: any[];
  editMode: boolean;
}

const DialogAddEditSection: React.FC<DialogAddEditSectionProps> = ({
  open,
  onClose,
  onSubmit,
  sectionToEdit,
  sections,
  editMode,
}) => {
  // State cho form section
  const [sectionForm, setSectionForm] = useState<SectionItem>({
    id: 0,
    title: "",
    description: "",
    position: 0,
  });

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && sectionToEdit) {
        setSectionForm({
          id: sectionToEdit.id,
          title: sectionToEdit.title || "",
          description: sectionToEdit.description || "",
          position: sectionToEdit.position || 0,
        });
      } else {
        setSectionForm({
          id: 0,
          title: "",
          description: "",
          position: sections.length, // Mặc định thêm vào cuối
        });
      }
    }
  }, [open, editMode, sectionToEdit, sections]);

  // Xử lý khi submit form
  const handleSubmit = () => {
    onSubmit(sectionForm);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {editMode ? "Chỉnh sửa phần học" : "Thêm phần học mới"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Tiêu đề phần học"
            fullWidth
            value={sectionForm.title}
            onChange={(e) =>
              setSectionForm({ ...sectionForm, title: e.target.value })
            }
            required
          />

          <TextField
            label="Mô tả phần học"
            fullWidth
            multiline
            rows={3}
            value={sectionForm.description}
            onChange={(e) =>
              setSectionForm({ ...sectionForm, description: e.target.value })
            }
          />

          {/* Phần chọn vị trí áp dụng cho cả thêm và sửa */}
          <FormControl fullWidth>
            <InputLabel>Vị trí hiển thị</InputLabel>
            <Select
              value={sectionForm.position}
              onChange={(e) =>
                setSectionForm({
                  ...sectionForm,
                  position: Number(e.target.value),
                })
              }
              label="Vị trí hiển thị"
            >
              {/* Tạo danh sách vị trí có thể chọn */}
              {Array.from(
                {
                  length: editMode ? sections.length : sections.length + 1,
                },
                (_, i) => (
                  <MenuItem key={i} value={i}>
                    {i === 0
                      ? "Đầu tiên"
                      : i === sections.length
                      ? "Cuối cùng"
                      : `Sau "${sections[i - 1]?.title || ""}"`}
                  </MenuItem>
                )
              )}
            </Select>
            <FormHelperText>
              Chọn vị trí hiển thị của phần học trong khóa học
            </FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!sectionForm.title}
        >
          {editMode ? "Cập nhật" : "Thêm phần học"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditSection;
