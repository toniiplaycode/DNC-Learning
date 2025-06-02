import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
  CardHeader,
  Divider,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  CloudUpload,
  AttachFile,
  Description,
  Delete,
  Link as LinkIcon,
  Image,
  Code,
  Archive,
  AssignmentTurnedIn,
  Grade,
  AccessTime,
  Feedback,
  InsertDriveFile,
  DownloadForOffline,
  Comment,
  Chat,
  OpenInNew,
} from "@mui/icons-material";
import { useAppDispatch } from "../../../app/hooks";
import { useAppSelector } from "../../../app/hooks";
import {
  createSubmission,
  fetchSubmissionsByAssignment,
  fetchUserSubmissions,
} from "../../../features/assignment-submissions/assignmentSubmissionsSlice";
import { selectAssignmentSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSelectors";
import { formatDateTime } from "../../../utils/formatters";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { fetchAssignmentByCourse } from "../../../features/assignments/assignmentsSlice";
import { fetchAssignmentInstructor } from "../../../features/assignments/assignmentsSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { selectSubmissionGrade } from "../../../features/user-grades/userGradesSelectors";
import { fetchGradeBySubmission } from "../../../features/user-grades/userGradesSlice";
import { selectCurrentAssignmentInstructor } from "../../../features/assignments/assignmentsSelectors";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import {
  uploadToDrive,
  getBestUrlForContent,
} from "../../../utils/uploadToDrive";

interface AssignmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface AssignmentContentProps {
  assignmentData: {
    id: number;
    assignmentId: number;
    title: string;
    description: string;
    dueDate?: string;
    maxFileSize: number; // in MB
    allowedFileTypes: string[];
    maxFiles: number;
    status?: "not_started" | "in_progress" | "submitted" | "graded";
    linkDocumentRequired?: string;
  };
}

// Add interface for form state
interface AssignmentSubmissionForm {
  assignmentId: number | null;
  userId: number | null;
  submissionText: string;
  fileUrl: string | null;
}

// Add a type for assignmentSubmission to help with proper typing
interface SingleAssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  submittedAt?: string;
  fileUrl?: string;
  submissionText?: string;
  isLate?: boolean;
  status?: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return <Image />;
  if (fileType.startsWith("text/")) return <Description />;
  if (fileType.includes("zip") || fileType.includes("rar")) return <Archive />;
  if (fileType.includes("javascript") || fileType.includes("typescript"))
    return <Code />;
  return <AttachFile />;
};

