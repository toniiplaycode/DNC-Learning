import React, { useState } from "react";
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

// Mock data for instructors
const mockInstructors = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    name: `Giảng viên ${index + 1}`,
    email: `instructor${index + 1}@example.com`,
    phone: `09${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0")}`,
    avatar: `/src/assets/avatar.png`,
    specialization: [
      "Web Development",
      "Mobile App",
      "Data Science",
      "UI/UX Design",
      "AI/ML",
    ][index % 5],
    joinDate: new Date(
      Date.now() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000
    ).toISOString(),
    coursesCount: Math.floor(Math.random() * 10),
    studentsCount: Math.floor(Math.random() * 1000),
    rating: (3 + Math.random() * 2).toFixed(1),
    status: ["active", "pending", "inactive", "blocked"][index % 4],
    verified: index % 3 === 0,
  }));

const AdminInstructors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(
    null
  );
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [instructors, setInstructors] = useState(mockInstructors);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const rowsPerPage = 10;

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

  // Handle block/unblock
  const handleToggleBlockClick = () => {
    handleMenuClose();
    setOpenBlockDialog(true);
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
      setInstructors(updatedInstructors);
      console.log(
        `Đã ${
          getSelectedInstructor()?.status === "blocked" ? "mở khóa" : "khóa"
        } giảng viên có ID: ${selectedInstructor}`
      );
      setOpenBlockDialog(false);
    }
  };

  // Handle verify/unverify
  const handleToggleVerifyClick = () => {
    handleMenuClose();
    setOpenVerifyDialog(true);
  };

  const handleToggleVerifyConfirm = () => {
    if (selectedInstructor) {
      const updatedInstructors = instructors.map((instructor) => {
        if (instructor.id === selectedInstructor) {
          return { ...instructor, verified: !instructor.verified };
        }
        return instructor;
      });
      setInstructors(updatedInstructors);
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

  const handleDeleteConfirm = () => {
    if (selectedInstructor) {
      const updatedInstructors = instructors.filter(
        (instructor) => instructor.id !== selectedInstructor
      );
      setInstructors(updatedInstructors);
      console.log(`Đã xóa giảng viên có ID: ${selectedInstructor}`);
      setOpenDeleteDialog(false);
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
      getSelectedInstructor()?.name || ""
    );

    // Chuyển hướng đến trang dashboard của giảng viên
    navigate("/instructor");
  };

  // Filter instructors
  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch = instructor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || instructor.status === statusFilter;
    const matchesSpecialization =
      specializationFilter === "all" ||
      instructor.specialization === specializationFilter;
    return matchesSearch && matchesStatus && matchesSpecialization;
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

  // Hàm xử lý lưu giảng viên mới
  const handleSaveInstructor = (instructorData: any) => {
    // Tạo ID mới cho giảng viên
    const newId = Math.max(...instructors.map((i) => i.id)) + 1;

    // Tạo giảng viên mới
    const newInstructor = {
      id: newId,
      ...instructorData,
    };

    // Cập nhật danh sách giảng viên
    setInstructors([newInstructor, ...instructors]);

    // Đóng dialog
    setOpenAddDialog(false);

    // Log để debug
    console.log("Đã thêm giảng viên mới:", newInstructor);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý giảng viên
      </Typography>

      {/* Search and filter section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3.5}>
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Chuyên môn</InputLabel>
                <Select
                  value={specializationFilter}
                  label="Chuyên môn"
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả chuyên môn</MenuItem>
                  {specializations.map((specialization) => (
                    <MenuItem key={specialization} value={specialization}>
                      {specialization}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.5}>
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
                      src={instructor.avatar}
                      alt={instructor.name}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {instructor.name}{" "}
                        {instructor.verified && (
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
                        ID: {instructor.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="body2">
                        {instructor.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Phone fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="body2">
                        {instructor.phone}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{instructor.specialization}</TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      {instructor.coursesCount} khóa học
                    </Typography>
                    <Typography variant="body2">
                      {instructor.studentsCount} học viên
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        value={parseFloat(instructor.rating)}
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({instructor.rating})
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      {
                        active: "Đang hoạt động",
                        pending: "Đang xét duyệt",
                        inactive: "Không hoạt động",
                        blocked: "Đã khóa",
                      }[instructor.status]
                    }
                    color={getStatusColor(instructor.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(instructor.joinDate).toLocaleDateString("vi-VN")}
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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleVerifyClick}>
          <ListItemIcon>
            {getSelectedInstructor()?.verified ? (
              <Cancel fontSize="small" color="warning" />
            ) : (
              <CheckCircle fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {getSelectedInstructor()?.verified
              ? "Hủy xác minh"
              : "Xác minh giảng viên"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleBlockClick}>
          <ListItemIcon>
            {getSelectedInstructor()?.status === "blocked" ? (
              <CheckCircle fontSize="small" color="success" />
            ) : (
              <Block fontSize="small" color="error" />
            )}
          </ListItemIcon>
          <ListItemText>
            {getSelectedInstructor()?.status === "blocked"
              ? "Mở khóa giảng viên"
              : "Khóa giảng viên"}
          </ListItemText>
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
        onSave={handleSaveInstructor}
      />
    </Box>
  );
};

export default AdminInstructors;
