import { useState } from "react";
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
  IconButton,
  Divider,
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
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

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
};

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
                        {new Date(courseData.lastUpdated).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Typography variant="body1" color="text.secondary">
                  {courseData.description}
                </Typography>

                <Stack direction="row" spacing={3}>
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
                  startIcon={<Edit />}
                  fullWidth
                  onClick={() => navigate(`/instructor/courses/${id}/edit`)}
                >
                  Chỉnh sửa khóa học
                </Button>
                <Button
                  variant="outlined"
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

      {/* Course Tabs */}
      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PlayCircle />} label="Nội dung" />
            <Tab icon={<People />} label="Học viên" />
            <Tab icon={<Assignment />} label="Bài tập" />
            <Tab icon={<Message />} label="Thảo luận" />
            <Tab icon={<AttachMoney />} label="Doanh thu" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Nội dung khóa học
            </Typography>
            {/* Add course content component */}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Danh sách học viên
            </Typography>
            {/* Add students list component */}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Bài tập & Quiz
            </Typography>
            {/* Add assignments component */}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Thảo luận
            </Typography>
            {/* Add discussions component */}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Thống kê doanh thu
            </Typography>
            {/* Add revenue stats component */}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstructorCourseView;
