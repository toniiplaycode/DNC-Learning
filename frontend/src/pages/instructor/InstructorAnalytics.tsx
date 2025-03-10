import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  TrendingUp,
  People,
  School,
  Assignment,
  AttachMoney,
  Info,
  DateRange,
} from "@mui/icons-material";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";

// Mock data
const mockStats = {
  overview: {
    totalStudents: 234,
    totalCourses: 5,
    totalAssignments: 25,
    totalRevenue: 15000000,
    revenueGrowth: 12.5,
    newStudents: 15,
    completionRate: 78,
  },
  courseStats: [
    {
      id: 1,
      name: "React & TypeScript Masterclass",
      students: 89,
      revenue: 8000000,
      completionRate: 75,
      rating: 4.8,
    },
    {
      id: 2,
      name: "Node.js Advanced Concepts",
      students: 65,
      revenue: 5000000,
      completionRate: 68,
      rating: 4.6,
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: "enrollment",
      description: "Nguyễn Văn A đã đăng ký khóa học React",
      date: "2024-03-15",
    },
    {
      id: 2,
      type: "assignment",
      description: "15 học viên đã nộp Assignment 1: React Hooks",
      date: "2024-03-14",
    },
  ],
};

// Thêm mock data cho biểu đồ
const mockChartData = {
  enrollmentTrend: [
    { month: "T1", students: 45, revenue: 4500000 },
    { month: "T2", students: 52, revenue: 5200000 },
    { month: "T3", students: 48, revenue: 4800000 },
    { month: "T4", students: 70, revenue: 7000000 },
    { month: "T5", students: 65, revenue: 6500000 },
    { month: "T6", students: 85, revenue: 8500000 },
  ],
  courseDistribution: [
    { id: 0, value: 35, label: "React" },
    { id: 1, value: 25, label: "Node.js" },
    { id: 2, value: 20, label: "TypeScript" },
    { id: 3, value: 15, label: "Docker" },
    { id: 4, value: 5, label: "Khác" },
  ],
  completionRate: [
    { month: "T1", rate: 65 },
    { month: "T2", rate: 68 },
    { month: "T3", rate: 72 },
    { month: "T4", rate: 75 },
    { month: "T5", rate: 78 },
    { month: "T6", rate: 82 },
  ],
};

const InstructorAnalytics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [tabValue, setTabValue] = useState(0);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Thống kê
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Thời gian</InputLabel>
          <Select
            value={timeRange}
            label="Thời gian"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">7 ngày qua</MenuItem>
            <MenuItem value="month">30 ngày qua</MenuItem>
            <MenuItem value="year">12 tháng qua</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Tổng số học viên
                  </Typography>
                  <Typography variant="h4">
                    {mockStats.overview.totalStudents}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    +{mockStats.overview.newStudents} mới
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: "primary.main" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Doanh thu
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(mockStats.overview.totalRevenue)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    +{mockStats.overview.revenueGrowth}%
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: "success.main" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Số khóa học
                  </Typography>
                  <Typography variant="h4">
                    {mockStats.overview.totalCourses}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang hoạt động
                  </Typography>
                </Box>
                <School sx={{ fontSize: 40, color: "info.main" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Tỷ lệ hoàn thành
                  </Typography>
                  <Typography variant="h4">
                    {mockStats.overview.completionRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={mockStats.overview.completionRate}
                    sx={{ mt: 1, height: 6, borderRadius: 1 }}
                  />
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "warning.main" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Enrollment & Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Xu hướng đăng ký và doanh thu
              </Typography>
              <Box sx={{ height: 350 }}>
                <BarChart
                  dataset={mockChartData.enrollmentTrend}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "month",
                      tickLabelStyle: {
                        angle: 0,
                        textAnchor: "middle",
                      },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "students",
                      label: "Học viên",
                      valueFormatter: (value) => `${value} học viên`,
                    },
                    {
                      dataKey: "revenue",
                      label: "Doanh thu",
                      valueFormatter: (value) =>
                        value ? `${(value / 1000000).toFixed(1)}M` : "0M",
                    },
                  ]}
                  height={350}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "top", horizontal: "right" },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố học viên theo khóa học
              </Typography>
              <Box sx={{ height: 350, display: "flex", alignItems: "center" }}>
                <PieChart
                  series={[
                    {
                      data: mockChartData.courseDistribution,
                      highlightScope: { faded: "global", highlighted: "item" },
                      faded: { innerRadius: 30, additionalRadius: -30 },
                    },
                  ]}
                  height={300}
                  slotProps={{
                    legend: {
                      direction: "column",
                      position: { vertical: "middle", horizontal: "right" },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tỷ lệ hoàn thành khóa học
              </Typography>
              <Box sx={{ height: 350 }}>
                <LineChart
                  dataset={mockChartData.completionRate}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "month",
                    },
                  ]}
                  series={[
                    {
                      dataKey: "rate",
                      label: "Tỷ lệ hoàn thành",
                      valueFormatter: (value) => `${value}%`,
                      area: true,
                      color: "#2e7d32",
                    },
                  ]}
                  height={350}
                  sx={{
                    ".MuiLineElement-root": {
                      strokeWidth: 2,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Course Performance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hiệu suất khóa học
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên khóa học</TableCell>
                  <TableCell align="center">Học viên</TableCell>
                  <TableCell align="right">Doanh thu</TableCell>
                  <TableCell align="center">Tỷ lệ hoàn thành</TableCell>
                  <TableCell align="center">Đánh giá</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockStats.courseStats.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell align="center">{course.students}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(course.revenue)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          {course.completionRate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={course.completionRate}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="center">{course.rating}/5</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hoạt động gần đây
          </Typography>
          <List>
            {mockStats.recentActivities.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemIcon>
                  {activity.type === "enrollment" ? (
                    <People color="primary" />
                  ) : (
                    <Assignment color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={activity.description}
                  secondary={new Date(activity.date).toLocaleDateString(
                    "vi-VN"
                  )}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstructorAnalytics;
