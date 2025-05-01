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
  Slideshow,
  Code,
} from "@mui/icons-material";
import { Course } from "../../../types/course.types";

interface DialogDetailCourseProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
}

// Update the component to display the data correctly
const DialogDetailCourse: React.FC<DialogDetailCourseProps> = ({
  open,
  onClose,
  course,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!course) return null;

  const formatLevel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const calculateAverageRating = () => {
    if (!course.reviews || course.reviews.length === 0) return 0;
    const sum = course.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / course.reviews.length).toFixed(1);
  };

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
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {course.title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip
                  label={course.category.name}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={formatLevel(course.level)}
                  color="default"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={
                    course.status === "published" ? "Đã xuất bản" : "Bản nháp"
                  }
                  color={course.status === "published" ? "success" : "warning"}
                  size="small"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Cập nhật:{" "}
                {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { md: "right" } }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {new Intl.NumberFormat("vi-VN").format(
                  parseFloat(course.price)
                )}{" "}
                đ
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    {course.enrollments.length} học viên
                  </Typography>
                </Stack>
                {course.reviews.length > 0 && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Star fontSize="small" />
                    <Typography variant="body2">
                      {calculateAverageRating()} ({course.reviews.length})
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">{course.description}</Typography>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={course.instructor.user.avatarUrl}
                    sx={{ mr: 1 }}
                  />
                  <Box>
                    <Typography variant="subtitle1">
                      {course.instructor.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.instructor.user.email}
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
                        Ngày bắt đầu:{" "}
                        {new Date(course.startDate).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày kết thúc:{" "}
                        {new Date(course.endDate).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Nội dung" icon={<MenuBook />} iconPosition="start" />
              <Tab label="Học viên" icon={<People />} iconPosition="start" />
              <Tab label="Đánh giá" icon={<Star />} iconPosition="start" />
            </Tabs>
          </Box>

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

                    {section.lessons && section.lessons.length > 0 && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Bài học
                        </Typography>
                        <List dense>
                          {section.lessons.map((lesson) => (
                            <ListItem key={lesson.id}>
                              <ListItemIcon>
                                {lesson.contentType === "video" && (
                                  <VideoLibrary fontSize="small" />
                                )}
                                {lesson.contentType === "slide" && (
                                  <Slideshow fontSize="small" />
                                )}
                                {lesson.contentType === "assignment" && (
                                  <Assignment fontSize="small" />
                                )}
                                {lesson.contentType === "quiz" && (
                                  <QuestionAnswer fontSize="small" />
                                )}
                                {lesson.contentType === "txt" && (
                                  <Description fontSize="small" />
                                )}
                                {lesson.contentType === "code" && (
                                  <Code fontSize="small" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Typography variant="body2">
                                      {lesson.title}
                                    </Typography>
                                    {lesson.isFree && (
                                      <Chip
                                        label="Miễn phí"
                                        size="small"
                                        color="success"
                                      />
                                    )}
                                  </Stack>
                                }
                                secondary={
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {lesson.contentType === "video" &&
                                      `Video • ${lesson.duration} phút`}
                                    {lesson.contentType === "slide" &&
                                      "Slide bài giảng"}
                                    {lesson.contentType === "assignment" &&
                                      "Bài tập"}
                                    {lesson.contentType === "quiz" &&
                                      `Trắc nghiệm • ${lesson.duration} phút`}
                                    {lesson.contentType === "txt" && "Tài liệu"}
                                    {lesson.contentType === "code" &&
                                      "Code mẫu"}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

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
                              <ListItemText
                                primary={doc.title}
                                secondary={doc.description}
                              />
                              <IconButton size="small">
                                <Download fontSize="small" />
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

          <TabPanel value={activeTab} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Học viên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell>Ngày đăng ký</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {course.enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={enrollment.user.avatarUrl}
                            sx={{ width: 24, height: 24 }}
                          >
                            {enrollment.user.username.charAt(0)}
                          </Avatar>
                          {enrollment.user.username}
                        </Box>
                      </TableCell>
                      <TableCell>{enrollment.user.email}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            enrollment.status === "active"
                              ? "Đang học"
                              : "Đã hủy"
                          }
                          color={
                            enrollment.status === "active" ? "success" : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(enrollment.enrollmentDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

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
                      {calculateAverageRating()}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.secondary"
                    >
                      /5 ({course.reviews.length} đánh giá)
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <List>
                  {course.reviews.map((review) => (
                    <React.Fragment key={review.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={review.student.user.avatarUrl}>
                            {review.student.fullName.charAt(0)}
                          </Avatar>
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
                                {review.student.fullName}
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
                                {review.reviewText}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(review.createdAt).toLocaleDateString(
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
