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
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { Close, CloudUpload, CalendarToday } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCourseAssignments } from "../../../features/course-lessons/courseLessonsApiSlice";
import { selectAlCourseLessonlAssignments } from "../../../features/course-lessons/courseLessonsSelector";
import {
  createAssignment,
  fetchAssignmentByCourse,
  updateAssignment,
} from "../../../features/assignments/assignmentsSlice";
import { toast } from "react-toastify";
import { selectAssignmentsCourse } from "../../../features/assignments/assignmentsSelectors";
import { fetchClassInstructorById } from "../../../features/academic-class-instructors/academicClassInstructorsSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { selectCurrentClassInstructor } from "../../../features/academic-class-instructors/academicClassInstructorsSelectors";

// Định nghĩa kiểu AssignmentItem
interface AssignmentItem {
  id: number;
  title: string;
  description: string | null;
  lessonId: number | null;
  academicClassId: number | null;
  dueDate: Date | null;
  maxScore: number | null;
  fileRequirements: string | null;
  assignmentType: "practice" | "homework" | "midterm" | "final" | "project";
}

// Định nghĩa props cho component
interface DialogAddEditAssignmentProps {
  open: boolean;
  onClose: () => void;
  assignmentToEdit?: AssignmentItem;
  lessonData: any[];
  editMode: boolean;
  additionalInfo?: {
    targetType: string;
  };
}

