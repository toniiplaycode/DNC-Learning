import React, { useState, useEffect, useMemo } from "react";
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
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  createCourseSection,
  fetchCourseSectionsByCourseId,
  updateCourseSection,
} from "../../../features/course-sections/courseSectionApiSlice";
import { selectAllCourseSectionsByCourseId } from "../../../features/course-sections/courseSectionSelector";
import { toast } from "react-toastify";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";

// Định nghĩa kiểu SectionItem
interface SectionItem {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderNumber: number;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa props cho component
interface DialogAddEditSectionProps {
  open: boolean;
  onClose: () => void;
  sectionIdToEdit: number;
  editMode: boolean;
}

const DialogAddEditSection: React.FC<DialogAddEditSectionProps> = ({
  open,
  onClose,
  sectionIdToEdit,
  editMode,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const sectionData = useAppSelector(selectAllCourseSectionsByCourseId);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseSectionsByCourseId(Number(id)));
    }
  }, [dispatch, id]);

  // State cho form section
  const [sectionForm, setSectionForm] = useState<SectionItem>({
    id: 0,
    courseId: Number(id), // Lấy courseId từ URL
    title: "",
    description: "",
    orderNumber: 0,
  });

  const sectionToEdit = useMemo(() => {
    return sectionData.find((section) => section.id === sectionIdToEdit);
  }, [sectionIdToEdit, sectionData]);

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && sectionToEdit) {
        setSectionForm({
          id: sectionToEdit.id,
          courseId: sectionToEdit.courseId,
          title: sectionToEdit.title || "",
          description: sectionToEdit.description || "",
          orderNumber: sectionToEdit.orderNumber || 1, // Đảm bảo rằng orderNumber là 1 khi chỉnh sửa
        });
      } else {
        setSectionForm({
          id: 0,
          courseId: Number(id),
          title: "",
          description: "",
          orderNumber: sectionData.length + 1, // Đặt vị trí bắt đầu từ 1
        });
      }
    }
  }, [open, editMode, sectionToEdit, sectionData, id]);

  // Xử lý khi submit form
  const handleSubmit = () => {
    if (!editMode) {
      dispatch(createCourseSection(sectionForm)).then(() => {
        // Sau khi tạo thành công, tải lại danh sách phần học
        dispatch(fetchCourseById(Number(id)));
        dispatch(fetchCourseSectionsByCourseId(Number(id)));
        toast.success(
          editMode
            ? "Cập nhật phần học thành công!"
            : "Thêm phần học thành công!"
        );
      });
    } else {
      console.log(sectionForm);
      dispatch(updateCourseSection(sectionForm)).then(() => {
        dispatch(fetchCourseById(Number(id)));
        dispatch(fetchCourseSectionsByCourseId(Number(id)));
        toast.success("Cập nhật phần học thành công!");
      });
    }

    onClose();
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
              value={sectionForm.orderNumber}
              onChange={(e) => {
                const selectedPosition = Number(e.target.value);
                // Create a sorted copy of sectionData excluding current section in edit mode
                const sortedSections = [...sectionData]
                  .filter(
                    (section) => !editMode || section.id !== sectionForm.id
                  )
                  .sort((a, b) => a.orderNumber - b.orderNumber);

                // Calculate new orderNumber
                const newOrderNumber =
                  selectedPosition === 1
                    ? 1
                    : sortedSections[selectedPosition - 2].orderNumber + 1;

                setSectionForm({
                  ...sectionForm,
                  orderNumber: newOrderNumber,
                });
              }}
              label="Vị trí hiển thị"
            >
              {(() => {
                // Create a sorted copy for menu items, excluding current section in edit mode
                const sortedSections = [...sectionData]
                  .filter(
                    (section) => !editMode || section.id !== sectionForm.id
                  )
                  .sort((a, b) => a.orderNumber - b.orderNumber);

                return [...Array(sortedSections.length + 1)].map((_, index) => {
                  const position = index + 1;
                  const prevSection = sortedSections[index - 1];

                  return (
                    <MenuItem key={position} value={position}>
                      {position === 1
                        ? "Đầu tiên"
                        : position === sortedSections.length + 1
                        ? "Cuối cùng"
                        : `Sau "${prevSection?.title || ""}"`}
                    </MenuItem>
                  );
                });
              })()}
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
