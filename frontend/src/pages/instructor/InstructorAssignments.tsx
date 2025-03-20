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
  Tabs,
  Tab,
  Grid,
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
  School,
  Person,
  Class,
  FilterAlt,
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
        studentType: "student", // Học viên bên ngoài
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
        studentType: "student", // Học viên bên ngoài
        submittedDate: "2024-03-21",
        fileUrl: "path/to/file.pdf",
        status: "late",
        score: null,
        feedback: "",
        files: [
          {
            id: 1,
            name: "react-hooks-assignment-b.pdf",
            type: "pdf",
            size: "1.9 MB",
            url: "path/to/file-b.pdf",
          },
        ],
      },
      // Sinh viên trường học
      {
        id: 3,
        studentId: 3,
        studentCode: "SV001", // Mã số sinh viên
        studentName: "Phạm Văn C",
        studentAvatar: "/src/assets/logo.png",
        studentType: "student_academic", // Sinh viên trường
        className: "CNTT-K44A", // Lớp học
        faculty: "Công nghệ thông tin", // Khoa
        submittedDate: "2024-03-19",
        fileUrl: "path/to/file.pdf",
        status: "submitted",
        score: null,
        feedback: "",
        files: [
          {
            id: 1,
            name: "assignment1-pham-van-c.pdf",
            type: "pdf",
            size: "2.1 MB",
            url: "path/to/file-c.pdf",
          },
          {
            id: 2,
            name: "source-code-c.zip",
            type: "zip",
            size: "1.5 MB",
            url: "path/to/file-c.zip",
          },
        ],
      },
      {
        id: 4,
        studentId: 4,
        studentCode: "SV002", // Mã số sinh viên
        studentName: "Lê Thị D",
        studentAvatar: "/src/assets/logo.png",
        studentType: "student_academic", // Sinh viên trường
        className: "CNTT-K44B", // Lớp học
        faculty: "Công nghệ thông tin", // Khoa
        submittedDate: "2024-03-17",
        fileUrl: "path/to/file.pdf",
        status: "graded", // Đã chấm điểm
        score: 85,
        feedback: "Bài làm tốt, nhưng cần cải thiện phần UI/UX",
        files: [
          {
            id: 1,
            name: "assignment1-le-thi-d.pdf",
            type: "pdf",
            size: "2.0 MB",
            url: "path/to/file-d.pdf",
          },
        ],
      },
    ],
  },
  // Thêm bài tập khác nếu cần
];

// Danh sách lớp học
const mockClasses = [
  "Tất cả",
  "CNTT-K44A",
  "CNTT-K44B",
  "CNTT-K45A",
  "KHMT-K44A",
  "KTPM-K44A",
];

// Danh sách khoa
const mockFaculties = [
  "Tất cả",
  "Công nghệ thông tin",
  "Kỹ thuật điện tử",
  "Kinh tế",
];

