import { useEffect, useState, useMemo } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Search, School, Person, VerifiedUser } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectAllInstructors,
  selectInstructorsStatus,
} from "../../features/instructors/instructorsSelectors";
import { fetchInstructors } from "../../features/instructors/instructorsApiSlice";

const Instructors = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const status = useAppSelector(selectInstructorsStatus);
  const instructorsData = useAppSelector(selectAllInstructors);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState("Tất cả");
  const [selectedExperience, setSelectedExperience] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInstructors());
    }
  }, [dispatch, status]);

  // Tạo danh sách chuyên ngành từ dữ liệu
  const specializations = useMemo(() => {
    const specSet = new Set<string>();
    specSet.add("Tất cả");

    instructorsData.forEach((instructor) => {
      if (instructor.specialization) {
        specSet.add(instructor.specialization);
      }
    });

    return Array.from(specSet);
  }, [instructorsData]);

  const experienceLevels = [
    "Tất cả",
    "1-3 năm",
    "4-6 năm",
    "7-9 năm",
    "10+ năm",
  ];
  const itemsPerPage = 8;

  // Hàm phân tích chuỗi teaching_experience để lấy số năm kinh nghiệm
  const getYearsOfExperience = (experience: string | undefined): number => {
    if (!experience) return 0;
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  // Hàm phân tích chuỗi expertise areas
  const parseExpertiseAreas = (
    expertiseAreas: string | undefined
  ): string[] => {
    if (!expertiseAreas) return [];
    return expertiseAreas.split(",").map((area) => area.trim());
  };

  // Hàm định dạng URL avatar
  const formatAvatarUrl = (avatarUrl: string | undefined): string => {
    if (!avatarUrl) return "/src/assets/default-avatar.png";
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `/src/assets/${avatarUrl}`;
  };

  // Lọc giảng viên với cách xử lý tốt hơn cho specialization
  const filteredInstructors = instructorsData.filter((instructor) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = instructor.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Lọc theo chuyên ngành với xử lý tốt hơn
    const matchesSpecialization =
      selectedSpecialization === "Tất cả" ||
      (instructor.specialization &&
        instructor.specialization.toLowerCase() ===
          selectedSpecialization.toLowerCase());

    // Nếu không có kết quả chính xác, tìm kiếm mở rộng
    const matchesSpecializationFallback =
      selectedSpecialization === "Tất cả" ||
      (instructor.specialization &&
        instructor.specialization
          .toLowerCase()
          .includes(selectedSpecialization.toLowerCase())) ||
      (instructor.expertiseAreas &&
        instructor.expertiseAreas
          .toLowerCase()
          .includes(selectedSpecialization.toLowerCase()));

    // Lọc theo kinh nghiệm
    const years = getYearsOfExperience(instructor.teachingExperience);
    const matchesExperience =
      selectedExperience === "Tất cả" ||
      (selectedExperience === "10+ năm"
        ? years >= 10
        : years >= parseInt(selectedExperience.split("-")[0]) &&
          years <= parseInt(selectedExperience.split("-")[1]));

    return (
      matchesSearch &&
      (matchesSpecialization || matchesSpecializationFallback) &&
      matchesExperience
    );
  });

  // Sắp xếp giảng viên
  const sortedInstructors = [...filteredInstructors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (
          parseFloat(b.averageRating || "0") -
          parseFloat(a.averageRating || "0")
        );
      case "students":
        return (b.totalStudents || 0) - (a.totalStudents || 0);
      case "courses":
        return (b.totalCourses || 0) - (a.totalCourses || 0);
      default:
        return 0;
    }
  });

  // Phân trang
  const totalPages = Math.ceil(sortedInstructors.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedInstructors = sortedInstructors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle empty state or loading
  if (status === "loading" && !instructorsData.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Khám phá giảng viên
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tìm hiểu và kết nối với những giảng viên đầy kinh nghiệm trong lĩnh vực
        của bạn
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Filters - Left Sidebar */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            order: { xs: 1, md: 0 },
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lọc tìm kiếm
              </Typography>

              <Stack spacing={3}>
                {/* Search */}
                <TextField
                  label="Tìm giảng viên"
                  variant="outlined"
                  fullWidth
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

                {/* Specialization */}
                <FormControl fullWidth>
                  <InputLabel>Chuyên ngành</InputLabel>
                  <Select
                    value={selectedSpecialization}
                    onChange={(e) =>
                      setSelectedSpecialization(e.target.value as string)
                    }
                    label="Chuyên ngành"
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Experience */}
                <FormControl fullWidth>
                  <InputLabel>Kinh nghiệm</InputLabel>
                  <Select
                    value={selectedExperience}
                    onChange={(e) =>
                      setSelectedExperience(e.target.value as string)
                    }
                    label="Kinh nghiệm"
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sort by */}
                <FormControl fullWidth>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as string)}
                    label="Sắp xếp theo"
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
          {displayedInstructors.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6">
                Không tìm thấy giảng viên phù hợp với tiêu chí tìm kiếm của bạn.
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {displayedInstructors.map((instructor) => (
                <Grid item xs={12} sm={6} key={instructor.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": { boxShadow: 6 },
                      height: "100%",
                    }}
                    onClick={() =>
                      navigate(`/view-instructor/${instructor.id}`)
                    }
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar
                          src={formatAvatarUrl(instructor.user?.avatarUrl)}
                          sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="h6">
                              {instructor.fullName}
                            </Typography>
                            {instructor.verificationStatus === "verified" && (
                              <VerifiedUser
                                color="primary"
                                sx={{ fontSize: 20 }}
                              />
                            )}
                          </Box>
                          <Typography color="text.secondary" gutterBottom>
                            {instructor.professionalTitle}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Rating
                              value={parseFloat(
                                instructor.averageRating || "0"
                              )}
                              precision={0.1}
                              readOnly
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              ({instructor.averageRating || "0"})
                            </Typography>
                          </Stack>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">
                              {instructor.totalStudents || 0} học viên
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <School fontSize="small" color="action" />
                            <Typography variant="body2">
                              {instructor.totalCourses || 0} khóa học
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {parseExpertiseAreas(instructor.expertiseAreas).map(
                            (area) => (
                              <Chip
                                key={area}
                                label={area}
                                size="small"
                                variant="outlined"
                                sx={{ m: 0.5 }}
                              />
                            )
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
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
    </Container>
  );
};

export default Instructors;
