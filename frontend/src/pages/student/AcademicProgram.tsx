import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import {
  School as SchoolIcon,
  Book as BookIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalLibrary as LocalLibraryIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search as SearchIcon,
  Clear as ClearIcon,
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { fetchStudentAcademicProgram } from "../../features/programs/programsSlice";
import { useNavigate } from "react-router-dom";
import { Program, ProgramCourse } from "../../types/program.types";
import {
  selectProgramsStatus,
  selectStudentAcademicProgram,
} from "../../features/programs/programsSelectors";
import { format } from "date-fns";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import EmptyState from "../../components/common/EmptyState";

const AcademicProgram = () => {
  // 1. All hooks declarations first
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentUser = useAppSelector(selectCurrentUser);
  const program = useAppSelector(selectStudentAcademicProgram);
  const programStatus = useAppSelector(selectProgramsStatus);

  // 2. Fetch data immediately
  useEffect(() => {
    if (currentUser?.userStudentAcademic?.id) {
      dispatch(
        fetchStudentAcademicProgram(Number(currentUser.userStudentAcademic.id))
      );
    } else if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role !== "student_academic") {
      navigate("/");
    }
  }, [dispatch, currentUser, navigate]);

  // 3. All useState hooks
  const [expandedSemesters, setExpandedSemesters] = useState<
    Record<number, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [mandatoryFilter, setMandatoryFilter] = useState<string>("all");
  const [creditsFilter, setCreditsFilter] = useState<string>("all");

  // 4. All useMemo hooks
  const uniqueCredits = React.useMemo(() => {
    if (!program?.programCourses) return [];
    const credits = new Set<number>();
    program.programCourses.forEach((course) => {
      credits.add(course.credits);
    });
    return Array.from(credits).sort((a, b) => a - b);
  }, [program?.programCourses]);

  const coursesBySemester = React.useMemo(() => {
    if (!program?.programCourses) return {};
    return program.programCourses.reduce<Record<number, ProgramCourse[]>>(
      (acc, course) => {
        const semester = course.semester;
        if (!acc[semester]) {
          acc[semester] = [];
        }
        acc[semester].push(course);
        return acc;
      },
      {}
    );
  }, [program?.programCourses]);

  const semesterTotalCredits = React.useMemo(
    () =>
      Object.entries(coursesBySemester).reduce<Record<number, number>>(
        (acc, [semester, courses]) => {
          acc[Number(semester)] = courses.reduce(
            (sum, course) => sum + course.credits,
            0
          );
          return acc;
        },
        {}
      ),
    [coursesBySemester]
  );

  const totalProgramCredits = React.useMemo(
    () =>
      Object.values(semesterTotalCredits).reduce(
        (sum, credits) => sum + credits,
        0
      ),
    [semesterTotalCredits]
  );

  // 5. Event handlers and other functions
  const toggleSemester = (semester: number) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semester]: !prev[semester],
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleMandatoryChange = (event: SelectChangeEvent) => {
    setMandatoryFilter(event.target.value);
  };

  const handleCreditsChange = (event: SelectChangeEvent) => {
    setCreditsFilter(event.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMandatoryFilter("all");
    setCreditsFilter("all");
  };

  const filterCourses = (courses: ProgramCourse[]) => {
    return courses.filter((course) => {
      if (
        searchQuery &&
        !course.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (mandatoryFilter !== "all") {
        const isMandatory = mandatoryFilter === "mandatory";
        if (course.isMandatory !== isMandatory) {
          return false;
        }
      }

      if (creditsFilter !== "all") {
        const credits = Number(creditsFilter);
        if (course.credits !== credits) {
          return false;
        }
      }

      return true;
    });
  };

  // 6. Render with state checks
  if (programStatus === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (programStatus === "failed") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Không thể tải chương trình học
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            if (currentUser?.userStudentAcademic?.id) {
              dispatch(
                fetchStudentAcademicProgram(
                  Number(currentUser.userStudentAcademic.id)
                )
              );
            }
          }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  if (!program) {
    return (
      <EmptyState
        icon={<SchoolIcon />}
        title="Không tìm thấy chương trình học"
        description="Chương trình học của bạn hiện không khả dụng. Vui lòng liên hệ với quản trị viên để được hỗ trợ."
        maxWidth={500}
        height={400}
      />
    );
  }

  // At this point, we know program is not null and status is succeeded
  const programData = program;

  // 7. Render
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "url('/src/assets/pattern.png')",
            opacity: 0.1,
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            {programData.programName}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 3 }}>
            {programData.description}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box>
                    <Typography
                      variant="body2"
                      color="white"
                      sx={{ opacity: 0.8 }}
                    >
                      Mã chương trình
                    </Typography>
                    <Typography variant="h6" color="white">
                      {programData.programCode}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box>
                    <Typography
                      variant="body2"
                      color="white"
                      sx={{ opacity: 0.8 }}
                    >
                      Tổng số tín chỉ tối đa
                    </Typography>
                    <Typography variant="h6" color="white">
                      {programData.totalCredits}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box>
                    <Typography
                      variant="body2"
                      color="white"
                      sx={{ opacity: 0.8 }}
                    >
                      Tổng số tín chỉ hiện tại
                    </Typography>
                    <Typography variant="h6" color="white">
                      {totalProgramCredits} / {programData.totalCredits}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box>
                    <Typography
                      variant="body2"
                      color="white"
                      sx={{ opacity: 0.8 }}
                    >
                      Thời gian đào tạo
                    </Typography>
                    <Typography variant="h6" color="white">
                      {programData.durationYears} năm
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Search and Filters Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Tìm kiếm và lọc khóa học
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery("")}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Loại môn học</InputLabel>
              <Select
                value={mandatoryFilter}
                onChange={handleMandatoryChange}
                label="Loại môn học"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="mandatory">Bắt buộc</MenuItem>
                <MenuItem value="optional">Tự chọn</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Số tín chỉ</InputLabel>
              <Select
                value={creditsFilter}
                onChange={handleCreditsChange}
                label="Số tín chỉ"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {uniqueCredits.map((credits) => (
                  <MenuItem key={credits} value={credits.toString()}>
                    {credits} tín chỉ
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {(searchQuery ||
          mandatoryFilter !== "all" ||
          creditsFilter !== "all") && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Đang lọc:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchQuery && (
                <Chip
                  label={`Tìm kiếm: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {mandatoryFilter !== "all" && (
                <Chip
                  label={`Loại: ${
                    mandatoryFilter === "mandatory" ? "Bắt buộc" : "Tự chọn"
                  }`}
                  onDelete={() => setMandatoryFilter("all")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {creditsFilter !== "all" && (
                <Chip
                  label={`Tín chỉ: ${creditsFilter}`}
                  onDelete={() => setCreditsFilter("all")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                label="Xóa tất cả bộ lọc"
                onClick={clearFilters}
                color="primary"
                size="small"
              />
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Timeline View */}
      <Box sx={{ display: "flex", gap: 4 }}>
        <Timeline
          position="right"
          sx={{
            flex: 1,
            "& .MuiTimelineItem-root": {
              minHeight: "auto",
              "&:before": {
                flex: 0,
                padding: 0,
              },
            },
            "& .MuiTimelineContent-root": {
              py: 0,
            },
          }}
        >
          {Object.entries(coursesBySemester)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([semester, courses]) => {
              const filteredCourses = filterCourses(courses);
              if (filteredCourses.length === 0) return null;

              return (
                <TimelineItem key={semester}>
                  <TimelineSeparator>
                    <TimelineDot
                      color="primary"
                      sx={{
                        p: 2,
                        my: 0,
                        boxShadow: `0 0 0 4px ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      }}
                    >
                      <LocalLibraryIcon />
                    </TimelineDot>
                    <TimelineConnector
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2) }}
                    />
                  </TimelineSeparator>
                  <TimelineContent sx={{ px: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight="bold"
                        >
                          Học kỳ {semester}
                        </Typography>
                        <Chip
                          label={`${
                            semesterTotalCredits[Number(semester)]
                          } tín chỉ`}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => toggleSemester(Number(semester))}
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          {expandedSemesters[Number(semester)] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {courses[0]?.start_time && courses[0]?.end_time && (
                          <>
                            {format(
                              new Date(courses[0].start_time),
                              "dd/MM/yyyy"
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(courses[0].end_time),
                              "dd/MM/yyyy"
                            )}
                          </>
                        )}
                      </Typography>
                    </Box>
                    <Collapse in={expandedSemesters[Number(semester)] ?? true}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Grid container spacing={1.5}>
                          {filteredCourses.map((course) => (
                            <Grid item xs={12} key={course.id}>
                              <Card
                                sx={{
                                  display: "flex",
                                  height: "70px",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  transition: "all 0.2s ease-in-out",
                                  bgcolor: "background.paper",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: theme.shadows[2],
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.04
                                    ),
                                    "& .MuiTypography-root": {
                                      color: theme.palette.primary.main,
                                    },
                                    "& .MuiChip-root": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.08
                                      ),
                                    },
                                  },
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  if (course.course?.id) {
                                    navigate(`/course/${course.course.id}`);
                                  }
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  sx={{
                                    width: 70,
                                    height: 70,
                                    p: 1,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                  }}
                                  image={
                                    course.course?.thumbnailUrl ||
                                    "/src/assets/logo-not-text.png"
                                  }
                                  alt={course.course?.title}
                                />
                                <CardContent
                                  sx={{
                                    flex: 1,
                                    py: 0.1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 600,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      fontSize: "0.9rem",
                                      color: theme.palette.primary.main,
                                    }}
                                  >
                                    {course.course?.title}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    flexWrap="wrap"
                                    useFlexGap
                                  >
                                    <Chip
                                      icon={<BookIcon />}
                                      label={`${course.credits} tín chỉ`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.65rem",
                                        mr: 0.5,
                                      }}
                                    />
                                    {course.start_time && course.end_time && (
                                      <Chip
                                        icon={
                                          <AccessTimeIcon
                                            sx={{ fontSize: 12 }}
                                          />
                                        }
                                        label={`${new Date(
                                          course.start_time
                                        ).toLocaleDateString(
                                          "vi-VN"
                                        )} - ${new Date(
                                          course.end_time
                                        ).toLocaleDateString("vi-VN")}`}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: "0.65rem",
                                          mr: 0.5,
                                        }}
                                      />
                                    )}
                                    <Chip
                                      icon={
                                        <ScheduleIcon sx={{ fontSize: 12 }} />
                                      }
                                      label={`${course.practice} tiết TH`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.65rem",
                                        mr: 0.5,
                                      }}
                                    />
                                    <Chip
                                      icon={
                                        <ScheduleIcon sx={{ fontSize: 12 }} />
                                      }
                                      label={`${course.theory} tiết LT`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.65rem",
                                        mr: 0.5,
                                      }}
                                    />
                                    <Chip
                                      icon={<CheckCircleIcon />}
                                      label={
                                        course.isMandatory
                                          ? "Bắt buộc"
                                          : "Tự chọn"
                                      }
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.65rem",
                                        mr: 0.5,
                                      }}
                                    />
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Collapse>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
        </Timeline>
      </Box>

      {/* No Results Message */}
      {Object.values(coursesBySemester).every(
        (courses) => filterCourses(courses).length === 0
      ) && (
        <EmptyState
          icon={<SearchOffIcon />}
          title={
            searchQuery || mandatoryFilter !== "all" || creditsFilter !== "all"
              ? "Không tìm thấy khóa học nào phù hợp với bộ lọc"
              : "Chưa có khóa học nào trong chương trình"
          }
          description={
            searchQuery || mandatoryFilter !== "all" || creditsFilter !== "all"
              ? "Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để tìm khóa học phù hợp với bạn."
              : "Chương trình đào tạo của bạn hiện chưa có khóa học nào. Vui lòng liên hệ với quản trị viên để được hỗ trợ."
          }
          maxWidth={600}
          height={400}
        />
      )}
    </Container>
  );
};

export default AcademicProgram;
