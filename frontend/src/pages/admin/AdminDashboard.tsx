import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Person,
  School,
  MenuBook,
  TrendingUp,
  AttachMoney,
  BarChart,
} from "@mui/icons-material";

// Mock data
const stats = [
  {
    title: "Tổng người dùng",
    value: 1250,
    icon: <Person />,
    color: "primary.main",
    change: "+12%",
  },
  {
    title: "Tổng khóa học",
    value: 45,
    icon: <School />,
    color: "success.main",
    change: "+5%",
  },
  {
    title: "Đang học",
    value: 320,
    icon: <MenuBook />,
    color: "warning.main",
    change: "+8%",
  },
  {
    title: "Doanh thu",
    value: "25.500.000đ",
    icon: <AttachMoney />,
    color: "error.main",
    change: "+15%",
  },
];

const recentUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "Học viên",
    avatar: "/src/assets/avatar.png",
    date: "2024-03-20",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    role: "Giảng viên",
    avatar: "/src/assets/avatar.png",
    date: "2024-03-19",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    role: "Học viên",
    avatar: "/src/assets/avatar.png",
    date: "2024-03-18",
  },
];

const recentCourses = [
  {
    id: 1,
    title: "React & TypeScript Masterclass",
    instructor: "John Doe",
    students: 45,
    rating: 4.8,
    date: "2024-03-15",
  },
  {
    id: 2,
    title: "Node.js Advanced Concepts",
    instructor: "Jane Smith",
    students: 32,
    rating: 4.7,
    date: "2024-03-12",
  },
  {
    id: 3,
    title: "Docker & Kubernetes",
    instructor: "Mike Johnson",
    students: 28,
    rating: 4.9,
    date: "2024-03-10",
  },
];

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bảng điều khiển
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1, fontWeight: "bold" }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main" }}>
                      {stat.change} so với tháng trước
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Người dùng mới</Typography>
                <Button variant="text" size="small">
                  Xem tất cả
                </Button>
              </Stack>
              <List>
                {recentUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={user.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {user.email}
                            </Typography>
                            <br />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.role} • {user.date}
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
        </Grid>

        {/* Recent Courses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Khóa học mới</Typography>
                <Button variant="text" size="small">
                  Xem tất cả
                </Button>
              </Stack>
              <List>
                {recentCourses.map((course, index) => (
                  <React.Fragment key={course.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <School />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {course.instructor}
                            </Typography>
                            <br />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {course.students} học viên • {course.rating} sao •{" "}
                              {course.date}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
