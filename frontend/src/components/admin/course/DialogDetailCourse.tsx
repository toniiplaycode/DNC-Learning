import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Stack,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  LinearProgress,
  ListItemAvatar,
} from "@mui/material";
import {
  Close,
  Person,
  MenuBook,
  Description,
  Assignment,
  QuestionAnswer,
  VideoLibrary,
  People,
  Star,
  Download,
  Visibility,
} from "@mui/icons-material";

interface DialogDetailCourseProps {
  open: boolean;
  onClose: () => void;
  courseId: number | null;
}

// Mock data cho một khóa học cụ thể
const mockCourseDetail = {
  id: 1,
  title: "React & TypeScript Masterclass",
  description:
    "Khóa học toàn diện về React và TypeScript, từ cơ bản đến nâng cao. Học cách xây dựng ứng dụng web hiện đại với các công nghệ tiên tiến.",
  category: "Web Development",
  instructor: {
    id: 101,
    name: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
    email: "nguyenvana@example.com",
  },
  price: 499000,
  duration: "30 giờ",
  level: "Trung cấp",
  status: "published",
  students: 234,
  rating: 4.8,
  totalRatings: 150,
  thumbnail: "/src/assets/logo.png",
  createdAt: "2024-03-15T00:00:00Z",
  lastUpdated: "2024-04-10T00:00:00Z",
  sections: [
    {
      id: 1,
      title: "Giới thiệu về React",
      description: "Làm quen với thư viện React và các khái niệm cơ bản",
      lessons: [
        {
          id: 101,
          title: "React là gì?",
          type: "video",
          duration: "10:30",
        },
        {
          id: 102,
          title: "Cài đặt môi trường phát triển",
          type: "video",
          duration: "15:45",
        },
      ],
      documents: [
        {
          id: 201,
          title: "Tổng quan về React",
          fileType: "pdf",
        },
      ],
    },
    {
      id: 2,
      title: "TypeScript cơ bản",
      description: "Nền tảng TypeScript cho lập trình viên React",
      lessons: [
        {
          id: 103,
          title: "Giới thiệu TypeScript",
          type: "video",
          duration: "12:20",
        },
        {
          id: 104,
          title: "Kiểu dữ liệu trong TypeScript",
          type: "video",
          duration: "18:10",
        },
      ],
      documents: [
        {
          id: 202,
          title: "TypeScript Cheat Sheet",
          fileType: "pdf",
        },
      ],
      quizzes: [
        {
          id: 301,
          title: "Kiểm tra kiến thức TypeScript",
          questions: 10,
          duration: "20 phút",
        },
      ],
    },
    {
      id: 3,
      title: "React Hooks",
      description: "Tìm hiểu về các hooks phổ biến trong React",
      lessons: [
        {
          id: 105,
          title: "useState và useEffect",
          type: "video",
          duration: "22:15",
        },
        {
          id: 106,
          title: "useContext và useReducer",
          type: "video",
          duration: "25:30",
        },
      ],
      assignments: [
        {
          id: 401,
          title: "Xây dựng ứng dụng Todo với Hooks",
          deadline: "2024-05-01",
          submissions: 120,
        },
      ],
    },
  ],
  students: [
    {
      id: 1001,
      name: "Trần Văn B",
      avatar: "/src/assets/avatar.png",
      enrollDate: "2024-03-20",
      progress: 65,
    },
    {
      id: 1002,
      name: "Lê Thị C",
      avatar: "/src/assets/avatar.png",
      enrollDate: "2024-03-22",
      progress: 48,
    },
    {
      id: 1003,
      name: "Phạm Văn D",
      avatar: "/src/assets/avatar.png",
      enrollDate: "2024-03-25",
      progress: 72,
    },
  ],
  reviews: [
    {
      id: 2001,
      student: "Trần Văn B",
      avatar: "/src/assets/avatar.png",
      rating: 5,
      comment:
        "Khóa học rất chi tiết và dễ hiểu. Giảng viên giải thích rõ ràng.",
      date: "2024-04-05",
    },
    {
      id: 2002,
      student: "Lê Thị C",
      avatar: "/src/assets/avatar.png",
      rating: 4,
      comment: "Nội dung tốt, có thể bổ sung thêm bài tập thực hành.",
      date: "2024-04-08",
    },
  ],
};

