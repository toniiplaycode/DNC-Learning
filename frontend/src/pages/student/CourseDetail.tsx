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
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import CustomContainer from "../../components/common/CustomContainer";
import { useAppSelector } from "../../app/hooks";
import { useAppDispatch } from "../../app/hooks";
import { fetchCourseById } from "../../features/courses/coursesApiSlice";
import { formatDate } from "date-fns";
import {
  fetchInstructorById,
  fetchInstructors,
} from "../../features/instructors/instructorsApiSlice";
import {
  selectAllInstructors,
  selectCurrentInstructor,
} from "../../features/instructors/instructorsSelectors";
import { useSelector } from "react-redux";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: "video" | "assignment" | "quiz";
  isLocked: boolean;
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
  practice: {
    id: number;
    title: string;
    description: string;
    duration: string;
    points: number;
    isLocked: boolean;
  };
  materials: {
    id: number;
    title: string;
    type: "pdf" | "slide" | "code" | "link";
    url: string;
    size?: string;
    isLocked: boolean;
    section: string;
  }[];
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: {
    name: string;
    avatar: string;
    title: string;
    rating: number;
    students: number;
    courses: number;
  };
  progress: number;
  duration: string;
  totalLessons: number;
  level: string;
  rating: number;
  enrollments: number;
  lastUpdated: string;
  sections: Section[];
  price: number;
  originalPrice: number;
  isEnrolled: boolean;
  whatYouWillLearn: string[];
  requirements: string[];
  certificates: string[];
  materials: {
    id: number;
    title: string;
    type: "pdf" | "slide" | "code" | "link";
    url: string;
    size?: string;
    isLocked: boolean;
    section: string;
  }[];
}

const mockCourseData = {
  id: 1,
  title: "Khóa học React & TypeScript từ cơ bản đến nâng cao",
  description:
    "Học cách xây dựng ứng dụng web hiện đại với React và TypeScript. Khóa học này sẽ giúp bạn nắm vững các khái niệm cơ bản và nâng cao.",
  thumbnail: "/src/assets/courses/react-ts.jpg",
  category: "Frontend Development",
  instructor: {
    name: "Nguyễn Văn A",
    avatar: "/src/assets/instructors/avatar.jpg",
    title: "Senior Frontend Developer",
    rating: 4.8,
    students: 1234,
    courses: 5,
  },
  progress: 35,
  duration: "20 giờ",
  totalLessons: 48,
  level: "Trung cấp",
  rating: 4.7,
  enrollments: 789,
  lastUpdated: "2024-02-15",
  sections: [
    {
      id: 1,
      title: "Giới thiệu khóa học",
      lessons: [
        {
          id: 1,
          title: "Tổng quan về khóa học",
          duration: "10:00",
          type: "video",
          isLocked: false,
        },
        {
          id: 2,
          title: "Cài đặt môi trường phát triển",
          duration: "15:00",
          type: "video",
          isLocked: false,
        },
      ],
      practice: {
        id: 101,
        title: "Bài tập: Cài đặt và cấu hình môi trường",
        description:
          "Thực hành cài đặt Node.js, VS Code và các extension cần thiết",
        duration: "30:00",
        points: 10,
        isLocked: false,
      },
      materials: [
        {
          id: 201,
          title: "Slide giới thiệu khóa học",
          type: "slide",
          url: "/materials/intro-slides.pdf",
          size: "2.5 MB",
          isLocked: false,
          section: "Giới thiệu khóa học",
        },
        {
          id: 202,
          title: "Hướng dẫn cài đặt môi trường",
          type: "pdf",
          url: "/materials/setup-guide.pdf",
          size: "1.8 MB",
          isLocked: false,
          section: "Giới thiệu khóa học",
        },
      ],
    },
    {
      id: 2,
      title: "React Fundamentals",
      lessons: [
        {
          id: 3,
          title: "Components và Props",
          duration: "20:00",
          type: "video",
          isLocked: true,
        },
        {
          id: 4,
          title: "State và Lifecycle",
          duration: "25:00",
          type: "video",
          isLocked: true,
        },
      ],
      practice: {
        id: 102,
        title: "Bài tập: Xây dựng Component Todo List",
        description:
          "Thực hành tạo components, sử dụng props và state để xây dựng ứng dụng Todo List",
        duration: "45:00",
        points: 20,
        isLocked: true,
      },
      materials: [
        {
          id: 203,
          title: "Tài liệu React Components",
          type: "pdf",
          url: "/materials/react-components.pdf",
          size: "3.2 MB",
          isLocked: true,
          section: "React Fundamentals",
        },
        {
          id: 204,
          title: "Source code ví dụ",
          type: "code",
          url: "https://github.com/example/react-examples",
          isLocked: true,
          section: "React Fundamentals",
        },
        {
          id: 205,
          title: "Slide bài giảng React Fundamentals",
          type: "slide",
          url: "/materials/react-fundamentals.pdf",
          size: "4.5 MB",
          isLocked: true,
          section: "React Fundamentals",
        },
      ],
    },
  ] as Section[],
  price: 599000,
  originalPrice: 1200000,
  isEnrolled: false,
  whatYouWillLearn: [
    "Xây dựng ứng dụng web với React & TypeScript",
    "Hiểu sâu về React Hooks và Custom Hooks",
    "Quản lý state với Redux Toolkit",
    "Làm việc với REST APIs",
    "Tối ưu hiệu suất ứng dụng React",
  ],
  requirements: [
    "Kiến thức cơ bản về HTML, CSS, JavaScript",
    "Hiểu biết về ES6+",
    "Không cần kinh nghiệm với React hoặc TypeScript",
  ],
  certificates: ["Khóa học được cấp chứng chỉ theo chuẩn quốc tế"],
  materials: [
    {
      id: 201,
      title: "Slide giới thiệu khóa học",
      type: "slide",
      url: "/materials/intro-slides.pdf",
      size: "2.5 MB",
      isLocked: false,
      section: "Giới thiệu khóa học",
    },
    {
      id: 202,
      title: "Hướng dẫn cài đặt môi trường",
      type: "pdf",
      url: "/materials/setup-guide.pdf",
      size: "1.8 MB",
      isLocked: false,
      section: "Giới thiệu khóa học",
    },
    {
      id: 203,
      title: "Tài liệu React Components",
      type: "pdf",
      url: "/materials/react-components.pdf",
      size: "3.2 MB",
      isLocked: true,
      section: "React Fundamentals",
    },
    {
      id: 204,
      title: "Source code ví dụ",
      type: "code",
      url: "https://github.com/example/react-examples",
      isLocked: true,
      section: "React Fundamentals",
    },
    {
      id: 205,
      title: "Slide bài giảng React Fundamentals",
      type: "slide",
      url: "/materials/react-fundamentals.pdf",
      size: "4.5 MB",
      isLocked: true,
      section: "React Fundamentals",
    },
  ],
} as CourseData;

