import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
  Avatar,
} from "@mui/material";
import CustomContainer from "../../components/common/CustomContainer";
import CardCourse from "../../components/common/CardCourse";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectUserEnrollments,
  selectUserProgress,
} from "../../features/enrollments/enrollmentsSelectors";
import {
  fetchUserEnrollments,
  fetchUserProgress,
} from "../../features/enrollments/enrollmentsApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { fetchStudentAcademicCourses } from "../../features/users/usersApiSlice";
import { selectStudentAcademicCourses } from "../../features/users/usersSelectors";
import { useNavigate } from "react-router-dom";
import { FilterList, Clear, Search } from "@mui/icons-material";

const calculateTotalLessons = (course: any) => {
  if (!course || !course.sections) return 0;
  return course.sections.reduce(
    (total: number, section: any) => total + (section.lessons?.length || 0),
    0
  );
};

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const userProgress = useAppSelector(selectUserProgress);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);

  // Filters state
  const [instructorFilter, setInstructorFilter] = useState<string>("");
  const [progressFilter, setProgressFilter] = useState<number[]>([0, 100]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique instructors from courses
  const uniqueInstructors = React.useMemo(() => {
    const instructorsMap = new Map<string, { name: string; avatar: string }>();

    // Add instructors from academic courses
    if (Array.isArray(studentAcademicCourses)) {
      studentAcademicCourses.forEach((item) => {
        if (item.course?.instructor?.fullName) {
          instructorsMap.set(item.course.instructor.fullName, {
            name: item.course.instructor.fullName,
            avatar: item.course.instructor?.user?.avatarUrl || "",
          });
        }
      });
    }

    // Add instructors from enrolled courses
    if (Array.isArray(userEnrollments)) {
      userEnrollments.forEach((course) => {
        if (course.course?.instructor?.fullName) {
          instructorsMap.set(course.course.instructor.fullName, {
            name: course.course.instructor.fullName,
            avatar: course.course.instructor?.user?.avatarUrl || "",
          });
        }
      });
    }

    return Array.from(instructorsMap.values());
  }, [studentAcademicCourses, userEnrollments]);

  // Filter handle changes
  const handleInstructorChange = (event: SelectChangeEvent<string>) => {
    setInstructorFilter(event.target.value);
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    setProgressFilter(newValue as number[]);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearFilters = () => {
    setInstructorFilter("");
    setProgressFilter([0, 100]);
    setSearchQuery("");
  };

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserEnrollments(Number(currentUser.id)));
      dispatch(fetchStudentAcademicCourses(currentUser.id));
      dispatch(fetchUserProgress());
    }
  }, [dispatch, currentUser, navigate]);

  // Process academic courses
  const academicCourses = React.useMemo(() => {
    if (!Array.isArray(studentAcademicCourses)) return [];

    return studentAcademicCourses
      .filter((item) => {
        // Apply instructor filter
        if (
          instructorFilter &&
          item.course?.instructor?.fullName !== instructorFilter
        ) {
          return false;
        }

        // Apply search filter
        if (
          searchQuery &&
          item.course.title &&
          !item.course.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .map((item) => {
        const course = item.course;
        return {
          id: course.id || 0,
          title: course.title || "",
          instructor: {
            fullName: course.instructor?.fullName || "",
            avatar: course.instructor?.user?.avatarUrl || "",
          },
          totalLessons: calculateTotalLessons(course),
          image: course.thumbnailUrl || "",
          category: course.category?.name || "",
          isAcademic: true,
          startDate: course.startDate || "",
          endDate: course.endDate || "",
          rating: 0,
          totalRatings: 0,
          duration: "",
          price: 0,
          for: "both",
        };
      });
  }, [studentAcademicCourses, instructorFilter, searchQuery]);

  // Process enrolled courses with filters
  const filteredEnrollments = React.useMemo(() => {
    if (!Array.isArray(userEnrollments)) return [];

    return userEnrollments
      .filter((course) => {
        // Apply instructor filter
        if (
          instructorFilter &&
          course.course?.instructor?.fullName !== instructorFilter
        ) {
          return false;
        }

        // Apply progress filter
        const courseProgress = userProgress?.find(
          (progress: any) => progress.courseId === course.course?.id
        );
        const progressPercentage = courseProgress?.completionPercentage || 0;
        if (
          progressPercentage < progressFilter[0] ||
          progressPercentage > progressFilter[1]
        ) {
          return false;
        }

        // Apply search filter
        if (
          searchQuery &&
          course.course?.title &&
          !course.course.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .map((course) => {
        const courseProgress = userProgress?.find(
          (progress: any) => progress.courseId === course.course?.id
        );

        return {
          id: course.course?.id || 0,
          title: course.course?.title || "",
          instructor: {
            fullName: course.course?.instructor?.fullName || "",
            avatar: course.course?.instructor?.user?.avatarUrl || "",
          },
          totalLessons: calculateTotalLessons(course.course),
          price: course.course?.price || 0,
          image: course.course?.thumbnailUrl || "",
          progress: courseProgress?.completionPercentage || 0,
          isEnrolled: true,
          category: course.course?.category?.name || "",
          for: course.course?.for || "both",
          rating: 0,
          totalRatings: 0,
          duration: "",
        };
      });
  }, [
    userEnrollments,
    userProgress,
    instructorFilter,
    progressFilter,
    searchQuery,
  ]);

  return (
    <CustomContainer>
      <Box>
        {/* Filters Section */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Bộ lọc khóa học
          </Typography>

          {/* Filters in one row */}
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid
              item
              xs={12}
              md={
                Array.isArray(userEnrollments) && userEnrollments.length > 0
                  ? 4
                  : 6
              }
            >
              <TextField
                fullWidth
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Instructor Filter */}
            <Grid
              item
              xs={12}
              md={
                Array.isArray(userEnrollments) && userEnrollments.length > 0
                  ? 4
                  : 6
              }
            >
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={instructorFilter}
                  onChange={handleInstructorChange}
                  label="Giảng viên"
                >
                  <MenuItem value="">
                    <em>Tất cả giảng viên</em>
                  </MenuItem>
                  {uniqueInstructors.map((instructor) => (
                    <MenuItem
                      key={instructor.name}
                      value={instructor.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Stack direction="row" spacing={2} gap={1}>
                        <Avatar
                          src={instructor.avatar}
                          alt={instructor.name}
                          sx={{ width: 24, height: 24 }}
                        />
                        {instructor.name}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Progress Filter - Only show when there are regular enrollments */}
            {Array.isArray(userEnrollments) && userEnrollments.length > 0 && (
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Tiến độ học tập: {progressFilter[0]}% - {progressFilter[1]}%
                  </Typography>
                  <Slider
                    value={progressFilter}
                    onChange={handleProgressChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                  />
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Clear Filters Button */}
          {(instructorFilter ||
            progressFilter[0] > 0 ||
            progressFilter[1] < 100 ||
            searchQuery) && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Chip
                label="Xóa tất cả bộ lọc"
                onDelete={clearFilters}
                color="primary"
                size="small"
              />
            </Box>
          )}

          {/* Active Filters */}
          {(instructorFilter ||
            progressFilter[0] > 0 ||
            progressFilter[1] < 100 ||
            searchQuery) && (
            <Stack direction="row" spacing={1}>
              <Typography variant="subtitle2">Đang lọc:</Typography>
              {searchQuery && (
                <Chip
                  label={`Tìm kiếm: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {instructorFilter && (
                <Chip
                  label={`Giảng viên: ${instructorFilter}`}
                  onDelete={() => setInstructorFilter("")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {(progressFilter[0] > 0 || progressFilter[1] < 100) && (
                <Chip
                  label={`Tiến độ: ${progressFilter[0]}% - ${progressFilter[1]}%`}
                  onDelete={() => setProgressFilter([0, 100])}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Paper>

        {/* Academic Courses Section */}
        {academicCourses && academicCourses.length > 0 && (
          <Box mb={4}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Khóa học thuật
            </Typography>
            <Grid container spacing={3}>
              {academicCourses.map((course) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`academic-${course.id}`}
                >
                  <CardCourse {...course} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Enrolled Courses Section */}
        {filteredEnrollments.length > 0 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Khóa học đã đăng ký
            </Typography>
            <Grid container spacing={3}>
              {filteredEnrollments.map((course) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`enrolled-${course.id}`}
                >
                  <CardCourse {...course} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* No Courses Message */}
        {!academicCourses.length && !filteredEnrollments.length && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: (theme) => theme.palette.background.default,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" py={2}>
              {instructorFilter ||
              progressFilter[0] > 0 ||
              progressFilter[1] < 100 ||
              searchQuery
                ? "Không tìm thấy khóa học nào với bộ lọc hiện tại"
                : "Bạn chưa có khóa học nào"}
            </Typography>
            {(instructorFilter ||
              progressFilter[0] > 0 ||
              progressFilter[1] < 100 ||
              searchQuery) && (
              <Chip
                label="Xóa bộ lọc"
                onClick={clearFilters}
                color="primary"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        )}
      </Box>
    </CustomContainer>
  );
};

export default EnrolledCourses;
