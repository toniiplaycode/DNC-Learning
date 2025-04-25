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
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import CustomContainer from "../../components/common/CustomContainer";
import { useAppSelector } from "../../app/hooks";
import { useAppDispatch } from "../../app/hooks";
import { fetchCourseById } from "../../features/courses/coursesApiSlice";
import { formatDate } from "date-fns";
import { fetchInstructorById } from "../../features/user_instructors/instructorsApiSlice";
import { selectCurrentInstructor } from "../../features/user_instructors/instructorsSelectors";
import { useSelector } from "react-redux";
import CourseRating from "../../components/common/course/CourseRating";
import { fetchUserEnrollments } from "../../features/enrollments/enrollmentsApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { selectUserEnrollments } from "../../features/enrollments/enrollmentsSelectors";
import { useAppSelector as useReduxAppSelector } from "../../redux/hooks";
import { selectUserEnrollments as selectReduxUserEnrollments } from "../../redux/features/user/userSelectors";
import { isUppercase } from "../../../../backend/src/modules/courses/dto/create-courses.dto";

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
  const currentInstructor = useAppSelector(selectCurrentInstructor);
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
    }
  }, [dispatch, id, currentUser]);

  useEffect(() => {
    // Kiểm tra người dùng trước tiên
    if (!currentUser) {
      setIsEnrolled(false);
      setCourseProgress(0);
      return;
    }

    // Sau đó mới kiểm tra enrollment nếu người dùng tồn tại
    if (userEnrollments && userEnrollments.length > 0) {
      const currentEnrollment = userEnrollments.find(
        (enrollment) => Number(enrollment?.course?.id) === Number(id)
      );
      setIsEnrolled(!!currentEnrollment);
      setCourseProgress(currentEnrollment?.progress || 0);
    }
  }, [id, currentUser, userEnrollments]);

  console.log(currentUser);

  useEffect(() => {
    if (currentCourse?.instructor?.id) {
      dispatch(fetchInstructorById(currentCourse?.instructor?.id));
    }
  }, [currentCourse, id]);

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

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
            <Chip icon={<AccessTime />} label={"12 tuần"} variant="outlined" />
            <Chip
              icon={<PlayCircleOutline />}
              label={`${totalLessons} bài học`}
              variant="outlined"
            />
            <Chip
              icon={<Person />}
              label={`${currentCourse?.enrollments?.length || 0} học viên`}
              variant="outlined"
            />
            <Chip icon={<Star />} label={averageRating} variant="outlined" />
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
                              {true && (
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
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Add What You'll Learn section */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bạn sẽ học được gì
                  </Typography>
                  <Grid container spacing={2}>
                    {currentCourse?.learned?.split("\n").map((item, index) => (
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

              {/* Add Requirements section */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Yêu cầu
                  </Typography>
                  <List>
                    {currentCourse?.required?.split("\n").map((req, index) => (
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

              {/* Add Certificate section */}
              <Card sx={{ mb: 4 }}>
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

              <CourseRating />
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
                <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                    {isEnrolled ? (
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        Đã tham gia
                      </Typography>
                    ) : (
                      formatPrice(currentCourse?.price || 0)
                    )}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" paragraph>
                  Khóa học bao gồm:
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <PlayCircleOutline />
                    <Typography variant="body2">
                      {totalLessons} bài học
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <AccessTime />
                    <Typography variant="body2">12 tuần học</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Assignment />
                    <Typography variant="body2">Bài tập thực hành</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Quiz />
                    <Typography variant="body2">Kiểm tra đánh giá</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <LibraryBooks />
                    <Typography variant="body2">Tài liệu học tập</Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 2 }}
                onClick={() => {
                  isEnrolled
                    ? navigate(`/course/${id}/learn`)
                    : navigate(`/purchase/${id}`);
                }}
              >
                {isEnrolled ? "Tiếp tục học" : "Đăng ký ngay"}
              </Button>

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
