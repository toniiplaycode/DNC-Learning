import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Stack,
  Button,
  Divider,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  People,
  School,
  AttachMoney,
  DateRange,
  CloudDownload,
  Refresh,
  ShowChart,
  DashboardCustomize,
  PieChart,
  TableChart,
  Timeline,
  Info,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

// Data mẫu cho biểu đồ doanh thu
const revenueData = {
  labels: [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ],
  datasets: [
    {
      label: "Doanh thu (triệu đồng)",
      data: [12, 19, 15, 17, 22, 24, 18, 20, 25, 30, 27, 32],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
      tension: 0.3,
    },
  ],
};

// Data mẫu cho biểu đồ người dùng mới
const newUsersData = {
  labels: [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ],
  datasets: [
    {
      label: "Học viên mới",
      data: [45, 52, 38, 60, 55, 80, 65, 75, 70, 85, 90, 100],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
    },
    {
      label: "Sinh viên mới",
      data: [30, 45, 20, 35, 40, 50, 45, 60, 55, 65, 70, 75],
      backgroundColor: "rgba(153, 102, 255, 0.6)",
    },
  ],
};

// Data mẫu cho biểu đồ khóa học theo danh mục
const coursesByCategoryData = {
  labels: [
    "Web",
    "Mobile",
    "AI/ML",
    "Database",
    "UI/UX",
    "DevOps",
    "Blockchain",
  ],
  datasets: [
    {
      label: "Số lượng khóa học",
      data: [12, 9, 8, 5, 7, 3, 2],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
        "rgba(199, 199, 199, 0.6)",
      ],
    },
  ],
};

// Data mẫu cho tỷ lệ hoàn thành khóa học
const completionRateData = {
  labels: ["Hoàn thành", "Đang học", "Bỏ dở"],
  datasets: [
    {
      label: "Tỷ lệ học viên",
      data: [65, 30, 5],
      backgroundColor: [
        "rgba(75, 192, 192, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 99, 132, 0.6)",
      ],
    },
  ],
};

// Mock data thống kê
const mockStats = {
  totalStudents: 2458,
  activeStudents: 1845,
  totalAcademicStudents: 1250,
  totalCourses: 46,
  activeCourses: 38,
  totalInstructors: 32,
  totalRevenue: 1250000000,
  monthlyRevenue: 125000000,
  completionRate: 78,
  avgCourseRating: 4.5,
};

// Cài đặt cho biểu đồ
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("year");
  const [tabValue, setTabValue] = useState(0);

  // Định dạng số tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Định dạng phần trăm
  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Phân tích & Báo cáo
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Thời gian</InputLabel>
            <Select
              value={timeRange}
              label="Thời gian"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="month">Tháng này</MenuItem>
              <MenuItem value="quarter">Quý này</MenuItem>
              <MenuItem value="year">Năm nay</MenuItem>
              <MenuItem value="all">Tất cả</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<CloudDownload />} size="small">
            Xuất báo cáo
          </Button>
          <Button variant="text" startIcon={<Refresh />} size="small">
            Làm mới
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<DashboardCustomize />}
          label="Tổng quan"
          iconPosition="start"
        />
        <Tab icon={<People />} label="Người dùng" iconPosition="start" />
        <Tab icon={<School />} label="Khóa học" iconPosition="start" />
        <Tab icon={<AttachMoney />} label="Doanh thu" iconPosition="start" />
      </Tabs>

      {/* Tab Tổng quan */}
      {tabValue === 0 && (
        <>
          {/* Thẻ thống kê */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tổng học viên
                  </Typography>
                  <Typography variant="h4">
                    {mockStats.totalStudents.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    +12.5% so với tháng trước
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tổng khóa học
                  </Typography>
                  <Typography variant="h4">{mockStats.totalCourses}</Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    +3 khóa mới trong tháng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tổng doanh thu
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(mockStats.totalRevenue).replace(/₫/g, "")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    +8.3% so với năm trước
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Tỷ lệ hoàn thành
                  </Typography>
                  <Typography variant="h4">
                    {formatPercent(mockStats.completionRate)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    +2.1% so với quý trước
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Biểu đồ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      Doanh thu theo thời gian
                    </Typography>
                    <Tooltip title="Biểu đồ hiển thị doanh thu trong 12 tháng gần nhất">
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <Line data={revenueData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Phân bố khóa học</Typography>
                    <Tooltip title="Biểu đồ hiển thị phân bố khóa học theo danh mục">
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <Doughnut
                      data={coursesByCategoryData}
                      options={chartOptions}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      Người dùng mới theo tháng
                    </Typography>
                    <Tooltip title="Biểu đồ hiển thị số lượng học viên và sinh viên mới đăng ký trong 12 tháng gần nhất">
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <Bar data={newUsersData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      Tỷ lệ hoàn thành khóa học
                    </Typography>
                    <Tooltip title="Biểu đồ hiển thị tỷ lệ học viên hoàn thành, đang học và bỏ dở khóa học">
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <Pie data={completionRateData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Tab Người dùng */}
      {tabValue === 1 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Phân tích người dùng
          </Typography>
          <Typography>
            Nội dung phân tích chi tiết về người dùng sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      )}

      {/* Tab Khóa học */}
      {tabValue === 2 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Phân tích khóa học
          </Typography>
          <Typography>
            Nội dung phân tích chi tiết về khóa học sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      )}

      {/* Tab Doanh thu */}
      {tabValue === 3 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Phân tích doanh thu
          </Typography>
          <Typography>
            Nội dung phân tích chi tiết về doanh thu sẽ được hiển thị ở đây.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminAnalytics;
