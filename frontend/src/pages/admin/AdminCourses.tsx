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
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  LockOpen,
  Lock,
} from "@mui/icons-material";
import DialogDetailCourse from "../../components/common/admin/course/DialogDetailCourse";

// Mock data
const mockCourses = Array(15)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: `Khóa học ${index + 1}`,
    category: [
      "Web Development",
      "Mobile Development",
      "Data Science",
      "DevOps",
    ][index % 4],
    instructor: `Giảng viên ${index + 1}`,
    students: Math.floor(Math.random() * 200) + 50,
    price: Math.floor(Math.random() * 500000) + 200000,
    status: ["published", "draft", "archived"][index % 3],
    isLocked: index % 5 === 0,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));

const AdminCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openLockDialog, setOpenLockDialog] = useState(false);
  const [courses, setCourses] = useState(mockCourses);

  const rowsPerPage = 10;

  // Handle menu open/close
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    courseId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle delete dialog
  const handleDeleteClick = () => {
    handleMenuClose();
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    console.log(`Deleting course with ID: ${selectedCourse}`);
    setOpenDeleteDialog(false);
  };

  // Xử lý mở dialog chi tiết
  const handleViewDetail = () => {
    handleMenuClose();
    setOpenDetailDialog(true);
  };

  // Xử lý khóa/mở khóa khóa học
  const handleToggleLockClick = () => {
    handleMenuClose();
    setOpenLockDialog(true);
  };

  const handleToggleLockConfirm = () => {
    if (selectedCourse) {
      // Tìm khóa học trong danh sách
      const updatedCourses = courses.map((course) => {
        if (course.id === selectedCourse) {
          // Đảo ngược trạng thái khóa
          return { ...course, isLocked: !course.isLocked };
        }
        return course;
      });

      setCourses(updatedCourses);
      console.log(
        `Đã ${
          getSelectedCourse()?.isLocked ? "mở khóa" : "khóa"
        } khóa học có ID: ${selectedCourse}`
      );
      setOpenLockDialog(false);
    }
  };

  // Lấy thông tin khóa học đang được chọn
  const getSelectedCourse = () => {
    return courses.find((course) => course.id === selectedCourse);
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Helper for status chip
  const getStatusChip = (status: string) => {
    switch (status) {
      case "published":
        return <Chip label="Đã xuất bản" color="success" size="small" />;
      case "draft":
        return <Chip label="Bản nháp" color="warning" size="small" />;
      case "archived":
        return <Chip label="Đã lưu trữ" color="error" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Quản lý khóa học
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm khóa học..."
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
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Danh mục"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả danh mục</MenuItem>
                  <MenuItem value="Web Development">Web Development</MenuItem>
                  <MenuItem value="Mobile Development">
                    Mobile Development
                  </MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="published">Đã xuất bản</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                  <MenuItem value="archived">Đã lưu trữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={() => console.log("Add new course")}
              >
                Thêm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Khóa học</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell align="center">Học viên</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {course.isLocked && (
                      <Tooltip title="Khóa học đã bị khóa">
                        <Lock fontSize="small" color="error" sx={{ mr: 1 }} />
                      </Tooltip>
                    )}
                    <Typography variant="body2" fontWeight="medium">
                      {course.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={course.category} size="small" />
                </TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell align="center">{course.students}</TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("vi-VN").format(course.price)} đ
                </TableCell>
                <TableCell align="center">
                  {getStatusChip(course.status)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, course.id)}
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        <Pagination
          count={Math.ceil(filteredCourses.length / rowsPerPage)}
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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleLockClick}>
          <ListItemIcon>
            {getSelectedCourse()?.isLocked ? (
              <LockOpen fontSize="small" color="success" />
            ) : (
              <Lock fontSize="small" color="warning" />
            )}
          </ListItemIcon>
          <ListItemText>
            {getSelectedCourse()?.isLocked ? "Mở khóa" : "Khóa khóa học"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lock Confirmation Dialog */}
      <Dialog open={openLockDialog} onClose={() => setOpenLockDialog(false)}>
        <DialogTitle>
          {getSelectedCourse()?.isLocked
            ? "Xác nhận mở khóa"
            : "Xác nhận khóa khóa học"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getSelectedCourse()?.isLocked
              ? "Khi mở khóa, học viên sẽ có thể tiếp tục học và truy cập vào khóa học này. Bạn có chắc chắn muốn mở khóa khóa học này không?"
              : "Khi khóa khóa học, học viên sẽ không thể tiếp tục học hoặc truy cập vào khóa học này. Bạn có chắc chắn muốn khóa khóa học này không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLockDialog(false)}>Hủy</Button>
          <Button
            onClick={handleToggleLockConfirm}
            color={getSelectedCourse()?.isLocked ? "success" : "warning"}
            autoFocus
          >
            {getSelectedCourse()?.isLocked ? "Mở khóa" : "Khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course Detail Dialog */}
      <DialogDetailCourse
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        courseId={selectedCourse}
      />
    </Box>
  );
};

export default AdminCourses;
