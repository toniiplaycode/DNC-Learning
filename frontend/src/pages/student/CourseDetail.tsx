import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  CardMedia,
  LinearProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PlayCircleOutline,
  Assignment,
  Quiz,
  AccessTime,
  Person,
  Star,
  CheckCircle,
  KeyboardArrowDown,
  KeyboardArrowUp,
  PictureAsPdf,
  LibraryBooks,
  Slideshow,
  Description,
  TableChart,
  TextSnippet,
  VideoLibrary,
  Link as LinkIcon,
  School,
  MenuBook,
  EmojiEvents,
  Timer,
  AutoStories,
  LockOpen,
  Lock,
  InfoOutlined,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import CustomContainer from "../../components/common/CustomContainer";
import { useAppSelector } from "../../app/hooks";
import { useAppDispatch } from "../../app/hooks";
import { fetchCourseById } from "../../features/courses/coursesApiSlice";
import { formatDate } from "date-fns";
import { fetchInstructorById } from "../../features/user_instructors/instructorsApiSlice";
import { selectCurrentInstructor } from "../../features/user_instructors/instructorsSelectors";
import CourseRating from "../../components/common/course/CourseRating";
import {
  enrollInCourse,
  fetchUserEnrollments,
} from "../../features/enrollments/enrollmentsApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { selectUserEnrollments } from "../../features/enrollments/enrollmentsSelectors";
import { fetchStudentAcademicCourses } from "../../features/users/usersApiSlice";
import { selectStudentAcademicCourses } from "../../features/users/usersSelectors";
import { alpha } from "@mui/material/styles";
import { EnrollmentStatus } from "../../types/enrollment.types";
import { toast } from "react-toastify";
import { selectStudentAcademicProgram } from "../../features/programs/programsSelectors";
import { fetchStudentAcademicProgram } from "../../features/programs/programsSlice";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </Box>
  );
};

