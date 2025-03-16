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
  Switch,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { Close, CloudUpload, CalendarToday } from "@mui/icons-material";

// Định nghĩa kiểu AssignmentItem
interface AssignmentItem {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  maxScore?: number;
  allowLateSubmission?: boolean;
  attachments?: string[];
  sectionId?: number;
  requiresSubmission?: boolean;
  submissionType?: "file" | "text" | "both";
  instructions?: string;
}

// Định nghĩa props cho component
interface DialogAddEditAssignmentProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (assignmentData: any) => void;
  initialSectionId?: number;
  assignmentToEdit?: AssignmentItem;
  sections: any[];
  editMode: boolean;
}

const DialogAddEditAssignment: React.FC<DialogAddEditAssignmentProps> = ({
  open,
  onClose,
  onSubmit,
  initialSectionId,
  assignmentToEdit,
  sections,
  editMode,
}) => {
  // State cho form assignment
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
    allowLateSubmission: false,
    sectionId: 0,
    requiresSubmission: true,
    submissionType: "file",
    instructions: "",
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
        // Tìm section của assignment khi edit
        let sectionId = assignmentToEdit.sectionId || 0;

        // Nếu không có sectionId trong assignmentToEdit, tìm từ sections
        if (!sectionId) {
          for (const section of sections) {
            const assignmentIndex = section.contents?.findIndex(
              (c: any) =>
                c.id === assignmentToEdit.id && c.type === "assignment"
            );
            if (assignmentIndex !== -1) {
              sectionId = section.id;
              break;
            }
          }
        }

        setAssignmentForm({
          title: assignmentToEdit.title || "",
          description: assignmentToEdit.description || "",
          dueDate: assignmentToEdit.dueDate || "",
          maxScore: assignmentToEdit.maxScore || 100,
          allowLateSubmission: assignmentToEdit.allowLateSubmission || false,
          sectionId: sectionId,
          requiresSubmission: assignmentToEdit.requiresSubmission !== false,
          submissionType: assignmentToEdit.submissionType || "file",
          instructions: assignmentToEdit.instructions || "",
        });
      } else {
        // Khi thêm mới
        setAssignmentForm({
          title: "",
          description: "",
          dueDate: "",
          maxScore: 100,
          allowLateSubmission: false,
          sectionId: initialSectionId || 0,
          requiresSubmission: true,
          submissionType: "file",
          instructions: "",
        });
      }

      // Reset file uploads
      setSelectedFiles([]);
      setFileUploadError(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open, editMode, assignmentToEdit, initialSectionId, sections]);

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
  const submitForm = (fileUrls: string[]) => {
    // Chuẩn bị dữ liệu để submit
    const submittedData = {
      ...assignmentForm,
      id: editMode && assignmentToEdit ? assignmentToEdit.id : Date.now(),
      attachments: fileUrls || [],
    };

    onSubmit(submittedData);
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
            value={assignmentForm.description}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                description: e.target.value,
              })
            }
          />

          {/* Chọn phần học */}
          <FormControl fullWidth>
            <InputLabel>Phần học</InputLabel>
            <Select
              value={assignmentForm.sectionId}
              label="Phần học"
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  sectionId: Number(e.target.value),
                })
              }
            >
              <MenuItem value={0}>Không thuộc phần học nào</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Nếu bài tập không thuộc phần học cụ thể, chọn "Không thuộc phần
              học nào"
            </FormHelperText>
          </FormControl>

          {/* Ngày hạn nộp */}
          <TextField
            label="Ngày hạn nộp"
            type="datetime-local"
            fullWidth
            value={assignmentForm.dueDate}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })
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
            value={assignmentForm.maxScore}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                maxScore: parseInt(e.target.value) || 0,
              })
            }
            InputProps={{ inputProps: { min: 0 } }}
          />

          {/* Cho phép nộp muộn */}
          <FormControlLabel
            control={
              <Switch
                checked={assignmentForm.allowLateSubmission}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    allowLateSubmission: e.target.checked,
                  })
                }
              />
            }
            label="Cho phép nộp bài muộn"
          />

          {/* Yêu cầu nộp bài */}
          <FormControlLabel
            control={
              <Switch
                checked={assignmentForm.requiresSubmission}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    requiresSubmission: e.target.checked,
                  })
                }
              />
            }
            label="Yêu cầu học viên nộp bài"
          />

          {/* Loại bài nộp */}
          {assignmentForm.requiresSubmission && (
            <FormControl fullWidth>
              <InputLabel>Loại bài nộp</InputLabel>
              <Select
                value={assignmentForm.submissionType}
                label="Loại bài nộp"
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    submissionType: e.target.value as "file" | "text" | "both",
                  })
                }
              >
                <MenuItem value="file">File (PDF, Word, hình ảnh...)</MenuItem>
                <MenuItem value="text">Văn bản</MenuItem>
                <MenuItem value="both">Cả file và văn bản</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Hướng dẫn nộp bài */}
          {assignmentForm.requiresSubmission && (
            <TextField
              label="Hướng dẫn nộp bài"
              fullWidth
              multiline
              rows={2}
              value={assignmentForm.instructions}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  instructions: e.target.value,
                })
              }
              placeholder="Nhập hướng dẫn nộp bài cho học viên..."
            />
          )}

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
