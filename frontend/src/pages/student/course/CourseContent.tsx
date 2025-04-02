import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Tabs,
  Tab,
  CardContent,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ContentDocuments from "../../../components/common/course/ContentDocuments";
import CourseRating from "../../../components/common/course/CourseRating";
import GradeOverview from "../../../components/common/course/GradeOverview";
import CourseStructure from "../../../components/common/course/CourseStructure";
import ContentDetail from "../../../components/common/course/ContentDetail";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import { useAppDispatch } from "../../../app/hooks";
import { selectCourseById } from "../../../features/courses/coursesSelector";
import { useAppSelector } from "../../../app/hooks";
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;
  return (
    <Box hidden={value !== index} sx={{ p: 2 }}>
      {value === index && children}
    </Box>
  );
};

interface ContentItem {
  id: number;
  type:
    | "video"
    | "slide"
    | "meet"
    | "quiz"
    | "assignment"
    | "document"
    | "link";
  title: string;
  description: string;
  duration?: string;
  url: string;
  completed: boolean;
  locked: boolean;
  maxAttempts?: number;
  passingScore?: number;
  objectives?: string[];
  prerequisites?: string[];
  keywords?: string[];
}

const mockCourseData = {
  id: 1,
  title: "React & TypeScript Masterclass",
  description:
    "Khóa học toàn diện về React và TypeScript cho lập trình viên Frontend",
  sections: [
    {
      id: 1,
      title: "Giới thiệu khóa học",
      progress: 75,
      contents: [
        {
          id: 1,
          type: "video",
          title: "Tổng quan khóa học",
          description: `Bài học này sẽ giới thiệu tổng quan về khóa học React & TypeScript, bao gồm:
            • Các kiến thức sẽ được học
            • Cách thức học tập hiệu quả
            • Lộ trình học tập chi tiết
            • Cài đặt môi trường phát triển`,
          duration: "10:00",
          url: "https://example.com/video1",
          completed: true,
          locked: false,
          objectives: [
            "Hiểu được mục tiêu và nội dung khóa học",
            "Chuẩn bị môi trường phát triển",
            "Nắm được lộ trình học tập",
          ],
          keywords: ["Overview", "Setup", "Learning Path"],
        },
        {
          id: 2,
          type: "slide",
          title: "Slide bài giảng: React Fundamentals",
          description: `Slide trình bày các khái niệm cơ bản của React:
            • Components và Props
            • State và Lifecycle
            • Event Handling
            • Conditional Rendering
            • Lists và Keys`,
          url: "https://example.com/slide1",
          completed: true,
          locked: false,
          keywords: ["React", "Components", "Props", "State"],
        },
        {
          id: 3,
          type: "meet",
          title: "Live session: Q&A về React Hooks",
          description: `Buổi thảo luận trực tuyến về React Hooks:
            • Giải đáp thắc mắc về useState, useEffect
            • Demo các use cases phổ biến
            • Tips và best practices
            • Review code của học viên`,
          duration: "60:00",
          url: "https://meet.google.com/xyz",
          completed: false,
          locked: false,
          prerequisites: [
            "Đã hoàn thành các bài học về React Hooks",
            "Chuẩn bị câu hỏi trước buổi học",
          ],
        },
        {
          id: 4,
          type: "quiz",
          title: "Kiểm tra kiến thức React cơ bản",
          description: `Bài kiểm tra đánh giá kiến thức:
            • 20 câu hỏi trắc nghiệm
            • Thời gian làm bài: 30 phút
            • Yêu cầu đạt: 70% số câu đúng
            • Được phép làm lại 2 lần`,
          duration: "30:00",
          url: "https://example.com/quiz1",
          completed: false,
          locked: false,
          maxAttempts: 2,
          passingScore: 70,
        },
        {
          id: 5,
          type: "assignment",
          title: "Bài tập: Xây dựng Todo App",
          description: `Bài tập thực hành:
            • Xây dựng ứng dụng Todo List với React
            • Sử dụng TypeScript để type checking
            • Implement CRUD operations
            • Styling với CSS modules
            • Deployment lên Vercel`,
          duration: "120:00",
          url: "https://example.com/assignment1",
          completed: false,
          locked: false,
          objectives: [
            "Áp dụng kiến thức về React Components",
            "Thực hành TypeScript với React",
            "Hiểu về state management cơ bản",
          ],
        },
      ],
      materials: [
        {
          id: 101,
          title: "Tài liệu hướng dẫn",
          type: "pdf",
          url: "https://example.com/guide.pdf",
        },
        {
          id: 102,
          title: "Tài liệu tham khảo",
          type: "link",
          url: "https://reactjs.org",
        },
      ],
    },
    {
      id: 2,
      title: "React Fundamentals",
      progress: 30,
      contents: [
        {
          id: 4,
          type: "video",
          title: "Components và Props",
          duration: "15:00",
          url: "https://example.com/video2",
          completed: false,
          locked: false,
        },
        {
          id: 5,
          type: "assignment",
          title: "Bài tập Components",
          url: "https://example.com/assignment1",
          completed: false,
          locked: true,
          description: "Xây dựng các components cơ bản",
          maxAttempts: 3,
          passingScore: 80,
        },
      ],
      assessment: {
        id: 201,
        title: "Kiểm tra cuối chương",
        type: "quiz",
        questions: 10,
        duration: "30:00",
        passingScore: 80,
        maxAttempts: 2,
        locked: true,
      },
      materials: [
        {
          id: 103,
          title: "React Documentation",
          type: "link",
          url: "https://reactjs.org/docs",
        },
      ],
    },
  ],
};

