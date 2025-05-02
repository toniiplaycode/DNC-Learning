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
  Description,
  PictureAsPdf,
  InsertDriveFile,
  Close,
  OpenInNew,
  RateReview,
  School,
  Person,
  FilterAlt,
  Edit,
  Delete,
  ArrowBack,
} from "@mui/icons-material";
import DialogAddEditAssignment from "../../components/instructor/course/DialogAddEditAssignment";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  deleteSubmission,
  fetchSubmissionsByInstructor,
  gradeSubmission,
} from "../../features/assignment-submissions/assignmentSubmissionsSlice";
import { selectInstructorSubmissions } from "../../features/assignment-submissions/assignmentSubmissionsSelectors";
import { formatDateTime } from "../../utils/formatters";
import { toast } from "react-toastify";
import { fetchInstructorGrades } from "../../features/user-grades/userGradesSlice";
import { selectInstructorGrades } from "../../features/user-grades/userGradesSelectors";
import {
  fetchInstructorAcademicClassAssignments,
  deleteAssignment,
} from "../../features/assignments/assignmentsSlice";
import { selectInstructorAcademicClassAssignments } from "../../features/assignments/assignmentsSelectors";

const InstructorAssignments = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorSubmissions = useAppSelector(selectInstructorSubmissions);
  const instructorGrades = useAppSelector(selectInstructorGrades);
  const instructorAssignments = useAppSelector(
    selectInstructorAcademicClassAssignments
  );
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
  const [weight, setWeight] = useState<number>(1.0);

  console.log(instructorGrades);

  // Thêm state và các hàm xử lý để mở dialog tạo bài tập
  const [openAddAssignmentModal, setOpenAddAssignmentModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

  // Add new state for selected assignment
  const [selectedAssignmentView, setSelectedAssignmentView] =
    useState<any>(null);

  // Add state for edit dialog
  const [openEditAssignmentModal, setOpenEditAssignmentModal] = useState(false);
  const [selectedEditAssignment, setSelectedEditAssignment] =
    useState<any>(null);

  // Add new states in InstructorAssignments component
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<any>(null);

  // Add new states
  const [deleteSubmissionDialogOpen, setDeleteSubmissionDialogOpen] =
    useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSubmissionsByInstructor(currentUser.userInstructor.id));
    dispatch(fetchInstructorGrades(currentUser.userInstructor.id));
    dispatch(
      fetchInstructorAcademicClassAssignments(currentUser.userInstructor.id)
    );
  }, [dispatch, currentUser]);

  const handleGrade = (submission: any) => {
    // Find matching grade if exists
    const matchingGrade = instructorGrades.find(
      (grade) => grade.assignmentSubmissionId === submission.id
    );

    const file = submission.fileUrl
      ? {
          id: 1,
          name: submission.fileUrl.split("/").pop(),
          url: submission.fileUrl,
          type: submission.fileUrl.split(".").pop()?.toLowerCase() || "unknown",
        }
      : null;

    // Handle both submission structures (from table and from assignment view)
    const assignmentTitle =
      submission.assignment?.title || selectedAssignmentView?.title;
    const courseName =
      submission.assignment?.academicClass?.className ||
      selectedAssignmentView?.academicClass?.className;

    setSelectedSubmission({
      ...submission,
      assignmentTitle: assignmentTitle,
      courseName: courseName,
      studentAvatar: submission.user.avatarUrl,
      studentName:
        submission.user.userStudentAcademic?.fullName ||
        submission.user.userStudent?.fullName,
      studentType: submission.user.role,
      studentCode: submission.user.userStudentAcademic?.studentCode,
      className:
        submission.assignment?.academicClass?.classCode ||
        selectedAssignmentView?.academicClass?.classCode,
      submittedDate: formatDateTime(submission.submittedAt),
      files: file ? [file] : [],
      existingGrade: matchingGrade,
    });

    // Set initial values from matching grade if exists
    setScore(matchingGrade ? Number(matchingGrade.score) : "");
    setWeight(matchingGrade ? Number(matchingGrade.weight) : 1.0);
    setFeedback(matchingGrade?.feedback || "");
    setGradeDialogOpen(true);
  };

  // In handleSubmitGrade function in InstructorAssignments.tsx
  const handleSubmitGrade = async () => {
    try {
      if (!selectedSubmission || score === "") return;

      const gradeData = {
        score: Number(score),
        weight: weight,
        feedback: feedback || "",
        instructorId: Number(currentUser.userInstructor.id),
      };

      // Refresh both submissions and grades after grading
      await dispatch(
        gradeSubmission({
          submissionId: selectedSubmission.id,
          data: gradeData,
        })
      ).unwrap();

      await Promise.all([
        dispatch(fetchSubmissionsByInstructor(currentUser.userInstructor.id)),
        dispatch(fetchInstructorGrades(currentUser.userInstructor.id)),
      ]);

      setGradeDialogOpen(false);
      toast.success(
        selectedSubmission.existingGrade
          ? "Chấm lại điểm thành công!"
          : "Chấm điểm thành công!"
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra khi chấm điểm");
    }
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

  const getStatusChip = (submission: any) => {
    // Find matching grade if exists
    const matchingGrade = instructorGrades.find(
      (grade) => grade.assignmentSubmissionId === submission.id
    );

    if (matchingGrade) {
      return (
        <Chip
          label={`Đã chấm: ${Number(matchingGrade.score).toFixed(1)}/${Number(
            matchingGrade.maxScore
          ).toFixed(1)}`}
          color="success"
          size="small"
        />
      );
    }

    switch (submission.status) {
      case "submitted":
        return <Chip label="Đã nộp" color="primary" size="small" />;
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

  // Add handler for edit button click
  const handleOpenEditAssignment = (assignment: any) => {
    setSelectedEditAssignment(assignment);
    setOpenEditAssignmentModal(true);
  };

  // Add delete handler
  const handleDeleteAssignment = (assignment: any) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  // Add confirmation handler
  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    // Check if assignment has submissions
    if (assignmentToDelete.assignmentSubmissions.length > 0) {
      toast.error("Không thể xóa bài tập đã có bài nộp");
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      return;
    }

    try {
      await dispatch(deleteAssignment(assignmentToDelete.id)).unwrap();
      toast.success("Xóa bài tập thành công");
      // Refresh assignments list
      dispatch(
        fetchInstructorAcademicClassAssignments(currentUser.userInstructor.id)
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài tập");
    } finally {
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  // Add delete handler
  const handleDeleteSubmission = (submission: any) => {
    // Check if submission has been graded
    const hasGrade = instructorGrades.some(
      (grade) => grade.assignmentSubmissionId === submission.id
    );

    if (hasGrade) {
      toast.error("Không thể xóa bài nộp đã được chấm điểm");
      return;
    }

    setSubmissionToDelete(submission);
    setDeleteSubmissionDialogOpen(true);
  };

  // Add confirmation handler
  const confirmDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      await dispatch(deleteSubmission(submissionToDelete.id)).unwrap();
      toast.success("Xóa bài nộp thành công");

      // Refresh all data
      await Promise.all([
        dispatch(fetchSubmissionsByInstructor(currentUser.userInstructor.id)),
        dispatch(fetchInstructorGrades(currentUser.userInstructor.id)),
        dispatch(
          fetchInstructorAcademicClassAssignments(currentUser.userInstructor.id)
        ),
      ]);

      // Update selectedAssignmentView with fresh data
      if (selectedAssignmentView) {
        const updatedAssignments = await dispatch(
          fetchInstructorAcademicClassAssignments(currentUser.userInstructor.id)
        ).unwrap();

        const updatedAssignment = updatedAssignments.find(
          (a: any) => a.id === selectedAssignmentView.id
        );

        if (updatedAssignment) {
          setSelectedAssignmentView(updatedAssignment);
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài nộp");
    } finally {
      setDeleteSubmissionDialogOpen(false);
      setSubmissionToDelete(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý bài tập
      </Typography>
      {/* Filters */}
      <Card>
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
                {studentTypeFilter === "student_academic" ? (
                  // Class filter for academic students
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Lớp</InputLabel>
                    <Select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      label="Lớp"
                    >
                      <MenuItem value="Tất cả">Tất cả lớp</MenuItem>
                      {Array.from(
                        new Set(
                          instructorAssignments.map(
                            (a) => a.academicClass.classCode
                          )
                        )
                      ).map((classCode) => (
                        <MenuItem key={classCode} value={classCode}>
                          {classCode}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  // Course filter for external students
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Khóa học</InputLabel>
                    <Select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      label="Khóa học"
                    >
                      <MenuItem value="all">Tất cả khóa học</MenuItem>
                      {Array.from(
                        new Set(
                          instructorSubmissions
                            .filter((s) => s.user.role === "student")
                            .map((s) => ({
                              id: s.assignment.lesson?.section?.courseId,
                              title:
                                s.assignment.lesson?.section?.course?.title,
                            }))
                            .filter((c) => c.id && c.title)
                        ),
                        (course) => JSON.stringify(course)
                      ).map((courseStr) => {
                        const course = JSON.parse(courseStr);
                        return (
                          <MenuItem key={course.id} value={course.id}>
                            {course.title}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}

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
            label="Tất cả "
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
      {tabValue !== 2 && (
        <>
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
                            {submission.assignment.academicClass?.classCode ||
                              "-"}
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
                            submission.assignment.lesson?.section?.course
                              ?.title}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(submission.submittedAt)}
                      </TableCell>
                      <TableCell>{getStatusChip(submission)}</TableCell>
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
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSubmission(submission)}
                              disabled={instructorGrades.some(
                                (grade) =>
                                  grade.assignmentSubmissionId === submission.id
                              )}
                            >
                              <Delete fontSize="small" />
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

          {/* Pagination */}
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
        </>
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

              {selectedSubmission.existingGrade && (
                <Paper
                  variant="outlined"
                  sx={{
                    my: 3,
                    p: 2,
                    bgcolor: "primary.lighter",
                    borderRadius: 1,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary">
                      Điểm đã chấm:
                    </Typography>
                    <Stack direction="row" spacing={3}>
                      <Typography variant="body2">
                        <strong>Điểm số:</strong>{" "}
                        {Number(selectedSubmission.existingGrade.score).toFixed(
                          1
                        )}
                        /
                        {Number(
                          selectedSubmission.existingGrade.maxScore
                        ).toFixed(1)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Trọng số:</strong> x
                        {Number(
                          selectedSubmission.existingGrade.weight
                        ).toFixed(1)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ngày chấm:</strong>{" "}
                        {formatDateTime(
                          selectedSubmission.existingGrade.gradedAt
                        )}
                      </Typography>
                    </Stack>
                    {selectedSubmission.existingGrade.feedback && (
                      <Typography variant="body2">
                        <strong>Phản hồi:</strong>{" "}
                        {selectedSubmission.existingGrade.feedback}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              )}

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
                  {selectedSubmission.existingGrade
                    ? "Chấm điểm lại:"
                    : "Chấm điểm:"}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={2}>
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
                      <TextField
                        label="Trọng số điểm"
                        type="number"
                        value={weight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (isNaN(val)) {
                            setWeight(1.0);
                          } else {
                            setWeight(Math.min(Math.max(val, 0.1), 2.0));
                          }
                        }}
                        fullWidth
                        variant="outlined"
                        helperText="Trọng số từ 0.1 đến 1.0"
                        InputProps={{
                          inputProps: {
                            min: 0.1,
                            max: 1.0,
                            step: 0.1,
                          },
                        }}
                      />
                    </Stack>
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
            {selectedSubmission?.existingGrade ? "Chấm lại điểm" : "Lưu điểm"}
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
        initialSectionId={currentSectionId || undefined}
        editMode={false}
        additionalInfo={{
          targetType: "academic",
        }}
      />
      {/* Edit Assignment Dialog */}
      <DialogAddEditAssignment
        open={openEditAssignmentModal}
        onClose={() => {
          setOpenEditAssignmentModal(false);
          setSelectedEditAssignment(null);
        }}
        assignmentToEdit={selectedEditAssignment}
        editMode={true}
        additionalInfo={{
          targetType: "academic",
        }}
      />
      {studentTypeFilter === "student_academic" && (
        <Box sx={{ mt: 3 }}>
          {selectedAssignmentView ? (
            <AssignmentSubmissionsView
              assignment={selectedAssignmentView}
              onBack={() => setSelectedAssignmentView(null)}
              onViewFiles={handleViewFiles}
              onGrade={handleGrade}
              getStatusChip={getStatusChip}
              onDelete={handleDeleteSubmission}
              instructorGrades={instructorGrades} // Add this line
            />
          ) : (
            <>
              <AcademicClassAssignments
                assignments={instructorAssignments}
                onViewDetail={(assignment) =>
                  setSelectedAssignmentView(assignment)
                }
                classFilter={classFilter}
                onClassFilterChange={(value) => setClassFilter(value)}
                onEdit={handleOpenEditAssignment} // Add this
                onDelete={handleDeleteAssignment} // Add this
              />
            </>
          )}
        </Box>
      )}
      {/* Add confirmation dialog to JSX */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa bài tập</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {assignmentToDelete?.assignmentSubmissions.length > 0 ? (
              <Typography color="error">
                Không thể xóa bài tập này vì đã có{" "}
                {assignmentToDelete.assignmentSubmissions.length} bài nộp.
              </Typography>
            ) : (
              `Bạn có chắc chắn muốn xóa bài tập "${assignmentToDelete?.title}" không?`
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={assignmentToDelete?.assignmentSubmissions.length > 0}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Submission Dialog */}
      <Dialog
        open={deleteSubmissionDialogOpen}
        onClose={() => setDeleteSubmissionDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa bài nộp</DialogTitle>
        <DialogContent>
          {submissionToDelete ? (
            <DialogContentText>
              Bạn có chắc chắn muốn xóa bài nộp của sinh viên{" "}
              <strong>
                {submissionToDelete.user?.userStudentAcademic?.fullName ||
                  submissionToDelete.user?.userStudent?.fullName ||
                  "Không xác định"}
              </strong>{" "}
              cho bài tập{" "}
              <strong>
                {submissionToDelete?.assignment?.title ||
                  (selectedAssignmentView && selectedAssignmentView.title) ||
                  "Không xác định"}
              </strong>{" "}
              không?
            </DialogContentText>
          ) : (
            <DialogContentText>Đang tải thông tin...</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSubmissionDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteSubmission}
            color="error"
            disabled={!submissionToDelete}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface AssignmentSubmissionsViewProps {
  assignment: any;
  onBack: () => void;
  onViewFiles: (submission: any) => void;
  onGrade: (submission: any) => void;
  getStatusChip: (submission: any) => React.ReactNode;
  onDelete: (submission: any) => void;
  instructorGrades: any[]; // Add this prop
}

const AssignmentSubmissionsView: React.FC<AssignmentSubmissionsViewProps> = ({
  assignment,
  onBack,
  onViewFiles,
  onGrade,
  getStatusChip,
  onDelete,
  instructorGrades,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  // Add useEffect to fetch fresh data
  useEffect(() => {
    const fetchData = async () => {
      if (assignment) {
        await Promise.all([
          dispatch(fetchSubmissionsByInstructor(currentUser.userInstructor.id)),
          dispatch(fetchInstructorGrades(currentUser.userInstructor.id)),
          dispatch(
            fetchInstructorAcademicClassAssignments(
              currentUser.userInstructor.id
            )
          ),
        ]);
      }
    };

    fetchData();
  }, [dispatch, currentUser, assignment]);

  // Rest of the component remains the same
  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h6">
          {assignment.title}
          <Typography variant="body2" color="text.secondary">
            {assignment.academicClass.classCode} -{" "}
            {assignment.academicClass.className}
          </Typography>
        </Typography>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sinh viên</TableCell>
              <TableCell>Mã SV</TableCell>
              <TableCell>Ngày nộp</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignment.assignmentSubmissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={submission.user.avatarUrl}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="body2">
                      {submission.user.userStudentAcademic?.fullName}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {submission.user.userStudentAcademic?.studentCode}
                </TableCell>
                <TableCell>{formatDateTime(submission.submittedAt)}</TableCell>
                <TableCell>{getStatusChip(submission)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Xem files">
                      <IconButton
                        size="small"
                        onClick={() => onViewFiles(submission)}
                      >
                        <Description fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chấm điểm">
                      <IconButton
                        size="small"
                        onClick={() => onGrade(submission)}
                      >
                        <RateReview fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(submission)}
                        disabled={instructorGrades.some(
                          (grade) =>
                            grade.assignmentSubmissionId === submission.id
                        )}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {assignment.assignmentSubmissions.length === 0 && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Assignment
                      sx={{
                        fontSize: 48,
                        color: "text.disabled",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      Chưa có bài nộp
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Sinh viên chưa nộp bài tập này
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </>
  );
};

// Update the AcademicClassAssignments component
interface AcademicClassAssignmentsProps {
  assignments: any[];
  onViewDetail: (assignment: any) => void;
  classFilter: string;
  onClassFilterChange: (classCode: string) => void;
  onEdit: (assignment: any) => void; // Add this
  onDelete: (assignment: any) => void; // Add this
}

const AcademicClassAssignments: React.FC<AcademicClassAssignmentsProps> = ({
  assignments,
  onViewDetail,
  classFilter,
  onClassFilterChange,
  onEdit,
  onDelete,
}) => {
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter assignments based on selected class and search query
  const filteredAssignments = assignments
    .filter(
      (a) =>
        classFilter === "Tất cả" || a.academicClass.classCode === classFilter
    )
    .filter((a) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.academicClass.classCode.toLowerCase().includes(query) ||
        a.academicClass.className.toLowerCase().includes(query)
      );
    });

  return (
    <>
      {/* Add search box */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên bài tập, mô tả, mã lớp hoặc tên lớp..."
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
      </Box>

      {/* Show result count */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Hiển thị {filteredAssignments.length} kết quả
      </Typography>

      {/* Existing table code using filteredAssignments */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Lớp</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Loại bài tập</TableCell>
              <TableCell>Điểm tối đa</TableCell>
              <TableCell>Hạn nộp</TableCell>
              <TableCell>Số bài đã nộp</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Chip
                      label={`${assignment.academicClass.classCode}`}
                      size="small"
                      variant="outlined"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {assignment.academicClass.className}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{assignment.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assignment.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        {
                          practice: "Thực hành",
                          midterm: "Giữa kỳ",
                          final: "Cuối kỳ",
                          project: "Dự án",
                        }[assignment.assignmentType] ||
                        assignment.assignmentType
                      }
                      size="small"
                      color={
                        {
                          practice: "primary",
                          midterm: "warning",
                          final: "error",
                          project: "info",
                        }[assignment.assignmentType] as any
                      }
                    />
                  </TableCell>
                  <TableCell align="center">{assignment.maxScore}</TableCell>
                  <TableCell>
                    {assignment.dueDate ? (
                      <>
                        <Typography variant="body2">
                          {formatDateTime(assignment.dueDate)}

                          {new Date(assignment.dueDate) < new Date() && (
                            <Typography
                              variant="caption"
                              color="error"
                              fontWeight={600}
                            >
                              {" "}
                              (Đã hết hạn)
                            </Typography>
                          )}
                        </Typography>
                      </>
                    ) : (
                      "Không có"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {assignment.assignmentSubmissions.length}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => onViewDetail(assignment)}
                        >
                          <Assignment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(assignment)} // Change this
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(assignment)}
                          disabled={assignment.assignmentSubmissions.length > 0}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không tìm thấy bài tập nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default InstructorAssignments;