const InstructorAssignments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentTypeFilter, setStudentTypeFilter] = useState("all"); // all, student, student_academic
  const [classFilter, setClassFilter] = useState("Tất cả");
  const [facultyFilter, setFacultyFilter] = useState("Tất cả");

  const [page, setPage] = useState(1);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleGrade = (submission: any) => {
    setSelectedSubmission(submission);
    setScore(submission.score || "");
    setFeedback(submission.feedback || "");
    setGradeDialogOpen(true);
  };

  const handleSubmitGrade = () => {
    // TODO: Implement grade submission logic
    setGradeDialogOpen(false);
  };

  const handleViewFiles = (files: any[]) => {
    setSelectedFiles(files);
    setFilesDialogOpen(true);
  };

  const handlePreviewFile = (file: any) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <PictureAsPdf color="error" />;
      case "doc":
      case "docx":
        return <Description color="primary" />;
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return <Description color="info" />;
      case "zip":
        return <Description color="warning" />;
      default:
        return <InsertDriveFile />;
    }
  };

  const renderPreview = (file: any) => {
    if (file.type === "pdf") {
      return (
        <iframe
          src={file.url}
          width="100%"
          height="500px"
          title={file.name}
          style={{ border: "none" }}
        />
      );
    } else if (
      file.type === "image" ||
      file.type === "png" ||
      file.type === "jpg" ||
      file.type === "jpeg"
    ) {
      return (
        <img
          src={file.url}
          alt={file.name}
          style={{ maxWidth: "100%", maxHeight: "500px" }}
        />
      );
    } else {
      return (
        <Typography align="center" color="text.secondary">
          Không thể hiển thị xem trước cho loại file này
        </Typography>
      );
    }
  };

  const getStatusChip = (status: string, score: number | null) => {
    switch (status) {
      case "submitted":
        return <Chip label="Đã nộp" color="primary" size="small" />;
      case "graded":
        return (
          <Chip label={`Đã chấm: ${score}/100`} color="success" size="small" />
        );
      case "late":
        return <Chip label="Nộp muộn" color="warning" size="small" />;
      default:
        return <Chip label="Chưa nộp" color="default" size="small" />;
    }
  };

  // Lọc submissions dựa trên các filter
  const getFilteredSubmissions = () => {
    let assignmentSubmissions: any[] = [];

    // Gộp tất cả các submission từ tất cả các bài tập
    mockAssignments.forEach((assignment) => {
      if (
        courseFilter === "all" ||
        courseFilter === assignment.courseId.toString()
      ) {
        assignment.submissions.forEach((submission) => {
          assignmentSubmissions.push({
            ...submission,
            assignmentTitle: assignment.title,
            courseName: assignment.courseName,
            dueDate: assignment.dueDate,
          });
        });
      }
    });

    // Áp dụng các bộ lọc
    return assignmentSubmissions.filter((submission) => {
      // Lọc theo trạng thái
      if (statusFilter !== "all" && submission.status !== statusFilter) {
        return false;
      }

      // Lọc theo loại học viên
      if (
        studentTypeFilter !== "all" &&
        submission.studentType !== studentTypeFilter
      ) {
        return false;
      }

      // Lọc theo lớp (chỉ áp dụng cho sinh viên trường)
      if (
        submission.studentType === "student_academic" &&
        classFilter !== "Tất cả" &&
        submission.className !== classFilter
      ) {
        return false;
      }

      // Lọc theo khoa (chỉ áp dụng cho sinh viên trường)
      if (
        submission.studentType === "student_academic" &&
        facultyFilter !== "Tất cả" &&
        submission.faculty !== facultyFilter
      ) {
        return false;
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          submission.studentName.toLowerCase().includes(query) ||
          (submission.studentCode &&
            submission.studentCode.toLowerCase().includes(query)) ||
          submission.assignmentTitle.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  const filteredSubmissions = getFilteredSubmissions();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setStudentTypeFilter("all");
    } else if (newValue === 1) {
      setStudentTypeFilter("student");
    } else {
      setStudentTypeFilter("student_academic");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý học viên
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên học viên, mã sinh viên hoặc tên bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ md: "center" }}
              >
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    label="Khóa học"
                  >
                    <MenuItem value="all">Tất cả khóa học</MenuItem>
                    {mockAssignments.map((assignment) => (
                      <MenuItem
                        key={assignment.courseId}
                        value={assignment.courseId.toString()}
                      >
                        {assignment.courseName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="submitted">Đã nộp</MenuItem>
                    <MenuItem value="graded">Đã chấm</MenuItem>
                    <MenuItem value="late">Nộp muộn</MenuItem>
                  </Select>
                </FormControl>

                {studentTypeFilter === "student_academic" && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <InputLabel>Lớp</InputLabel>
                      <Select
                        value={classFilter}
                        onChange={(e) =>
                          setClassFilter(e.target.value as string)
                        }
                        label="Lớp"
                      >
                        {mockClasses.map((className) => (
                          <MenuItem key={className} value={className}>
                            {className}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Khoa</InputLabel>
                      <Select
                        value={facultyFilter}
                        onChange={(e) =>
                          setFacultyFilter(e.target.value as string)
                        }
                        label="Khoa"
                      >
                        {mockFaculties.map((faculty) => (
                          <MenuItem key={faculty} value={faculty}>
                            {faculty}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs to switch between student types */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<FilterAlt fontSize="small" />}
            iconPosition="start"
            label="Tất cả học viên"
          />
          <Tab
            icon={<Person fontSize="small" />}
            iconPosition="start"
            label="Học viên bên ngoài"
          />
          <Tab
            icon={<School fontSize="small" />}
            iconPosition="start"
            label="Sinh viên trường"
          />
        </Tabs>
      </Box>

      {/* Result count */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Hiển thị {filteredSubmissions.length} kết quả
      </Typography>

      {/* Assignments table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Học viên</TableCell>
              {studentTypeFilter === "student_academic" && (
                <>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Lớp</TableCell>
                </>
              )}
              <TableCell>Bài tập</TableCell>
              <TableCell>Khóa học</TableCell>
              <TableCell>Ngày nộp</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={submission.studentAvatar}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="body2">
                        {submission.studentName}
                      </Typography>
                      <Tooltip
                        title={
                          submission.studentType === "student_academic"
                            ? "Sinh viên trường"
                            : "Học viên bên ngoài"
                        }
                      >
                        <Chip
                          icon={
                            submission.studentType === "student_academic" ? (
                              <School fontSize="small" />
                            ) : (
                              <Person fontSize="small" />
                            )
                          }
                          label={
                            submission.studentType === "student_academic"
                              ? "SV"
                              : "HV"
                          }
                          size="small"
                          color={
                            submission.studentType === "student_academic"
                              ? "secondary"
                              : "primary"
                          }
                          variant="outlined"
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  {studentTypeFilter === "student_academic" && (
                    <>
                      <TableCell>{submission.studentCode || "-"}</TableCell>
                      <TableCell>{submission.className || "-"}</TableCell>
                    </>
                  )}

                  <TableCell>{submission.assignmentTitle}</TableCell>
                  <TableCell>{submission.courseName}</TableCell>
                  <TableCell>{submission.submittedDate}</TableCell>
                  <TableCell>
                    {getStatusChip(submission.status, submission.score)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Xem files">
                        <IconButton
                          size="small"
                          onClick={() => handleViewFiles(submission.files)}
                        >
                          <Description fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chấm điểm">
                        <IconButton
                          size="small"
                          onClick={() => handleGrade(submission)}
                        >
                          <RateReview fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={studentTypeFilter === "student_academic" ? 8 : 6}
                  align="center"
                >
                  Không tìm thấy bài nộp nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredSubmissions.length > 0 && (
        <Box display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredSubmissions.length / 10)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Grading Dialog */}
      <Dialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chấm điểm bài tập</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">
                  {selectedSubmission.assignmentTitle}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedSubmission.courseName}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Avatar
                    src={selectedSubmission.studentAvatar}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography>
                    {selectedSubmission.studentName}
                    {selectedSubmission.studentType === "student_academic" && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({selectedSubmission.studentCode} -{" "}
                        {selectedSubmission.className})
                      </Typography>
                    )}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Nộp lúc: {selectedSubmission.submittedDate}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Files đã nộp:
              </Typography>
              <List dense>
                {selectedSubmission.files.map((file: any) => (
                  <ListItem key={file.id} disablePadding>
                    <ListItemButton
                      onClick={() => handlePreviewFile(file)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={file.size}
                        primaryTypographyProps={{
                          variant: "body2",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Chấm điểm:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Điểm (0-100)"
                      type="number"
                      value={score}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) {
                          setScore("");
                        } else {
                          setScore(Math.min(Math.max(val, 0), 100));
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        inputProps: {
                          min: 0,
                          max: 100,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Phản hồi"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={4}
                      placeholder="Nhập nhận xét, đánh giá..."
                    />
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
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
