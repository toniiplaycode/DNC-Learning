import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Stack,
  Chip,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import {
  Edit,
  People,
  Star,
  PlayCircle,
  Assignment,
  Message,
  Settings,
  AttachMoney,
  Description,
  Quiz,
  VideoCall,
  MenuBook,
  Link as LinkIcon,
  ExpandMore,
  ExpandLess,
  Add,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ContentDiscussion from "../../components/course/ContentDiscussion";
import ContentDocuments from "../../components/course/ContentDocuments";
import ContentDetail from "../../components/course/ContentDetail";

// Mock data
const courseData = {
  id: 1,
  title: "React & TypeScript Masterclass",
  thumbnail: "/src/assets/logo.png",
  description: "Khóa học toàn diện về React và TypeScript cho lập trình viên.",
  totalStudents: 234,
  rating: 4.8,
  totalRatings: 150,
  totalLessons: 48,
  totalDuration: "12 giờ 30 phút",
  price: 499000,
  status: "published",
  lastUpdated: "2024-03-15",
  topics: [
    "React Hooks",
    "TypeScript Basics",
    "State Management",
    "Performance Optimization",
  ],
  sections: [
    {
      id: 1,
      title: "Giới thiệu khóa học",
      progress: 100,
      contents: [
        {
          id: 1,
          type: "video",
          title: "Tổng quan khóa học",
          description:
            "Bài học giới thiệu tổng quan về khóa học React & TypeScript",
          duration: "10:00",
          url: "https://example.com/video1",
          completed: true,
          locked: false,
        },
        {
          id: 2,
          type: "document",
          title: "Tài liệu khóa học",
          description: "Tài liệu hướng dẫn học tập",
          url: "https://example.com/doc1",
          completed: true,
          locked: false,
        },
      ],
    },
    {
      id: 2,
      title: "React Fundamentals",
      progress: 75,
      contents: [
        {
          id: 3,
          type: "video",
          title: "Giới thiệu về React Components",
          description: "Các loại component trong React",
          duration: "15:00",
          url: "https://example.com/video2",
          completed: true,
          locked: false,
        },
        {
          id: 4,
          type: "quiz",
          title: "Quiz: React Basics",
          description: "Kiểm tra kiến thức cơ bản về React",
          url: "https://example.com/quiz1",
          completed: false,
          locked: false,
        },
      ],
    },
  ],
};

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    title: "React Hooks Cheatsheet",
    description: "Tổng hợp các hooks phổ biến trong React",
    fileType: "pdf",
    fileSize: "2.5 MB",
    downloadUrl: "https://example.com/docs/react-hooks.pdf",
  },
  {
    id: 2,
    title: "TypeScript Types Guide",
    description: "Hướng dẫn về các kiểu dữ liệu trong TypeScript",
    fileType: "pdf",
    fileSize: "1.8 MB",
    downloadUrl: "https://example.com/docs/ts-types.pdf",
  },
];

// Mock data for students
const mockStudents = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
    progress: 75,
    lastActive: "2024-03-20",
    completedLessons: 12,
    totalLessons: 24,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "/src/assets/avatar.png",
    progress: 45,
    lastActive: "2024-03-18",
    completedLessons: 8,
    totalLessons: 24,
  },
];

