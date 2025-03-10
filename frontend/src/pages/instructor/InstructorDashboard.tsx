import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Star,
  MoreVert,
  School,
  Notifications,
  Assignment,
  CalendarToday,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

// Mock data cho các khóa học mới nhất
const recentCourses = [
  {
    id: 1,
    title: "React & TypeScript Masterclass",
    students: 234,
    rating: 4.8,
    progress: 100,
    image: "/src/assets/logo.png",
  },
  {
    id: 2,
    title: "Node.js Advanced Concepts",
    students: 189,
    rating: 4.7,
    progress: 80,
    image: "/src/assets/logo.png",
  },
  {
    id: 3,
    title: "Docker & Kubernetes",
    students: 156,
    rating: 4.9,
    progress: 60,
    image: "/src/assets/logo.png",
  },
];

// Mock data cho học viên mới nhất
const recentStudents = [
  {
    id: 1,
    name: "John Doe",
    course: "React & TypeScript Masterclass",
    enrollDate: "2024-03-20",
    avatar: "/src/assets/avatar.png",
  },
  {
    id: 2,
    name: "Jane Smith",
    course: "Node.js Advanced Concepts",
    enrollDate: "2024-03-19",
    avatar: "/src/assets/avatar.png",
  },
  {
    id: 3,
    name: "Mike Johnson",
    course: "Docker & Kubernetes",
    enrollDate: "2024-03-18",
    avatar: "/src/assets/avatar.png",
  },
];

// Mock data
const mockData = {
  notifications: [
    {
      id: 1,
      type: "review",
      message: "Bạn có đánh giá mới trong khóa học React",
      time: "10 phút trước",
    },
    {
      id: 2,
      type: "question",
      message: "Học viên đặt câu hỏi trong bài học TypeScript Basic",
      time: "1 giờ trước",
    },
  ],
  upcomingTasks: [
    {
      id: 1,
      title: "Chấm bài Assignment 1: React Hooks",
      course: "React & TypeScript Masterclass",
      dueDate: "2024-03-20",
      submissions: 15,
    },
    {
      id: 2,
      title: "Phê duyệt câu hỏi thảo luận",
      course: "Node.js Advanced Concepts",
      dueDate: "2024-03-21",
      pending: 8,
    },
  ],
  recentMessages: [
    {
      id: 1,
      from: "Nguyễn Văn A",
      avatar: "/src/assets/logo.png",
      message: "Thầy ơi, em có thắc mắc về bài học...",
      time: "15:30",
    },
    {
      id: 2,
      from: "Trần Thị B",
      avatar: "/src/assets/logo.png",
      message: "Cảm ơn thầy đã giải đáp...",
      time: "Hôm qua",
    },
  ],
  upcomingEvents: [
    {
      id: 1,
      title: "Live Q&A Session",
      course: "React & TypeScript Masterclass",
      date: "2024-03-20 19:00",
    },
    {
      id: 2,
      title: "Deadline nộp bài tập cuối khóa",
      course: "Node.js Advanced Concepts",
      date: "2024-03-25 23:59",
    },
  ],
};

const InstructorDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Bảng điều khiển
      </Typography>

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Thông báo mới</Typography>
                <Button
                  component={RouterLink}
                  to="/instructor/notifications"
                  size="small"
                >
                  Xem tất cả
                </Button>
              </Stack>
              <List>
                {mockData.notifications.map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <Notifications color="primary" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Công việc cần làm</Typography>
                <Button
                  component={RouterLink}
                  to="/instructor/assignments"
                  size="small"
                >
                  Xem tất cả
                </Button>
              </Stack>
              <List>
                {mockData.upcomingTasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <Assignment color="primary" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <>
                          {task.course}
                          <br />
                          Hạn chót:{" "}
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Messages */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Tin nhắn gần đây</Typography>
                <Button
                  component={RouterLink}
                  to="/instructor/chats"
                  size="small"
                >
                  Xem tất cả
                </Button>
              </Stack>
              <List>
                {mockData.recentMessages.map((message) => (
                  <ListItem key={message.id}>
                    <ListItemAvatar>
                      <Avatar src={message.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={message.from}
                      secondary={
                        <>
                          {message.message}
                          <br />
                          {message.time}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Sự kiện sắp tới</Typography>
                <Button
                  component={RouterLink}
                  to="/instructor/calendar"
                  size="small"
                >
                  Xem lịch
                </Button>
              </Stack>
              <List>
                {mockData.upcomingEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <CalendarToday color="primary" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          {event.course}
                          <br />
                          {new Date(event.date).toLocaleString("vi-VN")}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Khóa học gần đây */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Khóa học của tôi</Typography>
            <Button
              variant="contained"
              startIcon={<School />}
              onClick={() => navigate("/instructor/courses/create")}
            >
              Tạo khóa học
            </Button>
          </Box>

          <Grid container spacing={3}>
            {recentCourses.map((course) => (
              <Grid item xs={12} md={4} key={course.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={course.image}
                          sx={{ width: 48, height: 48 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" noWrap>
                            {course.title}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {course.students} học viên
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Star
                                sx={{
                                  fontSize: 16,
                                  color: "warning.main",
                                }}
                              />
                              <Typography variant="caption">
                                {course.rating}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          gutterBottom
                        >
                          Tiến độ hoàn thành
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Học viên mới */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Học viên mới
          </Typography>
          <List>
            {recentStudents.map((student, index) => (
              <React.Fragment key={student.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={student.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={student.name}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {student.course}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Đăng ký: {student.enrollDate}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstructorDashboard;
