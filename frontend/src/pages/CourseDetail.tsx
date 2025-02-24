import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import CustomContainer from "../components/common/CustomContainer";

interface Section {
  id: number;
  title: string;
  lessons: {
    id: number;
    title: string;
    duration: string;
    type: "video" | "assignment" | "quiz";
    isLocked: boolean;
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
          title: "Bài tập Components",
          duration: "30:00",
          type: "assignment",
          isLocked: true,
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
} as CourseData;

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

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

  const InstructorInfo = () => (
    <>
      <Typography variant="h6" gutterBottom>
        Giảng viên
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar
          src={mockCourseData.instructor.avatar}
          sx={{ width: 64, height: 64, mr: 2 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {mockCourseData.instructor.name}
          </Typography>
          <Typography color="text.secondary">
            {mockCourseData.instructor.title}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Typography variant="h6" align="center">
            {mockCourseData.instructor.rating}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Đánh giá
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" align="center">
            {mockCourseData.instructor.students}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Học viên
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" align="center">
            {mockCourseData.instructor.courses}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Khóa học
          </Typography>
        </Grid>
      </Grid>
    </>
  );

  return (
    <CustomContainer>
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {mockCourseData.title}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={mockCourseData.category}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary" component="span">
              Cập nhật lần cuối: {mockCourseData.lastUpdated}
            </Typography>
          </Box>

          <Typography color="text.secondary" paragraph>
            {mockCourseData.description}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
            <Chip
              icon={<AccessTime />}
              label={mockCourseData.duration}
              variant="outlined"
            />
            <Chip
              icon={<PlayCircleOutline />}
              label={`${mockCourseData.totalLessons} bài học`}
              variant="outlined"
            />
            <Chip
              icon={<Person />}
              label={`${mockCourseData.enrollments} học viên`}
              variant="outlined"
            />
            <Chip
              icon={<Star />}
              label={`${mockCourseData.rating}/5`}
              variant="outlined"
            />
          </Box>

          {/* Course Content */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Nội dung khóa học
          </Typography>

          <Card>
            <CardContent>
              <List>
                {mockCourseData.sections.map((section, sectionIndex) => (
                  <Box key={section.id}>
                    {/* Section Header - Clickable */}
                    <Box
                      onClick={() => handleSectionToggle(sectionIndex)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "grey.50",
                        p: 2,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "grey.100",
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", flex: 1 }}
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

                    {/* Lessons */}
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
                            borderLeft: "2px solid",
                            borderColor: "grey.200",
                            pl: 3,
                            py: 1.5,
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {lesson.type === "video" && (
                              <PlayCircleOutline color="primary" />
                            )}
                            {lesson.type === "assignment" && (
                              <Assignment color="primary" />
                            )}
                            {lesson.type === "quiz" && <Quiz color="primary" />}
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
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {lesson.duration}
                                </Typography>
                              </Box>
                            }
                          />
                          {lesson.isLocked ? (
                            <Chip
                              label="Khóa"
                              size="small"
                              color="default"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          ) : (
                            <CheckCircle
                              color="success"
                              sx={{ ml: 1, fontSize: 20 }}
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
                {mockCourseData.whatYouWillLearn.map((item, index) => (
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
                {mockCourseData.requirements.map((req, index) => (
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
                      <Typography variant="h4" fontWeight="bold" sx={{ mr: 2 }}>
                        {formatPrice(mockCourseData.price)}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        {formatPrice(mockCourseData.originalPrice)}
                      </Typography>
                    </Box>
                    <Typography
                      color="error"
                      variant="subtitle1"
                      fontWeight="bold"
                    >
                      {Math.round(
                        (1 -
                          mockCourseData.price / mockCourseData.originalPrice) *
                          100
                      )}
                      % giảm giá
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" paragraph>
                      Khóa học bao gồm:
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <PlayCircleOutline />
                        <Typography variant="body2">
                          {mockCourseData.totalLessons} bài học
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <AccessTime />
                        <Typography variant="body2">
                          {mockCourseData.duration} học tập
                        </Typography>
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
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mb: 2 }}
                  >
                    Đăng ký ngay
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ mb: 3 }}
                  >
                    Thêm vào giỏ hàng
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
