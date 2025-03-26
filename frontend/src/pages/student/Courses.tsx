import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  Stack,
  Slider,
  InputAdornment,
  Alert,
  Skeleton,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import CardCourse from "../../components/common/CardCourse";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCourses } from "../../features/courses/coursesApiSlice";

const Courses = () => {
  const dispatch = useAppDispatch();
  const { courses, status, error } = useAppSelector((state) => state.courses);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000000]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCourses());
    }
  }, [status, dispatch]);

  // Trích xuất các danh mục thực tế từ dữ liệu
  const uniqueCategories = [
    "Tất cả",
    ...new Set(courses.map((course) => course.category?.name || "Khác")),
  ];

  // Trích xuất các level từ dữ liệu
  const uniqueLevels = [
    "Tất cả",
    ...new Set(courses.map((course) => course.level || "beginner")),
  ];

  const itemsPerPage = 8;

  // Tính rating trung bình từ reviews
  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  // Tính tổng số bài học từ các sections
  const calculateTotalLessons = (course: any) => {
    if (!course.sections) return 0;
    return course.sections.reduce(
      (total: number, section: any) => total + (section.lessons?.length || 0),
      0
    );
  };

  // Format dữ liệu để phù hợp với CardCourse component
  const formatCourseData = (course: any) => ({
    id: course.id,
    title: course.title,
    instructor: {
      name: course.instructor?.fullName || "Giảng viên",
      avatar: course.instructor?.user?.avatarUrl,
    },
    rating: calculateAverageRating(course.reviews),
    totalRatings: course.reviews?.length || 0,
    duration: "12 tuần", // Giả định hoặc tính từ dữ liệu
    totalLessons: calculateTotalLessons(course),
    price: parseFloat(course.price) || 0,
    image: course.thumbnailUrl || "/src/assets/logo.png",
    category: course.category?.name || "Không phân loại",
  });

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" ||
      course.category?.name === selectedCategory;
    const matchesLevel =
      selectedLevel === "Tất cả" || course.level === selectedLevel;
    const matchesPrice =
      course.price >= priceRange[0] && course.price <= priceRange[1];
    const isPublished = course.status === "published";

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLevel &&
      matchesPrice &&
      isPublished
    );
  });

  // Sort courses
  const sortCourses = (courses: any[], sortMethod: string) => {
    let sortedCourses = [...courses];
    switch (sortMethod) {
      case "price-low":
        return sortedCourses.sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
      case "price-high":
        return sortedCourses.sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
      case "rating":
        return sortedCourses.sort((a, b) => {
          const ratingA = calculateAverageRating(a.reviews);
          const ratingB = calculateAverageRating(b.reviews);
          return ratingB - ratingA;
        });
      default:
        // newest first based on createdAt
        return sortedCourses.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const displayedCourses = sortCourses(filteredCourses, sortBy).slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Khóa học
      </Typography>

      {status === "loading" && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">Đang tải khóa học...</Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: 2 }}
                />
                <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {status === "failed" && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || "Không thể tải khóa học. Vui lòng thử lại sau."}
        </Alert>
      )}

      {status === "succeeded" && (
        <Grid container spacing={3}>
          {/* Filters - Left Sidebar */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              order: { xs: 1, md: 0 },
              position: { xs: "static", md: "sticky" },
              top: { md: 24 },
              alignSelf: { md: "flex-start" },
              height: { md: "fit-content" },
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bộ lọc tìm kiếm
                </Typography>

                <Stack spacing={3}>
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

                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Danh mục"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {uniqueCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Trình độ</InputLabel>
                    <Select
                      value={selectedLevel}
                      label="Trình độ"
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      {uniqueLevels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level === "beginner"
                            ? "Cơ bản"
                            : level === "intermediate"
                            ? "Trung cấp"
                            : level === "advanced"
                            ? "Nâng cao"
                            : level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography gutterBottom>Khoảng giá</Typography>
                    <Box sx={{ px: 1 }}>
                      <Slider
                        value={priceRange}
                        onChange={handlePriceChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={2000000}
                        step={100000}
                        valueLabelFormat={formatPrice}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(priceRange[0])}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(priceRange[1])}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Sắp xếp theo</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sắp xếp theo"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="newest">Mới nhất</MenuItem>
                      <MenuItem value="rating">Đánh giá cao</MenuItem>
                      <MenuItem value="price-low">Giá tăng dần</MenuItem>
                      <MenuItem value="price-high">Giá giảm dần</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hiển thị {displayedCourses.length} trên tổng số{" "}
                    {filteredCourses.length} khóa học
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Course List - Right Content */}
          <Grid
            item
            xs={12}
            md={9}
            sx={{
              order: { xs: 2, md: 1 },
            }}
          >
            {filteredCourses.length === 0 ? (
              <Alert severity="info">
                Không tìm thấy khóa học nào phù hợp với bộ lọc. Vui lòng thử lại
                với các tiêu chí khác.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {displayedCourses.map((course) => (
                  <Grid item xs={12} sm={6} lg={4} key={course.id}>
                    <CardCourse {...formatCourseData(course)} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {filteredCourses.length > 0 && (
              <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Courses;
