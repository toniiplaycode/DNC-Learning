import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import {
  CalendarToday,
  CloudUpload,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  uploadImageToCloudinary,
  createObjectURL,
} from "../../../utils/uploadImage";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import {
  createCourse,
  fetchCourses,
  fetchCoursesByInstructor,
  updateCourse,
} from "../../../features/courses/coursesApiSlice";
import { fetchCategories } from "../../../features/categories/categoriesApiSlice";
import { selectAllCategories } from "../../../features/categories/categoriesSelectors";
import { toast } from "react-toastify";
import { Course } from "../../../features/courses/coursesSlice";
import { fetchInstructors } from "../../../features/user_instructors/instructorsApiSlice";
import { selectAllInstructors } from "../../../features/user_instructors/instructorsSelectors";
import { fetchAllDocuments } from "../../../features/documents/documentsSlice";

// Update interface to include edit mode props
interface DialogAddEditCourseProps {
  open: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  editMode?: boolean;
  isAdmin?: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  categoryId: number | null;
  instructorId: number | null;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  status: "published" | "archived" | "draft";
  thumbnailUrl: string;
  required: string;
  learned: string;
}

const DialogAddEditCourse: React.FC<DialogAddEditCourseProps> = ({
  open,
  onClose,
  courseToEdit,
  editMode = false,
  isAdmin,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const categories = useAppSelector(selectAllCategories);
  const instructors = useAppSelector(selectAllInstructors);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchInstructors());
  }, [dispatch]);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    categoryId: null,
    instructorId: isAdmin ? null : Number(currentUser?.userInstructor?.id),
    price: 0,
    level: "beginner",
    status: "published",
    thumbnailUrl: "",
    required: "",
    learned: "",
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setPreviewUrl(createObjectURL(file));
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData({ ...formData, thumbnailUrl: imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      // Add error handling/notification here
    } finally {
      setUploading(false);
    }
  };

  // Update useEffect to handle edit mode initialization
  useEffect(() => {
    if (open && courseToEdit && editMode) {
      setFormData({
        title: courseToEdit.title || "",
        description: courseToEdit.description || "",
        categoryId: courseToEdit.categoryId || null,
        instructorId: courseToEdit.instructorId || null,
        price: courseToEdit.price || 0,
        level: courseToEdit.level || "beginner",
        status: courseToEdit.status || "draft",
        thumbnailUrl: courseToEdit.thumbnailUrl || "",
        required: courseToEdit.required || "",
        learned: courseToEdit.learned || "",
      });
      setPreviewUrl(courseToEdit.thumbnailUrl || "");
    }
  }, [open, courseToEdit, editMode]);

  // Update handleSubmit to handle both create and edit
  const handleSubmit = async () => {
    try {
      if (editMode && courseToEdit) {
        await dispatch(
          updateCourse({
            id: courseToEdit.id,
            courseData: formData,
          })
        );
      } else {
        await dispatch(createCourse(formData));
      }
      await dispatch(fetchCoursesByInstructor(currentUser?.userInstructor?.id));
      await dispatch(fetchCourses());
      toast.success(
        editMode ? "Cập nhật khóa học thành công!" : "Tạo khóa học thành công!"
      );
      handleClose();
    } catch (error) {
      toast.error(
        editMode ? "Không thể cập nhật khóa học" : "Không thể tạo khóa học"
      );
      console.error("Error:", error);
    }
  };

  // Add handleClose function
  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: null,
      instructorId: isAdmin ? null : Number(currentUser?.userInstructor?.id),
      price: 0,
      level: "beginner",
      status: "published",
      thumbnailUrl: "",
      required: "",
      learned: "",
    });
    setPreviewUrl("");
    onClose();
  };

  // Update dialog title and button text
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? "Chỉnh Sửa Khóa Học" : "Tạo Khóa Học Mới"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {isAdmin && (
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={formData.instructorId || ""}
                label="Giảng viên phụ trách"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructorId: Number(e.target.value) || null,
                  })
                }
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={instructor.user?.avatarUrl}
                        sx={{ width: 24, height: 24 }}
                      >
                        {instructor.fullName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {instructor.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {instructor.professionalTitle}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Basic Information */}
          <TextField
            label="Tên khóa học"
            fullWidth
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* Category Selection */}
          <FormControl fullWidth>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={formData.categoryId || ""}
              label="Danh mục"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryId: Number(e.target.value) || null,
                })
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price */}
          <TextField
            label="Giá khóa học"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">VND</InputAdornment>
              ),
            }}
          />

          {/* Level Selection */}
          <FormControl fullWidth>
            <InputLabel>Cấp độ</InputLabel>
            <Select
              value={formData.level}
              label="Cấp độ"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  level: e.target.value as CourseFormData["level"],
                })
              }
            >
              <MenuItem value="beginner">Cơ bản</MenuItem>
              <MenuItem value="intermediate">Trung cấp</MenuItem>
              <MenuItem value="advanced">Nâng cao</MenuItem>
            </Select>
          </FormControl>

          {/* Requirements and Learning Outcomes */}
          <TextField
            label="Yêu cầu đầu vào"
            fullWidth
            multiline
            rows={3}
            value={formData.required}
            onChange={(e) =>
              setFormData({ ...formData, required: e.target.value })
            }
            placeholder="Các yêu cầu cần có trước khi học khóa học này"
          />

          <TextField
            label="Kết quả đạt được"
            fullWidth
            multiline
            rows={3}
            value={formData.learned}
            onChange={(e) =>
              setFormData({ ...formData, learned: e.target.value })
            }
            placeholder="Những gì học viên sẽ học được sau khóa học"
          />

          {/* Thumbnail URL */}
          <Stack spacing={2}>
            <Typography variant="subtitle2">Ảnh thu nhỏ khóa học</Typography>

            {/* Image Preview */}
            {(previewUrl || formData.thumbnailUrl) && (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={previewUrl || formData.thumbnailUrl}
                  alt="Preview"
                  style={{
                    width: "300px",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}

            {/* Upload Options */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                component="label"
                sx={{ width: "20%" }}
                startIcon={<CloudUpload />}
                disabled={uploading}
              >
                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                />
              </Button>

              <TextField
                fullWidth
                label="hoặc dán URL ảnh"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>

          {/* Status Selection */}
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={formData.status}
              label="Trạng thái"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as CourseFormData["status"],
                })
              }
            >
              <MenuItem value="published">Xuất bản</MenuItem>
              <MenuItem value="archived">Lưu trữ</MenuItem>
              <MenuItem value="draft">Bản nháp</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.title || !formData.categoryId}
        >
          {editMode ? "Cập nhật" : "Tạo khóa học"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditCourse;
