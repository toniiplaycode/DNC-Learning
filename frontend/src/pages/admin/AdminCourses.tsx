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
  Tooltip,
  Badge,
  Avatar,
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
import DialogDetailCourse from "../../components/admin/course/DialogDetailCourse";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { selectAllCourses } from "../../features/courses/coursesSelector";
import { fetchCategories } from "../../features/categories/categoriesApiSlice";
import {
  deleteCourse,
  fetchCourses,
} from "../../features/courses/coursesApiSlice";
import { selectActiveCategories } from "../../features/categories/categoriesSelectors";
import DialogAddEditCourse from "../../components/instructor/course/DialogAddEditCourse";
import { fetchInstructors } from "../../features/user_instructors/instructorsApiSlice";
import { selectAllInstructors } from "../../features/user_instructors/instructorsSelectors";
import { toast } from "react-toastify";

interface Instructor {
  id: string;
  fullName: string;
  user: {
    avatarUrl?: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  status?: string;
  courseCount?: number;
}

interface Course {
  id: number;
  title: string;
  description?: string;
  categoryId: string;
  instructorId: string;
  price: string;
  level: string;
  status: string;
  thumbnailUrl?: string;
  startDate?: string;
  endDate?: string;
  category: Category;
  instructor: Instructor;
  enrollments?: { userId: string }[];
  sections?: any[];
  isLocked?: boolean;
}

const AdminCourses = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const courses = useAppSelector(selectAllCourses);
  const categories = useAppSelector(selectActiveCategories);
  const instructors = useAppSelector(selectAllInstructors);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openLockDialog, setOpenLockDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCourses());
    dispatch(fetchInstructors());
  }, [dispatch]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    course: Course
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedCourse) {
        await dispatch(deleteCourse(selectedCourse.id))
          .unwrap()
          .then((res) => {
            toast.success("Xóa khóa học thành công!");
            // Refresh the courses list
            dispatch(fetchCourses());
          });
      }
    } catch (error) {
      toast.error("Không thể xóa khóa học");
      console.error("Error deleting course:", error);
    }
    setOpenDeleteDialog(false);
  };

  const handleViewDetail = () => {
    handleMenuClose();
    setOpenDetailDialog(true);
  };

  const handleToggleLockConfirm = () => {
    if (selectedCourse) {
      const updatedCourses = courses.map((course) => {
        if (course.id === selectedCourse.id) {
          return { ...course, isLocked: !course.isLocked };
        }
        return course;
      });

      console.log(
        `Đã ${selectedCourse.isLocked ? "mở khóa" : "khóa"} khóa học có ID: ${
          selectedCourse.id
        }`
      );
      setOpenLockDialog(false);
    }
  };

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setCourseToEdit(selectedCourse);
    setOpenEditDialog(true);
  };

  const filteredCourses =
    courses &&
    courses
      .filter((course) => {
        const matchesSearch = course.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || course.category.name === categoryFilter;
        const matchesStatus =
          statusFilter === "all" || course.status === statusFilter;
        const matchesInstructor =
          instructorFilter === "all" ||
          course.instructorId === instructorFilter;

        return (
          matchesSearch && matchesCategory && matchesStatus && matchesInstructor
        );
      })
      .sort((a, b) => {
        if (dateSort === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      });

  const paginatedCourses = filteredCourses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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

  const getStudentCount = (enrollments: { userId: string }[]) => {
    return enrollments?.length || 0;
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN").format(parseFloat(price));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý khóa học
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
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

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Danh mục"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả danh mục</MenuItem>
                  {categories.map((category) => (
                    <MenuItem
                      key={category.id}
                      value={category.name}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">{category.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({category.courseCount})
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
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
              <FormControl fullWidth size="small">
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={instructorFilter}
                  label="Giảng viên"
                  onChange={(e) => setInstructorFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả giảng viên</MenuItem>
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor.id} value={instructor.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={instructor.user?.avatarUrl}
                          sx={{ width: 24, height: 24 }}
                        >
                          {instructor.fullName?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {instructor.fullName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={dateSort}
                  label="Sắp xếp"
                  onChange={(e) =>
                    setDateSort(e.target.value as "newest" | "oldest")
                  }
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="oldest">Cũ nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={handleAddClick}
              >
                Thêm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            {paginatedCourses.map((course: any) => (
              <TableRow key={course.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {course.thumbnailUrl ? (
                      <Box
                        component="img"
                        src={course.thumbnailUrl}
                        alt={course.title}
                        sx={{ width: 40, height: 40, borderRadius: 1 }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src="/src/assets/logo.png"
                        alt={course.title}
                        sx={{ width: 40, height: 40, borderRadius: 1 }}
                      />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {course.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {course.level === "beginner"
                          ? "Cơ bản"
                          : course.level === "intermediate"
                          ? "Trung cấp"
                          : "Nâng cao"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.category?.name || "N/A"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={course.instructor?.user?.avatarUrl}
                      sx={{ width: 24, height: 24 }}
                    >
                      {course.instructor?.fullName?.charAt(0)}
                    </Avatar>
                    {course.instructor?.fullName}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {getStudentCount(course.enrollments || [])}
                </TableCell>
                <TableCell align="right">
                  {formatPrice(course.price)} đ
                </TableCell>
                <TableCell align="center">
                  {getStatusChip(course.status)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, course)}
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
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

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

      <Dialog open={openLockDialog} onClose={() => setOpenLockDialog(false)}>
        <DialogTitle>
          {selectedCourse?.isLocked
            ? "Xác nhận mở khóa"
            : "Xác nhận khóa khóa học"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedCourse?.isLocked
              ? "Khi mở khóa, học viên sẽ có thể tiếp tục học và truy cập vào khóa học này. Bạn có chắc chắn muốn mở khóa khóa học này không?"
              : "Khi khóa khóa học, học viên sẽ không thể tiếp tục học hoặc truy cập vào khóa học này. Bạn có chắc chắn muốn khóa khóa học này không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLockDialog(false)}>Hủy</Button>
          <Button
            onClick={handleToggleLockConfirm}
            color={selectedCourse?.isLocked ? "success" : "warning"}
            autoFocus
          >
            {selectedCourse?.isLocked ? "Mở khóa" : "Khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      <DialogDetailCourse
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        course={selectedCourse}
      />

      <DialogAddEditCourse
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        editMode={false}
        isAdmin={true}
      />

      <DialogAddEditCourse
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setCourseToEdit(null);
        }}
        editMode={true}
        courseToEdit={courseToEdit}
        isAdmin={true}
      />
    </Box>
  );
};

export default AdminCourses;
