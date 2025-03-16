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
  LinearProgress,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";

// Định nghĩa kiểu ContentItem cho rõ ràng
interface ContentItem {
  id: number;
  type: string;
  title: string;
  description: string;
  duration: string;
  url: string;
  completed: boolean;
  locked: boolean;
  objectives?: string[];
  keywords?: string[];
  prerequisites?: string[];
  maxAttempts?: number;
  passingScore?: number;
  sectionId?: number;
}

// Định nghĩa props cho component
interface DialogAddEditLessonProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (contentData: any) => void;
  initialSectionId?: number;
  contentToEdit?: ContentItem;
  sections: any[];
  editMode: boolean;
}

// Định nghĩa kiểu cho các content type
type ContentType =
  | "video"
  | "slide"
  | "meet"
  | "quiz"
  | "assignment"
  | "document"
  | "link";

// Form data interface
interface ContentFormData {
  title: string;
  type: ContentType;
  description: string;
  duration: string;
  url: string;
  sectionId: number;
  position: number;
  objectives?: string[];
  keywords?: string[];
  prerequisites?: string[];
  maxAttempts?: number;
  passingScore?: number;
}

const DialogAddEditLesson: React.FC<DialogAddEditLessonProps> = ({
  open,
  onClose,
  onSubmit,
  initialSectionId,
  contentToEdit,
  sections,
  editMode,
}) => {
  // State quản lý form
  const [contentForm, setContentForm] = useState<ContentFormData>({
    title: "",
    type: "video",
    description: "",
    duration: "",
    url: "",
    sectionId: 0,
    position: 0,
    objectives: [],
    keywords: [],
    prerequisites: [],
  });

  // State quản lý upload file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Cập nhật form khi có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && contentToEdit) {
        // Tìm section và position của content khi edit
        let sectionId = contentToEdit.sectionId || 0;
        let position = 0;

        // Nếu không có sectionId trong contentToEdit, tìm từ sections
        if (!sectionId) {
          for (const section of sections) {
            const contentIndex = section.contents.findIndex(
              (c: ContentItem) => c.id === contentToEdit.id
            );
            if (contentIndex !== -1) {
              sectionId = section.id;
              position = contentIndex;
              break;
            }
          }
        }

        setContentForm({
          title: contentToEdit.title || "",
          type: (contentToEdit.type as ContentType) || "video",
          description: contentToEdit.description || "",
          duration: contentToEdit.duration || "",
          url: contentToEdit.url || "",
          sectionId: sectionId,
          position: position,
          objectives: contentToEdit.objectives || [],
          keywords: contentToEdit.keywords || [],
          prerequisites: contentToEdit.prerequisites || [],
          maxAttempts: contentToEdit.maxAttempts,
          passingScore: contentToEdit.passingScore,
        });
      } else {
        // Khi thêm mới
        const section = sections.find((s) => s.id === initialSectionId);
        const defaultPosition = section?.contents ? section.contents.length : 0;

        setContentForm({
          title: "",
          type: "video",
          description: "",
          duration: "",
          url: "",
          sectionId: initialSectionId || 0,
          position: defaultPosition,
          objectives: [],
          keywords: [],
          prerequisites: [],
        });
      }

      // Reset upload state
      resetFileUpload();
    }
  }, [open, editMode, contentToEdit, initialSectionId, sections]);

  // Xử lý file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Kiểm tra kích thước file (giới hạn 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setFileUploadError("File quá lớn, vui lòng chọn file nhỏ hơn 100MB");
        return;
      }

      setSelectedFile(file);
      setFileUploadError(null);
    }
  };

  const resetFileUpload = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setFileUploadError(null);
  };

  const simulateFileUpload = async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    return new Promise<string>((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsUploading(false);
              resolve(`https://example.com/uploads/${selectedFile.name}`);
            }, 500);
          }
          return newProgress;
        });
      }, 300);
    });
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      let fileUrl = contentForm.url;

      // Nếu có file được chọn, thực hiện upload
      if (selectedFile) {
        fileUrl = (await simulateFileUpload()) || "";
      }

      // Chuẩn bị data để submit
      const submittedData = {
        ...(editMode && contentToEdit ? { id: contentToEdit.id } : {}),
        title: contentForm.title,
        type: contentForm.type,
        description: contentForm.description,
        duration: contentForm.duration,
        url: fileUrl,
        sectionId: contentForm.sectionId,
        position: contentForm.position,
        objectives: contentForm.objectives,
        keywords: contentForm.keywords,
        prerequisites: contentForm.prerequisites,
        // Thêm các trường chỉ cần cho quiz
        ...(contentForm.type === "quiz"
          ? {
              maxAttempts: contentForm.maxAttempts || 2,
              passingScore: contentForm.passingScore || 70,
            }
          : {}),
      };

      // Gọi callback onSubmit từ prop
      onSubmit(submittedData);

      // Reset form và đóng modal
      if (!editMode) {
        setContentForm({
          title: "",
          type: "video",
          description: "",
          duration: "",
          url: "",
          sectionId: contentForm.sectionId, // Giữ lại section đã chọn
          position: 0,
          objectives: [],
          keywords: [],
          prerequisites: [],
        });
      }

      resetFileUpload();
    } catch (error) {
      console.error("Lỗi khi submit form:", error);
    }
  };

  // Lấy vị trí mới nhất cho nội dung
  const getNextPosition = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.contents?.length || 0;
  };

  // Xử lý khi thay đổi section
  const handleSectionChange = (newSectionId: number) => {
    setContentForm({
      ...contentForm,
      sectionId: newSectionId,
      position: getNextPosition(newSectionId),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {editMode ? "Chỉnh sửa nội dung" : "Thêm nội dung mới"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Tiêu đề */}
          <TextField
            label="Tiêu đề"
            fullWidth
            required
            value={contentForm.title}
            onChange={(e) =>
              setContentForm({ ...contentForm, title: e.target.value })
            }
            placeholder="Nhập tiêu đề nội dung"
          />

          {/* Chọn section */}
          <FormControl fullWidth required>
            <InputLabel>Phần học</InputLabel>
            <Select
              value={contentForm.sectionId}
              onChange={(e) => handleSectionChange(Number(e.target.value))}
              label="Phần học"
            >
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Loại nội dung */}
          <FormControl fullWidth required>
            <InputLabel>Loại nội dung</InputLabel>
            <Select
              value={contentForm.type}
              onChange={(e) =>
                setContentForm({
                  ...contentForm,
                  type: e.target.value as ContentType,
                })
              }
              label="Loại nội dung"
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="slide">Slide</MenuItem>
              <MenuItem value="document">Tài liệu</MenuItem>
              <MenuItem value="quiz">Bài kiểm tra</MenuItem>
              <MenuItem value="assignment">Bài tập</MenuItem>
              <MenuItem value="meet">Buổi học trực tuyến</MenuItem>
              <MenuItem value="link">Liên kết</MenuItem>
            </Select>
            <FormHelperText>
              Chọn loại nội dung phù hợp với bài học
            </FormHelperText>
          </FormControl>

          {/* Mô tả */}
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={4}
            value={contentForm.description}
            onChange={(e) =>
              setContentForm({ ...contentForm, description: e.target.value })
            }
            placeholder="Nhập mô tả chi tiết về nội dung"
          />

          {/* Thêm các trường đặc biệt cho quiz */}
          {contentForm.type === "quiz" && (
            <Stack spacing={2}>
              <TextField
                label="Số lần làm tối đa"
                type="number"
                fullWidth
                value={contentForm.maxAttempts || 2}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    maxAttempts: Number(e.target.value),
                  })
                }
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Điểm đạt (%)"
                type="number"
                fullWidth
                value={contentForm.passingScore || 70}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    passingScore: Number(e.target.value),
                  })
                }
                inputProps={{ min: 0, max: 100 }}
                helperText="Điểm phần trăm tối thiểu để đạt bài kiểm tra"
              />
            </Stack>
          )}

          {/* Thời lượng */}
          <TextField
            label="Thời lượng (phút)"
            fullWidth
            value={contentForm.duration}
            onChange={(e) =>
              setContentForm({ ...contentForm, duration: e.target.value })
            }
            helperText="Ví dụ: 45 phút, 1:30:00"
          />

          {/* Upload file */}
          {(contentForm.type === "video" ||
            contentForm.type === "document" ||
            contentForm.type === "slide") && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tải lên file
              </Typography>
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  p: 3,
                  textAlign: "center",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {isUploading ? (
                  <Box sx={{ width: "100%" }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >{`${Math.round(uploadProgress)}%`}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <input
                      accept={
                        contentForm.type === "video"
                          ? "video/*"
                          : contentForm.type === "document"
                          ? ".pdf,.doc,.docx"
                          : ".pdf,.ppt,.pptx"
                      }
                      id="file-upload"
                      type="file"
                      hidden
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                      >
                        {selectedFile
                          ? `Đã chọn: ${selectedFile.name}`
                          : "Chọn file"}
                      </Button>
                    </label>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {contentForm.type === "video"
                        ? "Định dạng: MP4, WebM, Ogg"
                        : contentForm.type === "document"
                        ? "Định dạng: PDF, DOC, DOCX"
                        : "Định dạng: PDF, PPT, PPTX"}
                    </Typography>
                    {fileUploadError && (
                      <Typography
                        color="error"
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        {fileUploadError}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* URL trực tiếp */}
          <TextField
            label={`URL ${
              contentForm.type === "video"
                ? "video"
                : contentForm.type === "slide"
                ? "slide"
                : contentForm.type === "document"
                ? "tài liệu"
                : contentForm.type === "link"
                ? "đường dẫn"
                : "nội dung"
            }`}
            fullWidth
            value={contentForm.url}
            onChange={(e) =>
              setContentForm({ ...contentForm, url: e.target.value })
            }
            placeholder="https://example.com/content"
            helperText={
              contentForm.type === "video" ||
              contentForm.type === "document" ||
              contentForm.type === "slide"
                ? "Có thể để trống nếu bạn tải file lên trực tiếp"
                : "Nhập URL đến nội dung"
            }
            required={
              !selectedFile ||
              !(
                contentForm.type === "video" ||
                contentForm.type === "document" ||
                contentForm.type === "slide"
              )
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !contentForm.title ||
            (!contentForm.url &&
              !selectedFile &&
              (contentForm.type === "video" ||
                contentForm.type === "document" ||
                contentForm.type === "slide")) ||
            isUploading
          }
        >
          {isUploading
            ? "Đang tải lên..."
            : editMode
            ? "Cập nhật nội dung"
            : "Thêm nội dung"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditLesson;
