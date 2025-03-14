import React, { useState } from "react";
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
import ContentDiscussion from "../../components/course/ContentDiscussion";
import { useParams, useNavigate } from "react-router-dom";
import ContentDocuments from "../../components/course/ContentDocuments";
import CourseRating from "../../components/course/CourseRating";
import GradeOverview from "../../components/course/GradeOverview";
import CourseStructure from "../../components/course/CourseStructure";
import ContentDetail from "../../components/course/ContentDetail";
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

// Thêm hàm helper để lấy nội dung đầu tiên
const getFirstContent = (sections: any[]) => {
  return sections[0]?.contents[0] || null;
};

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  // Khởi tạo selectedContent với nội dung đầu tiên
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    getFirstContent(mockCourseData.sections)
  );
  const [activeTab, setActiveTab] = useState(0);

  const handleContentClick = (content: ContentItem) => {
    if (!content.locked) {
      setSelectedContent(content);
    }
  };

  const mockComments = [
    {
      id: 1,
      user: {
        id: 1,
        name: "John Doe",
        avatar: "/src/assets/avatar.png",
        role: "student",
      },
      content: "Làm thế nào để xử lý re-render tối ưu trong React?",
      createdAt: "2 giờ trước",
      replies: [
        {
          id: 2,
          user: {
            id: 2,
            name: "Instructor Alex",
            avatar: "/src/assets/avatar.png",
            role: "instructor",
          },
          content: `Để tối ưu re-render trong React, bạn có thể:
        1. Sử dụng React.memo() cho component
        2. Tối ưu useCallback và useMemo
        3. Tránh inline function trong props
        4. Phân chia component hợp lý`,
          createdAt: "1 giờ trước",
        },
      ],
    },
  ];

  // Thêm dữ liệu mock cho tài liệu
  const mockDocuments = [
    {
      id: 1,
      title: "Slide bài giảng React Hooks",
      fileType: "pdf",
      fileSize: "2.5 MB",
      downloadUrl: "https://example.com/slides.pdf",
    },
    {
      id: 2,
      title: "Source code mẫu",
      fileType: "code",
      fileSize: "350 KB",
      downloadUrl: "https://example.com/code.zip",
    },
    {
      id: 3,
      title: "Hình minh họa kiến trúc",
      fileType: "image",
      fileSize: "1.2 MB",
      downloadUrl: "https://example.com/architecture.png",
    },
    {
      id: 4,
      title: "Tài liệu tham khảo",
      fileType: "pdf",
      fileSize: "4.8 MB",
      downloadUrl: "https://example.com/references.pdf",
    },
  ];

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

  // Mock data - sẽ được thay thế bằng API call trong tương lai
  const mockReviews = [
    {
      id: 1,
      userName: "Nguyễn Văn A",
      userAvatar: "/src/assets/avatar.png",
      rating: 5,
      content:
        "Khóa học rất chi tiết và dễ hiểu. Giảng viên giải thích rõ ràng và có nhiều ví dụ thực tế.",
      date: "2023-08-15",
    },
    {
      id: 2,
      userName: "Trần Thị B",
      userAvatar: "/src/assets/avatar.png",
      rating: 4,
      content:
        "Nội dung hay, nhưng một số phần hơi khó hiểu. Hy vọng sẽ có thêm ví dụ trong các phần nâng cao.",
      date: "2023-08-10",
    },
    {
      id: 3,
      userName: "Lê Văn C",
      userAvatar: "/src/assets/avatar.png",
      rating: 5,
      content:
        "Tuyệt vời! Đã học được rất nhiều điều mới và áp dụng ngay vào dự án của mình.",
      date: "2023-07-22",
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
          {mockCourseData.title}
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
                  sections={mockCourseData.sections}
                  handleContentClick={handleContentClick}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Card>
            {selectedContent && (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                  >
                    <Tab label="Nội dung" />
                    <Tab label="Thảo luận" />
                    <Tab label="Tài liệu" />
                    <Tab label="Điểm số" />
                    <Tab label="Đánh giá" />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  <ContentDetail content={selectedContent} />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {selectedContent && (
                    <ContentDiscussion comments={mockComments} />
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Box sx={{ mb: 4 }}>
                    <ContentDocuments documents={mockDocuments} />
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <GradeOverview grades={mockGrades} />
                </TabPanel>

                <TabPanel value={activeTab} index={4}>
                  <CourseRating Reviews={mockReviews} />
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
