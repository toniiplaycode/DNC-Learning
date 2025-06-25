import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  People,
  Star,
  Visibility,
  Delete,
  Edit,
  School,
  Psychology,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  deleteCourse,
  fetchCoursesByInstructor,
} from "../../features/courses/coursesApiSlice";
import { selectCoursesByInstructor } from "../../features/courses/coursesSelector";
import DialogAddEditCourse from "../../components/instructor/course/DialogAddEditCourse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { toast } from "react-toastify";
import { setISODay } from "date-fns";

const InstructorCourses = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const courses = useAppSelector(selectCoursesByInstructor);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentsFilter, setStudentsFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    courseId: null as string | null,
    hasEnrollments: false,
  });
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  useEffect(() => {
    dispatch(fetchCoursesByInstructor(currentUser?.userInstructor?.id));
  }, [dispatch, currentUser]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    courseId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setDeleteConfirmDialog({
        open: true,
        courseId,
        hasEnrollments: course.enrollments.length > 0,
      });
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmDialog.courseId) {
      try {
        await dispatch(deleteCourse(deleteConfirmDialog.courseId));
        await dispatch(
          fetchCoursesByInstructor(currentUser?.userInstructor?.id)
        );
        toast.success("Xóa khóa học thành công!");
      } catch (error) {
        toast.error("Không thể xóa khóa học. Vui lòng thử lại!");
      }
    }
    setDeleteConfirmDialog({
      open: false,
      courseId: null,
      hasEnrollments: false,
    });
  };

  // Filter and sort courses based on search query, students, and rating
  const filteredCourses = courses
    .filter((course) => {
      // Lọc theo từ khóa tìm kiếm
      const searchMatch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Lọc theo đối tượng học viên
      const audienceMatch =
        audienceFilter === "all" || course.for === audienceFilter;

      return searchMatch && audienceMatch;
    })
    .sort((a, b) => {
      if (studentsFilter === "mostStudents") {
        return b.enrollments.length - a.enrollments.length;
      }
      if (studentsFilter === "leastStudents") {
        return a.enrollments.length - b.enrollments.length;
      }
      if (ratingFilter === "highestRating") {
        const aRating =
          a.reviews.length > 0
            ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
            : 0;
        const bRating =
          b.reviews.length > 0
            ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
            : 0;
        return bRating - aRating;
      }
      if (ratingFilter === "lowestRating") {
        const aRating =
          a.reviews.length > 0
            ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
            : 0;
        const bRating =
          b.reviews.length > 0
            ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
            : 0;
        return aRating - bRating;
      }
      return 0;
    });

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setOpenAddDialog(true);
    handleMenuClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Quản lý khóa học
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={() => setOpenAddDialog(true)}
        >
          Tạo Khóa Học
        </Button>
      </Stack>

      {/* Search and Filter */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    bgcolor: "grey.50",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: 120 }}>
                <InputLabel>Số Học Viên</InputLabel>
                <Select
                  value={studentsFilter}
                  onChange={(e) => setStudentsFilter(e.target.value)}
                  label="Số Học Viên"
                  sx={{ borderRadius: 2, bgcolor: "grey.50" }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="mostStudents">Nhiều học viên nhất</MenuItem>
                  <MenuItem value="leastStudents">Ít học viên nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: 120 }}>
                <InputLabel>Đánh Giá</InputLabel>
                <Select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  label="Đánh Giá"
                  sx={{ borderRadius: 2, bgcolor: "grey.50" }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="highestRating">Số sao cao nhất</MenuItem>
                  <MenuItem value="lowestRating">Số sao thấp nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: 120 }}>
                <InputLabel>Đối tượng</InputLabel>
                <Select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  label="Đối tượng"
                  sx={{ borderRadius: 2, bgcolor: "grey.50" }}
                >
                  <MenuItem value="all">Tất cả đối tượng</MenuItem>
                  <MenuItem value="both">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <People fontSize="small" sx={{ color: "info.main" }} />
                      <Typography>Tất cả người học</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="student">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <School fontSize="small" sx={{ color: "primary.main" }} />
                      <Typography>Học viên tự do</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="student_academic">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Psychology
                        fontSize="small"
                        sx={{ color: "warning.main" }}
                      />
                      <Typography>Sinh viên học thuật</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course List with grouping by audience type */}
      {filteredCourses.length === 0 ? (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            Không tìm thấy khóa học nào.
          </Typography>
        </Box>
      ) : (
        <>
          {audienceFilter !== "all" ? (
            // Nếu đã lọc theo đối tượng, hiển thị không phân nhóm
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                {filteredCourses.map((course) => (
                  <Grid item xs={12} sm={6} lg={4} key={course.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                        },
                        bgcolor: "white",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                          {/* Course Header */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              variant="rounded"
                              src={course.thumbnailUrl}
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 2,
                                bgcolor: "grey.200",
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: { xs: "1rem", md: "1.1rem" },
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {course.title}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, course.id)}
                                >
                                  <MoreVert sx={{ color: "text.secondary" }} />
                                </IconButton>
                              </Box>
                              <Box>
                                <Chip
                                  label={
                                    course.status === "published"
                                      ? "Đã Xuất Bản"
                                      : "Bản Nháp"
                                  }
                                  size="small"
                                  color={
                                    course.status === "published"
                                      ? "success"
                                      : "default"
                                  }
                                  sx={{ mt: 1, mr: 1 }}
                                />

                                {course.for && (
                                  <Chip
                                    icon={
                                      course.for === "both" ? (
                                        <People fontSize="small" />
                                      ) : course.for === "student" ? (
                                        <School fontSize="small" />
                                      ) : (
                                        <Psychology fontSize="small" />
                                      )
                                    }
                                    label={
                                      course.for === "both"
                                        ? "Tất cả người học"
                                        : course.for === "student"
                                        ? "Học viên tự do"
                                        : "Sinh viên học thuật"
                                    }
                                    size="small"
                                    color={
                                      course.for === "both"
                                        ? "info"
                                        : course.for === "student"
                                        ? "primary"
                                        : "warning"
                                    }
                                    sx={{ mt: 1 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>

                          {/* Course Stats */}
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <People fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {course.enrollments.length} học viên
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Star
                                fontSize="small"
                                sx={{ color: "#f5c518" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {course.reviews.length > 0
                                  ? (
                                      course.reviews.reduce(
                                        (sum, r) => sum + r.rating,
                                        0
                                      ) / course.reviews.length
                                    ).toFixed(1)
                                  : "Chưa có đánh giá"}{" "}
                                ({course.reviews.length})
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Price and Last Updated */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              color="primary.main"
                            >
                              {course.student_academic
                                ? "Dành cho sinh viên"
                                : parseFloat(course.price) === 0
                                ? "Miễn phí"
                                : `${parseFloat(course.price).toLocaleString(
                                    "vi-VN"
                                  )} VNĐ`}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Cập nhật:{" "}
                              {new Date(course.updatedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            // Nếu không lọc, giữ nguyên cách hiển thị theo nhóm
            ["both", "student", "student_academic"].map((audienceType) => {
              const coursesInGroup = filteredCourses.filter(
                (course) => course.for === audienceType
              );

              if (coursesInGroup.length === 0) return null;

              return (
                <Box key={audienceType} sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      pb: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {audienceType === "both" ? (
                      <People
                        fontSize="small"
                        sx={{ mr: 1, color: "info.main" }}
                      />
                    ) : audienceType === "student" ? (
                      <School
                        fontSize="small"
                        sx={{ mr: 1, color: "primary.main" }}
                      />
                    ) : (
                      <Psychology
                        fontSize="small"
                        sx={{ mr: 1, color: "warning.main" }}
                      />
                    )}
                    <Typography variant="h6" fontWeight="medium">
                      {audienceType === "both"
                        ? "Khóa học cho tất cả người học"
                        : audienceType === "student"
                        ? "Khóa học cho học viên tự do"
                        : "Khóa học cho sinh viên học thuật"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 2 }}
                    >
                      ({coursesInGroup.length} khóa học)
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {coursesInGroup.map((course) => (
                      <Grid item xs={12} sm={6} lg={4} key={course.id}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                            },
                            bgcolor: "white",
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                              {/* Course Header */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  variant="rounded"
                                  src={course.thumbnailUrl}
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 2,
                                    bgcolor: "grey.200",
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="bold"
                                      sx={{
                                        fontSize: { xs: "1rem", md: "1.1rem" },
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {course.title}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={(e) =>
                                        handleMenuOpen(e, course.id)
                                      }
                                    >
                                      <MoreVert
                                        sx={{ color: "text.secondary" }}
                                      />
                                    </IconButton>
                                  </Box>
                                  <Box>
                                    <Chip
                                      label={
                                        course.status === "published"
                                          ? "Đã Xuất Bản"
                                          : "Bản Nháp"
                                      }
                                      size="small"
                                      color={
                                        course.status === "published"
                                          ? "success"
                                          : "default"
                                      }
                                      sx={{ mt: 1, mr: 1 }}
                                    />

                                    {course.for && (
                                      <Chip
                                        icon={
                                          course.for === "both" ? (
                                            <People fontSize="small" />
                                          ) : course.for === "student" ? (
                                            <School fontSize="small" />
                                          ) : (
                                            <Psychology fontSize="small" />
                                          )
                                        }
                                        label={
                                          course.for === "both"
                                            ? "Tất cả người học"
                                            : course.for === "student"
                                            ? "Học viên tự do"
                                            : "Sinh viên học thuật"
                                        }
                                        size="small"
                                        color={
                                          course.for === "both"
                                            ? "info"
                                            : course.for === "student"
                                            ? "primary"
                                            : "warning"
                                        }
                                        sx={{ mt: 1 }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>

                              {/* Course Stats */}
                              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <People fontSize="small" color="action" />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {course.enrollments.length} học viên
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Star
                                    fontSize="small"
                                    sx={{ color: "#f5c518" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {course.reviews.length > 0
                                      ? (
                                          course.reviews.reduce(
                                            (sum, r) => sum + r.rating,
                                            0
                                          ) / course.reviews.length
                                        ).toFixed(1)
                                      : "Chưa có đánh giá"}{" "}
                                    ({course.reviews.length})
                                  </Typography>
                                </Box>
                              </Stack>

                              {/* Price and Last Updated */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  color="primary.main"
                                >
                                  {course.for === "student_academic"
                                    ? "Dành cho sinh viên"
                                    : parseFloat(course.price) === 0
                                    ? "Miễn phí"
                                    : `${parseFloat(
                                        course.price
                                      ).toLocaleString("vi-VN")} VNĐ`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Cập nhật:{" "}
                                  {new Date(
                                    course.updatedAt
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })
          )}
        </>
      )}

      {/* Course Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" },
        }}
      >
        <MenuItem
          onClick={() =>
            selectedCourse && navigate(`/instructor/courses/${selectedCourse}`)
          }
        >
          <Visibility
            sx={{ mr: 1, color: "text.secondary" }}
            fontSize="small"
          />
          Xem và chỉnh sửa nội dung
        </MenuItem>

        <MenuItem
          onClick={() => {
            const course = courses.find((c) => c.id === selectedCourse);
            if (course) {
              handleEditCourse(course);
            }
          }}
        >
          <Edit sx={{ mr: 1, color: "text.secondary" }} fontSize="small" />
          Chỉnh sửa khóa học
        </MenuItem>

        <MenuItem
          onClick={() => handleDeleteCourse(selectedCourse as string)}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Xóa khóa học
        </MenuItem>
      </Menu>

      <DialogAddEditCourse
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setCourseToEdit(null);
        }}
        courseToEdit={courseToEdit}
        editMode={!!courseToEdit}
      />

      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() =>
          setDeleteConfirmDialog({
            open: false,
            courseId: null,
            hasEnrollments: false,
          })
        }
      >
        <DialogTitle>
          {deleteConfirmDialog.hasEnrollments
            ? "Không thể xóa khóa học"
            : "Xác nhận xóa khóa học"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteConfirmDialog.hasEnrollments
              ? "Không thể xóa khóa học này vì đã có học viên đăng ký. Vui lòng xem xét ẩn hoặc lưu trữ khóa học thay vì xóa."
              : "Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteConfirmDialog({
                open: false,
                courseId: null,
                hasEnrollments: false,
              })
            }
          >
            Hủy
          </Button>
          {!deleteConfirmDialog.hasEnrollments && (
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Xóa
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorCourses;
