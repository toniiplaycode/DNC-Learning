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
  Button,
  Collapse,
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
import {
  FilterList,
  Clear,
  Search,
  MenuBook,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { fetchStudentAcademicProgram } from "../../features/programs/programsSlice";
import { selectStudentAcademicProgram } from "../../features/programs/programsSelectors";
import { alpha } from "@mui/material/styles";
import { User } from "../../features/auth/authApiSlice";

// Add type definition at the top of the file
type UserRole = "student" | "student_academic" | "instructor" | "admin";

const calculateTotalLessons = (course: any) => {
  if (!course || !course.sections) return 0;
  return course.sections.reduce(
    (total: number, section: any) => total + (section.lessons?.length || 0),
    0
  );
};

// Add new type for semester courses
interface SemesterCourses {
  semester: number;
  courses: any[];
  startDate: string;
  endDate: string;
}

// Add helper function to check if course is locked
const isCourseLocked = (startDate: string): boolean => {
  if (!startDate) return true;
  const start = new Date(startDate);
  const now = new Date();
  return start > now;
};

// Add helper function to format date safely
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "Chưa có thông tin";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Chưa có thông tin"
    : date.toLocaleDateString("vi-VN");
};

// Add helper function to get current semester
const getCurrentSemester = (
  semesterCourses: SemesterCourses[]
): number | null => {
  const now = new Date();

  // Find semester that contains current date
  const currentSemester = semesterCourses.find((semester) => {
    const startDate = new Date(semester.startDate);
    const endDate = new Date(semester.endDate);
    return now >= startDate && now <= endDate;
  });

  return currentSemester?.semester || null;
};