// Mock data for comments
const mockComments = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "/src/assets/avatar.png",
      role: "student",
    },
    content:
      "Thầy ơi, em không hiểu phần React Hook lắm, thầy có thể giải thích lại được không ạ?",
    createdAt: "2024-03-20T10:30:00",
    replies: [
      {
        id: 101,
        user: {
          id: 999,
          name: "Giảng viên",
          avatar: "/src/assets/avatar.png",
          role: "instructor",
        },
        content: "Chào bạn, mình sẽ giải thích thêm trong buổi học tới nhé!",
        createdAt: "2024-03-20T11:15:00",
      },
    ],
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const InstructorCourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>(
    courseData.sections.map((section) => section.id)
  );
  const [selectedContent, setSelectedContent] = useState(
    courseData.sections[0].contents[0]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSectionToggle = (sectionId: number) => {
    setExpandedSections((prevExpanded) =>
      prevExpanded.includes(sectionId)
        ? prevExpanded.filter((id) => id !== sectionId)
        : [...prevExpanded, sectionId]
    );
  };

  const handleContentClick = (content: any) => {
    setSelectedContent(content);
    setTabValue(0); // Switch to content tab
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle color="primary" />;
      case "slide":
        return <Description color="info" />;
      case "assignment":
        return <Assignment color="warning" />;
      case "quiz":
        return <Quiz color="error" />;
      case "meet":
        return <VideoCall color="secondary" />;
      case "document":
        return <MenuBook color="success" />;
      case "link":
        return <LinkIcon color="info" />;
      default:
        return <Description />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Course Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={courseData.thumbnail}
                    sx={{ width: 120, height: 120 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {courseData.title}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        size="small"
                        color="success"
                        label={
                          courseData.status === "published"
                            ? "Đã xuất bản"
                            : "Bản nháp"
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        Cập nhật:{" "}
                        {new Date(courseData.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Typography variant="body1">
                  {courseData.description}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  divider={<Divider orientation="vertical" flexItem />}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People color="action" />
                    <Typography>{courseData.totalStudents} học viên</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Star sx={{ color: "warning.main" }} />
                    <Typography>
                      {courseData.rating} ({courseData.totalRatings} đánh giá)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PlayCircle color="action" />
                    <Typography>
                      {courseData.totalLessons} bài học (
                      {courseData.totalDuration})
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Settings />}
                  fullWidth
                  onClick={() => navigate(`/instructor/courses/${id}/settings`)}
                >
                  Cài đặt khóa học
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Grid container spacing={3}>
        {/* Left sidebar - Course Structure */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* Course Structure */}
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Nội dung khóa học</Typography>
                  <Button
                    startIcon={<Add />}
                    size="small"
                    onClick={() =>
                      navigate(`/instructor/courses/${id}/edit-content`)
                    }
                  >
                    Thêm
                  </Button>
                </Box>
                <Stack spacing={2}>
                  {courseData.sections.map((section) => (
                    <Card key={section.id} variant="outlined">
                      <ListItem
                        button
                        onClick={() => handleSectionToggle(section.id)}
                        sx={{ py: 2 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="subtitle1">
                                {section.title}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  ml: "auto",
                                }}
                              >
                                {expandedSections.includes(section.id) ? (
                                  <ExpandLess />
                                ) : (
                                  <ExpandMore />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>

                      {expandedSections.includes(section.id) && (
                        <List disablePadding>
                          {section.contents.map((content) => (
                            <ListItem
                              key={content.id}
                              onClick={() => handleContentClick(content)}
                              sx={{
                                pl: 4,
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                                bgcolor:
                                  selectedContent?.id === content.id
                                    ? "action.selected"
                                    : "inherit",
                              }}
                            >
                              <ListItemIcon>
                                {getContentIcon(content.type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={content.title}
                                secondary={
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {content.duration
                                      ? `${content.duration} • ${content.type}`
                                      : content.type}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                          <ListItem
                            button
                            sx={{
                              pl: 4,
                              color: "primary.main",
                            }}
                            onClick={() =>
                              navigate(
                                `/instructor/courses/${id}/edit-content/${section.id}`
                              )
                            }
                          >
                            <ListItemIcon>
                              <Add color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Thêm nội dung" />
                          </ListItem>
                        </List>
                      )}
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<PlayCircle />} label="Nội dung" />
                <Tab icon={<People />} label="Học viên" />
                <Tab icon={<Description />} label="Tài liệu" />
                <Tab icon={<Message />} label="Thảo luận" />
                <Tab icon={<Assignment />} label="Bài tập/Quiz" />
                <Tab icon={<AttachMoney />} label="Doanh thu" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {selectedContent && (
                <>
                  <ContentDetail content={selectedContent} />

                  {/* Nút chỉnh sửa nội dung - thêm vào sau ContentDetail */}
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() =>
                        navigate(
                          `/instructor/courses/${id}/edit-content/${selectedContent.id}`
                        )
                      }
                    >
                      Chỉnh sửa nội dung này
                    </Button>
                  </Box>
                </>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Danh sách học viên ({mockStudents.length})
              </Typography>
              <List>
                {mockStudents.map((student) => (
                  <Card key={student.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar src={student.avatar} />
                            <Box>
                              <Typography variant="subtitle1">
                                {student.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Hoạt động gần nhất: {student.lastActive}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              Tiến độ: {student.progress}% (
                              {student.completedLessons}/{student.totalLessons}{" "}
                              bài học)
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.progress}
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Tài liệu khóa học</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() =>
                    navigate(`/instructor/courses/${id}/add-document`)
                  }
                >
                  Thêm tài liệu
                </Button>
              </Box>
              <ContentDocuments documents={mockDocuments} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <ContentDiscussion comments={mockComments} />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Bài tập & Quiz</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() =>
                      navigate(`/instructor/courses/${id}/add-assignment`)
                    }
                  >
                    Thêm bài tập
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() =>
                      navigate(`/instructor/courses/${id}/add-quiz`)
                    }
                  >
                    Thêm quiz
                  </Button>
                </Stack>
              </Box>
              <Typography>Quản lý bài tập và quiz của khóa học</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <Typography variant="h6" gutterBottom>
                Thống kê doanh thu
              </Typography>
              <Typography>Tính năng đang phát triển</Typography>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstructorCourseView;