// Cập nhật hàm helper để lấy bài học đầu tiên
const getFirstLesson = (sections: any[]) => {
  if (
    !sections ||
    sections.length === 0 ||
    !sections[0].lessons ||
    sections[0].lessons.length === 0
  ) {
    return null;
  }

  const firstLesson = sections[0].lessons[0];
  return {
    id: firstLesson.id,
    type: firstLesson.contentType,
    title: firstLesson.title,
    description: firstLesson.content,
    duration: firstLesson.duration ? `${firstLesson.duration}:00` : undefined,
    url: firstLesson.contentUrl || "",
    completed: false,
  };
};

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const course = useAppSelector(selectCourseById);

  useEffect(() => {
    dispatch(fetchCourseById(Number(courseId)));
  }, [dispatch, courseId]);

  useEffect(() => {
    setSelectedLesson(getFirstLesson(course?.sections));
  }, [course]);

  const [selectedLesson, setSelectedLesson] = useState<ContentItem | null>();

  const handleLessonClick = (id: string) => {
    console.log("Lesson clicked:", id);

    let selectedLesson = null;

    // Tìm lesson trong tất cả các sections
    course?.sections?.forEach((section) => {
      const lesson = section.lessons.find((lesson) => lesson.id === id);
      if (lesson) {
        selectedLesson = {
          id: lesson.id,
          type: lesson.contentType,
          title: lesson.title,
          description: lesson.content,
          duration: lesson.duration ? `${lesson.duration}:00` : undefined,
          url: lesson.contentUrl || "",
          completed: false, // Cần add thêm trường này nếu API có
          // Các trường khác nếu cần
        };
      }
    });

    if (selectedLesson) {
      setSelectedLesson(selectedLesson);
    }
  };

  const [activeTab, setActiveTab] = useState(0);

  // Mock data
  const mockGrades = [
    {
      id: 1,
      title: "Quiz 1: React Hooks Basics",
      type: "quiz",
      score: 8,
      maxScore: 10,
      weight: 10,
      completedAt: "2023-08-15",
    },
    {
      id: 2,
      title: "Assignment 1: Todo App",
      type: "assignment",
      score: 85,
      maxScore: 100,
      weight: 15,
      completedAt: "2023-08-20",
      feedback:
        "Good work on component structure. Could improve on state management.",
    },
    {
      id: 3,
      title: "Midterm Exam",
      type: "midterm",
      score: 75,
      maxScore: 100,
      weight: 30,
      completedAt: "2023-09-05",
      feedback:
        "Strong understanding of core concepts, but needs improvement in advanced topics.",
    },
    {
      id: 4,
      title: "Assignment 2: E-commerce App",
      type: "assignment",
      score: 92,
      maxScore: 100,
      weight: 15,
      completedAt: "2023-09-25",
      feedback:
        "Excellent work! Very clean code and good performance optimization.",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 2 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/course/${courseId}`)}
          startIcon={<ArrowBack />}
        >
          Quay lại tổng quan
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {course?.title}
        </Typography>
      </Box>

      {/* Course Overview */}
      <Grid container spacing={3}>
        {/* Sidebar - Left Content */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* Progress Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tiến độ học tập
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tổng tiến độ
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={45}
                    sx={{ height: 10, borderRadius: 1 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    45% hoàn thành
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • 3/6 chương hoàn thành
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 12/24 bài học hoàn thành
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 2/4 bài kiểm tra hoàn thành
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Course Structure */}
            <Card>
              <CardContent>
                <CourseStructure
                  sections={course?.sections}
                  handleLessonClick={handleLessonClick}
                  activeLesson={selectedLesson?.id}
                  setActiveTab={setActiveTab}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Card>
            {selectedLesson && (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                  >
                    <Tab label="Nội dung" />
                    <Tab label="Tài liệu" />
                    <Tab label="Điểm số" />
                    <Tab label="Đánh giá" />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  <ContentDetail content={selectedLesson} />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Box sx={{ mb: 4 }}>
                    <ContentDocuments />
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <GradeOverview grades={mockGrades} />
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <CourseRating />
                </TabPanel>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseContent;
