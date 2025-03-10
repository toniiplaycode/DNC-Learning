import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Pagination,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  DialogContentText,
  Paper,
} from "@mui/material";
import {
  Search,
  Assignment,
  Download,
  FilterList,
  Description,
  PictureAsPdf,
  Code,
  InsertDriveFile,
  Close,
  OpenInNew,
  RateReview,
} from "@mui/icons-material";

// Mock data
const mockAssignments = [
  {
    id: 1,
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    title: "Assignment 1: React Hooks",
    dueDate: "2024-03-20",
    submissions: [
      {
        id: 1,
        studentId: 1,
        studentName: "Nguyễn Văn A",
        studentAvatar: "/src/assets/logo.png",
        submittedDate: "2024-03-18",
        fileUrl: "path/to/file.pdf",
        status: "submitted", // submitted, graded, late
        score: null,
        feedback: "",
        files: [
          {
            id: 1,
            name: "react-hooks-assignment.pdf",
            type: "pdf",
            size: "2.4 MB",
            url: "path/to/file.pdf",
          },
          {
            id: 2,
            name: "source-code.zip",
            type: "zip",
            size: "1.2 MB",
            url: "path/to/file.zip",
          },
          {
            id: 3,
            name: "screenshot.png",
            type: "image",
            size: "856 KB",
            url: "path/to/image.png",
          },
        ],
      },
      {
        id: 2,
        studentId: 2,
        studentName: "Trần Thị B",
        studentAvatar: "/src/assets/logo.png",
        submittedDate: "2024-03-21",
        fileUrl: "path/to/file.pdf",
        status: "late",
        score: null,
        feedback: "",
      },
    ],
  },
  // Add more assignments...
];

const InstructorAssignments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleGrade = (submission: any) => {
    setSelectedSubmission(submission);
    setScore(submission.score || "");
    setFeedback(submission.feedback || "");
    setGradeDialogOpen(true);
  };

  const handleSubmitGrade = () => {
    // TODO: Implement grade submission logic
    setGradeDialogOpen(false);
    setSelectedSubmission(null);
    setScore("");
    setFeedback("");
  };

  const handleViewFiles = (submission: any) => {
    setSelectedFiles(submission.files);
    setFilesDialogOpen(true);
  };

  const handlePreviewFile = (file: any) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "info";
      case "graded":
        return "success";
      case "late":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return "Đã nộp";
      case "graded":
        return "Đã chấm";
      case "late":
        return "Nộp muộn";
      default:
        return status;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <PictureAsPdf color="error" />;
      case "zip":
        return <Code color="primary" />;
      case "image":
        return <Description color="success" />;
      default:
        return <InsertDriveFile />;
    }
  };

  const renderPreview = (file: any) => {
    switch (file.type) {
      case "pdf":
        return (
          <iframe
            src={file.url}
            width="100%"
            height="500px"
            style={{ border: "none" }}
            title={file.name}
          />
        );
      case "image":
        return (
          <img
            src={file.url}
            alt={file.name}
            style={{
              maxWidth: "100%",
              maxHeight: "500px",
              objectFit: "contain",
            }}
          />
        );
      default:
        return (
          <DialogContentText align="center">
            Không thể xem trước file này. Vui lòng tải xuống để xem.
          </DialogContentText>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý bài tập
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <TextField
              size="small"
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Khóa học</InputLabel>
              <Select
                value={courseFilter}
                label="Khóa học"
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả khóa học</MenuItem>
                <MenuItem value="1">React & TypeScript Masterclass</MenuItem>
                {/* Add more courses */}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="submitted">Đã nộp</MenuItem>
                <MenuItem value="graded">Đã chấm</MenuItem>
                <MenuItem value="late">Nộp muộn</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {mockAssignments.map((assignment) => (
        <Card key={assignment.id} sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  {assignment.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignment.courseName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Hạn nộp:{" "}
                {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}
              </Typography>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Học viên</TableCell>
                    <TableCell>Ngày nộp</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Điểm</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignment.submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar src={submission.studentAvatar} />
                          <Typography variant="body2">
                            {submission.studentName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submittedDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(submission.status)}
                          label={getStatusLabel(submission.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {submission.score !== null ? submission.score : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Xem bài nộp">
                            <IconButton
                              size="small"
                              onClick={() => handleViewFiles(submission)}
                            >
                              <Description />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chấm điểm">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleGrade(submission)}
                            >
                              <RateReview />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      {/* Grade Dialog */}
      <Dialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chấm điểm cho {selectedSubmission?.studentName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Điểm số"
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label="Nhận xét"
              multiline
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmitGrade}
            disabled={score === "" || score < 0 || score > 100}
          >
            Lưu điểm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Files Dialog */}
      <Dialog
        open={filesDialogOpen}
        onClose={() => setFilesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Danh sách file đã nộp</DialogTitle>
        <DialogContent>
          <List>
            {selectedFiles.map((file) => (
              <ListItem
                key={file.id}
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    {(file.type === "pdf" || file.type === "image") && (
                      <Tooltip title="Xem trước">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handlePreviewFile(file)}
                        >
                          <Description />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Tải xuống">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => window.open(file.url)}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemButton
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={file.size}
                    primaryTypographyProps={{
                      variant: "body2",
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilesDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{selectedFile?.name}</Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Mở trong tab mới">
                <IconButton
                  size="small"
                  onClick={() => window.open(selectedFile?.url)}
                >
                  <OpenInNew />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                onClick={() => setPreviewDialogOpen(false)}
              >
                <Close />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "grey.100",
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selectedFile && renderPreview(selectedFile)}
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InstructorAssignments;
