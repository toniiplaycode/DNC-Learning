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
  LinearProgress,
  Stack,
  Button,
  Tabs,
  Tab,
  CardContent,
  Rating,
  TextField,
  Avatar,
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

interface GradeItem {
  id: number;
  title: string;
  type: "quiz" | "assignment" | "midterm" | "final";
  score: number;
  maxScore: number;
  completedAt: string;
  weight?: number; // Trọng số điểm
  feedback?: string;
}

interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  isInstructor: boolean;
  reply?: {
    comment: string;
    createdAt: string;
  };
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
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");

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

  // Mock data đánh giá
  const mockReviews: Review[] = [
    {
      id: 1,
      user: {
        name: "Nguyễn Văn A",
        avatar: "/src/assets/avatar.png",
      },
      rating: 5,
      comment: "Khóa học rất hay và chi tiết. Giảng viên nhiệt tình hỗ trợ.",
      createdAt: "2024-03-15",
      isInstructor: false,
      reply: {
        comment: "Cảm ơn bạn đã đánh giá. Chúc bạn học tập tốt!",
        createdAt: "2024-03-15",
      },
    },
    {
      id: 2,
      user: {
        name: "Trần Thị B",
        avatar: "/src/assets/avatar.png",
      },
      rating: 4,
      comment: "Nội dung dễ hiểu, có nhiều bài tập thực hành.",
      createdAt: "2024-03-14",
      isInstructor: false,
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
                <Typography variant="h6" gutterBottom>
                  Nội dung khóa học
                </Typography>
                <List>
                  {mockCourseData.sections.map((section, sectionIndex) => (
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
                              <Typography variant="body1" sx={{ mr: 1 }}>
                                {sectionIndex + 1}.
                              </Typography>
                              {section.title}
                              {expandedSections.includes(section.id) ? (
                                <ExpandLess sx={{ ml: "auto" }} />
                              ) : (
                                <ExpandMore sx={{ ml: "auto" }} />
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
                          {section.contents.map((content, contentIndex) => (
                            <ListItem
                              key={content.id}
                              onClick={() => handleContentClick(content)}
                              sx={{
                                pl: 4,
                                opacity: content.locked ? 0.5 : 1,
                                cursor: "pointer",
                                bgcolor:
                                  selectedContent?.id === content.id
                                    ? "action.selected"
                                    : "transparent",
                                "&:hover": {
                                  bgcolor:
                                    selectedContent?.id === content.id
                                      ? "action.selected"
                                      : "action.hover",
                                },
                              }}
                            >
                              <ListItemIcon>
                                {getContentIcon(content.type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                      {sectionIndex + 1}.{contentIndex + 1}
                                    </Typography>
                                    {content.title}
                                  </Box>
                                }
                                secondary={content.duration}
                                primaryTypographyProps={{
                                  color:
                                    selectedContent?.id === content.id
                                      ? "primary"
                                      : "text.primary",
                                }}
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
                                cursor: "pointer",
                                bgcolor:
                                  selectedContent?.id === section.assessment.id
                                    ? "action.selected"
                                    : "transparent",
                                "&:hover": {
                                  bgcolor:
                                    selectedContent?.id ===
                                    section.assessment.id
                                      ? "action.selected"
                                      : "action.hover",
                                },
                              }}
                            >
                              <ListItemIcon>
                                <Quiz
                                  color={
                                    selectedContent?.id ===
                                    section.assessment.id
                                      ? "primary"
                                      : "inherit"
                                  }
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={section.assessment.title}
                                secondary={`${section.assessment.questions} câu hỏi • ${section.assessment.duration}`}
                                primaryTypographyProps={{
                                  color:
                                    selectedContent?.id ===
                                    section.assessment.id
                                      ? "primary"
                                      : "text.primary",
                                }}
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
                    <ContentDiscussion
                      contentId={selectedContent.id}
                      contentTitle={selectedContent.title}
                    />
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h6" gutterBottom>
                    Tài liệu học tập
                  </Typography>
                  <Stack spacing={3}>
                    {mockCourseData.sections.map((section, index) => (
                      <Box key={section.id}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                            color: "text.secondary",
                          }}
                        >
                          <Typography component="span" sx={{ mr: 1 }}>
                            {index + 1}.
                          </Typography>
                          {section.title}
                        </Typography>
                        {section.materials.length > 0 ? (
                          <Card variant="outlined">
                            <List dense>
                              {section.materials.map((material) => (
                                <ListItem
                                  key={material.id}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                    },
                                  }}
                                >
                                  <ListItemIcon>
                                    {material.type === "pdf" ? (
                                      <Description color="error" />
                                    ) : material.type === "doc" ? (
                                      <Description color="primary" />
                                    ) : (
                                      <LinkIcon color="info" />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={material.title}
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => window.open(material.url)}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Card>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 2 }}
                          >
                            Chưa có tài liệu
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <GradeOverview />
                </TabPanel>

                <TabPanel value={activeTab} index={4}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Đánh giá khóa học
                    </Typography>

                    {/* Form đánh giá */}
                    <Card sx={{ mb: 4 }}>
                      <CardContent>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography>Đánh giá của bạn:</Typography>
                            <Rating
                              value={rating}
                              onChange={(event, newValue) => {
                                setRating(newValue);
                              }}
                              size="large"
                            />
                            <Typography color="text.secondary">
                              ({rating} / 5)
                            </Typography>
                          </Box>

                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Chia sẻ nhận xét của bạn về khóa học..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />

                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              disabled={!rating || !comment.trim()}
                              onClick={() => {
                                // Xử lý gửi đánh giá
                                console.log({ rating, comment });
                              }}
                            >
                              Gửi đánh giá
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Danh sách đánh giá */}
                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                      Đánh giá từ học viên
                    </Typography>

                    <Stack spacing={2}>
                      {mockReviews.map((review) => (
                        <Card key={review.id} variant="outlined">
                          <CardContent>
                            <Stack spacing={2}>
                              <Box sx={{ display: "flex", gap: 2 }}>
                                <Avatar src={review.user.avatar} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1">
                                    {review.user.name}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Rating
                                      value={review.rating}
                                      readOnly
                                      size="small"
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              <Typography variant="body1">
                                {review.comment}
                              </Typography>

                              {review.reply && (
                                <Box sx={{ pl: 6, pt: 1 }}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography
                                        variant="subtitle2"
                                        color="primary"
                                        gutterBottom
                                      >
                                        Phản hồi từ giảng viên
                                      </Typography>
                                      <Typography variant="body2">
                                        {review.reply.comment}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mt: 1, display: "block" }}
                                      >
                                        {new Date(
                                          review.reply.createdAt
                                        ).toLocaleDateString()}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Box>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                </TabPanel>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
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

// Component GradeOverview
const GradeOverview = () => {
  // Mock data điểm số
  const mockGrades: GradeItem[] = [
    {
      id: 1,
      title: "Kiểm tra: React Hooks",
      type: "quiz",
      score: 85,
      maxScore: 100,
      completedAt: "2024-03-10",
      weight: 10,
    },
    {
      id: 2,
      title: "Bài tập: Todo App",
      type: "assignment",
      score: 90,
      maxScore: 100,
      completedAt: "2024-03-12",
      weight: 20,
      feedback: "Hoàn thành tốt các yêu cầu cơ bản. Cần cải thiện phần UI/UX.",
    },
    {
      id: 3,
      title: "Kiểm tra giữa kỳ",
      type: "midterm",
      score: 88,
      maxScore: 100,
      completedAt: "2024-03-15",
      weight: 30,
    },
    {
      id: 4,
      title: "Kiểm tra cuối kỳ",
      type: "final",
      score: 92,
      maxScore: 100,
      completedAt: "2024-03-20",
      weight: 40,
    },
  ];

  // Tính điểm trung bình có trọng số
  const calculateFinalGrade = (grades: GradeItem[]) => {
    const totalWeight = grades.reduce(
      (sum, grade) => sum + (grade.weight || 0),
      0
    );
    const weightedSum = grades.reduce(
      (sum, grade) =>
        sum + (grade.score * (grade.weight || 0)) / grade.maxScore,
      0
    );
    return ((weightedSum / totalWeight) * 100).toFixed(1);
  };

  return (
    <Box>
      {/* Tổng quan điểm */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Điểm tổng kết
              </Typography>
              <Typography variant="h3" color="primary">
                {calculateFinalGrade(mockGrades)}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  • Kiểm tra:{" "}
                  {mockGrades.filter((g) => g.type === "quiz").length} bài
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Bài tập:{" "}
                  {mockGrades.filter((g) => g.type === "assignment").length} bài
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Đã hoàn thành: {mockGrades.length} / {mockGrades.length} bài
                  đánh giá
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chi tiết điểm */}
      <Typography variant="h6" gutterBottom>
        Chi tiết điểm số
      </Typography>
      <Stack spacing={2}>
        {mockGrades.map((grade) => (
          <Card key={grade.id} variant="outlined">
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">{grade.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành:{" "}
                    {new Date(grade.completedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" color="primary">
                      {grade.score}/{grade.maxScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({grade.weight}%)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <LinearProgress
                    variant="determinate"
                    value={(grade.score / grade.maxScore) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Grid>
                {grade.feedback && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Nhận xét: {grade.feedback}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default CourseContent;
