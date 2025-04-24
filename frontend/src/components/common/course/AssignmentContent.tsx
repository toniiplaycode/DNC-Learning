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
} from "@mui/icons-material";
import { useAppDispatch } from "../../../app/hooks";
import { useAppSelector } from "../../../app/hooks";
import {
  createSubmission,
  fetchSubmissionsByAssignment,
} from "../../../features/assignment-submissions/assignmentSubmissionsSlice";
import { selectAssignmentSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSelectors";
import { formatDateTime } from "../../../utils/formatters";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { fetchAssignmentByCourse } from "../../../features/assignments/assignmentsSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { selectSubmissionGrade } from "../../../features/user-grades/userGradesSelectors";
import { fetchGradeBySubmission } from "../../../features/user-grades/userGradesSlice";

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
  };
}

// Add interface for form state
interface AssignmentSubmissionForm {
  assignmentId: number | null;
  userId: number | null;
  submissionText: string;
  fileUrl: string | null;
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
  const currentUser = useAppSelector(selectCurrentUser);
  const [files, setFiles] = useState<AssignmentFile[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add state for Google Drive link
  const [driveLink, setDriveLink] = useState("");
  const [submitType, setSubmitType] = useState<"file" | "drive">("drive");

  // Add form state
  const [formSubmission, setFormSubmission] =
    useState<AssignmentSubmissionForm>({
      assignmentId: assignmentData.assignmentId || assignmentData.id,
      userId: Number(currentUser.id) || null,
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
      if (assignmentSubmissions?.id) {
        setIsLoadingGrade(true);
        try {
          await dispatch(
            fetchGradeBySubmission(assignmentSubmissions.id)
          ).unwrap();
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

  console.log(submissionGrade);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.size <= assignmentData.maxFileSize * 1024 * 1024 &&
        assignmentData.allowedFileTypes.some(
          (type) => file.type.includes(type) || file.name.endsWith(type)
        )
    );

    const newFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prev) =>
      [...prev, ...newFiles].slice(0, assignmentData.maxFiles)
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Update handleSubmit to use form state
  const handleSubmit = async () => {
    setUploading(true);
    try {
      const submissionData = {
        ...formSubmission,
        submissionText: note,
        fileUrl: submitType === "drive" ? driveLink : null,
      };

      await dispatch(createSubmission(submissionData));
      await dispatch(fetchAssignmentByCourse(Number(id)));
      dispatch(
        fetchSubmissionsByAssignment(Number(assignmentData.assignmentId))
      );

      toast.success("Nộp bài thành công!");

      console.log("submissionData", submissionData);
    } finally {
      setUploading(false);
    }
  };

  // Update note change handler
  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    setFormSubmission((prev) => ({
      ...prev,
      submissionText: newNote,
    }));
  };

  // Update drive link change handler
  const handleDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    setDriveLink(newLink);
    setFormSubmission((prev) => ({
      ...prev,
      fileUrl: newLink,
    }));
  };

  return (
    <Box>
      {/* Hiển thị thông tin bài nộp khi có dữ liệu */}
      {assignmentSubmissions &&
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
                      {assignmentSubmissions.submittedAt
                        ? formatDateTime(assignmentSubmissions.submittedAt)
                        : ""}
                      {assignmentSubmissions.isLate && (
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
                {assignmentSubmissions.fileUrl && (
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
                          href={assignmentSubmissions.fileUrl}
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
                            {assignmentSubmissions.fileUrl.split("/").pop()}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <DownloadForOffline color="primary" />
                        </Link>
                      </Box>
                    </Box>
                  </>
                )}
                {/* Ghi chú khi nộp bài */}
                {assignmentSubmissions.submissionText && (
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
                          {assignmentSubmissions.submissionText}
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
          {currentUser.role === "instructor" && (
            <Typography variant="body2" color="text.secondary">
              Hãy qua tab "BÀI KIỂM TRA/BÀI TẬP" để thêm bài tập
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
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
          {/* Upload Section */}
          <Card>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                multiple
                onChange={handleFileSelect}
                accept={assignmentData.allowedFileTypes.join(",")}
              />

              <Stack spacing={3}>
                {/* File List */}
                {files.length > 0 && (
                  <List>
                    {files.map((file) => (
                      <ListItem
                        key={file.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <Delete />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / (1024 * 1024)).toFixed(
                            2
                          )} MB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

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
                        Google Drive
                      </Button>

                      <Button
                        variant={
                          submitType === "file" ? "contained" : "outlined"
                        }
                        startIcon={<CloudUpload />}
                        onClick={() => {
                          setSubmitType("file");
                          fileInputRef.current?.click();
                        }}
                        disabled={files.length >= assignmentData.maxFiles}
                      >
                        Upload file
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
                        onChange={handleDriveLinkChange}
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
                      (submitType === "file" && files.length === 0) ||
                      (submitType === "drive" && !driveLink) ||
                      uploading
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

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Xem trước bài nộp</DialogTitle>
        <DialogContent>
          <Box>
            <List>
              {files.map((file) => (
                <ListItem key={file.id}>
                  <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                  />
                </ListItem>
              ))}
            </List>
            {note && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ghi chú:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {note}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentContent;