// Change to named export
export const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const userProgress = useAppSelector(selectUserProgress);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);
  const programCourses = useAppSelector(selectStudentAcademicProgram);

  // Filters state
  const [instructorFilter, setInstructorFilter] = useState<string>("");
  const [progressFilter, setProgressFilter] = useState<number[]>([0, 100]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Add state for expanded semesters
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(
    new Set()
  );

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

  // Add toggle handler
  const toggleSemester = (semester: number) => {
    setExpandedSemesters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(semester)) {
        newSet.delete(semester);
      } else {
        newSet.add(semester);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserEnrollments(Number(currentUser.id)));
      dispatch(fetchStudentAcademicCourses(currentUser.id));
      dispatch(fetchUserProgress());
    }
  }, [dispatch, currentUser, navigate]);

  useEffect(() => {
    if (currentUser?.userStudentAcademic?.id) {
      dispatch(
        fetchStudentAcademicProgram(Number(currentUser.userStudentAcademic.id))
      );
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

  // Process academic courses that are not in the program
  const nonProgramAcademicCourses = React.useMemo(() => {
    if (
      !Array.isArray(studentAcademicCourses) ||
      !Array.isArray(programCourses?.programCourses)
    )
      return [];

    // Get all course IDs from the program
    const programCourseIds = new Set(
      programCourses.programCourses.map((pc) => pc.course?.id)
    );

    // Filter out courses that are in the program
    return studentAcademicCourses
      .filter((item) => {
        // Skip if course is in the program
        if (programCourseIds.has(item.course?.id)) return false;

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
  }, [studentAcademicCourses, programCourses, instructorFilter, searchQuery]);

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

  // Group academic courses by semester
  const semesterCourses = React.useMemo(() => {
    if (
      !programCourses?.programCourses ||
      currentUser?.role !== "student_academic"
    ) {
      return [];
    }

    const semesterMap = new Map<number, SemesterCourses>();

    programCourses.programCourses.forEach((programCourse) => {
      const semester = programCourse.semester;
      const course = programCourse.course;
      const startTime = programCourse.start_time;
      const endTime = programCourse.end_time;

      if (!semesterMap.has(semester)) {
        semesterMap.set(semester, {
          semester,
          courses: [],
          startDate: startTime ?? "",
          endDate: endTime ?? "",
        });
      }

      const semesterData = semesterMap.get(semester)!;

      // Check if course exists in academicCourses
      if (course?.id) {
        const existingCourse = academicCourses.find(
          (ac) => ac.id === course.id
        );
        if (existingCourse) {
          const isLocked = isCourseLocked(startTime ?? "");
          semesterData.courses.push({
            ...existingCourse,
            credits: programCourse.credits,
            isMandatory: programCourse.isMandatory,
            practice: programCourse.practice,
            theory: programCourse.theory,
            isLocked,
            startDate: startTime ?? "",
            endDate: endTime ?? "",
          });
        }
      }
    });

    return Array.from(semesterMap.values()).sort(
      (a, b) => a.semester - b.semester
    );
  }, [programCourses, academicCourses, currentUser?.role]);

  // Update expanded semesters when semesterCourses changes
  useEffect(() => {
    if (semesterCourses.length > 0) {
      const currentSemester = getCurrentSemester(semesterCourses);
      if (currentSemester !== null) {
        setExpandedSemesters(new Set([currentSemester]));
      }
    }
  }, [semesterCourses]);

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

        {/* Academic Courses Section - Grouped by Semester */}
        {currentUser &&
          currentUser.role === "student_academic" &&
          semesterCourses.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Khóa học theo chương trình đào tạo
              </Typography>

              {semesterCourses.map((semester) => {
                const isCurrentSemester =
                  getCurrentSemester(semesterCourses) === semester.semester;

                return (
                  <Box key={semester.semester} mb={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          alpha(
                            theme.palette.primary.main,
                            isCurrentSemester ? 0.1 : 0.05
                          ),
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(
                              theme.palette.primary.main,
                              isCurrentSemester ? 0.15 : 0.08
                            ),
                        },
                        borderColor: "primary.main",
                      }}
                      onClick={() => toggleSemester(semester.semester)}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <IconButton
                            size="small"
                            sx={{
                              transform: expandedSemesters.has(
                                semester.semester
                              )
                                ? "rotate(180deg)"
                                : "none",
                              transition: "transform 0.2s",
                            }}
                          >
                            <ExpandMore />
                          </IconButton>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="primary"
                            >
                              Học kỳ {semester.semester}
                            </Typography>
                            {isCurrentSemester && (
                              <Chip
                                size="small"
                                label="Học kỳ hiện tại"
                                color="primary"
                                sx={{
                                  height: "20px",
                                  "& .MuiChip-label": {
                                    px: 1,
                                    fontSize: "0.75rem",
                                  },
                                }}
                              />
                            )}
                          </Stack>
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip
                            size="small"
                            label={`${semester.courses.reduce(
                              (sum, course) => sum + (course.credits || 0),
                              0
                            )} tín chỉ`}
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(semester.startDate)} -{" "}
                            {formatDate(semester.endDate)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>

                    <Collapse in={expandedSemesters.has(semester.semester)}>
                      <Grid container spacing={3}>
                        {semester.courses.map((course) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={`semester-${semester.semester}-course-${course.id}`}
                          >
                            <CardCourse
                              {...course}
                              additionalInfo={
                                <Stack direction="row" spacing={1} mt={1}>
                                  <Chip
                                    size="small"
                                    label={`${course.credits} tín chỉ`}
                                    color="primary"
                                    variant="outlined"
                                  />
                                  {course.isMandatory && (
                                    <Chip
                                      size="small"
                                      label="Bắt buộc"
                                      color="error"
                                      variant="outlined"
                                    />
                                  )}
                                  {course.practice > 0 && (
                                    <Chip
                                      size="small"
                                      label={`${course.practice} TH`}
                                      color="info"
                                      variant="outlined"
                                    />
                                  )}
                                  {course.theory > 0 && (
                                    <Chip
                                      size="small"
                                      label={`${course.theory} LT`}
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                  {course.isLocked && (
                                    <Chip
                                      size="small"
                                      label="Chưa mở"
                                      color="default"
                                      variant="outlined"
                                      sx={{
                                        bgcolor: "grey.100",
                                        "& .MuiChip-label": {
                                          color: "text.secondary",
                                        },
                                      }}
                                    />
                                  )}
                                </Stack>
                              }
                              disabled={course.isLocked}
                              disabledTooltip={
                                course.isLocked
                                  ? `Khóa học sẽ mở ${formatDate(
                                      course.startDate
                                    )}`
                                  : undefined
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  </Box>
                );
              })}
            </Box>
          )}

        {/* Non-Program Academic Courses Section */}
        {currentUser?.role === "student_academic" &&
          nonProgramAcademicCourses.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Khóa học bổ sung
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Các khóa học bổ sung không thuộc chương trình đào tạo chính thức
                do giảng viên phụ trách thêm vào.
              </Typography>
              <Grid container spacing={3}>
                {nonProgramAcademicCourses.map((course) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={`non-program-${course.id}`}
                  >
                    <CardCourse
                      {...course}
                      additionalInfo={
                        <Stack direction="row" spacing={1} mt={1}>
                          <Chip
                            size="small"
                            label="Khóa học bổ sung"
                            color="info"
                            variant="outlined"
                          />
                          {course.isLocked && (
                            <Chip
                              size="small"
                              label="Chưa mở"
                              color="default"
                              variant="outlined"
                              sx={{
                                bgcolor: "grey.100",
                                "& .MuiChip-label": {
                                  color: "text.secondary",
                                },
                              }}
                            />
                          )}
                        </Stack>
                      }
                      disabled={course.isLocked}
                      disabledTooltip={
                        course.isLocked
                          ? `Khóa học sẽ mở ${formatDate(course.startDate)}`
                          : undefined
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

        {/* Regular Enrolled Courses Section */}
        {filteredEnrollments.length > 0 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Khóa học đã đăng ký
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Các khóa học bạn đã đăng ký.
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
              p: 6,
              textAlign: "center",
              bgcolor: "background.paper",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              maxWidth: 600,
              mx: "auto",
              my: 4,
            }}
          >
            <Box
              sx={{
                position: "relative",
                mb: 3,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "primary.light",
                  opacity: 0.1,
                  animation: "pulse 2s infinite",
                },
                "@keyframes pulse": {
                  "0%": {
                    transform: "translate(-50%, -50%) scale(1)",
                    opacity: 0.1,
                  },
                  "50%": {
                    transform: "translate(-50%, -50%) scale(1.2)",
                    opacity: 0.2,
                  },
                  "100%": {
                    transform: "translate(-50%, -50%) scale(1)",
                    opacity: 0.1,
                  },
                },
              }}
            >
              <MenuBook
                sx={{ fontSize: 80, color: "primary.main", opacity: 0.8 }}
              />
            </Box>
            <Typography
              variant="h5"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {instructorFilter ||
              progressFilter[0] > 0 ||
              progressFilter[1] < 100 ||
              searchQuery
                ? "Không tìm thấy khóa học nào với bộ lọc hiện tại"
                : "Bạn chưa có khóa học nào"}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
            >
              {instructorFilter ||
              progressFilter[0] > 0 ||
              progressFilter[1] < 100 ||
              searchQuery
                ? "Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để tìm khóa học phù hợp với bạn."
                : "Khám phá các khóa học mới và bắt đầu hành trình học tập của bạn ngay hôm nay."}
            </Typography>
            {(instructorFilter ||
              progressFilter[0] > 0 ||
              progressFilter[1] < 100 ||
              searchQuery) && (
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/courses")}
                  startIcon={<MenuBook />}
                >
                  Xem tất cả khóa học
                </Button>
              </Stack>
            )}
            {!instructorFilter &&
              progressFilter[0] === 0 &&
              progressFilter[1] === 100 &&
              !searchQuery && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/courses")}
                  startIcon={<MenuBook />}
                  sx={{ mt: 2 }}
                >
                  Khám phá khóa học
                </Button>
              )}
          </Paper>
        )}
      </Box>
    </CustomContainer>
  );
};

// Add default export
export default EnrolledCourses;
