import { useEffect, useState } from "react";
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
import DialogAddEditAssignment from "../../components/instructor/course/DialogAddEditAssignment";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { fetchSubmissionsByInstructor } from "../../features/assignment-submissions/assignmentSubmissionsSlice";
import { selectInstructorSubmissions } from "../../features/assignment-submissions/assignmentSubmissionsSelectors";
import { formatDateTime } from "../../utils/formatters";

const InstructorAssignments = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorSubmissions = useAppSelector(selectInstructorSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentTypeFilter, setStudentTypeFilter] = useState("all"); // all, student, student_academic
  const [classFilter, setClassFilter] = useState("Tất cả");
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

  // Thêm state và các hàm xử lý để mở dialog tạo bài tập
  const [openAddAssignmentModal, setOpenAddAssignmentModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [mockCourseData, setMockCourseData] = useState({
    sections: [
      { id: 1, title: "Section 1", contents: [] },
      { id: 2, title: "Section 2", contents: [] },
      { id: 3, title: "Section 3", contents: [] },
    ],
  });

  useEffect(() => {
    dispatch(fetchSubmissionsByInstructor(currentUser.userInstructor.id));
  }, [dispatch, currentUser]);

  console.log(instructorSubmissions);

  const handleGrade = (submission: any) => {
    const file = submission.fileUrl
      ? {
          id: 1,
          name: submission.fileUrl.split("/").pop(),
          url: submission.fileUrl,
          type: submission.fileUrl.split(".").pop()?.toLowerCase() || "unknown",
        }
      : null;

    setSelectedSubmission({
      ...submission,
      assignmentTitle: submission.assignment.title,
      courseName:
        submission.assignment.academicClass?.className ||
        submission.assignment.lesson?.title,
      studentAvatar: submission.user.avatarUrl,
      studentName:
        submission.user.userStudentAcademic?.fullName ||
        submission.user.userStudent?.fullName,
      studentType: submission.user.role,
      studentCode: submission.user.userStudentAcademic?.studentCode,
      className: submission.assignment.academicClass?.classCode,
      submittedDate: formatDateTime(submission.submittedAt),
      files: file ? [file] : [],
    });

    setScore(submission.score || "");
    setFeedback(submission.feedback || "");
    setGradeDialogOpen(true);
  };

  const handleSubmitGrade = () => {
    // TODO: Implement grade submission logic
    setGradeDialogOpen(false);
  };

  const handleViewFiles = (submission: any) => {
    if (!submission.fileUrl) {
      setSelectedFiles([]);
      setFilesDialogOpen(true);
      return;
    }

    // Create a file object from the fileUrl
    const file = {
      id: 1,
      name: submission.fileUrl.split("/").pop(), // Get filename from URL
      url: submission.fileUrl,
      type: submission.fileUrl.split(".").pop()?.toLowerCase() || "unknown", // Get file extension
    };

    setSelectedFiles([file]);
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
    return instructorSubmissions.filter((submission) => {
      const isStudentAcademic = submission.user.role === "student_academic";

      // Lọc theo loại học viên
      if (studentTypeFilter !== "all") {
        if (studentTypeFilter === "student_academic" && !isStudentAcademic)
          return false;
        if (studentTypeFilter === "student" && isStudentAcademic) return false;
      }

      // Lọc theo khóa học/lớp học
      if (courseFilter !== "all") {
        if (submission.assignment.academicClassId) {
          if (
            courseFilter !== submission.assignment.academicClass?.id.toString()
          )
            return false;
        }
      }

      // Lọc theo trạng thái
      if (statusFilter !== "all" && submission.status !== statusFilter) {
        return false;
      }

      // Lọc theo lớp học (cho sinh viên trường)
      if (isStudentAcademic && classFilter !== "Tất cả") {
        if (submission.assignment.academicClass?.classCode !== classFilter)
          return false;
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          submission.user.userStudentAcademic?.fullName
            .toLowerCase()
            .includes(query) ||
          submission.user.userStudent?.fullName.toLowerCase().includes(query) ||
          submission.user.userStudentAcademic?.studentCode
            ?.toLowerCase()
            .includes(query) ||
          submission.assignment.title.toLowerCase().includes(query)
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

  // Hàm xử lý khi nhấn nút tạo bài tập mới cho sinh viên
  const handleOpenAddAssignmentModal = () => {
    setOpenAddAssignmentModal(true);
  };

  // Hàm xử lý khi thêm bài tập mới
  const handleAddAssignment = (assignmentData: any) => {
    console.log("Thêm bài tập mới:", assignmentData);
    console.log("Dành cho sinh viên thuộc lớp:", classFilter);

    // Thực hiện thêm bài tập (gọi API)
    alert(`Đã tạo bài tập "${assignmentData.title}" thành công!`);
    setOpenAddAssignmentModal(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý bài tập
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
                    {[
                      ...new Map(
                        instructorSubmissions
                          .filter(
                            (sub) => sub.assignment.lesson?.section?.course
                          )
                          .map((sub) => [
                            sub.assignment.lesson.section.course.id,
                            sub.assignment.lesson.section.course,
                          ])
                      ).values(),
                    ].map((course) => (
                      <MenuItem key={course.id} value={course.id.toString()}>
                        {course.title}
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
                        <MenuItem value="Tất cả">Tất cả</MenuItem>
                        {Array.from(
                          new Set(
                            instructorSubmissions
                              .filter((sub) => sub.assignment.academicClass)
                              .map(
                                (sub) => sub.assignment.academicClass.classCode
                              )
                          )
                        ).map((classCode) => (
                          <MenuItem key={classCode} value={classCode}>
                            {classCode}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}

                {studentTypeFilter === "student_academic" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenAddAssignmentModal}
                  >
                    Tạo bài tập mới
                  </Button>
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
              <TableCell>Lớp/Khóa học</TableCell>
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
                        src={submission.user.avatarUrl}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="body2">
                        {submission.user.userStudentAcademic?.fullName ||
                          submission.user.userStudent?.fullName}
                      </Typography>
                      <Tooltip
                        title={
                          submission.user.role === "student_academic"
                            ? "Sinh viên trường"
                            : "Học viên bên ngoài"
                        }
                      >
                        <Chip
                          icon={
                            submission.user.role === "student_academic" ? (
                              <School fontSize="small" />
                            ) : (
                              <Person fontSize="small" />
                            )
                          }
                          label={
                            submission.user.role === "student_academic"
                              ? "SV"
                              : "HV"
                          }
                          size="small"
                          color={
                            submission.user.role === "student_academic"
                              ? "primary"
                              : "info"
                          }
                          variant="outlined"
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  {studentTypeFilter === "student_academic" && (
                    <>
                      <TableCell>
                        {submission.user.userStudentAcademic?.studentCode ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        {submission.assignment.academicClass?.classCode || "-"}
                      </TableCell>
                    </>
                  )}

                  <TableCell>{submission.assignment.title}</TableCell>
                  <TableCell>
                    {submission.assignment.academicClass?.className
                      ? "Lớp: " +
                        submission.assignment.academicClass?.className +
                        " - " +
                        submission.assignment.academicClass?.classCode
                      : "Khóa học: " +
                        submission.assignment.lesson?.section?.course?.title}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(submission.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(submission.status, submission.score)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Xem files">
                        <IconButton
                          size="small"
                          onClick={() => handleViewFiles(submission)}
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
              <Box>
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
                  sx={{ my: 1 }}
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

              {selectedSubmission.submissionText && (
                <Paper
                  variant="outlined"
                  sx={{
                    my: 3,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lời nhắn từ học viên:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        whiteSpace: "pre-wrap",
                        color: "text.primary",
                      }}
                    >
                      {selectedSubmission.submissionText}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Files đã nộp:
              </Typography>
              {selectedSubmission.files.length > 0 ? (
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
                          primaryTypographyProps={{
                            variant: "body2",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có file đính kèm
                </Typography>
              )}

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
            {selectedFiles && selectedFiles.length > 0 ? (
              selectedFiles.map((file) => (
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
                      primaryTypographyProps={{
                        variant: "body2",
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Không có file đính kèm
              </Typography>
            )}
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

      {/* Modal Thêm bài tập */}
      <DialogAddEditAssignment
        open={openAddAssignmentModal}
        onClose={() => setOpenAddAssignmentModal(false)}
        onSubmit={handleAddAssignment}
        initialSectionId={currentSectionId || undefined}
        sections={mockCourseData.sections}
        editMode={false}
        additionalInfo={{
          targetType: "academic",
          className: classFilter !== "all" ? classFilter : "Tất cả các lớp",
        }}
      />
    </Box>
  );
};

export default InstructorAssignments;
