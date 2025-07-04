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
  LinearProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";
import {
  createCourseLesson,
  updateCourseLesson,
} from "../../../features/course-lessons/courseLessonsApiSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import { fetchQuizzesByCourse } from "../../../features/quizzes/quizzesSlice";
import { fetchCourseUsersEnrollments } from "../../../features/enrollments/enrollmentsApiSlice";
import { selectCourseUsers } from "../../../features/enrollments/enrollmentsSelectors";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import {
  uploadToDrive,
  getBestUrlForContent,
} from "../../../utils/uploadToDrive";

// Định nghĩa kiểu ContentItem cho rõ ràng
interface ContentItem {
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

// Định nghĩa props cho component
interface DialogAddEditLessonProps {
  open: boolean;
  onClose: () => void;
  initialSectionId?: number;
  contentToEdit?: ContentItem;
  sections: any[];
  editMode: boolean;
  courseData: any;
}

// Định nghĩa kiểu cho các content type
type ContentType =
  | "video"
  | "slide"
  | "txt"
  | "docx"
  | "pdf"
  | "xlsx"
  | "quiz"
  | "assignment";

const DialogAddEditLesson: React.FC<DialogAddEditLessonProps> = ({
  open,
  onClose,
  initialSectionId,
  contentToEdit,
  sections,
  editMode,
  courseData,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const allUsersEnrollments = useAppSelector(selectCourseUsers);

  // Single form state
  const [contentForm, setContentForm] = useState<ContentItem>({
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
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  useEffect(() => {
    if (open && allUsersEnrollments.length === 0 && id) {
      dispatch(fetchCourseUsersEnrollments(Number(id)));
    }
  }, [open, id, allUsersEnrollments.length, dispatch]);

  // Cập nhật form khi có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && contentToEdit) {
        setContentForm({
          id: contentToEdit.id,
          title: contentToEdit.title || "",
          contentType: (contentToEdit.contentType as ContentType) || "video",
          content: contentToEdit.content || "",
          duration: contentToEdit.duration || 0,
          contentUrl: contentToEdit.contentUrl || "",
          sectionId: contentToEdit.sectionId,
          orderNumber: contentToEdit.orderNumber,
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

  const resetFileUpload = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setFileUploadError(null);
    setUploadedFileUrl("");
  };

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

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setFileUploadError("Vui lòng chọn file để tải lên");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    console.log("Bắt đầu tải file:", selectedFile.name);

    try {
      console.log("Đang tải lên file:", selectedFile.name);
      const response = await uploadToDrive(selectedFile, (progress) => {
        setUploadProgress(progress);
        console.log(`Tiến độ tải lên: ${progress}%`);
      });

      console.log("Kết quả tải lên:", response);

      if (response.success) {
        // Lấy URL phù hợp nhất cho loại content hiện tại
        const bestUrl = getBestUrlForContent(response, contentForm.contentType);
        console.log("Tải lên thành công, URL phù hợp:", bestUrl);
        console.log("Thông tin đầy đủ:", {
          fileUrl: response.fileUrl,
          directLink: response.directLink,
          embedUrl: response.embedUrl,
          contentType: contentForm.contentType,
        });

        setUploadedFileUrl(bestUrl);
        // Cập nhật contentUrl trong form
        setContentForm((prev) => ({
          ...prev,
          contentUrl: bestUrl,
        }));
        toast.success("Tải file lên thành công!");
        return bestUrl;
      } else {
        console.error("Lỗi tải lên:", response.message);
        setFileUploadError(response.message || "Tải lên thất bại");
        toast.error(
          "Tải file lên thất bại: " + (response.message || "Lỗi không xác định")
        );
        return null;
      }
    } catch (error) {
      console.error("Lỗi tải file:", error);
      setFileUploadError("Không thể tải file lên. Vui lòng thử lại.");
      toast.error(
        "Lỗi khi tải file: " +
          (error instanceof Error ? error.message : "Lỗi không xác định")
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    // Sử dụng uploadedFileUrl nếu đã tải lên, hoặc dùng contentUrl có sẵn
    let fileUrl = uploadedFileUrl || contentForm.contentUrl;

    // Nếu có file được chọn nhưng chưa tải lên, thực hiện tải lên trước
    if (selectedFile && !uploadedFileUrl) {
      console.log("Có file chưa tải lên, tiến hành tải lên trước khi submit");
      const uploadedUrl = await handleFileUpload();
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      } else if (!contentForm.contentUrl) {
        // If upload failed and no URL provided, show error
        toast.error("Vui lòng cung cấp file hợp lệ hoặc URL");
        return;
      }
    }

    console.log("Đang submit form với URL file:", fileUrl);

    const submitData = {
      ...contentForm,
      contentUrl: fileUrl,
      duration: Number(contentForm.duration),
      sectionId: Number(contentForm.sectionId),
      orderNumber: Number(contentForm.orderNumber),
    };

    console.log("Dữ liệu submit:", submitData);

    if (!editMode) {
      dispatch(createCourseLesson(submitData))
        .unwrap()
        .then(async (createdLesson) => {
          try {
            const notificationData = {
              userIds: allUsersEnrollments.map((user) => user.id),
              title: `Nội dung học tập mới`,
              content: `Giảng viên vừa thêm ${
                createdLesson.contentType === "quiz"
                  ? "bài trắc nghiệm"
                  : createdLesson.contentType === "assignment"
                  ? "bài tập"
                  : "nội dung học tập"
              } "${createdLesson.title}" vào khóa học "${courseData?.title}".`,
              type:
                createdLesson.contentType === "quiz"
                  ? "quiz"
                  : createdLesson.contentType === "assignment"
                  ? "assignment"
                  : "course",
            };

            if (notificationData.userIds.length > 0) {
              dispatch(createNotification(notificationData));
            }

            // Refresh course data and quizzes
            dispatch(fetchCourseById(Number(id)));
            dispatch(fetchQuizzesByCourse(Number(id)));
            toast.success("Tạo nội dung thành công!");
          } catch (error) {
            console.error("Error creating notification:", error);
            // Still show success for lesson creation
            toast.success("Tạo nội dung thành công!");
          }
        });
    } else {
      dispatch(updateCourseLesson(submitData)).then(() => {
        dispatch(fetchCourseById(Number(id)));
        toast.success("Cập nhật nội dung thành công!");
      });
    }

    onClose();
  };

  // Lấy vị trí mới nhất cho nội dung
  const getNextPosition = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.contents?.length || 0;
  };

  // Xử lý khi thay đổi section
  const handleSectionChange = (newSectionId: string | number) => {
    const sectionIdNumber =
      typeof newSectionId === "string" ? parseInt(newSectionId) : newSectionId;
    const newSection = sections.find((s) => s.id === sectionIdNumber);
    // Always set to last position in the new section
    const lastPosition = newSection?.lessons?.length
      ? newSection.lessons.length + 1
      : 1;

    setContentForm({
      ...contentForm,
      sectionId: sectionIdNumber,
      orderNumber: lastPosition, // Automatically set to last position in new section
    });
  };

  // Optional: Add useEffect to handle section changes
  useEffect(() => {
    if (contentForm.sectionId) {
      const currentSection = sections.find(
        (s) => s.id === contentForm.sectionId
      );
      const lastPosition = currentSection?.lessons?.length
        ? currentSection.lessons.length + 1
        : 1;

      // Only update if in add mode or if section changed in edit mode
      if (
        !editMode ||
        (editMode && contentForm.sectionId !== contentToEdit?.sectionId)
      ) {
        setContentForm((prev) => ({
          ...prev,
          orderNumber: lastPosition,
        }));
      }
    }
  }, [contentForm.sectionId, sections, editMode, contentToEdit?.sectionId]);

  const lessonPositions = useMemo(() => {
    const currentSection = sections.find((s) => s.id === contentForm.sectionId);
    const lessonsCount = currentSection?.lessons?.length || 0;
    const totalPositions = editMode ? lessonsCount : lessonsCount + 1;
    return Array.from({ length: totalPositions }, (_, i) => i + 1);
  }, [sections, contentForm.sectionId, editMode]);

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
              onChange={(e) => handleSectionChange(e.target.value)}
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
              <MenuItem value="txt">Text (.txt)</MenuItem>
              <MenuItem value="docx">Word (.docx)</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="quiz">Bài trắc nghiệm</MenuItem>
              <MenuItem value="assignment">Bài tập</MenuItem>
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
            type="number"
            fullWidth
            value={contentForm.duration}
            onChange={(e) =>
              setContentForm({
                ...contentForm,
                duration: Number(e.target.value),
              })
            }
          />

          {/* Miễn phí */}
          <FormControlLabel
            control={
              <Switch
                checked={contentForm.isFree}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    isFree: e.target.checked,
                  })
                }
              />
            }
            label="Nội dung miễn phí"
          />
          <FormHelperText>
            Nếu được bật, học viên có thể xem nội dung này mà không cần đăng ký
            khóa học
          </FormHelperText>

          {/* Upload file */}
          {(contentForm.contentType === "video" ||
            contentForm.contentType === "slide" ||
            contentForm.contentType === "txt" ||
            contentForm.contentType === "docx" ||
            contentForm.contentType === "pdf" ||
            contentForm.contentType === "xlsx") && (
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
                          : contentForm.contentType === "slide"
                          ? ".ppt,.pptx"
                          : contentForm.contentType === "txt"
                          ? ".txt"
                          : contentForm.contentType === "docx"
                          ? ".doc,.docx"
                          : contentForm.contentType === "pdf"
                          ? ".pdf"
                          : contentForm.contentType === "xlsx"
                          ? ".xls,.xlsx"
                          : undefined
                      }
                      id="file-upload"
                      type="file"
                      hidden
                      onChange={handleFileSelect}
                    />
                    <Stack direction="row" spacing={2} justifyContent="center">
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
                      {selectedFile && !isUploading && !uploadedFileUrl && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleFileUpload}
                          disabled={isUploading}
                        >
                          Tải lên ngay
                        </Button>
                      )}
                    </Stack>
                    {uploadedFileUrl && (
                      <Typography
                        variant="subtitle2"
                        color="success.main"
                        sx={{ mt: 1 }}
                      >
                        File đã tải lên thành công! URL:{" "}
                        {uploadedFileUrl.substring(0, 50)}...
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {contentForm.contentType === "video"
                        ? "Định dạng: MP4, WebM, Ogg"
                        : contentForm.contentType === "slide"
                        ? "Định dạng: PDF, PPT, PPTX"
                        : contentForm.contentType === "txt"
                        ? "Định dạng: TXT"
                        : contentForm.contentType === "docx"
                        ? "Định dạng: DOC, DOCX"
                        : contentForm.contentType === "pdf"
                        ? "Định dạng: PDF"
                        : contentForm.contentType === "xlsx"
                        ? "Định dạng: XLS, XLSX"
                        : ""}
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

          {/* URL or Quiz/Assignment Message */}
          {contentForm.contentType === "quiz" ||
          contentForm.contentType === "assignment" ? (
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                borderRadius: 1,
                color: "white",
              }}
            >
              <Typography variant="body1" gutterBottom>
                Sau khi thêm nội dung này, hãy chuyển qua tab "BÀI TRẮC
                NGHIỆM/BÀI TẬP" để thêm chi tiết{" "}
                {contentForm.contentType === "quiz"
                  ? "bài trắc nghiệm"
                  : "bài tập"}
                .
              </Typography>
            </Box>
          ) : (
            <>
              <Typography>
                {uploadedFileUrl
                  ? "File đã tải lên hoặc nhập URL khác"
                  : "Nhập URL (nếu không tải lên file)"}
              </Typography>

              {/* URL trực tiếp */}
              <TextField
                label={`URL ${
                  contentForm.contentType === "video"
                    ? "video"
                    : contentForm.contentType === "slide"
                    ? "slide"
                    : contentForm.contentType === "txt"
                    ? "văn bản"
                    : contentForm.contentType === "docx"
                    ? "tài liệu Word"
                    : contentForm.contentType === "pdf"
                    ? "tài liệu PDF"
                    : contentForm.contentType === "xlsx"
                    ? "bảng tính Excel"
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
                  contentForm.contentType === "slide" ||
                  contentForm.contentType === "txt" ||
                  contentForm.contentType === "docx" ||
                  contentForm.contentType === "pdf" ||
                  contentForm.contentType === "xlsx"
                    ? "Có thể để trống nếu bạn tải file lên trực tiếp"
                    : "Nhập URL đến nội dung"
                }
                required={
                  !selectedFile ||
                  !(
                    contentForm.contentType === "video" ||
                    contentForm.contentType === "slide" ||
                    contentForm.contentType === "txt" ||
                    contentForm.contentType === "docx" ||
                    contentForm.contentType === "pdf" ||
                    contentForm.contentType === "xlsx"
                  )
                }
              />
            </>
          )}

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
              {lessonPositions.map((position) => (
                <MenuItem key={position} value={position}>
                  {position === 1
                    ? "Đầu tiên trong phần"
                    : position === lessonPositions.length
                    ? "Cuối cùng trong phần"
                    : `Sau "${
                        sections.find((s) => s.id === contentForm.sectionId)
                          ?.lessons?.[position - 2]?.title || ""
                      }`}
                </MenuItem>
              ))}
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
            !contentForm.title || // Only title is required
            isUploading // Disabled while uploading
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
