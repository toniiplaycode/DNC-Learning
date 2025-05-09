import { useEffect, useState, useMemo } from "react";
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
  Chip,
  Avatar,
  Paper,
  TablePagination,
  TextField,
  Button,
} from "@mui/material";
import {
  TrendingUp,
  People,
  AttachMoney,
  ShoppingCart,
  FilterList,
  Clear,
  DownloadForOfflineOutlined,
  School,
} from "@mui/icons-material";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectInstructorPayments } from "../../features/payments/paymentsSelectors";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { fetchInstructorPayments } from "../../features/payments/paymentsSlice";
import * as XLSX from "xlsx";
import { fetchInstructorEnrollments } from "../../features/enrollments/enrollmentsApiSlice";
import { selectInstructorEnrollments } from "../../features/enrollments/enrollmentsSelectors";

const InstructorAnalytics = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorPayments = useAppSelector(selectInstructorPayments);
  const instructorEnrollmentsStudent = useAppSelector(
    selectInstructorEnrollments
  );

  // Pagination for payments table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add these state variables near the other state declarations
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Add these new state variables
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState("all");
  const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState("all");
  const [enrollmentDateFromFilter, setEnrollmentDateFromFilter] = useState("");
  const [enrollmentDateToFilter, setEnrollmentDateToFilter] = useState("");
  const [showEnrollmentFilters, setShowEnrollmentFilters] = useState(false);

  // Add these state variables for enrollment pagination
  const [enrollmentPage, setEnrollmentPage] = useState(0);
  const [enrollmentRowsPerPage, setEnrollmentRowsPerPage] = useState(10);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchInstructorPayments(currentUser.userInstructor.id));
      dispatch(fetchInstructorEnrollments(currentUser.userInstructor.id));
    }
  }, [dispatch, currentUser]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Calculate statistics from real payment data
  const paymentStats = useMemo(() => {
    if (!instructorPayments || instructorPayments.length === 0) {
      return {
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        totalCount: 0,
        uniqueStudents: 0,
        completionRate: 0,
      };
    }

    const stats = instructorPayments.reduce(
      (acc, payment) => {
        // Add to total counts
        acc.totalCount++;
        acc.totalRevenue += parseFloat(payment.amount);

        // Track unique students
        if (!acc.studentIds.has(payment.userId)) {
          acc.studentIds.add(payment.userId);
        }

        // Process by status
        if (payment.status === "completed") {
          acc.completedCount++;
          acc.completedRevenue += parseFloat(payment.amount);
        } else if (payment.status === "pending") {
          acc.pendingCount++;
          acc.pendingRevenue += parseFloat(payment.amount);
        } else if (payment.status === "failed") {
          acc.failedCount++;
        }

        return acc;
      },
      {
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        totalCount: 0,
        studentIds: new Set<string | number>(),
      }
    );

    return {
      ...stats,
      uniqueStudents: stats.studentIds.size,
      completionRate:
        stats.totalCount > 0
          ? (stats.completedCount / stats.totalCount) * 100
          : 0,
    };
  }, [instructorPayments]);

  // Calculate course revenue
  const courseStats = useMemo(() => {
    if (!instructorPayments || instructorPayments.length === 0) return [];

    const coursesMap = new Map();

    instructorPayments.forEach((payment) => {
      const { courseId, course, status, amount } = payment;

      if (!coursesMap.has(courseId)) {
        coursesMap.set(courseId, {
          id: courseId,
          name: course.title,
          thumbnailUrl: course.thumbnailUrl,
          totalRevenue: 0,
          completedRevenue: 0,
          pendingRevenue: 0,
          students: new Set(),
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          totalCount: 0,
        });
      }

      const courseData = coursesMap.get(courseId);
      courseData.totalCount++;
      courseData.totalRevenue += parseFloat(amount);
      courseData.students.add(payment.userId);

      if (status === "completed") {
        courseData.completedCount++;
        courseData.completedRevenue += parseFloat(amount);
      } else if (status === "pending") {
        courseData.pendingCount++;
        courseData.pendingRevenue += parseFloat(amount);
      } else if (status === "failed") {
        courseData.failedCount++;
      }
    });

    // Convert to array and calculate completion rate
    return Array.from(coursesMap.values()).map((course) => ({
      ...course,
      students: course.students.size,
      completionRate:
        course.totalCount > 0
          ? (course.completedCount / course.totalCount) * 100
          : 0,
    }));
  }, [instructorPayments]);

  // Prepare chart data - monthly revenue
  const monthlyRevenueData = useMemo(() => {
    if (!instructorPayments || instructorPayments.length === 0) {
      return [];
    }

    const months = {};

    // Initialize months (last 6 months)
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      months[monthKey] = {
        month: `T${d.getMonth() + 1}`,
        revenue: 0,
        completedRevenue: 0,
        students: new Set(),
      };
    }

    // Fill with actual data
    instructorPayments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (months[monthKey]) {
        if (payment.status === "completed") {
          months[monthKey].completedRevenue += parseFloat(payment.amount);
        }
        months[monthKey].revenue += parseFloat(payment.amount);
        months[monthKey].students.add(payment.userId);
      }
    });

    // Convert to array format for chart
    return Object.values(months).map((m) => ({
      month: m.month,
      revenue: m.revenue,
      completedRevenue: m.completedRevenue,
      students: m.students.size,
    }));
  }, [instructorPayments]);

  // Prepare payment method distribution data
  const paymentMethodData = useMemo(() => {
    if (!instructorPayments || instructorPayments.length === 0) {
      return [];
    }

    const methods = {};

    instructorPayments.forEach((payment) => {
      const method = payment.paymentMethod;
      if (!methods[method]) {
        methods[method] = { count: 0, value: 0 };
      }
      methods[method].count++;
      methods[method].value += parseFloat(payment.amount);
    });

    return Object.entries(methods).map(([method, data], index) => ({
      id: index,
      value: data.count,
      label:
        method === "zalopay"
          ? "ZaloPay"
          : method === "e_wallet"
          ? "Ví điện tử"
          : method === "bank_transfer"
          ? "Chuyển khoản"
          : "Thẻ tín dụng",
    }));
  }, [instructorPayments]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn tất";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  // Add this function before the return statement
  const filteredPayments = useMemo(() => {
    if (!instructorPayments) return [];

    return instructorPayments.filter((payment) => {
      // Status filter
      if (statusFilter !== "all" && payment.status !== statusFilter)
        return false;

      // Method filter
      if (methodFilter !== "all" && payment.paymentMethod !== methodFilter)
        return false;

      // Course filter
      if (
        courseFilter !== "all" &&
        payment.courseId.toString() !== courseFilter
      )
        return false;

      // Date range filter
      const paymentDate = new Date(payment.createdAt);
      if (dateFromFilter && paymentDate < new Date(dateFromFilter))
        return false;
      if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59); // End of day
        if (paymentDate > toDate) return false;
      }

      return true;
    });
  }, [
    instructorPayments,
    statusFilter,
    methodFilter,
    courseFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // Add this function to reset filters
  const resetFilters = () => {
    setStatusFilter("all");
    setMethodFilter("all");
    setCourseFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  // Add this function before the return statement
  const exportToExcel = () => {
    if (!filteredPayments.length) return;

    // Prepare data for Excel with formatted values
    const excelData = filteredPayments.map((payment) => ({
      ID: payment.id,
      "Học viên": payment.user?.username || "N/A",
      Email: payment.user?.email || "N/A",
      "Khóa học": payment.course?.title || "N/A",
      "Số tiền": parseFloat(payment.amount).toLocaleString("vi-VN") + "đ",
      "Phương thức":
        payment.paymentMethod === "zalopay"
          ? "ZaloPay"
          : payment.paymentMethod === "e_wallet"
          ? "Ví điện tử"
          : payment.paymentMethod === "bank_transfer"
          ? "Chuyển khoản"
          : "Thẻ tín dụng",
      "Trạng thái": getStatusLabel(payment.status),
      "Ngày tạo": new Date(payment.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Thanh toán");

    // Apply column widths
    const colWidths = [
      { wch: 5 }, // ID
      { wch: 20 }, // Học viên
      { wch: 30 }, // Email
      { wch: 40 }, // Khóa học
      { wch: 15 }, // Số tiền
      { wch: 15 }, // Phương thức
      { wch: 15 }, // Trạng thái
      { wch: 20 }, // Ngày tạo
    ];
    worksheet["!cols"] = colWidths;

    // Generate a filename with current date
    const fileName = `Thanh-toan-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Generate and download the file
    XLSX.writeFile(workbook, fileName);
  };

  // Add this function before the return statement
  const filteredEnrollments = useMemo(() => {
    if (
      !instructorEnrollmentsStudent ||
      !Array.isArray(instructorEnrollmentsStudent)
    )
      return [];

    return instructorEnrollmentsStudent
      .filter((item) => item.id) // Filter out the stats object
      .filter((enrollment) => {
        // Status filter
        if (
          enrollmentStatusFilter !== "all" &&
          enrollment.status !== enrollmentStatusFilter
        )
          return false;

        // Course filter
        if (
          enrollmentCourseFilter !== "all" &&
          enrollment.courseId.toString() !== enrollmentCourseFilter
        )
          return false;

        // Date range filter
        const enrollmentDate = new Date(enrollment.enrollmentDate);
        if (
          enrollmentDateFromFilter &&
          enrollmentDate < new Date(enrollmentDateFromFilter)
        )
          return false;
        if (enrollmentDateToFilter) {
          const toDate = new Date(enrollmentDateToFilter);
          toDate.setHours(23, 59, 59); // End of day
          if (enrollmentDate > toDate) return false;
        }

        return true;
      });
  }, [
    instructorEnrollmentsStudent,
    enrollmentStatusFilter,
    enrollmentCourseFilter,
    enrollmentDateFromFilter,
    enrollmentDateToFilter,
  ]);

  // Add this function to reset enrollment filters
  const resetEnrollmentFilters = () => {
    setEnrollmentStatusFilter("all");
    setEnrollmentCourseFilter("all");
    setEnrollmentDateFromFilter("");
    setEnrollmentDateToFilter("");
  };

  // Add this function for exporting enrollments to Excel
  const exportEnrollmentsToExcel = () => {
    if (!filteredEnrollments.length) return;

    // Prepare data for Excel with formatted values
    const excelData = filteredEnrollments.map((enrollment) => ({
      ID: enrollment.id,
      "Học viên": enrollment.user?.username || "N/A",
      Email: enrollment.user?.email || "N/A",
      "Khóa học": enrollment.course?.title || "N/A",
      "Giá khóa học": formatCurrency(parseFloat(enrollment.course?.price) || 0),
      "Trạng thái":
        enrollment.status === "active"
          ? "Đang học"
          : enrollment.status === "completed"
          ? "Đã hoàn thành"
          : "Đã hủy",
      "Ngày đăng ký": new Date(enrollment.enrollmentDate).toLocaleDateString(
        "vi-VN",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ),
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Đăng ký khóa học");

    // Apply column widths
    const colWidths = [
      { wch: 5 }, // ID
      { wch: 20 }, // Học viên
      { wch: 30 }, // Email
      { wch: 40 }, // Khóa học
      { wch: 15 }, // Giá khóa học
      { wch: 15 }, // Trạng thái
      { wch: 15 }, // Ngày đăng ký
    ];
    worksheet["!cols"] = colWidths;

    // Generate a filename with current date
    const fileName = `Dang-ky-khoa-hoc-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Generate and download the file
    XLSX.writeFile(workbook, fileName);
  };

  // Add these handlers for enrollment pagination
  const handleEnrollmentChangePage = (event, newPage) => {
    setEnrollmentPage(newPage);
  };

  const handleEnrollmentChangeRowsPerPage = (event) => {
    setEnrollmentRowsPerPage(parseInt(event.target.value, 10));
    setEnrollmentPage(0);
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
          Thống kê doanh thu
        </Typography>
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
                    {instructorEnrollmentsStudent &&
                    Array.isArray(instructorEnrollmentsStudent)
                      ? instructorEnrollmentsStudent.length
                      : 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    {instructorPayments && instructorPayments.length > 0
                      ? `${
                          instructorEnrollmentsStudent &&
                          Array.isArray(instructorEnrollmentsStudent)
                            ? instructorEnrollmentsStudent.length
                            : 0
                        } học viên`
                      : "Chưa có học viên"}
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
                    {formatCurrency(paymentStats.completedRevenue)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {paymentStats.pendingRevenue > 0
                      ? `${formatCurrency(
                          paymentStats.pendingRevenue
                        )} đang xử lý`
                      : "Không có thanh toán đang xử lý"}
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
                    Giao dịch
                  </Typography>
                  <Typography variant="h4">
                    {paymentStats.totalCount}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {paymentStats.completedCount} hoàn tất /{" "}
                    {paymentStats.pendingCount} đang xử lý
                  </Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: "info.main" }} />
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
                    Tỷ lệ giao dịch thành công
                  </Typography>
                  <Typography variant="h4">
                    {paymentStats.completionRate.toFixed(0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={paymentStats.completionRate}
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
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Xu hướng doanh thu
              </Typography>
              <Box sx={{ height: 350 }}>
                {monthlyRevenueData.length > 0 ? (
                  <BarChart
                    dataset={monthlyRevenueData}
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
                        color: "#1976d2",
                      },
                      {
                        dataKey: "completedRevenue",
                        label: "Doanh thu thành công",
                        valueFormatter: (value) =>
                          value ? `${(value / 1000000).toFixed(1)}M` : "0M",
                        color: "#2e7d32",
                      },
                      {
                        dataKey: "revenue",
                        label: "Tổng doanh thu",
                        valueFormatter: (value) =>
                          value ? `${(value / 1000000).toFixed(1)}M` : "0M",
                        color: "#ed6c02",
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
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Chưa có dữ liệu doanh thu
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố phương thức thanh toán
              </Typography>
              <Box sx={{ height: 350, display: "flex", alignItems: "center" }}>
                {paymentMethodData.length > 0 ? (
                  <PieChart
                    series={[
                      {
                        data: paymentMethodData,
                        highlightScope: {
                          faded: "global",
                          highlighted: "item",
                        },
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
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Chưa có dữ liệu phương thức thanh toán
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Course Performance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hiệu suất theo khóa học
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên khóa học</TableCell>
                  <TableCell align="center">Học viên</TableCell>
                  <TableCell align="right">Doanh thu</TableCell>
                  <TableCell align="center">Tỷ lệ thành công</TableCell>
                  <TableCell align="right">Doanh thu chờ xử lý</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courseStats.length > 0 ? (
                  courseStats.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={course.thumbnailUrl}
                            variant="rounded"
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          {course.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{course.students}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(course.completedRevenue)}
                      </TableCell>
                      <TableCell align="center">
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            {course.completionRate.toFixed(0)}%
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
                      <TableCell align="right">
                        {formatCurrency(course.pendingRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Chưa có dữ liệu khóa học
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lịch sử thanh toán
          </Typography>

          {/* Add this inside the Card component for Payments Table, just after the Typography h6 */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button
              startIcon={<FilterList />}
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "contained" : "outlined"}
            >
              Bộ lọc
            </Button>

            {(statusFilter !== "all" ||
              methodFilter !== "all" ||
              courseFilter !== "all" ||
              dateFromFilter ||
              dateToFilter) && (
              <Button
                startIcon={<Clear />}
                size="small"
                onClick={resetFilters}
                variant="outlined"
                color="error"
              >
                Xóa bộ lọc
              </Button>
            )}

            {statusFilter !== "all" && (
              <Chip
                label={`Trạng thái: ${getStatusLabel(statusFilter)}`}
                color={getStatusColor(statusFilter)}
                onDelete={() => setStatusFilter("all")}
                size="small"
              />
            )}

            {methodFilter !== "all" && (
              <Chip
                label={`Phương thức: ${
                  methodFilter === "zalopay"
                    ? "ZaloPay"
                    : methodFilter === "e_wallet"
                    ? "Ví điện tử"
                    : methodFilter === "bank_transfer"
                    ? "Chuyển khoản"
                    : "Thẻ tín dụng"
                }`}
                onDelete={() => setMethodFilter("all")}
                size="small"
              />
            )}

            {courseFilter !== "all" && (
              <Chip
                label={`Khóa học: ${
                  courseStats.find((c) => c.id.toString() === courseFilter)
                    ?.name || courseFilter
                }`}
                onDelete={() => setCourseFilter("all")}
                size="small"
              />
            )}

            {(dateFromFilter || dateToFilter) && (
              <Chip
                label={`Ngày: ${
                  dateFromFilter
                    ? new Date(dateFromFilter).toLocaleDateString("vi-VN")
                    : ""
                } - ${
                  dateToFilter
                    ? new Date(dateToFilter).toLocaleDateString("vi-VN")
                    : ""
                }`}
                onDelete={() => {
                  setDateFromFilter("");
                  setDateToFilter("");
                }}
                size="small"
              />
            )}

            <Button
              startIcon={<DownloadForOfflineOutlined />}
              size="small"
              onClick={exportToExcel}
              variant="outlined"
              color="primary"
              disabled={!filteredPayments.length}
              sx={{ ml: 1 }}
            >
              Tải Excel
            </Button>
          </Stack>

          {/* Filter Section */}
          {showFilters && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="completed">Hoàn tất</MenuItem>
                    <MenuItem value="pending">Đang xử lý</MenuItem>
                    <MenuItem value="failed">Thất bại</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phương thức</InputLabel>
                  <Select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    label="Phương thức"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="zalopay">ZaloPay</MenuItem>
                    <MenuItem value="e_wallet">Ví điện tử</MenuItem>
                    <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                    <MenuItem value="credit_card">Thẻ tín dụng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    label="Khóa học"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {courseStats.map((course) => (
                      <MenuItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    size="small"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>
              </Grid>
            </Grid>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Phương thức</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments && filteredPayments.length > 0 ? (
                  filteredPayments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography variant="body2">
                              {payment.user?.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {payment.user?.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={payment.course?.thumbnailUrl}
                              variant="rounded"
                              sx={{ width: 30, height: 30, mr: 1 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {payment.course?.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(parseFloat(payment.amount))}
                        </TableCell>
                        <TableCell>
                          {payment.paymentMethod === "zalopay"
                            ? "ZaloPay"
                            : payment.paymentMethod === "e_wallet"
                            ? "Ví điện tử"
                            : payment.paymentMethod === "bank_transfer"
                            ? "Chuyển khoản"
                            : "Thẻ tín dụng"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(payment.status)}
                            color={getStatusColor(payment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Chưa có dữ liệu thanh toán
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredPayments && filteredPayments.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredPayments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Hiển thị mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tham gia gần đây
          </Typography>

          {/* Filters for enrollments */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button
              startIcon={<FilterList />}
              size="small"
              onClick={() => setShowEnrollmentFilters(!showEnrollmentFilters)}
              variant={showEnrollmentFilters ? "contained" : "outlined"}
            >
              Bộ lọc
            </Button>

            {(enrollmentStatusFilter !== "all" ||
              enrollmentCourseFilter !== "all" ||
              enrollmentDateFromFilter ||
              enrollmentDateToFilter) && (
              <Button
                startIcon={<Clear />}
                size="small"
                onClick={resetEnrollmentFilters}
                variant="outlined"
                color="error"
              >
                Xóa bộ lọc
              </Button>
            )}

            {enrollmentStatusFilter !== "all" && (
              <Chip
                label={`Trạng thái: ${
                  enrollmentStatusFilter === "active"
                    ? "Đang học"
                    : enrollmentStatusFilter === "completed"
                    ? "Đã hoàn thành"
                    : "Đã hủy"
                }`}
                color={
                  enrollmentStatusFilter === "active"
                    ? "primary"
                    : enrollmentStatusFilter === "completed"
                    ? "success"
                    : "error"
                }
                onDelete={() => setEnrollmentStatusFilter("all")}
                size="small"
              />
            )}

            {enrollmentCourseFilter !== "all" &&
              instructorEnrollmentsStudent?.courseStats && (
                <Chip
                  label={`Khóa học: ${
                    instructorEnrollmentsStudent.courseStats.find(
                      (c) => c.courseId.toString() === enrollmentCourseFilter
                    )?.courseTitle || enrollmentCourseFilter
                  }`}
                  onDelete={() => setEnrollmentCourseFilter("all")}
                  size="small"
                />
              )}

            {(enrollmentDateFromFilter || enrollmentDateToFilter) && (
              <Chip
                label={`Ngày: ${
                  enrollmentDateFromFilter
                    ? new Date(enrollmentDateFromFilter).toLocaleDateString(
                        "vi-VN"
                      )
                    : ""
                } - ${
                  enrollmentDateToFilter
                    ? new Date(enrollmentDateToFilter).toLocaleDateString(
                        "vi-VN"
                      )
                    : ""
                }`}
                onDelete={() => {
                  setEnrollmentDateFromFilter("");
                  setEnrollmentDateToFilter("");
                }}
                size="small"
              />
            )}

            <Button
              startIcon={<DownloadForOfflineOutlined />}
              size="small"
              onClick={exportEnrollmentsToExcel}
              variant="outlined"
              color="primary"
              disabled={!filteredEnrollments.length}
              sx={{ ml: 1 }}
            >
              Tải Excel
            </Button>
          </Stack>

          {/* Filter Inputs */}
          {showEnrollmentFilters && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={enrollmentStatusFilter}
                    onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="active">Đang học</MenuItem>
                    <MenuItem value="completed">Đã hoàn thành</MenuItem>
                    <MenuItem value="dropped">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={enrollmentCourseFilter}
                    onChange={(e) => setEnrollmentCourseFilter(e.target.value)}
                    label="Khóa học"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {instructorEnrollmentsStudent?.courseStats?.map(
                      (course) => (
                        <MenuItem
                          key={course.courseId}
                          value={course.courseId.toString()}
                        >
                          {course.courseTitle}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    value={enrollmentDateFromFilter}
                    onChange={(e) =>
                      setEnrollmentDateFromFilter(e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    size="small"
                    value={enrollmentDateToFilter}
                    onChange={(e) => setEnrollmentDateToFilter(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>
              </Grid>
            </Grid>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments.length > 0 ? (
                  filteredEnrollments
                    .sort(
                      (a, b) =>
                        new Date(b.enrollmentDate).getTime() -
                        new Date(a.enrollmentDate).getTime()
                    )
                    .slice(
                      enrollmentPage * enrollmentRowsPerPage,
                      enrollmentPage * enrollmentRowsPerPage +
                        enrollmentRowsPerPage
                    )
                    .map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography variant="body2">
                              {enrollment.user?.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {enrollment.user?.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={enrollment.course?.thumbnailUrl}
                              variant="rounded"
                              sx={{ width: 30, height: 30, mr: 1 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {enrollment.course?.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              enrollment.status === "active"
                                ? "Đang học"
                                : enrollment.status === "completed"
                                ? "Đã hoàn thành"
                                : "Đã hủy"
                            }
                            color={
                              enrollment.status === "active"
                                ? "primary"
                                : enrollment.status === "completed"
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(
                            enrollment.enrollmentDate
                          ).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Chưa có dữ liệu đăng ký gần đây
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredEnrollments && filteredEnrollments.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredEnrollments.length}
              rowsPerPage={enrollmentRowsPerPage}
              page={enrollmentPage}
              onPageChange={handleEnrollmentChangePage}
              onRowsPerPageChange={handleEnrollmentChangeRowsPerPage}
              labelRowsPerPage="Hiển thị mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstructorAnalytics;