const DialogDetailCourse: React.FC<DialogDetailCourseProps> = ({
  open,
  onClose,
  courseId,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Nếu không có courseId, không hiển thị nội dung
  if (!courseId) return null;

  // Trong thực tế, sẽ fetch data dựa trên courseId
  const course = mockCourseDetail;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Chi tiết khóa học</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Header section with course basic info */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {course.title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip
                  label={course.category}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={course.level}
                  color="default"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={
                    course.status === "published"
                      ? "Đã xuất bản"
                      : course.status === "draft"
                      ? "Bản nháp"
                      : "Đã lưu trữ"
                  }
                  color={
                    course.status === "published"
                      ? "success"
                      : course.status === "draft"
                      ? "warning"
                      : "error"
                  }
                  size="small"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Cập nhật:{" "}
                {new Date(course.lastUpdated).toLocaleDateString("vi-VN")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: "right" } }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {new Intl.NumberFormat("vi-VN").format(course.price)} đ
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    {course.students.length} học viên
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Star fontSize="small" />
                  <Typography variant="body2">
                    {course.rating} ({course.totalRatings})
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">{course.description}</Typography>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={course.instructor.avatar} sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="subtitle1">
                      {course.instructor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.instructor.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", sm: "block" } }}
                />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Thông tin khóa học
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Thời lượng: {course.duration}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày tạo:{" "}
                        {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs for different sections */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Nội dung" icon={<MenuBook />} iconPosition="start" />
              <Tab label="Học viên" icon={<People />} iconPosition="start" />
              <Tab label="Đánh giá" icon={<Star />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Content Tab */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={3}>
              {course.sections.map((section) => (
                <Card key={section.id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {section.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {section.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    {/* Lessons */}
                    {section.lessons && section.lessons.length > 0 && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Bài học
                        </Typography>
                        <List dense>
                          {section.lessons.map((lesson) => (
                            <ListItem key={lesson.id}>
                              <ListItemIcon>
                                <VideoLibrary fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={lesson.title}
                                secondary={`${lesson.type} • ${lesson.duration}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* Documents */}
                    {section.documents && section.documents.length > 0 && (
                      <>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Tài liệu
                        </Typography>
                        <List dense>
                          {section.documents.map((doc) => (
                            <ListItem key={doc.id}>
                              <ListItemIcon>
                                <Description fontSize="small" />
                              </ListItemIcon>
                              <IconButton size="small">
                                <Download fontSize="small" />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* Quizzes */}
                    {section.quizzes && section.quizzes.length > 0 && (
                      <>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Bài kiểm tra
                        </Typography>
                        <List dense>
                          {section.quizzes.map((quiz) => (
                            <ListItem key={quiz.id}>
                              <ListItemIcon>
                                <QuestionAnswer fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={quiz.title}
                                secondary={`${quiz.questions} câu hỏi • ${quiz.duration}`}
                              />
                              <IconButton size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {/* Assignments */}
                    {section.assignments && section.assignments.length > 0 && (
                      <>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Bài tập
                        </Typography>
                        <List dense>
                          {section.assignments.map((assignment) => (
                            <ListItem key={assignment.id}>
                              <ListItemIcon>
                                <Assignment fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={assignment.title}
                                secondary={`Hạn nộp: ${new Date(
                                  assignment.deadline
                                ).toLocaleDateString("vi-VN")} • ${
                                  assignment.submissions
                                } bài nộp`}
                              />
                              <IconButton size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* Students Tab */}
          <TabPanel value={activeTab} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Học viên</TableCell>
                    <TableCell>Ngày đăng ký</TableCell>
                    <TableCell>Tiến độ</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {course.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={student.avatar}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Typography variant="body2">
                            {student.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {new Date(student.enrollDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ width: "70%", mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.progress}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {student.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Reviews Tab */}
          <TabPanel value={activeTab} index={2}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">Đánh giá từ học viên</Typography>
                  <Box>
                    <Typography variant="h4" component="span" color="primary">
                      {course.rating}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.secondary"
                    >
                      /5 ({course.totalRatings} đánh giá)
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <List>
                  {course.reviews.map((review) => (
                    <React.Fragment key={review.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={review.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography variant="subtitle2">
                                {review.student}
                              </Typography>
                              <Box>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    fontSize="small"
                                    sx={{
                                      color:
                                        i < review.rating
                                          ? "warning.main"
                                          : "grey.300",
                                      fontSize: "16px",
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                gutterBottom
                              >
                                {review.comment}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(review.date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Tab Panel component
function TabPanel(props: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default DialogDetailCourse;