const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { currentCourse, status, error } = useAppSelector(
    (state) => state.courses
  );
  const currentUser = useAppSelector(selectCurrentUser);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);
  const currentInstructor = useAppSelector(selectCurrentInstructor);
  const studentAcademicProgram = useAppSelector(selectStudentAcademicProgram);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(parseInt(id)));
    }
    if (currentUser?.id) {
      dispatch(fetchUserEnrollments(Number(currentUser?.id)));
      dispatch(fetchStudentAcademicCourses(currentUser.id));
    }
    if (
      currentUser?.role === "student_academic" &&
      currentUser?.userStudentAcademic?.id
    ) {
      dispatch(
        fetchStudentAcademicProgram(Number(currentUser.userStudentAcademic.id))
      );
    }
  }, [dispatch, id, currentUser, navigate]);

  useEffect(() => {
    // Kiểm tra người dùng trước tiên
    if (!currentUser) {
      setIsEnrolled(false);
      setCourseProgress(0);
      return;
    }

    // Kiểm tra enrollment thông thường
    let isEnrolledInCourse = false;
    if (userEnrollments && userEnrollments.length > 0) {
      const currentEnrollment = userEnrollments.find(
        (enrollment) => Number(enrollment?.course?.id) === Number(id)
      );
      isEnrolledInCourse = !!currentEnrollment;
      setCourseProgress(currentEnrollment?.progress || 0);
    }

    // Kiểm tra enrollment trong khóa học thuật
    if (studentAcademicCourses && studentAcademicCourses.length > 0) {
      const isInAcademicCourse = studentAcademicCourses.some(
        (academic) => Number(academic.course.id) === Number(id)
      );
      isEnrolledInCourse = isEnrolledInCourse || isInAcademicCourse;
    }

    setIsEnrolled(isEnrolledInCourse);
  }, [id, currentUser, userEnrollments, studentAcademicCourses]);

  useEffect(() => {
    if (currentCourse?.instructor?.id) {
      dispatch(fetchInstructorById(currentCourse?.instructor?.id));
    }
  }, [currentCourse, id]);

  // Kiểm tra khóa học có bị khóa không (nếu thuộc chương trình đào tạo và chưa đến ngày mở)
  const isCourseLocked = () => {
    // Chỉ khóa với sinh viên học thuật
    if (
      currentUser?.role !== "student_academic" ||
      !studentAcademicProgram?.programCourses ||
      !currentCourse?.id
    ) {
      return false;
    }

    // Tìm khóa học trong chương trình đào tạo
    const programCourse = studentAcademicProgram.programCourses.find(
      (pc) => pc.course?.id === currentCourse.id
    );

    if (!programCourse) {
      console.log("Course not found in program");
      return false;
    }

    // Nếu chưa đến ngày mở thì khóa
    if (programCourse.start_time) {
      const start = new Date(programCourse.start_time);
      const now = new Date();
      const locked = start > now;

      return locked;
    }

    return false;
  };

  const handleSectionToggle = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const totalLessons =
    currentCourse?.sections?.reduce((total, section) => {
      return total + section.lessons.length;
    }, 0) || 0;

  const averageRating =
    currentCourse?.reviews.reduce((total, review) => {
      return total + review.rating;
    }, 0) / (currentCourse?.reviews.length || 1) || 0;

  const InstructorInfo = () => (
    <Box
      sx={{
        cursor: "pointer",
      }}
      onClick={() => {
        navigate(`/view-instructor/${currentCourse?.instructor?.id}`);
      }}
    >
      <Typography variant="h6" gutterBottom>
        Giảng viên
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar
          src={currentInstructor?.user?.avatarUrl}
          sx={{ width: 64, height: 64, mr: 2 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {currentCourse?.instructor?.fullName}
          </Typography>
          <Typography color="text.secondary">
            {currentCourse?.instructor?.professionalTitle}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Typography variant="h6" align="center">
            {currentInstructor?.totalReviews}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Đánh giá
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" align="center">
            {currentInstructor?.totalStudents}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Học viên
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" align="center">
            {currentInstructor?.totalCourses}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Khóa học
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  // Add this function to check if user can enroll
  const canEnroll = () => {
    // If already enrolled, always allow access
    if (isEnrolled) return true;

    // If course is for both types, allow anyone
    if (!currentCourse?.for || currentCourse.for === "both") return true;

    // If no user, allow view but will redirect to login
    if (!currentUser) return true;

    // Check role-specific access
    return (
      (currentCourse.for === "student" && currentUser.role === "student") ||
      (currentCourse.for === "student_academic" &&
        currentUser.role === "student_academic")
    );
  };

  return (
    <CustomContainer>
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {currentCourse?.title}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={currentCourse?.category?.name}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary" component="span">
              Cập nhật lần cuối:{" "}
              {formatDate(currentCourse?.updatedAt || new Date(), "dd/MM/yyyy")}
            </Typography>
          </Box>

          <Typography color="text.secondary" paragraph>
            {currentCourse?.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <AccessTime sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium">
                12 tuần
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <PlayCircleOutline sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium">
                {totalLessons} bài học
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Person sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium">
                {currentCourse?.enrollments?.length || 0} học viên
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Star sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium">
                {averageRating.toFixed(1)}
              </Typography>
            </Box>

            {currentCourse?.for && currentCourse.for !== "both" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    currentCourse.for === "student"
                      ? alpha(theme.palette.info.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.1),
                  color: (theme) =>
                    currentCourse.for === "student"
                      ? theme.palette.info.main
                      : theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: (theme) =>
                      currentCourse.for === "student"
                        ? alpha(theme.palette.info.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.15),
                  },
                }}
              >
                <School sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
                  {currentCourse.for === "student"
                    ? "Dành cho học viên"
                    : "Dành cho sinh viên"}
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
            >
              <Tab label="Nội dung khóa học" />
              <Tab label="Tài liệu học tập" />
            </Tabs>

            {/* Content Tab */}
            <TabPanel value={activeTab} index={0}>
              <Card>
                <CardContent>
                  <List>
                    {currentCourse?.sections?.map((section, sectionIndex) => (
                      <Box key={section.id}>
                        {/* Section Header - Clickable */}
                        <Box
                          onClick={() => handleSectionToggle(sectionIndex)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "grey.50",
                            p: 1,
                            borderRadius: 1,
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "grey.100",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              Phần {sectionIndex + 1}: {section.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: "auto", mr: 2 }}
                            >
                              {section.lessons.length} bài học
                            </Typography>
                          </Box>
                          {expandedSections.includes(sectionIndex) ? (
                            <KeyboardArrowUp color="action" />
                          ) : (
                            <KeyboardArrowDown color="action" />
                          )}
                        </Box>

                        {/* Lessons and Practice */}
                        <List
                          sx={{
                            pl: 2,
                            height: expandedSections.includes(sectionIndex)
                              ? "auto"
                              : "0px",
                            overflow: "hidden",
                            transition: "height 0.3s ease",
                            visibility: expandedSections.includes(sectionIndex)
                              ? "visible"
                              : "hidden",
                          }}
                        >
                          {section.lessons.map((lesson, lessonIndex) => (
                            <ListItem
                              key={lesson.id}
                              sx={{
                                pl: 2,
                                py: 1,
                                borderRadius: 1,
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {lesson.contentType === "video" && (
                                  <VideoLibrary color="primary" />
                                )}
                                {lesson.contentType === "assignment" && (
                                  <Assignment color="warning" />
                                )}
                                {lesson.contentType === "quiz" && (
                                  <Quiz color="warning" />
                                )}
                                {lesson.contentType === "pdf" && (
                                  <PictureAsPdf color="info" />
                                )}
                                {lesson.contentType === "slide" && (
                                  <Slideshow color="info" />
                                )}
                                {lesson.contentType === "docx" && (
                                  <Description color="info" />
                                )}
                                {lesson.contentType === "xlsx" && (
                                  <TableChart color="info" />
                                )}
                                {lesson.contentType === "txt" && (
                                  <TextSnippet color="info" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    {sectionIndex + 1}.{lessonIndex + 1}{" "}
                                    {lesson.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {lesson.contentType == "quiz"
                                        ? "bài trắc nghiệm"
                                        : lesson.contentType == "assignment"
                                        ? "bài tập"
                                        : lesson.contentType == "xlsx"
                                        ? "excel"
                                        : lesson.contentType == "docx"
                                        ? "word"
                                        : lesson.contentType}
                                    </Typography>
                                  </Box>
                                }
                              />
                              {lesson.isFree === "1" ||
                              lesson.isFree === 1 ||
                              lesson.isFree === true ? (
                                <Typography
                                  sx={{
                                    transformOrigin: "center",
                                    background:
                                      "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                                    color: "white",
                                    padding: "1px 2px",
                                    borderRadius: "6px",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                  }}
                                  variant="caption"
                                >
                                  Free
                                </Typography>
                              ) : (
                                <Lock color="error" sx={{ fontSize: 20 }} />
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Add What You'll Learn section */}

              {currentCourse?.learned?.length > 0 && (
                <Card sx={{ my: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bạn sẽ học được gì
                    </Typography>
                    <Grid container spacing={2}>
                      {currentCourse?.learned
                        ?.split("\n")
                        .map((item, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <CheckCircle color="success" sx={{ mt: 0.5 }} />
                              <Typography>{item}</Typography>
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Add Requirements section */}
              {currentCourse?.required?.length > 0 && (
                <Card sx={{ my: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Yêu cầu
                    </Typography>
                    <List>
                      {currentCourse?.required
                        ?.split("\n")
                        .map((req, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <CheckCircle color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={req} />
                          </ListItem>
                        ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Add Certificate section */}
              <Card sx={{ my: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chứng chỉ
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle color="info" />
                      </ListItemIcon>
                      Khóa học được cấp chứng chỉ theo chuẩn quốc tế
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              {isEnrolled && <CourseRating />}
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={activeTab} index={1}>
              <Card>
                <CardContent>
                  {currentCourse?.sections?.map((section, sectionIndex) => {
                    // Kết hợp documents từ section và lessons có contentType là "document", "pdf", "docx", "xlsx", "txt", "slide"
                    const documentLessons = section.lessons
                      .filter((lesson: any) =>
                        ["pdf", "docx", "xlsx", "txt", "slide"].includes(
                          lesson.contentType
                        )
                      )
                      .map((lesson: any) => ({
                        id: lesson.id,
                        title: lesson.title,
                        fileType: getFileTypeFromContentType(
                          lesson.contentType
                        ), // Xác định đúng fileType
                        isLesson: true, // Đánh dấu đây là lesson
                        isFree: lesson.isFree,
                      }));

                    const allDocuments = [
                      ...section.documents,
                      ...documentLessons,
                    ];

                    if (allDocuments.length === 0) {
                      return null; // Không hiển thị nếu không có tài liệu
                    }

                    return (
                      <Box key={section.id}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Phần {sectionIndex + 1}: {section.title}
                        </Typography>

                        <List>
                          {allDocuments.map((item) => (
                            <ListItem
                              key={`${item.isLesson ? "lesson" : "doc"}-${
                                item.id
                              }`}
                              sx={{
                                bgcolor: "background.paper",
                                borderRadius: 1,
                                mb: 1,
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <ListItemIcon>
                                {item.fileType === "pdf" && (
                                  <PictureAsPdf
                                    color="info"
                                    sx={{ fontSize: 24 }}
                                  />
                                )}
                                {item.fileType === "docx" && (
                                  <Description
                                    color="info"
                                    sx={{ fontSize: 24 }}
                                  />
                                )}
                                {item.fileType === "xlsx" && (
                                  <TableChart
                                    color="info"
                                    sx={{ fontSize: 24 }}
                                  />
                                )}
                                {item.fileType === "txt" && (
                                  <TextSnippet
                                    color="info"
                                    sx={{ fontSize: 24 }}
                                  />
                                )}
                                {item.fileType === "slide" && (
                                  <Slideshow
                                    color="info"
                                    sx={{ fontSize: 24 }}
                                  />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                secondary={
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <Chip
                                      label={item.fileType.toUpperCase()}
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  </Stack>
                                }
                              />
                              {true && !item.isFree && (
                                <Chip
                                  label="Khóa"
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    );
                  })}{" "}
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: "sticky", top: 100, marginBottom: 2 }}>
            <CardContent>
              <CardMedia
                component="img"
                height="260"
                image={
                  currentCourse
                    ? currentCourse.thumbnailUrl
                    : "/src/assets/logo.png"
                }
                sx={{
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              />
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "baseline",
                    mb: 1,
                  }}
                >
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                    {isEnrolled ? (
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        Đã tham gia
                      </Typography>
                    ) : currentCourse?.for === "student_academic" ? (
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        Dành cho sinh viên trường
                      </Typography>
                    ) : (
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                        textAlign="center"
                      >
                        {currentCourse && currentCourse?.price > 0
                          ? formatPrice(currentCourse?.price)
                          : "Miễn phí"}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        <MenuBook />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {totalLessons} bài học
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Nội dung học tập đa dạng
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        <Timer />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          12 tuần học
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Thời gian học tập linh hoạt
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        <Assignment />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Bài tập thực hành
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rèn luyện kỹ năng thực tế
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        <Quiz />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Kiểm tra đánh giá
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Đánh giá năng lực học tập
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        <AutoStories />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Tài liệu học tập
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tài liệu tham khảo phong phú
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        height: "100%",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        <EmojiEvents />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Chứng chỉ
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Chứng nhận kết quả học tập
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Nút đăng ký/học, áp dụng disabled nếu bị khóa */}
              {currentCourse &&
              currentCourse?.price == 0 &&
              currentCourse?.for !== "student_academic" &&
              !isEnrolled ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={async () => {
                    if (!currentUser?.id) {
                      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
                      navigate("/login");
                      return;
                    }

                    try {
                      await dispatch(
                        enrollInCourse({
                          userId: Number(currentUser.id),
                          courseId: Number(id),
                        })
                      ).unwrap();

                      toast.success("Đăng ký khóa học thành công!");
                      navigate(`/enrolled-courses`);
                    } catch (error: any) {
                      console.error("Enrollment error:", error);
                      toast.error(
                        error?.message || "Có lỗi xảy ra khi đăng ký khóa học"
                      );
                    }
                  }}
                  sx={{ mb: 2 }}
                  disabled={isCourseLocked()}
                >
                  {isCourseLocked()
                    ? "Chưa đến thời gian mở"
                    : "Đăng ký miễn phí"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mb: 2 }}
                  onClick={() => {
                    if (isEnrolled) {
                      navigate(`/course/${id}/learn`);
                    } else if (
                      currentCourse?.for === "student_academic" &&
                      currentUser?.role === "student_academic"
                    ) {
                      // No navigation for academic students who aren't enrolled - they need to contact instructor
                    } else {
                      navigate(`/purchase/${id}`);
                    }
                  }}
                  disabled={
                    !canEnroll() ||
                    (currentCourse?.for === "student_academic" &&
                      currentUser?.role === "student_academic" &&
                      !isEnrolled) ||
                    isCourseLocked()
                  }
                >
                  {isCourseLocked()
                    ? "Chưa đến thời gian mở"
                    : isEnrolled
                    ? "Tiếp tục học"
                    : currentCourse?.for === "student_academic" &&
                      currentUser?.role === "student_academic" &&
                      !isEnrolled
                    ? "Liên hệ giảng viên phụ trách"
                    : canEnroll()
                    ? "Đăng ký ngay"
                    : "Không có quyền đăng ký"}
                </Button>
              )}

              {/* Thông báo nếu bị khóa */}
              {isCourseLocked() && (
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    color="error"
                    fontWeight={600}
                    variant="body1"
                    sx={{ mb: 1 }}
                  >
                    Khóa học này sẽ mở vào{" "}
                    {(() => {
                      const programCourse =
                        studentAcademicProgram?.programCourses?.find(
                          (pc) => pc.course?.id === currentCourse?.id
                        );
                      return programCourse?.start_time
                        ? new Date(programCourse.start_time).toLocaleDateString(
                            "vi-VN"
                          )
                        : "";
                    })()}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/academic-program")}
                    sx={{ mt: 1, mb: 2 }}
                  >
                    Xem chương trình đào tạo
                  </Button>
                </Box>
              )}

              {(!isEnrolled || // Kiểm tra enrollment trong khóa học thuật
                (currentCourse?.for === "student_academic" &&
                  currentUser?.role === "student_academic")) &&
                (() => {
                  // Tìm lesson đầu tiên trong tất cả sections
                  let firstLesson = null;
                  for (const section of currentCourse?.sections || []) {
                    if (section.lessons && section.lessons.length > 0) {
                      firstLesson = section.lessons[0];
                      break;
                    }
                  }
                  // Nếu bị khóa thì không cho học thử
                  if (
                    isCourseLocked() ||
                    currentCourse?.for == "student_academic"
                  )
                    return null;
                  return firstLesson && firstLesson.isFree == "1" ? (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{ mb: 2 }}
                      onClick={() => {
                        navigate(`/course/${id}/learn`);
                      }}
                    >
                      Học thử khóa học
                    </Button>
                  ) : null;
                })()}

              {!canEnroll() && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ display: "block", mb: 2, textAlign: "center" }}
                >
                  Khóa học này chỉ dành cho{" "}
                  {currentCourse?.for === "student"
                    ? "học viên"
                    : "sinh viên trường"}
                </Typography>
              )}

              {currentCourse?.for === "student_academic" &&
                currentUser?.role === "student_academic" &&
                !isEnrolled && (
                  <Typography
                    color="info.main"
                    variant="caption"
                    sx={{ display: "block", mb: 2, textAlign: "center" }}
                  >
                    Vui lòng liên hệ giảng viên phụ trách lớp để được thêm vào
                    khóa học này.
                  </Typography>
                )}

              <Divider sx={{ mb: 3 }} />

              <InstructorInfo />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};

// Helper function để xác định fileType từ contentType
function getFileTypeFromContentType(contentType: string): string {
  switch (contentType) {
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "xlsx":
      return "xlsx";
    case "txt":
      return "txt";
    case "slide":
      return "slide";
    case "document":
      return "pdf"; // Giả định mặc định cho document
    default:
      return "pdf";
  }
}

export default CourseDetail;
