import React, { useState } from "react";
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
  Chip,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import CardCourse from "../components/common/CardCourse";

// Thêm hàm format rating
const formatRating = (rating: number): number => {
  return Math.round(rating * 100) / 100;
};

// Cập nhật phần mock data
const mockCourses = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: `Khóa học ${index + 1}: ${
      ["React & TypeScript", "Python", "Machine Learning", "Web Development"][
        index % 4
      ]
    }`,
    instructor: {
      name: `Giảng viên ${index + 1}`,
      avatar: "/src/assets/avatar.png",
    },
    rating: formatRating(4 + Math.random()), // Format rating với 2 chữ số thập phân
    totalRatings: Math.floor(Math.random() * 1000),
    duration: `${Math.floor(Math.random() * 30 + 10)} giờ`,
    totalLessons: Math.floor(Math.random() * 30 + 10),
    price: Math.floor(Math.random() * 1000000) + 500000,
    image: "/src/assets/logo.png",
    category: ["Frontend", "Backend", "Mobile", "AI/ML"][index % 4],
    level: ["Beginner", "Intermediate", "Advanced"][index % 3],
  }));

const categories = [
  "Tất cả",
  "Frontend",
  "Backend",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Database",
];

const levels = ["Tất cả", "Beginner", "Intermediate", "Advanced"];

const Courses = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000000]);
  const [sortBy, setSortBy] = useState("newest");

  const itemsPerPage = 8;

  // Filter courses
  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "Tất cả" || course.level === selectedLevel;
    const matchesPrice =
      course.price >= priceRange[0] && course.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return b.id - a.id; // newest first
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const displayedCourses = sortedCourses.slice(
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
                    {categories.map((category) => (
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
                    {levels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
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
                      sx={{ display: "flex", justifyContent: "space-between" }}
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
                    <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                    <MenuItem value="price-desc">Giá giảm dần</MenuItem>
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
            order: { xs: 2, md: 1 }, // Trên mobile hiển thị sau, desktop bên phải
          }}
        >
          <Grid container spacing={3}>
            {displayedCourses.map((course) => (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <CardCourse {...course} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Courses;