const AssignmentContent: React.FC<AssignmentContentProps> = ({
  assignmentData,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const assignmentSubmissions = useAppSelector(selectAssignmentSubmissions);
  const submissionGrade = useAppSelector(selectSubmissionGrade);
  const instructor = useAppSelector(selectCurrentAssignmentInstructor);
  const currentUser = useAppSelector(selectCurrentUser);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  // Add state for Google Drive link
  const [driveLink, setDriveLink] = useState("");
  const [submitType, setSubmitType] = useState<"drive" | "drive-upload">(
    "drive"
  );

  // State for direct Drive upload
  const [driveUploadProgress, setDriveUploadProgress] = useState(0);
  const [isDriveUploading, setIsDriveUploading] = useState(false);
  const [driveUploadError, setDriveUploadError] = useState<string | null>(null);
  const [selectedDriveFile, setSelectedDriveFile] = useState<File | null>(null);
  const driveFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchAssignmentInstructor(assignmentData.assignmentId));
  }, [dispatch, assignmentData]);

  // Add form state
  const [formSubmission, setFormSubmission] =
    useState<AssignmentSubmissionForm>({
      assignmentId: assignmentData.assignmentId || assignmentData.id,
      userId: currentUser ? Number(currentUser.id) : null,
      submissionText: "",
      fileUrl: null,
    });

  // Add loading state
  const [isLoadingGrade, setIsLoadingGrade] = useState(false);

  useEffect(() => {
    if (assignmentData.assignmentId !== null) {
      dispatch(
        fetchSubmissionsByAssignment(Number(assignmentData.assignmentId))
      );
    }
    dispatch(fetchGradeBySubmission(Number(assignmentData.assignmentId)));
    setFormSubmission((prev) => ({
      ...prev,
      assignmentId: assignmentData.assignmentId || prev.assignmentId,
    }));
  }, [dispatch, assignmentData]);

  // Refactor useEffect for better handling
  useEffect(() => {
    const fetchGrade = async () => {
      // Check if assignmentSubmissions is a single object with an id property
      const submissionId =
        assignmentSubmissions &&
        !Array.isArray(assignmentSubmissions) &&
        "id" in assignmentSubmissions
          ? assignmentSubmissions.id
          : null;

      if (submissionId) {
        setIsLoadingGrade(true);
        try {
          await dispatch(fetchGradeBySubmission(submissionId)).unwrap();
        } catch (error) {
          console.error("Error fetching grade:", error);
          toast.error("Không thể tải thông tin điểm");
        } finally {
          setIsLoadingGrade(false);
        }
      }
    };

    fetchGrade();
  }, [dispatch, assignmentSubmissions]);

  // Handle Drive upload
  const handleDriveUpload = async () => {
    if (!selectedDriveFile) {
      setDriveUploadError("Vui lòng chọn file để tải lên");
      return;
    }

    setIsDriveUploading(true);
    setDriveUploadProgress(0);
    setDriveUploadError(null);

    try {
      const response = await uploadToDrive(selectedDriveFile, (progress) => {
        setDriveUploadProgress(progress);
      });

      if (response.success) {
        // Get the most appropriate URL based on file type
        const fileType = selectedDriveFile.type.includes("pdf")
          ? "pdf"
          : selectedDriveFile.type.includes("word")
          ? "docx"
          : selectedDriveFile.type.includes("sheet")
          ? "xlsx"
          : selectedDriveFile.type.includes("presentation")
          ? "slide"
          : selectedDriveFile.type.includes("image")
          ? "image"
          : "pdf";

        const bestUrl = getBestUrlForContent(response, fileType);
        setDriveLink(bestUrl);

        toast.success("Tải file lên Drive thành công!");
      } else {
        setDriveUploadError(response.message || "Tải lên thất bại");
        toast.error(
          "Tải file lên thất bại: " + (response.message || "Lỗi không xác định")
        );
      }
    } catch (error) {
      console.error("Lỗi tải file:", error);
      setDriveUploadError("Không thể tải file lên. Vui lòng thử lại.");
      toast.error(
        "Lỗi khi tải file: " +
          (error instanceof Error ? error.message : "Lỗi không xác định")
      );
    } finally {
      setIsDriveUploading(false);
    }
  };

  // Update handleSubmit to use form state
  const handleSubmit = async () => {
    setUploading(true);
    try {
      // Make sure assignmentId is not null before submitting
      if (!formSubmission.assignmentId || !currentUser?.id) {
        toast.error("Không thể xác định bài tập hoặc người dùng");
        return;
      }

      const submissionData = {
        assignmentId: formSubmission.assignmentId,
        userId: Number(currentUser.id),
        submissionText: note,
        fileUrl: driveLink, // Always use driveLink as fileUrl
      };

      await dispatch(createSubmission(submissionData));
      await dispatch(fetchAssignmentByCourse(Number(id)));
      await dispatch(fetchUserSubmissions());
      dispatch(
        fetchSubmissionsByAssignment(Number(assignmentData.assignmentId))
      );

      if (instructor) {
        try {
          const notificationData = {
            userIds: [instructor.id],
            title: "Bài tập mới được nộp",
            content: `${currentUser?.username} đã nộp bài tập "${assignmentData.title}"`,
            type: "assignment",
          };

          await dispatch(createNotification(notificationData));
        } catch (error) {
          console.error("Error sending notification:", error);
          // Don't show error to user as this is not critical
        }
      }

      toast.success("Nộp bài thành công!");

      console.log("submissionData", submissionData);
    } finally {
      setUploading(false);
    }
  };

  // Update note change handler
  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  };

  return (
    <Box>
      {/* Hiển thị thông tin bài nộp khi có dữ liệu */}
      {assignmentSubmissions &&
      !Array.isArray(assignmentSubmissions) &&
      Object.keys(assignmentSubmissions).length > 0 ? (
        <Box sx={{ mt: 3 }}>
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AssignmentTurnedIn sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h5">Bài nộp gần nhất</Typography>
                </Box>
              }
              sx={{ bgcolor: "primary.light", color: "white", pb: 1 }}
            />
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Điểm số */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Grade sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      Điểm số:
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {isLoadingGrade ? (
                        <LinearProgress sx={{ width: 100 }} />
                      ) : (
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                          }}
                        >
                          {submissionGrade?.score != null
                            ? `${submissionGrade.score}/${submissionGrade.maxScore}`
                            : "Chưa chấm điểm"}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Box>

                {/* Nhận xét của giảng viên */}
                {submissionGrade && submissionGrade.feedback !== null && (
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Chat sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />{" "}
                    {isLoadingGrade ? (
                      <LinearProgress sx={{ width: 100 }} />
                    ) : (
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Nhận xét của giảng viên:
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: "bold",
                            }}
                          >
                            {submissionGrade.feedback}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Thời gian chấm */}

                {submissionGrade && submissionGrade.feedback !== null && (
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <AccessTime sx={{ mr: 2, color: "info.main" }} />
                    {isLoadingGrade ? (
                      <LinearProgress sx={{ width: 100 }} />
                    ) : (
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Thời gian chấm:
                        </Typography>
                        <Typography variant="body1">
                          {formatDateTime(submissionGrade.updatedAt)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Trạng thái */}
                <Divider />
                {/* Thời gian nộp */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <AccessTime sx={{ mr: 2, color: "info.main" }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      Thời gian nộp:
                    </Typography>
                    <Typography variant="body1">
                      {(assignmentSubmissions as SingleAssignmentSubmission)
                        .submittedAt
                        ? formatDateTime(
                            (
                              assignmentSubmissions as SingleAssignmentSubmission
                            ).submittedAt as string
                          )
                        : ""}
                      {(assignmentSubmissions as SingleAssignmentSubmission)
                        .isLate && (
                        <Chip
                          label="Muộn"
                          color="error"
                          size="small"
                          sx={{ ml: 1, fontWeight: "bold" }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Box>

                {/* Feedback
                {assignmentSubmissions.feedback && (
                  <>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Feedback sx={{ mr: 2, color: "secondary.main" }} />
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Nhận xét của giảng viên:
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: "grey.50",
                            borderRadius: 2,
                            whiteSpace: "pre-line",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {assignmentSubmissions.feedback}
                        </Paper>
                      </Box>
                    </Box>
                  </>
                )} */}

                {/* File đã nộp */}
                {(assignmentSubmissions as SingleAssignmentSubmission)
                  .fileUrl && (
                  <>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <AttachFile sx={{ mr: 2, color: "info.dark" }} />
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          File đã nộp:
                        </Typography>
                        <Link
                          href={
                            (
                              assignmentSubmissions as SingleAssignmentSubmission
                            ).fileUrl
                          }
                          target="_blank"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            bgcolor: "grey.100",
                            borderRadius: 1,
                            "&:hover": { bgcolor: "grey.200" },
                          }}
                        >
                          <InsertDriveFile
                            sx={{ mr: 1, color: "primary.main" }}
                          />
                          <Typography noWrap>
                            {
                              (
                                assignmentSubmissions as SingleAssignmentSubmission
                              ).fileUrl as string
                            }
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <DownloadForOffline color="primary" />
                        </Link>
                      </Box>
                    </Box>
                  </>
                )}
                {/* Ghi chú khi nộp bài */}
                {(assignmentSubmissions as SingleAssignmentSubmission)
                  .submissionText && (
                  <>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Comment sx={{ mr: 2, color: "text.secondary" }} />
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Ghi chú khi nộp bài:
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: "grey.50",
                            borderRadius: 2,
                            whiteSpace: "pre-line",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {
                            (
                              assignmentSubmissions as SingleAssignmentSubmission
                            ).submissionText
                          }
                        </Paper>
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      ) : !assignmentData.assignmentId ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            textAlign: "center",
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h5"
            color="text.secondary"
            fontWeight={"bold"}
            gutterBottom
          >
            Chưa tạo bài tập
          </Typography>
          {currentUser && currentUser.role === "instructor" && (
            <Typography variant="body2" color="text.secondary">
              Hãy qua tab "Bài trắc nghiệm/bài tập" để thêm bài tập
            </Typography>
          )}
        </Box>
      ) : (
        <>
          {/* Assignment Title Header - Add this section */}
          <Card sx={{ borderRadius: 2, boxShadow: 3, textAlign: "center" }}>
            <CardHeader
              title={
                <Box>
                  <Typography variant="h5">
                    Bài tập: {assignmentData.title}
                  </Typography>
                </Box>
              }
              sx={{ bgcolor: "primary.main", color: "white", pb: 2 }}
              subheader={
                <Box sx={{ mt: 1, color: "white" }}>
                  <Typography variant="body2">
                    {assignmentData.description &&
                      (assignmentData.description.length > 150
                        ? `${assignmentData.description.substring(0, 150)}...`
                        : assignmentData.description)}
                  </Typography>
                </Box>
              }
            />
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2}>
                {assignmentData.dueDate && (
                  <Chip
                    label={`Hạn nộp: ${formatDateTime(assignmentData.dueDate)}`}
                    color="warning"
                  />
                )}
                <Chip
                  label={`Tối đa ${assignmentData.maxFiles} file`}
                  variant="outlined"
                />
                <Chip
                  label={`Dung lượng tối đa: ${assignmentData.maxFileSize}MB`}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Reference Document Card - Make it more visually appealing and handle empty state */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Description sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Tài liệu tham khảo</Typography>
                </Box>
              }
              sx={{ bgcolor: "primary.light", color: "white", pb: 1 }}
            />
            <CardContent>
              {assignmentData.linkDocumentRequired ? (
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Box width="100%">
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "grey.50",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <InsertDriveFile
                          sx={{ mr: 2, color: "primary.main", fontSize: 28 }}
                        />
                        <Box>
                          <Typography variant="body1" gutterBottom>
                            Tài liệu từ giảng viên
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tài liệu này cung cấp thông tin hữu ích cho bài tập
                            của bạn
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "white",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            maxWidth: "80%",
                          }}
                        >
                          <InsertDriveFile sx={{ mr: 1, color: "#4285F4" }} />
                          <Typography noWrap sx={{ color: "text.primary" }}>
                            {assignmentData.linkDocumentRequired ||
                              "Tài liệu tham khảo"}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadForOffline />}
                            href={assignmentData.linkDocumentRequired}
                            target="_blank"
                            download
                          >
                            Tải xuống
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Description />}
                            href={assignmentData.linkDocumentRequired}
                            target="_blank"
                          >
                            Xem tài liệu
                          </Button>
                        </Stack>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                    textAlign: "center",
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Description
                    sx={{ fontSize: 40, color: "text.disabled", mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Không có tài liệu tham khảo cho bài tập này
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Giảng viên không cung cấp tài liệu tham khảo bổ sung
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* Upload Options */}
                <Box>
                  {/* Toggle Buttons */}
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Button
                        sx={{ mr: 1 }}
                        variant={
                          submitType === "drive" ? "contained" : "outlined"
                        }
                        onClick={() => setSubmitType("drive")}
                        startIcon={<LinkIcon />}
                      >
                        Link từ Google Drive
                      </Button>

                      <Button
                        variant={
                          submitType === "drive-upload"
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => setSubmitType("drive-upload")}
                        startIcon={<CloudUpload />}
                      >
                        Tải lên Drive
                      </Button>
                    </Box>
                  </Stack>

                  {/* Google Drive Link Section */}
                  {submitType === "drive" && (
                    <Box sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        label="Đường dẫn Google Drive"
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="Nhập đường dẫn chia sẻ từ Google Drive"
                        helperText="Đảm bảo file được chia sẻ công khai hoặc cho phép xem"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  )}

                  {/* Drive Upload Section */}
                  {submitType === "drive-upload" && (
                    <Box sx={{ p: 2 }}>
                      <input
                        type="file"
                        id="drive-upload"
                        ref={driveFileInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedDriveFile(file);
                            setDriveUploadError(null);
                          }
                        }}
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
                        {isDriveUploading ? (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Đang tải lên Drive... {driveUploadProgress}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={driveUploadProgress}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        ) : (
                          <Box>
                            <Stack
                              direction="row"
                              spacing={2}
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                onClick={() =>
                                  driveFileInputRef.current?.click()
                                }
                              >
                                {selectedDriveFile
                                  ? `Đã chọn: ${selectedDriveFile.name}`
                                  : "Chọn file để tải lên Drive"}
                              </Button>

                              {selectedDriveFile && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleDriveUpload}
                                  disabled={isDriveUploading}
                                >
                                  Tải lên Drive
                                </Button>
                              )}
                            </Stack>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                              sx={{ mt: 1, textAlign: "center" }}
                            >
                              Dung lượng tối đa: {assignmentData.maxFileSize}MB
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {driveUploadError && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ display: "block", mb: 2 }}
                        >
                          {driveUploadError}
                        </Typography>
                      )}

                      {driveLink && !isDriveUploading && (
                        <TextField
                          fullWidth
                          label="URL đã tải lên"
                          value={driveLink}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <InsertDriveFile color="primary" />
                              </InputAdornment>
                            ),
                            endAdornment: driveLink && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  href={driveLink}
                                  target="_blank"
                                >
                                  <OpenInNew />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {/* Note */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ghi chú"
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Nhập ghi chú về bài nộp của bạn (không bắt buộc)"
                />

                {/* Submit Button */}
                <Box sx={{ textAlign: "right" }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={
                      (submitType === "drive" && !driveLink) ||
                      uploading ||
                      isDriveUploading
                    }
                  >
                    {uploading ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LinearProgress
                          sx={{ width: 100, mr: 1 }}
                          color="inherit"
                        />
                        Đang tải lên...
                      </Box>
                    ) : (
                      "Nộp bài"
                    )}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default AssignmentContent;
