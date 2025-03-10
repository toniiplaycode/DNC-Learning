import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Rating,
  Stack,
  Chip,
  Pagination,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  School,
  Person,
  Star,
  VerifiedUser,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Mock data
const mockInstructors = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    full_name: `Giảng viên ${index + 1}`,
    avatar: "/src/assets/avatar.png",
    professional_title: [
      "Senior Developer",
      "Tech Lead",
      "Solution Architect",
      "Principal Engineer",
    ][index % 4],
    specialization: [
      "Web Development",
      "Mobile Development",
      "AI/ML",
      "DevOps",
    ][index % 4],
    rating_average: Number((4 + Math.random()).toFixed(2)),
    total_students: Math.floor(Math.random() * 5000) + 500,
    total_courses: Math.floor(Math.random() * 10) + 1,
    total_reviews: Math.floor(Math.random() * 1000) + 100,
    expertise_areas: [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "Machine Learning",
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    verification_status: Math.random() > 0.3 ? "verified" : "pending",
    teaching_experience: Math.floor(Math.random() * 10) + 1,
  }));

const specializations = [
  "Tất cả",
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "DevOps",
  "Database",
];

const experienceLevels = ["Tất cả", "1-3 năm", "4-6 năm", "7-9 năm", "10+ năm"];

const Instructors = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState("Tất cả");
  const [selectedExperience, setSelectedExperience] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("rating");

  const itemsPerPage = 8;

  // Filter instructors
  const filteredInstructors = mockInstructors.filter((instructor) => {
    const matchesSearch = instructor.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === "Tất cả" ||
      instructor.specialization === selectedSpecialization;
    const matchesExperience =
      selectedExperience === "Tất cả" ||
      (selectedExperience === "10+ năm"
        ? instructor.teaching_experience >= 10
        : instructor.teaching_experience >=
            parseInt(selectedExperience.split("-")[0]) &&
          instructor.teaching_experience <=
            parseInt(selectedExperience.split("-")[1]));

    return matchesSearch && matchesSpecialization && matchesExperience;
  });

  // Sort instructors
  const sortedInstructors = [...filteredInstructors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating_average - a.rating_average;
      case "students":
        return b.total_students - a.total_students;
      case "courses":
        return b.total_courses - a.total_courses;
      default:
        return b.rating_average - a.rating_average;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedInstructors.length / itemsPerPage);
  const displayedInstructors = sortedInstructors.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Giảng viên
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
                  placeholder="Tìm kiếm giảng viên..."
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
                  <InputLabel>Chuyên môn</InputLabel>
                  <Select
                    value={selectedSpecialization}
                    label="Chuyên môn"
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Kinh nghiệm</InputLabel>
                  <Select
                    value={selectedExperience}
                    label="Kinh nghiệm"
                    onChange={(e) => setSelectedExperience(e.target.value)}
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sắp xếp theo"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
                    <MenuItem value="students">Học viên nhiều nhất</MenuItem>
                    <MenuItem value="courses">Khóa học nhiều nhất</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {displayedInstructors.length} trên tổng số{" "}
                  {filteredInstructors.length} giảng viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Instructors List - Right Content */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{
            order: { xs: 2, md: 1 },
          }}
        >
          <Grid container spacing={3}>
            {displayedInstructors.map((instructor) => (
              <Grid item xs={12} sm={6} key={instructor.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                    height: "100%",
                  }}
                  onClick={() => navigate(`/view-instructor/${instructor.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Avatar
                        src={instructor.avatar}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="h6">
                            {instructor.full_name}
                          </Typography>
                          {instructor.verification_status === "verified" && (
                            <VerifiedUser
                              color="primary"
                              sx={{ fontSize: 20 }}
                            />
                          )}
                        </Box>
                        <Typography color="text.secondary" gutterBottom>
                          {instructor.professional_title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Rating
                            value={instructor.rating_average}
                            precision={0.1}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({instructor.rating_average})
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">
                            {instructor.total_students} học viên
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <School fontSize="small" color="action" />
                          <Typography variant="body2">
                            {instructor.total_courses} khóa học
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {instructor.expertise_areas.map((area) => (
                          <Chip
                            key={area}
                            label={area}
                            size="small"
                            variant="outlined"
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
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

export default Instructors;
