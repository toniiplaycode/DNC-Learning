import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Stack,
  Grid,
  Divider,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Link,
  LinearProgress,
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  Description,
  DownloadForOffline,
  AttachFile,
  InsertDriveFile,
  PictureAsPdf,
  Code,
  Image,
  Archive,
  Feedback,
  AccessTime,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import CustomContainer from "../../../components/common/CustomContainer";
import { fetchSubmissionsByAssignment } from "../../../features/assignment-submissions/assignmentSubmissionsSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectAssignmentSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSelectors";
import { formatDateTime } from "../../../utils/formatters";

const AssessmentAssignmentResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const assignmentSubmissions = useAppSelector(selectAssignmentSubmissions);

  useEffect(() => {
    dispatch(fetchSubmissionsByAssignment(Number(id)));
  }, [dispatch, id]);

  return (
    <CustomContainer>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Kết quả bài tập
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cột bên trái - Thông tin chính */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h5" gutterBottom>
                  Điểm số
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h4" color="primary.main">
                    {assignmentSubmissions?.score || "chưa chấm điểm"}
                  </Typography>
                  <Typography variant="h4" color="text.secondary">
                    / {assignmentSubmissions?.assignment?.maxScore}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Bài tập:</strong>{" "}
                {assignmentSubmissions?.assignment?.title}
              </Typography>
              <Typography variant="body2">
                <strong>Thời gian nộp:</strong>{" "}
                {formatDateTime(assignmentSubmissions?.submittedAt)}
                {assignmentSubmissions?.isLate && (
                  <Chip
                    label="Muộn"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              {/* <Typography variant="body2">
                <strong>Chấm điểm lúc:</strong>
              </Typography> */}
              <Typography variant="body2">
                <strong>Người chấm:</strong>
              </Typography>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Phần feedback của giảng viên */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Feedback sx={{ mr: 1 }} /> Nhận xét của giảng viên
              </Typography>

              {/* <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  "& img": { maxWidth: "100%" },
                }}
              >
                <Box sx={{ display: "flex", mb: 2 }}>
                  <Avatar
                    src={assignmentResult.instructor.avatar}
                    sx={{ mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle2">
                      {assignmentResult.instructor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assignmentResult.gradedAt}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ ml: 7 }}>
                  <ReactMarkdown>{assignmentResult.feedback}</ReactMarkdown>
                </Box>
              </Paper> */}
            </Box>
          </Card>
        </Grid>

        {/* Cột bên phải - Files và ghi chú */}
        <Grid item xs={12} md={4}>
          {/* Phần files đã nộp */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <AttachFile sx={{ mr: 1 }} /> Files đã nộp
            </Typography>

            <Link href={assignmentSubmissions?.fileUrl} target="_blank">
              {assignmentSubmissions?.fileUrl}
            </Link>
          </Card>

          {/* Phần ghi chú khi nộp bài */}
          {assignmentSubmissions?.submissionText && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ghi chú khi nộp bài
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {assignmentSubmissions?.submissionText}
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={() => navigate("/assessment")}>
          Quay lại danh sách
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              `/assessment/assignment/${assignmentSubmissions?.assignmentId}`
            )
          }
        >
          Nộp lại
        </Button>
      </Box>
    </CustomContainer>
  );
};

export default AssessmentAssignmentResult;