const DialogAddEditAssignment: React.FC<DialogAddEditAssignmentProps> = ({
  open,
  onClose,
  assignmentToEdit,
  editMode,
  additionalInfo,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const lessonData = useAppSelector(selectAlCourseLessonlAssignments);
  const assignmentsData = useAppSelector(selectAssignmentsCourse);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentClassInstructor = useAppSelector(selectCurrentClassInstructor);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseAssignments(Number(id)));
      dispatch(fetchAssignmentByCourse(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchClassInstructorById(Number(currentUser?.userInstructor?.id)));
  }, [dispatch, currentUser]);

  // State cho form assignment
  const [assignmentForm, setAssignmentForm] = useState<AssignmentItem>({
    id: 0,
    title: "",
    description: null,
    lessonId: null,
    academicClassId: null,
    dueDate: null,
    maxScore: null,
    fileRequirements: null,
    assignmentType: "practice",
  });

  // State quản lý upload file (cho tài liệu đính kèm)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && assignmentToEdit) {
        setAssignmentForm({
          id: assignmentToEdit.id,
          title: assignmentToEdit.title || "",
          description: assignmentToEdit.description || null,
          lessonId: assignmentToEdit.lessonId || null,
          academicClassId: assignmentToEdit.academicClassId || null,
          dueDate: assignmentToEdit.dueDate || null,
          maxScore: assignmentToEdit.maxScore || null,
          fileRequirements: assignmentToEdit.fileRequirements || null,
          assignmentType: assignmentToEdit.assignmentType || "practice",
        });
      } else {
        // Khi thêm mới
        setAssignmentForm({
          id: 0,
          title: "",
          description: null,
          lessonId: null,
          academicClassId: null,
          dueDate: null,
          maxScore: null,
          fileRequirements: null,
          assignmentType: "practice",
        });
      }

      // Reset file uploads
      setSelectedFiles([]);
      setFileUploadError(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open, editMode, assignmentToEdit, lessonData]);

  // Xử lý chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // Kiểm tra kích thước file (max 10MB mỗi file)
      const oversizedFiles = newFiles.filter(
        (file) => file.size > 10 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setFileUploadError(
          `${oversizedFiles.length} file vượt quá kích thước cho phép (10MB)`
        );
        return;
      }

      setFileUploadError(null);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Xóa file đã chọn
  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  // Gửi form
  const handleSubmit = () => {
    // Tạo FormData để upload files (nếu có)
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    if (selectedFiles.length > 0) {
      // Giả lập upload file
      setIsUploading(true);

      // Tạo một interval để giả lập tiến trình upload
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);

            // Sau khi upload xong, submit form
            setTimeout(() => {
              setIsUploading(false);
              submitForm([
                ...selectedFiles.map((file) => URL.createObjectURL(file)),
              ]);
            }, 500);

            return 100;
          }
          return newProgress;
        });
      }, 300);
    } else {
      // Nếu không có file, submit form ngay
      submitForm([]);
    }
  };

  // Xử lý submit form
  const submitForm = async (fileUrls: string[]) => {
    if (!editMode) {
      await dispatch(createAssignment(assignmentForm));
    } else if (editMode) {
      await dispatch(updateAssignment(assignmentForm));
    }

    await dispatch(fetchAssignmentByCourse(Number(id)));
    toast.success(
      editMode ? "Cập nhật bài tập thành công!" : "Thêm bài tập thành công!"
    );

    console.log("Submitted Data:", assignmentForm);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {editMode ? "Chỉnh sửa bài tập" : "Thêm bài tập mới"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* Hiển thị thông tin bổ sung khi tạo bài tập cho sinh viên trường */}
          {additionalInfo && additionalInfo.targetType === "academic" && (
            <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bài tập dành cho sinh viên trường
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Bài tập này sẽ được gán cho tất cả sinh viên thuộc lớp đã chọn.
              </Typography>
            </Box>
          )}
          {/* Chọn lớp học thuật */}
          {additionalInfo && additionalInfo.targetType === "academic" && (
            <FormControl fullWidth>
              <InputLabel>Chọn lớp học thuật</InputLabel>
              <Select
                value={assignmentForm.academicClassId || 0}
                label="Chọn lớp học thuật"
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    academicClassId: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={0}>Chọn lớp học</MenuItem>
                {currentClassInstructor?.map((classInstructor) => (
                  <MenuItem
                    key={classInstructor.academicClass.id}
                    value={classInstructor.academicClass.id}
                  >
                    {classInstructor.academicClass.classCode} -{" "}
                    {classInstructor.academicClass.className}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Chọn lớp học để gán bài tập cho sinh viên
              </FormHelperText>
            </FormControl>
          )}

          {/* Tiêu đề bài tập */}
          <TextField
            label="Tiêu đề bài tập"
            fullWidth
            value={assignmentForm.title}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, title: e.target.value })
            }
            required
          />

          {/* Mô tả bài tập */}
          <TextField
            label="Mô tả bài tập"
            fullWidth
            multiline
            rows={3}
            value={assignmentForm.description || ""}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                description: e.target.value,
              })
            }
          />

          {/* Chọn nội dung */}
          {!additionalInfo && (
            <FormControl fullWidth>
              <InputLabel>Nội dung</InputLabel>
              <Select
                value={assignmentForm.lessonId || 0}
                label="Nội dung"
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    lessonId: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={0}>Không thuộc nội dung học nào</MenuItem>
                {lessonData.map((lesson) => {
                  const hasAssignment = assignmentsData.some(
                    (assignment) => assignment.lessonId === lesson.id
                  );
                  return (
                    <MenuItem
                      key={lesson.id}
                      value={lesson.id}
                      disabled={hasAssignment}
                      sx={{
                        ...(hasAssignment && {
                          color: "promary.main",
                          "& .assignment-indicator": {
                            ml: 1,
                            color: "warning.main",
                            fontSize: "0.75rem",
                          },
                        }),
                      }}
                    >
                      {lesson.title}
                      {hasAssignment && (
                        <Typography
                          component="span"
                          className="assignment-indicator"
                        >
                          &nbsp; (đã có bài tập)
                        </Typography>
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
              <FormHelperText>
                Nếu bài tập không thuộc nội dung cụ thể, chọn "Không thuộc nội
                dung nào"
              </FormHelperText>
            </FormControl>
          )}

          {/* Ngày hạn nộp */}
          <TextField
            label="Ngày hạn nộp"
            type="datetime-local"
            fullWidth
            value={
              assignmentForm.dueDate
                ? new Date(assignmentForm.dueDate).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                dueDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Điểm tối đa */}
          <TextField
            label="Điểm tối đa"
            type="number"
            fullWidth
            value={assignmentForm.maxScore || ""}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                maxScore: parseInt(e.target.value) || null,
              })
            }
            InputProps={{ inputProps: { min: 0 } }}
          />

          <Stack spacing={3}>
            {/* Assignment Type Selection */}
            <FormControl fullWidth>
              <InputLabel>Loại bài tập</InputLabel>
              <Select
                value={assignmentForm.assignmentType}
                label="Loại bài tập"
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    assignmentType: e.target
                      .value as AssignmentItem["assignmentType"],
                  })
                }
              >
                <MenuItem value="practice">Thực hành</MenuItem>
                <MenuItem value="homework">Bài tập về nhà</MenuItem>
                <MenuItem value="midterm">Giữa kỳ</MenuItem>
                <MenuItem value="final">Cuối kỳ</MenuItem>
                <MenuItem value="project">Dự án</MenuItem>
              </Select>
              <FormHelperText>
                Chọn loại bài tập để phân loại và quản lý dễ dàng hơn
              </FormHelperText>
            </FormControl>

            {/* File Requirements */}
            <TextField
              label="Yêu cầu về file nộp bài"
              fullWidth
              multiline
              rows={3}
              value={assignmentForm.fileRequirements || ""}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  fileRequirements: e.target.value,
                })
              }
              placeholder="Ví dụ: File PDF dưới 10MB, đặt tên theo format MSSV_TenBaiTap.pdf"
              helperText="Mô tả các yêu cầu về định dạng, kích thước, cách đặt tên file nộp bài"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CloudUpload color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {/* Upload tài liệu đính kèm */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Tài liệu đính kèm
            </Typography>

            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
                mb: 2,
              }}
              onClick={() =>
                document.getElementById("upload-assignment-files")?.click()
              }
            >
              <input
                type="file"
                id="upload-assignment-files"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <CloudUpload
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="body1">
                Kéo thả file vào đây hoặc click để chọn file
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hỗ trợ nhiều định dạng file (PDF, Word, Excel, hình ảnh...)
              </Typography>
            </Box>

            {/* Hiển thị file đã chọn */}
            {selectedFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  File đã chọn ({selectedFiles.length}):
                </Typography>
                <Stack spacing={1}>
                  {selectedFiles.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ maxWidth: "70%" }}
                      >
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Hiển thị lỗi upload */}
            {fileUploadError && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {fileUploadError}
              </Typography>
            )}

            {/* Hiển thị progress khi đang upload */}
            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Đang tải lên tài liệu... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!assignmentForm.title || isUploading}
        >
          {isUploading
            ? "Đang tải lên..."
            : editMode
            ? "Cập nhật bài tập"
            : "Thêm bài tập"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditAssignment;
