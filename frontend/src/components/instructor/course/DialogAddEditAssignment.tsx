import React, { useState, useEffect, useRef } from "react";
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
  Alert,
} from "@mui/material";
import {
  Close,
  CloudUpload,
  CalendarToday,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCourseAssignments } from "../../../features/course-lessons/courseLessonsApiSlice";
import { selectAlCourseLessonlAssignments } from "../../../features/course-lessons/courseLessonsSelector";
import {
  createAssignment,
  fetchAssignmentByCourse,
  fetchInstructorAcademicClassAssignments,
  updateAssignment,
} from "../../../features/assignments/assignmentsSlice";
import { toast } from "react-toastify";
import { selectAssignmentsCourse } from "../../../features/assignments/assignmentsSelectors";
import { fetchClassInstructorById } from "../../../features/academic-class-instructors/academicClassInstructorsSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { selectCurrentClassInstructor } from "../../../features/academic-class-instructors/academicClassInstructorsSelectors";
import { fetchStudentsByAcademicClass } from "../../../features/users/usersApiSlice";
import { selectAcademicClassStudents } from "../../../features/users/usersSelectors";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import {
  uploadToDrive,
  getBestUrlForContent,
} from "../../../utils/uploadToDrive";

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
  linkDocumentRequired: string | null;
  assignmentType: "practice" | "homework" | "midterm" | "final" | "project";
  startTime?: Date | null;
  endTime?: Date | null;
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
  const currentClassInstructors = useAppSelector(selectCurrentClassInstructor);
  const academicClassStudents = useAppSelector(selectAcademicClassStudents);

  // Extract instructor ID safely with type assertion
  // @ts-ignore -- Ignoring type error since we know userInstructor exists at runtime
  const instructorId = currentUser?.userInstructor?.id;

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseAssignments(Number(id)));
      dispatch(fetchAssignmentByCourse(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (instructorId) {
      dispatch(fetchClassInstructorById(Number(instructorId)));
    }
  }, [dispatch, instructorId]);

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
    linkDocumentRequired: null,
    assignmentType: "practice",
  });

  useEffect(() => {
    if (assignmentForm.academicClassId)
      dispatch(fetchStudentsByAcademicClass(assignmentForm.academicClassId));
  }, [assignmentForm.academicClassId]);

  console.log(academicClassStudents);

  // State quản lý upload file (cho tài liệu đính kèm)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // State for reference document upload
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const [referenceUploadProgress, setReferenceUploadProgress] = useState(0);
  const [referenceUploadError, setReferenceUploadError] = useState<
    string | null
  >(null);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);

  // State cho lỗi ngày hạn nộp và lỗi chọn lớp
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [classError, setClassError] = useState<string | null>(null);

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && assignmentToEdit) {
        setAssignmentForm({
          id: assignmentToEdit.id,
          title: assignmentToEdit.title || "",
          description: assignmentToEdit.description || null,
          lessonId: assignmentToEdit.lessonId || null,
          academicClassId: Number(assignmentToEdit.academicClassId) || null,
          dueDate: assignmentToEdit.dueDate || null,
          maxScore: assignmentToEdit.maxScore || null,
          fileRequirements: assignmentToEdit.fileRequirements || null,
          linkDocumentRequired: assignmentToEdit.linkDocumentRequired || null,
          assignmentType: assignmentToEdit.assignmentType || "practice",
          startTime: assignmentToEdit.startTime || null,
          endTime: assignmentToEdit.endTime || null,
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
          linkDocumentRequired: null,
          assignmentType: "practice",
          startTime: null,
          endTime: null,
        });
      }

      // Reset file uploads
      setSelectedFiles([]);
      setFileUploadError(null);
      setUploadProgress(0);
      setIsUploading(false);

      // Reset reference document state
      setReferenceFile(null);
      setIsUploadingReference(false);
      setReferenceUploadProgress(0);
      setReferenceUploadError(null);
    }
  }, [open, editMode, assignmentToEdit, lessonData]);

  // Handle reference document file selection
  const handleReferenceFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setReferenceUploadError(
          "File quá lớn. Vui lòng chọn file nhỏ hơn 10MB"
        );
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        setReferenceUploadError(
          "Định dạng file không được hỗ trợ. Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT"
        );
        return;
      }

      setReferenceFile(file);
      setReferenceUploadError(null);
    }
  };

  // Upload reference document to Google Drive
  const handleReferenceUpload = async () => {
    if (!referenceFile) {
      setReferenceUploadError("Vui lòng chọn file để tải lên");
      return null;
    }

    setIsUploadingReference(true);
    setReferenceUploadProgress(0);

    try {
      const response = await uploadToDrive(referenceFile, (progress) => {
        setReferenceUploadProgress(progress);
      });

      if (response.success) {
        // Get the most appropriate URL based on file type
        const fileType = referenceFile.type.includes("pdf")
          ? "pdf"
          : referenceFile.type.includes("word")
          ? "docx"
          : referenceFile.type.includes("sheet")
          ? "xlsx"
          : referenceFile.type.includes("presentation")
          ? "slide"
          : "pdf";

        const bestUrl = getBestUrlForContent(response, fileType);

        // Update form with the URL
        setAssignmentForm({
          ...assignmentForm,
          linkDocumentRequired: bestUrl,
        });

        toast.success("Tải tài liệu tham khảo lên thành công!");
        return bestUrl;
      } else {
        setReferenceUploadError(response.message || "Tải lên thất bại");
        toast.error(
          "Tải tài liệu lên thất bại: " +
            (response.message || "Lỗi không xác định")
        );
        return null;
      }
    } catch (error) {
      console.error("Lỗi tải file:", error);
      setReferenceUploadError("Không thể tải file lên. Vui lòng thử lại.");
      toast.error(
        "Lỗi khi tải file: " +
          (error instanceof Error ? error.message : "Lỗi không xác định")
      );
      return null;
    } finally {
      setIsUploadingReference(false);
    }
  };

  // Gửi form
  const handleSubmit = async () => {
    // Nếu là bài tập academic thì phải chọn ngày hạn nộp
    if (additionalInfo?.targetType === "academic" && !assignmentForm.dueDate) {
      setDueDateError("Vui lòng chọn ngày hạn nộp cho bài tập học thuật");
      return;
    } else {
      setDueDateError(null);
    }
    // Nếu là bài tập academic thì phải chọn lớp
    if (
      additionalInfo?.targetType === "academic" &&
      (!assignmentForm.academicClassId || assignmentForm.academicClassId === 0)
    ) {
      setClassError("Vui lòng chọn lớp học thuật");
      return;
    } else {
      setClassError(null);
    }

    // Only upload the reference file if it hasn't been uploaded already
    if (
      referenceFile &&
      !isUploadingReference &&
      !assignmentForm.linkDocumentRequired
    ) {
      const uploadedUrl = await handleReferenceUpload();
      if (!uploadedUrl) {
        // If upload failed and no URL provided, show warning but continue
        toast.warning(
          "Tải tài liệu tham khảo không thành công, tiếp tục thêm bài tập không có tài liệu"
        );
      }
    }

    // Continue with the existing submission logic
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
    // Transform the form data to match API types
    const apiData: any = {
      title: assignmentForm.title,
      description: assignmentForm.description || undefined,
      fileRequirements: assignmentForm.fileRequirements || undefined,
      linkDocumentRequired: assignmentForm.linkDocumentRequired || undefined,
      assignmentType: assignmentForm.assignmentType,
    };

    // Only add non-null properties
    if (assignmentForm.lessonId) apiData.lessonId = assignmentForm.lessonId;
    if (assignmentForm.academicClassId)
      apiData.academicClassId = assignmentForm.academicClassId;
    if (assignmentForm.dueDate)
      apiData.dueDate = new Date(assignmentForm.dueDate).toISOString();
    if (assignmentForm.maxScore) apiData.maxScore = assignmentForm.maxScore;
    if (assignmentForm.startTime)
      apiData.startTime = new Date(assignmentForm.startTime).toISOString();
    if (assignmentForm.endTime)
      apiData.endTime = new Date(assignmentForm.endTime).toISOString();

    if (editMode) {
      apiData.id = assignmentForm.id;
    }

    if (!editMode) {
      await dispatch(createAssignment(apiData));

      // @ts-ignore -- Using type assertion for userInstructor access
      const instructorName = currentUser?.userInstructor?.fullName;
      if (academicClassStudents.length > 0 && instructorName) {
        const notificationData = {
          userIds: academicClassStudents.map((user) => user.id),
          title: `Giảng viên "${instructorName}" vừa thêm bài tập mới`,
          content: `Giảng viên vừa thêm bài tập "${assignmentForm.title}".`,
          type: "assignment",
        };
        await dispatch(createNotification(notificationData));
      }
    } else if (editMode) {
      await dispatch(updateAssignment(apiData));
    }

    await dispatch(fetchAssignmentByCourse(Number(id)));
    if (instructorId) {
      await dispatch(fetchInstructorAcademicClassAssignments(instructorId));
    }

    toast.success(
      editMode ? "Cập nhật bài tập thành công!" : "Thêm bài tập thành công!"
    );

    console.log("Submitted Data:", apiData);
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
            <FormControl fullWidth error={!!classError}>
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
                required
              >
                <MenuItem value={0}>Chọn lớp học</MenuItem>
                {/* @ts-ignore - Using type assertion since we know the structure at runtime */}
                {Array.isArray(currentClassInstructors) &&
                  currentClassInstructors.map((classInstructor: any) => (
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
                {classError || "Chọn lớp học để gán bài tập cho sinh viên"}
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
            required={additionalInfo?.targetType === "academic"}
            error={!!dueDateError}
            helperText={dueDateError || undefined}
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

            {/* Link Document Required - Enhanced with direct upload */}
            <Box>
              <Box>
                <TextField
                  label="URL tài liệu tham khảo"
                  fullWidth
                  value={assignmentForm.linkDocumentRequired || ""}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      linkDocumentRequired: e.target.value,
                    })
                  }
                  placeholder="https://drive.google.com/file/d/..."
                  helperText={
                    referenceFile
                      ? "File đã chọn, nhấn 'Tải lên' để tải lên Drive"
                      : "Nhập URL đến tài liệu tham khảo hoặc tải file lên"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CloudUpload color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    p: 2,
                    mb: 2,
                    borderRadius: 1,
                  }}
                >
                  {isUploadingReference ? (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Đang tải lên tài liệu tham khảo...{" "}
                        {referenceUploadProgress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={referenceUploadProgress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <input
                        type="file"
                        id="reference-upload"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                        hidden
                        ref={referenceFileInputRef}
                        onChange={handleReferenceFileSelect}
                      />
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <label htmlFor="reference-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            onClick={() =>
                              referenceFileInputRef.current?.click()
                            }
                          >
                            {referenceFile
                              ? `Đã chọn: ${referenceFile.name}`
                              : "Chọn file tài liệu"}
                          </Button>
                        </label>
                        {referenceFile && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReferenceUpload}
                            disabled={isUploadingReference}
                          >
                            Tải lên ngay
                          </Button>
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ mt: 1, textAlign: "center" }}
                      >
                        Định dạng hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX,
                        TXT (Tối đa 10MB)
                      </Typography>
                    </Box>
                  )}
                </Box>

                {referenceUploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {referenceUploadError}
                  </Alert>
                )}

                {assignmentForm.linkDocumentRequired &&
                  !isUploadingReference && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Tài liệu tham khảo đã sẵn sàng!
                    </Alert>
                  )}
              </Box>
            </Box>

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
                  <InputAdornment position="start"></InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !assignmentForm.title || isUploading || isUploadingReference
          }
        >
          {isUploading || isUploadingReference
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
