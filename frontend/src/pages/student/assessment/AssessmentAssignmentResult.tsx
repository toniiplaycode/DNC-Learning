import React from "react";
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
import ReactMarkdown from "react-markdown";

// Mock data cho kết quả bài tập
const mockAssignmentResult = {
  id: 1,
  title: "Bài tập: Xây dựng ứng dụng React Hooks",
  description:
    "Trong bài tập này, bạn sẽ áp dụng kiến thức về React Hooks để xây dựng một ứng dụng quản lý công việc (Todo App) đơn giản.",
  maxPoints: 100,
  score: 85,
  submittedAt: "18/03/2024 23:45",
  gradedAt: "20/03/2024 14:30",
  status: "graded", // pending, graded, rejected, late
  dueDate: "20/03/2024 23:59",
  isLate: false,
  feedback: `
## Nhận xét chi tiết

Bài làm của bạn hoàn thành tốt các yêu cầu cơ bản của bài tập. Ứng dụng Todo chạy ổn định và có đầy đủ chức năng theo yêu cầu.

### Điểm mạnh:
- Sử dụng useState và useEffect đúng cách
- Custom hook useTodoStorage được triển khai tốt
- Giao diện dễ sử dụng

### Điểm cần cải thiện:
- Cần tối ưu hóa hiệu suất với useCallback và useMemo
- TypeScript có thể được sử dụng triệt để hơn với các interface rõ ràng
- Cần xử lý thêm các trường hợp lỗi

Tổng thể đây là một bài nộp tốt. Tiếp tục phát huy!
  `,
  submittedFiles: [
    {
      id: 1,
      name: "react_hooks_todo_app.zip",
      type: "zip",
      size: "1.4 MB",
      url: "/path/to/file.zip",
    },
    {
      id: 2,
      name: "README.md",
      type: "md",
      size: "4 KB",
      url: "/path/to/readme.md",
    },
    {
      id: 3,
      name: "screenshot.png",
      type: "image",
      size: "245 KB",
      url: "/path/to/screenshot.png",
    },
  ],
  note: "Em đã hoàn thành bài tập theo yêu cầu. Em đã cố gắng áp dụng tất cả các hooks đã học trong khóa. Phần dark mode em làm thêm như một tính năng bổ sung.",
  instructor: {
    name: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
  },
};

// Hàm để chọn icon phù hợp với loại file
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <PictureAsPdf color="error" />;
    case "doc":
    case "docx":
    case "txt":
    case "md":
      return <Description color="primary" />;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
      return <Code color="success" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <Image color="info" />;
    case "zip":
    case "rar":
      return <Archive color="warning" />;
    default:
      return <InsertDriveFile />;
  }
};

const AssessmentAssignmentResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Trong thực tế, dữ liệu sẽ được lấy từ API dựa theo id
  const assignmentResult = mockAssignmentResult;

  // Xác định trạng thái và màu sắc tương ứng
  const getStatusInfo = () => {
    switch (assignmentResult.status) {
      case "graded":
        return {
          label: "Đã chấm điểm",
          color: "success",
          icon: <CheckCircle />,
        };
      case "pending":
        return {
          label: "Đang chờ chấm",
          color: "warning",
          icon: <AccessTime />,
        };
      case "rejected":
        return {
          label: "Bị từ chối",
          color: "error",
          icon: <Feedback />,
        };
      case "late":
        return {
          label: "Nộp muộn",
          color: "warning",
          icon: <AccessTime />,
        };
      default:
        return {
          label: "Đã nộp",
          color: "info",
          icon: <Assignment />,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <CustomContainer>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Kết quả bài tập
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {assignmentResult.title}
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
                  <Typography variant="h3" color="primary.main">
                    {assignmentResult.score}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    / {assignmentResult.maxPoints}
                  </Typography>
                </Stack>
              </Box>

              <Chip
                icon={statusInfo.icon}
                label={statusInfo.label}
                color={statusInfo.color as any}
                sx={{ fontWeight: "medium" }}
              />
            </Stack>

            <Box sx={{ mt: 1, mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={
                  (assignmentResult.score / assignmentResult.maxPoints) * 100
                }
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Bài tập:</strong> {assignmentResult.title}
              </Typography>
              <Typography variant="body2">
                <strong>Thời gian nộp:</strong> {assignmentResult.submittedAt}
                {assignmentResult.isLate && (
                  <Chip
                    label="Muộn"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="body2">
                <strong>Chấm điểm lúc:</strong> {assignmentResult.gradedAt}
              </Typography>
              <Typography variant="body2">
                <strong>Người chấm:</strong> {assignmentResult.instructor.name}
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

              <Paper
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
              </Paper>
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

            <List>
              {assignmentResult.submittedFiles.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="download"
                      color="primary"
                    >
                      <DownloadForOffline />
                    </IconButton>
                  }
                  sx={{ px: 1 }}
                >
                  <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                  <ListItemText primary={file.name} secondary={file.size} />
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Phần ghi chú khi nộp bài */}
          {assignmentResult.note && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ghi chú khi nộp bài
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {assignmentResult.note}
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
          onClick={() => navigate(`/assessment/assignment/${id}`)}
        >
          Nộp lại
        </Button>
      </Box>
    </CustomContainer>
  );
};

export default AssessmentAssignmentResult;
