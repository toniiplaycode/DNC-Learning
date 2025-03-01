import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Stack,
  Button,
  Dialog,
  Tabs,
  Tab,
  CardContent,
  Chip,
} from "@mui/material";
import {
  PlayCircle,
  Description,
  Assignment,
  Quiz,
  VideoCall,
  MenuBook,
  Link as LinkIcon,
  CheckCircle,
  Lock,
  CircleOutlined,
  CheckCircleOutline,
  ArrowBack,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import ContentDiscussion from "../../components/course/ContentDiscussion";
import { useParams, useNavigate } from "react-router-dom";
import QuizContent from "../../components/course/QuizContent";
import AssignmentContent from "../../components/course/AssignmentContent";

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

interface Section {
  id: number;
  title: string;
  progress: number;
  contents: ContentItem[];
  assessment?: {
    id: number;
    title: string;
    type: "quiz";
    questions: number;
    duration: string;
    passingScore: number;
    maxAttempts: number;
    locked: boolean;
  };
  materials: {
    id: number;
    title: string;
    type: "pdf" | "doc" | "link";
    url: string;
  }[];
}

const mockCourseData = {
  id: 1,
  title: "React & TypeScript Masterclass",
  description:
    "Khóa học toàn diện về React và TypeScript cho lập trình viên Frontend",
  overview: {
    duration: "20 giờ",
    level: "Intermediate",
    totalLessons: 24,
    totalSections: 6,
    lastUpdated: "01/03/2024",
    requirements: [
      "Kiến thức cơ bản về HTML, CSS, JavaScript",
      "Hiểu biết về lập trình hướng đối tượng",
      "Môi trường phát triển: VS Code, Node.js",
    ],
    objectives: [
      "Xây dựng ứng dụng với React & TypeScript",
      "Hiểu và áp dụng React Hooks",
      "Type-safe development với TypeScript",
      "State Management với Redux Toolkit",
      "Testing và Deployment",
    ],
  },
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

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle color="primary" />;
      case "slide":
        return <Description color="info" />;
      case "meet":
        return <VideoCall color="success" />;
      case "quiz":
        return <Quiz color="warning" />;
      case "assignment":
        return <Assignment color="error" />;
      case "document":
        return <MenuBook />;
      case "link":
        return <LinkIcon />;
      default:
        return <Description />;
    }
  };

  const handleContentClick = (content: ContentItem) => {
    if (!content.locked) {
      setSelectedContent(content);
    }
  };

  const handleSectionToggle = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
                <Typography variant="h6" gutterBottom>
                  Nội dung khóa học
                </Typography>
                <List>
                  {mockCourseData.sections.map((section) => (
                    <Box key={section.id}>
                      <ListItem
                        onClick={() => handleSectionToggle(section.id)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                                {section.title}
                              </Typography>
                              {expandedSections.includes(section.id) ? (
                                <ExpandLess color="action" />
                              ) : (
                                <ExpandMore color="action" />
                              )}
                            </Box>
                          }
                          secondary={
                            <LinearProgress
                              variant="determinate"
                              value={section.progress}
                              sx={{ height: 4, mt: 1 }}
                            />
                          }
                        />
                      </ListItem>
                      <Box
                        sx={{
                          display: expandedSections.includes(section.id)
                            ? "block"
                            : "none",
                        }}
                      >
                        <List dense>
                          {section.contents.map((content) => (
                            <ListItem
                              key={content.id}
                              onClick={() => handleContentClick(content)}
                              sx={{
                                pl: 4,
                                opacity: content.locked ? 0.5 : 1,
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                              }}
                            >
                              <ListItemIcon>
                                {getContentIcon(content.type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={content.title}
                                secondary={content.duration}
                              />
                              {content.completed && (
                                <CheckCircle color="success" />
                              )}
                              {content.locked && <Lock />}
                            </ListItem>
                          ))}
                          {section.assessment && (
                            <ListItem
                              sx={{
                                pl: 4,
                                opacity: section.assessment.locked ? 0.5 : 1,
                              }}
                            >
                              <ListItemIcon>
                                <Quiz color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={section.assessment.title}
                                secondary={`${section.assessment.questions} câu hỏi • ${section.assessment.duration}`}
                              />
                              {section.assessment.locked && <Lock />}
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Card sx={{ height: "100%" }}>
            {selectedContent ? (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Nội dung" />
                    <Tab label="Tài liệu" />
                    <Tab label="Thảo luận" />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  <ContentDetail content={selectedContent} />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Tài liệu học tập
                  </Typography>
                  <List>
                    {mockCourseData.sections
                      .find((s) =>
                        s.contents.some((c) => c.id === selectedContent.id)
                      )
                      ?.materials.map((material) => (
                        <ListItem
                          key={material.id}
                          button
                          onClick={() => window.open(material.url)}
                        >
                          <ListItemIcon>
                            {material.type === "pdf" ? (
                              <Description />
                            ) : (
                              <LinkIcon />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={material.title} />
                        </ListItem>
                      ))}
                  </List>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  {selectedContent && (
                    <ContentDiscussion
                      contentId={selectedContent.id}
                      contentTitle={selectedContent.title}
                    />
                  )}
                </TabPanel>
              </>
            ) : (
              <Box
                sx={{
                  p: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Chọn một nội dung để bắt đầu học
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ my: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tổng quan khóa học
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Thời lượng
                  </Typography>
                  <Typography variant="body1">
                    {mockCourseData.overview.duration}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Trình độ
                  </Typography>
                  <Typography variant="body1">
                    {mockCourseData.overview.level}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Số bài học
                  </Typography>
                  <Typography variant="body1">
                    {mockCourseData.overview.totalLessons} bài
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật
                  </Typography>
                  <Typography variant="body1">
                    {mockCourseData.overview.lastUpdated}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Yêu cầu
              </Typography>
              <List dense>
                {mockCourseData.overview.requirements.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CircleOutlined sx={{ fontSize: 8 }} />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bạn sẽ học được gì
              </Typography>
              <List dense>
                {mockCourseData.overview.objectives.map((obj, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutline color="success" />
                    </ListItemIcon>
                    <ListItemText primary={obj} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

// Thêm nhiều câu hỏi mẫu hơn
const mockQuestions = [
  {
    id: 1,
    content: "useState hook được sử dụng để làm gì?",
    options: [
      "Quản lý side effects",
      "Quản lý state trong functional component",
      "Tối ưu performance",
      "Xử lý routing",
    ],
    correctAnswer: 1,
    explanation:
      "useState là hook cơ bản để quản lý state trong functional component.",
  },
  {
    id: 2,
    content: "useEffect hook được gọi khi nào?",
    options: [
      "Chỉ khi component mount",
      "Sau mỗi lần render",
      "Khi dependencies thay đổi",
      "Tất cả các trường hợp trên",
    ],
    correctAnswer: 3,
    explanation:
      "useEffect có thể được gọi trong cả 3 trường hợp tùy vào cách sử dụng dependencies.",
  },
  {
    id: 3,
    content: "useMemo hook dùng để làm gì?",
    options: [
      "Tối ưu performance bằng cách cache giá trị",
      "Quản lý state",
      "Xử lý side effects",
      "Tạo ref",
    ],
    correctAnswer: 0,
    explanation:
      "useMemo giúp tối ưu performance bằng cách cache giá trị tính toán.",
  },
  {
    id: 4,
    content: "useCallback hook khác gì với useMemo?",
    options: [
      "useCallback cache function, useMemo cache value",
      "useCallback cache value, useMemo cache function",
      "Không có sự khác biệt",
      "Không thể so sánh",
    ],
    correctAnswer: 0,
    explanation:
      "useCallback được sử dụng để cache function references, trong khi useMemo cache giá trị tính toán.",
  },
  {
    id: 5,
    content: "Custom hooks trong React là gì?",
    options: [
      "Các hooks có sẵn của React",
      "Function bắt đầu bằng use và có thể tái sử dụng logic",
      "Class components",
      "Thư viện bên thứ 3",
    ],
    correctAnswer: 1,
    explanation:
      "Custom hooks là các function bắt đầu bằng use và cho phép tái sử dụng logic giữa các components.",
  },
];

// Cập nhật ContentDetail component
const ContentDetail = ({ content }: { content: ContentItem }) => {
  return (
    <Box>
      {/* Main content area */}
      {content.type === "video" && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", bgcolor: "black", mb: 2 }}>
            {/* Video player component */}
          </Box>
        </Box>
      )}

      {content.type === "meet" && (
        <Box sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <Typography>Link meeting: {content.url}</Typography>
            <Button
              variant="contained"
              startIcon={<VideoCall />}
              onClick={() => window.open(content.url)}
            >
              Tham gia buổi học
            </Button>
          </Stack>
        </Box>
      )}

      {content.type === "quiz" && (
        <Box sx={{ mb: 4 }}>
          <QuizContent
            quizData={{
              id: content.id,
              title: content.title,
              description: content.description,
              timeLimit: 30,
              passingScore: content.passingScore || 70,
              maxAttempts: content.maxAttempts || 2,
              questions: mockQuestions,
            }}
            onComplete={(score) => {
              console.log("Quiz completed with score:", score);
              // Thêm logic cập nhật trạng thái hoàn thành
            }}
          />
        </Box>
      )}

      {content.type === "assignment" && (
        <Box sx={{ mb: 4 }}>
          <AssignmentContent
            assignmentData={{
              id: content.id,
              title: content.title,
              description: content.description,
              dueDate: "23:59 15/03/2024",
              maxFileSize: 10,
              allowedFileTypes: [
                ".pdf",
                ".doc",
                ".docx",
                ".zip",
                ".rar",
                ".js",
                ".ts",
                ".tsx",
              ],
              maxFiles: 5,
            }}
            onSubmit={(files, note) => {
              console.log("Files:", files);
              console.log("Note:", note);
              // Thêm logic xử lý submit
            }}
          />
        </Box>
      )}

      {/* Content description */}
      <Card sx={{ mt: 3, boxShadow: 0 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {content.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              mb: 3,
              color: "text.secondary",
            }}
          >
            {content.description}
          </Typography>

          {content.objectives && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Mục tiêu bài học:
              </Typography>
              <List dense>
                {content.objectives.map((obj, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutline color="success" />
                    </ListItemIcon>
                    <ListItemText primary={obj} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {content.prerequisites && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Yêu cầu trước khi học:
              </Typography>
              <List dense>
                {content.prerequisites.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CircleOutlined sx={{ fontSize: 8 }} />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseContent;
