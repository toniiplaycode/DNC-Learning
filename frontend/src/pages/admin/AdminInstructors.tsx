import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Avatar,
  Tooltip,
  Stack,
  Rating,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  CheckCircle,
  Cancel,
  Block,
  Email,
  Phone,
  VerifiedUser,
  Dashboard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import DialogInstructorDetail from "../../components/admin/instructor/DialogInstructorDetail";
import DialogAddInstructor from "../../components/admin/instructor/DialogAddInstructor";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAllInstructors } from "../../features/user_instructors/instructorsSelectors";
import {
  fetchInstructors,
  deleteInstructor,
} from "../../features/user_instructors/instructorsApiSlice";
import { fetchFaculties } from "../../features/faculties/facultiesSlice";
import { selectAllFaculties } from "../../features/faculties/facultiesSelectors";
import { toast } from "react-toastify";

const AdminInstructors = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const instructors = useAppSelector(selectAllInstructors);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(
    null
  );
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedInstructorData, setSelectedInstructorData] =
    useState<any>(null);
  const faculties = useAppSelector(selectAllFaculties);

  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchInstructors());
    dispatch(fetchFaculties());
  }, [dispatch]);

  // Handle menu open/close
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    instructorId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedInstructor(instructorId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Get selected instructor
  const getSelectedInstructor = () => {
    return instructors.find(
      (instructor) => instructor.id === selectedInstructor
    );
  };

  // Handle view detail
  const handleViewDetail = () => {
    handleMenuClose();
    setOpenDetailDialog(true);
  };

  const handleToggleBlockConfirm = () => {
    if (selectedInstructor) {
      const updatedInstructors = instructors.map((instructor) => {
        if (instructor.id === selectedInstructor) {
          const newStatus =
            instructor.status === "blocked" ? "active" : "blocked";
          return { ...instructor, status: newStatus };
        }
        return instructor;
      });

      console.log(
        `Đã ${
          getSelectedInstructor()?.status === "blocked" ? "mở khóa" : "khóa"
        } giảng viên có ID: ${selectedInstructor}`
      );
      setOpenBlockDialog(false);
    }
  };

  const handleToggleVerifyConfirm = () => {
    if (selectedInstructor) {
      const updatedInstructors = instructors.map((instructor) => {
        if (instructor.id === selectedInstructor) {
          return { ...instructor, verified: !instructor.verified };
        }
        return instructor;
      });

      console.log(
        `Đã ${
          getSelectedInstructor()?.verified ? "hủy xác minh" : "xác minh"
        } giảng viên có ID: ${selectedInstructor}`
      );
      setOpenVerifyDialog(false);
    }
  };

  // Handle delete
  const handleDeleteClick = () => {
    handleMenuClose();
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInstructor) return;

    const instructor = instructors.find((i) => i.id === selectedInstructor);

    if (!instructor) {
      toast.error("Không tìm thấy thông tin giảng viên");
      setOpenDeleteDialog(false);
      return;
    }

    // Kiểm tra xem giảng viên có khóa học hoặc học viên không
    if (
      (instructor.totalCourses && instructor.totalCourses > 0) ||
      (instructor.totalStudents && instructor.totalStudents > 0)
    ) {
      toast.error(
        "Không thể xóa giảng viên này vì họ đang có khóa học hoặc học viên. " +
          "Vui lòng xóa tất cả khóa học và học viên trước."
      );
      setOpenDeleteDialog(false);
      return;
    }

    try {
      await dispatch(deleteInstructor(instructor.userId)).unwrap();
      toast.success("Xóa giảng viên thành công");
      setOpenDeleteDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa giảng viên");
    }
  };

  // Thêm hàm xử lý cho việc truy cập vào trang giảng viên
  const handleAccessInstructorDashboard = () => {
    handleMenuClose();

    // Lưu thông tin về việc admin đang đóng vai giảng viên
    localStorage.setItem("adminImpersonating", "true");
    localStorage.setItem(
      "impersonatedInstructorId",
      String(selectedInstructor)
    );
    localStorage.setItem(
      "impersonatedInstructorName",
      getSelectedInstructor()?.fullName || ""
    );

    // Chuyển hướng đến trang dashboard của giảng viên
    navigate("/instructor");
  };

  // Filter instructors
  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch =
      instructor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    const matchesStatus =
      statusFilter === "all" || instructor.verificationStatus === statusFilter;
    const matchesFaculty =
      facultyFilter === "all" ||
      (facultyFilter === "freelance" && !instructor.faculty) ||
      instructor.faculty?.facultyName === facultyFilter;

    return matchesSearch && matchesStatus && matchesFaculty;
  });

  // Paginate
  const displayedInstructors = filteredInstructors.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Get unique specializations for filter
  const specializations = [
    ...new Set(instructors.map((instructor) => instructor.specialization)),
  ];

  // Status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
        return "default";
      case "blocked":
        return "error";
      default:
        return "default";
    }
  };

  // Hàm xử lý mở dialog thêm giảng viên
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleEditClick = () => {
    const instructor = getSelectedInstructor();
    if (instructor) {
      setSelectedInstructorData({
        user: {
          id: instructor.userId,
          username: instructor.user?.username,
          email: instructor.user?.email,
          phone: instructor.user?.phone,
          avatarUrl: instructor.user?.avatarUrl,
        },
        instructor: {
          id: instructor.id,
          fullName: instructor.fullName,
          professionalTitle: instructor.professionalTitle,
          specialization: instructor.specialization,
          educationBackground: instructor.educationBackground,
          teachingExperience: instructor.teachingExperience,
          bio: instructor.bio,
          expertiseAreas: instructor.expertiseAreas,
          certificates: instructor.certificates,
          linkedinProfile: instructor.linkedinProfile,
          website: instructor.website,
          verificationDocuments: instructor.verificationDocuments,
          verificationStatus: instructor.verificationStatus,
          facultyId: instructor.facultyId?.toString() || "",
        },
      });
      setOpenEditDialog(true);
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý giảng viên
      </Typography>

      {/* Search and filter section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm giảng viên"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={facultyFilter}
                  label="Khoa"
                  onChange={(e) => setFacultyFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả khoa</MenuItem>
                  <MenuItem value="freelance">Giảng viên tự do</MenuItem>
                  {faculties.map((faculty) => (
                    <MenuItem key={faculty.id} value={faculty.facultyName}>
                      {faculty.facultyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="pending">Đang xét duyệt</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
                  <MenuItem value="blocked">Đã khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ height: "100%", width: "100%" }}
                onClick={handleOpenAddDialog}
              >
                Thêm giảng viên
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instructors table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Thông tin liên hệ</TableCell>
              <TableCell>Khoa</TableCell>
              <TableCell>Chuyên môn</TableCell>
              <TableCell>Thống kê</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tham gia</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedInstructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={instructor.user?.avatarUrl}
                      alt={instructor.fullName}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {instructor.fullName}{" "}
                        {instructor.verificationStatus === "verified" && (
                          <Tooltip title="Đã xác minh">
                            <VerifiedUser
                              fontSize="small"
                              color="primary"
                              sx={{ verticalAlign: "middle", ml: 0.5 }}
                            />
                          </Tooltip>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {instructor.professionalTitle}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="body2">
                        {instructor.user?.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Phone fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="body2">
                        {instructor.user?.phone}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  {instructor.facultyId ? (
                    <Chip
                      label={
                        faculties.find((f) => f.id === instructor.facultyId)
                          ?.facultyName
                      }
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Giảng viên tự do"
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {instructor.specialization}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {instructor.educationBackground}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      {instructor.totalCourses} khóa học
                    </Typography>
                    <Typography variant="body2">
                      {instructor.totalStudents} học viên
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        value={
                          instructor.averageRating
                            ? parseFloat(instructor.averageRating)
                            : 0
                        }
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({instructor.totalReviews || 0})
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      {
                        verified: "Đã xác minh",
                        pending: "Đang xét duyệt",
                        rejected: "Từ chối",
                      }[instructor.verificationStatus]
                    }
                    color={
                      {
                        verified: "success",
                        pending: "warning",
                        rejected: "error",
                      }[instructor.verificationStatus] as any
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(instructor.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, instructor.id)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        <Pagination
          count={Math.ceil(filteredInstructors.length / rowsPerPage)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetail}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAccessInstructorDashboard}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          <ListItemText>Truy cập trang giảng viên</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa giảng viên</ListItemText>
        </MenuItem>
      </Menu>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={openBlockDialog} onClose={() => setOpenBlockDialog(false)}>
        <DialogTitle>
          {getSelectedInstructor()?.status === "blocked"
            ? "Xác nhận mở khóa"
            : "Xác nhận khóa giảng viên"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getSelectedInstructor()?.status === "blocked"
              ? "Khi mở khóa, giảng viên sẽ có thể tiếp tục hoạt động trên hệ thống. Bạn có chắc chắn muốn mở khóa giảng viên này không?"
              : "Khi khóa giảng viên, họ sẽ không thể đăng nhập hoặc thực hiện bất kỳ hoạt động nào trên hệ thống. Các khóa học của họ vẫn hiển thị nhưng sẽ không nhận học viên mới. Bạn có chắc chắn muốn khóa giảng viên này không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlockDialog(false)}>Hủy</Button>
          <Button
            onClick={handleToggleBlockConfirm}
            color={
              getSelectedInstructor()?.status === "blocked"
                ? "success"
                : "error"
            }
            autoFocus
          >
            {getSelectedInstructor()?.status === "blocked" ? "Mở khóa" : "Khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verify/Unverify Confirmation Dialog */}
      <Dialog
        open={openVerifyDialog}
        onClose={() => setOpenVerifyDialog(false)}
      >
        <DialogTitle>
          {getSelectedInstructor()?.verified
            ? "Xác nhận hủy xác minh"
            : "Xác nhận xác minh giảng viên"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getSelectedInstructor()?.verified
              ? "Khi hủy xác minh, giảng viên sẽ không còn được đánh dấu là đã xác minh trên hệ thống. Điều này có thể ảnh hưởng đến uy tín của họ. Bạn có chắc chắn muốn hủy xác minh giảng viên này không?"
              : "Xác minh giảng viên sẽ cấp cho họ huy hiệu đã xác minh, giúp tăng độ tin cậy với học viên. Hãy đảm bảo rằng bạn đã kiểm tra tất cả thông tin xác thực của giảng viên này. Bạn có chắc chắn muốn xác minh giảng viên này không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVerifyDialog(false)}>Hủy</Button>
          <Button
            onClick={handleToggleVerifyConfirm}
            color={getSelectedInstructor()?.verified ? "warning" : "success"}
            autoFocus
          >
            {getSelectedInstructor()?.verified ? "Hủy xác minh" : "Xác minh"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa giảng viên này? Hành động này không thể
            hoàn tác, và tất cả khóa học của giảng viên này cũng sẽ bị xóa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructor Detail Dialog */}
      <DialogInstructorDetail
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        instructorId={selectedInstructor}
      />

      {/* Dialog thêm giảng viên */}
      <DialogAddInstructor
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />

      {/* Dialog chỉnh sửa giảng viên */}
      <DialogAddInstructor
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        editMode={true}
        instructorData={selectedInstructorData}
      />
    </Box>
  );
};

export default AdminInstructors;
