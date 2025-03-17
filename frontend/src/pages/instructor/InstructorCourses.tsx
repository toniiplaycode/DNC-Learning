import { useState } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  School,
  People,
  Star,
  Edit,
  Delete,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Mock data
const mockCourses = [
  {
    id: 1,
    title: "React & TypeScript Masterclass",
    thumbnail: "/src/assets/logo.png",
    totalStudents: 234,
    rating: 4.8,
    totalRatings: 150,
    price: 499000,
    status: "published",
    progress: 100,
    lastUpdated: "2024-03-15",
  },
  {
    id: 2,
    title: "Node.js Advanced Concepts",
    thumbnail: "/src/assets/logo.png",
    totalStudents: 189,
    rating: 4.7,
    totalRatings: 120,
    price: 599000,
    status: "draft",
    progress: 80,
    lastUpdated: "2024-03-10",
  },
  // Thêm mock data khác...
];

const InstructorCourses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    courseId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleEditCourse = (courseId: number) => {
    navigate(`/instructor/courses/${courseId}/edit`);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      default:
        return "default";
    }
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
          Khóa học của tôi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/instructor/courses/create")}
        >
          Tạo khóa học
        </Button>
      </Stack>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course List */}
      <Grid container spacing={3}>
        {mockCourses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {/* Course Header */}
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Avatar
                      variant="rounded"
                      src={course.thumbnail}
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {course.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, course.id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                      <Chip
                        size="small"
                        color={getStatusColor(course.status)}
                        label={
                          course.status === "published"
                            ? "Đã xuất bản"
                            : "Bản nháp"
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  {/* Course Stats */}
                  <Stack direction="row" spacing={2}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.totalStudents} học viên
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Star fontSize="small" color="warning" />
                      <Typography variant="body2" color="text.secondary">
                        {course.rating} ({course.totalRatings})
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Course Progress */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tiến độ hoàn thành
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>

                  {/* Last Updated */}
                  <Typography variant="caption" color="text.secondary">
                    Cập nhật lần cuối:{" "}
                    {new Date(course.lastUpdated).toLocaleDateString("vi-VN")}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Course Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            selectedCourse && navigate(`/instructor/courses/${selectedCourse}`)
          }
        >
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          Xem và chỉnh sửa khóa học
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Xóa khóa học
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InstructorCourses;
