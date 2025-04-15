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
import { createCourseLesson } from "../../../features/course-lessons/courseLessonsApiSlice";
import { useAppDispatch } from "../../../app/hooks";
import { fetchCourseSectionsByCourseId } from "../../../features/course-sections/courseSectionApiSlice";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";

// Định nghĩa kiểu ContentItem cho rõ ràng
interface ContentItem {
  id: number;
  contentType: string;
  title: string;
  content: string;
  duration: number;
  contentUrl: string;
  completed: boolean;
  locked: boolean;
  sectionId?: number;
}

// Định nghĩa props cho component
interface DialogAddEditLessonProps {
  open: boolean;
  onClose: () => void;
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
  id?: number;
  title: string;
  contentType: ContentType;
  content: string;
  duration: number;
  contentUrl: string;
  sectionId: number;
  orderNumber: number;
  isFree?: boolean;
}

const DialogAddEditLesson: React.FC<DialogAddEditLessonProps> = ({
  open,
  onClose,
  initialSectionId,
  contentToEdit,
  sections,
  editMode,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  // Single form state
  const [contentForm, setContentForm] = useState<ContentFormData>({
    title: "",
    contentType: "video",
    content: "",
    duration: 0,
    contentUrl: "",
    sectionId: initialSectionId || 0,
    orderNumber: 1,
    isFree: false,
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
        // Tìm section và orderNumber của content khi edit
        let sectionId = contentToEdit.sectionId || 0;
        let orderNumber = 0;

        // Nếu không có sectionId trong contentToEdit, tìm từ sections
        if (!sectionId) {
          for (const section of sections) {
            const contentIndex = section.contents.findIndex(
              (c: ContentItem) => c.id === contentToEdit.id
            );
            if (contentIndex !== -1) {
              sectionId = section.id;
              orderNumber = contentIndex;
              break;
            }
          }
        }

        setContentForm({
          id: contentToEdit.id,
          title: contentToEdit.title || "",
          contentType: (contentToEdit.contentType as ContentType) || "video",
          content: contentToEdit.content || "",
          duration: contentToEdit.duration || 0,
          contentUrl: contentToEdit.contentUrl || "",
          sectionId: sectionId,
          orderNumber: orderNumber,
          isFree: contentToEdit.isFree || false,
        });
      } else {
        // Khi thêm mới
        const section = sections.find((s) => s.id === initialSectionId);
        // Set position to length + 1 for new content
        const lastPosition = section?.lessons?.length
          ? section.lessons.length + 1
          : 1;

        setContentForm({
          title: "",
          contentType: "video",
          content: "",
          duration: 0,
          contentUrl: "",
          sectionId: initialSectionId || 0,
          orderNumber: lastPosition, // Set to last position by default
          isFree: false,
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
    let fileUrl = contentForm.contentUrl;

    if (selectedFile) {
      fileUrl = (await simulateFileUpload()) || "";
    }

    const submitData = {
      ...contentForm,
      contentUrl: fileUrl,
      duration: Number(contentForm.duration),
      sectionId: Number(contentForm.sectionId),
      orderNumber: Number(contentForm.orderNumber),
    };

    console.log(submitData);

    dispatch(createCourseLesson(submitData)).then(() => {
      dispatch(fetchCourseById(Number(id)));
      toast.success(
        editMode
          ? "Cập nhật bài giảng thành công!"
          : "Thêm bài giảng thành công!"
      );
    });

    onClose();
  };

  // Lấy vị trí mới nhất cho nội dung
  const getNextPosition = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.contents?.length || 0;
  };

  // Xử lý khi thay đổi section
  const handleSectionChange = (newSectionId: number) => {
    const section = sections.find((s) => s.id === newSectionId);
    const lastPosition = section?.lessons?.length
      ? section.lessons.length + 1
      : 1;

    setContentForm({
      ...contentForm,
      sectionId: newSectionId,
      orderNumber: lastPosition, // Set to last position when changing sections
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
              value={contentForm.contentType}
              onChange={(e) =>
                setContentForm({
                  ...contentForm,
                  contentType: e.target.value as ContentType,
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
            value={contentForm.content}
            onChange={(e) =>
              setContentForm({ ...contentForm, content: e.target.value })
            }
            placeholder="Nhập mô tả chi tiết về nội dung"
          />

          {/* Thời lượng */}
          <TextField
            label="Thời lượng (phút)"
            fullWidth
            value={contentForm.duration}
            onChange={(e) =>
              setContentForm({
                ...contentForm,
                duration: Number(e.target.value),
              })
            }
          />

          {/* Upload file */}
          {(contentForm.contentType === "video" ||
            contentForm.contentType === "document" ||
            contentForm.contentType === "slide") && (
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
                        contentForm.contentType === "video"
                          ? "video/*"
                          : contentForm.contentType === "document"
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
                      {contentForm.contentType === "video"
                        ? "Định dạng: MP4, WebM, Ogg"
                        : contentForm.contentType === "document"
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
              contentForm.contentType === "video"
                ? "video"
                : contentForm.contentType === "slide"
                ? "slide"
                : contentForm.contentType === "document"
                ? "tài liệu"
                : contentForm.contentType === "link"
                ? "đường dẫn"
                : "nội dung"
            }`}
            fullWidth
            value={contentForm.contentUrl}
            onChange={(e) =>
              setContentForm({ ...contentForm, contentUrl: e.target.value })
            }
            placeholder="https://example.com/content"
            helperText={
              contentForm.contentType === "video" ||
              contentForm.contentType === "document" ||
              contentForm.contentType === "slide"
                ? "Có thể để trống nếu bạn tải file lên trực tiếp"
                : "Nhập URL đến nội dung"
            }
            required={
              !selectedFile ||
              !(
                contentForm.contentType === "video" ||
                contentForm.contentType === "document" ||
                contentForm.contentType === "slide"
              )
            }
          />

          {/* Vị trí bài học */}
          <FormControl fullWidth>
            <InputLabel>Vị trí bài học</InputLabel>
            <Select
              value={contentForm.orderNumber}
              onChange={(e) =>
                setContentForm({
                  ...contentForm,
                  orderNumber: Number(e.target.value),
                })
              }
              label="Vị trí bài học"
            >
              {(() => {
                const currentSection = sections.find(
                  (s) => s.id === contentForm.sectionId
                );
                const lessonsCount = currentSection?.lessons?.length || 0;
                const totalPositions = editMode
                  ? lessonsCount
                  : lessonsCount + 1;

                return Array.from({ length: totalPositions }, (_, i) => {
                  const position = i + 1;
                  return (
                    <MenuItem key={position} value={position}>
                      {position === 1
                        ? "Đầu tiên trong phần"
                        : position === totalPositions
                        ? "Cuối cùng trong phần"
                        : `Sau "${
                            currentSection?.lessons?.[position - 2]?.title || ""
                          }`}
                    </MenuItem>
                  );
                });
              })()}
            </Select>
            <FormHelperText>
              Chọn vị trí hiển thị của bài học trong phần học
            </FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !contentForm.title ||
            (!contentForm.contentUrl &&
              !selectedFile &&
              (contentForm.contentType === "video" ||
                contentForm.contentType === "document" ||
                contentForm.contentType === "slide")) ||
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