// Thêm interface và component TabPanel
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
  const { courseId } = useParams();

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(parseInt(id)));
    }
  }, [dispatch, id]);

  const { currentCourse, status, error } = useAppSelector(
    (state) => state.courses
  );

  useEffect(() => {
    if (currentCourse?.instructor?.id) {
      dispatch(fetchInstructorById(currentCourse?.instructor?.id));
    }
  }, [currentCourse, id]);

  const currentInstructor = useSelector(selectCurrentInstructor);

  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [activeTab, setActiveTab] = useState(0);

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
                                  <PlayCircleOutline color="primary" />
                                )}
                                {lesson.contentType === "assignment" && (
                                  <Assignment color="primary" />
                                )}
                                {lesson.contentType === "quiz" && (
                                  <Quiz color="primary" />
                                )}
                                {lesson.contentType === "document" && (
                                  <PictureAsPdf color="primary" />
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
                                    <AccessTime
                                      sx={{
                                        fontSize: 16,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {lesson.duration || "N/A"} phút
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
                    {mockCourseData.certificates.map((req, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle color="info" />
                        </ListItemIcon>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={activeTab} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tài liệu khóa học
                  </Typography>
                  {currentCourse?.sections?.map((section, sectionIndex) => {
                    // Kết hợp documents từ section và lessons có contentType="document"
                    const documentLessons = section.lessons
                      .filter(
                        (lesson: any) => lesson.contentType === "document"
                      )
                      .map((lesson: any) => ({
                        id: lesson.id,
                        title: lesson.title,
                        fileType: "pdf", // Giả định mặc định là PDF
                        fileSize: 1024, // Giả định kích thước mặc định
                        isLesson: true, // Đánh dấu đây là lesson
                        isFree: lesson.isFree,
                      }));

                    const allDocuments = [
                      ...section.documents,
                      ...documentLessons,
                    ];

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
                                <PictureAsPdf
                                  color="error"
                                  sx={{ fontSize: 24 }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                secondary={
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    {!item.isLesson && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {`${(item.fileSize / 1024).toFixed(
                                          2
                                        )} MB`}
                                      </Typography>
                                    )}
                                    <Chip
                                      label="PDF"
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                    />
                                    {item.isLesson && item.isFree && (
                                      <Chip
                                        label="Miễn phí"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    )}
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
              {mockCourseData.isEnrolled ? (
                // Enrolled student view
                <>
                  <CardMedia
                    component="img"
                    height="140"
                    image={"/src/assets/logo.png"}
                    sx={{
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Tiến độ học tập
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={mockCourseData.progress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {mockCourseData.progress}%
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mb: 3 }}
                    onClick={() => navigate(`/course/${courseId}/learn`)}
                  >
                    Tiếp tục học
                  </Button>

                  <Divider sx={{ mb: 3 }} />

                  <InstructorInfo />
                </>
              ) : (
                // Non-enrolled student view
                <>
                  <CardMedia
                    component="img"
                    height="140"
                    image={"/src/assets/logo.png"}
                    sx={{
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  />
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "baseline", mb: 1 }}
                    >
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                        {formatPrice(currentCourse?.price || 0)}
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
                        <Typography variant="body2">
                          Bài tập thực hành
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Quiz />
                        <Typography variant="body2">
                          Kiểm tra đánh giá
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <LibraryBooks />
                        <Typography variant="body2">
                          Tài liệu học tập
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mb: 2 }}
                    onClick={() => navigate(`/purchase/${courseId}`)}
                  >
                    Đăng ký ngay
                  </Button>

                  <Divider sx={{ mb: 3 }} />

                  <InstructorInfo />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};

export default CourseDetail;
