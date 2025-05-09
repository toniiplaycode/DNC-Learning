import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tab,
  Tabs,
  Divider,
  Stack,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Cancel,
  MoreVert,
  Receipt,
  Download,
  AttachMoney,
  PriceCheck,
  LocalAtm,
  AccountBalance,
  CreditCard,
  Clear,
  ContentCopy,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllPayments } from "../../features/payments/paymentsSlice";
import { selectAllPayments } from "../../features/payments/paymentsSelectors";
import * as XLSX from "xlsx";
import { selectAllInstructors } from "../../features/user_instructors/instructorsSelectors";
import { fetchInstructors } from "../../features/user_instructors/instructorsApiSlice";
import { fetchAllInstructors } from "../../features/instructors/instructorsSlice";
import { selectAllInstructors as selectAllInstructorsFromInstructors } from "../../features/instructors/instructorsSelectors";

// Enum for payment status and methods (kept for consistency with API values)
enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  E_WALLET = "e_wallet",
  ZALOPAY = "zalopay",
}

const AdminPayments = () => {
  const dispatch = useAppDispatch();
  const payments = useAppSelector(selectAllPayments);
  const instructors = useAppSelector(selectAllInstructors);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [courseIdFilter, setCourseIdFilter] = useState("all");
  const [instructorIdFilter, setInstructorIdFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAllPayments());
    dispatch(fetchInstructors());
  }, [dispatch]);

  // Tổng doanh thu từ các thanh toán hoàn thành
  const totalRevenue = payments
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  // Tổng số giao dịch
  const totalTransactions = payments.length;

  // Số giao dịch đang chờ xử lý
  const pendingTransactions = payments.filter(
    (p) => p.status === PaymentStatus.PENDING
  ).length;

  // Lọc thanh toán theo các bộ lọc
  useEffect(() => {
    if (!payments) {
      setFilteredPayments([]);
      return;
    }

    let result = [...payments];

    // Lọc theo tab
    if (tabValue === 1) {
      result = result.filter((p) => p.status === PaymentStatus.PENDING);
    } else if (tabValue === 2) {
      result = result.filter((p) => p.status === PaymentStatus.COMPLETED);
    } else if (tabValue === 3) {
      result = result.filter(
        (p) =>
          p.status === PaymentStatus.FAILED ||
          p.status === PaymentStatus.REFUNDED
      );
    }

    // Lọc theo trạng thái (nếu không phải ở All tab)
    if (tabValue === 0 && statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Lọc theo phương thức thanh toán
    if (methodFilter !== "all") {
      result = result.filter((p) => p.paymentMethod === methodFilter);
    }

    // Lọc theo ngày
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      result = result.filter(
        (p) => new Date(p.createdAt).toDateString() === today
      );
    } else if (dateFilter === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      result = result.filter((p) => new Date(p.createdAt) >= lastWeek);
    } else if (dateFilter === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      result = result.filter((p) => new Date(p.createdAt) >= lastMonth);
    }

    // Filter by course
    if (courseIdFilter !== "all") {
      result = result.filter((p) => p.courseId.toString() === courseIdFilter);
    }

    // Filter by instructor
    if (instructorIdFilter !== "all") {
      result = result.filter(
        (p) =>
          p.course?.instructor?.id?.toString() === instructorIdFilter ||
          p.course?.instructorId?.toString() === instructorIdFilter
      );
    }

    // Filter by year
    if (yearFilter !== "all") {
      result = result.filter(
        (p) => new Date(p.createdAt).getFullYear().toString() === yearFilter
      );
    }

    // Filter by month (only if year is selected)
    if (yearFilter !== "all" && monthFilter !== "all") {
      result = result.filter((p) => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate.getMonth() + 1 === parseInt(monthFilter);
      });
    }

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toString().includes(query) ||
          (p.user?.username && p.user.username.toLowerCase().includes(query)) ||
          (p.user?.email && p.user.email.toLowerCase().includes(query)) ||
          (p.transactionId && p.transactionId.toLowerCase().includes(query)) ||
          (p.course?.title && p.course.title.toLowerCase().includes(query))
      );
    }

    setFilteredPayments(result);
  }, [
    payments,
    searchQuery,
    statusFilter,
    methodFilter,
    dateFilter,
    tabValue,
    courseIdFilter,
    instructorIdFilter,
    yearFilter,
    monthFilter,
  ]);

  // Tính toán phân trang
  const pageCount = Math.ceil(filteredPayments.length / rowsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Xử lý click vào menu
  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    payment
  ) => {
    setSelectedPayment(payment);
    setActionMenu(event.currentTarget);
  };

  // Xử lý đóng menu
  const handleMenuClose = () => {
    setActionMenu(null);
  };

  // Xử lý mở dialog chi tiết
  const handleOpenDetail = () => {
    setActionMenu(null);
    setDetailDialogOpen(true);
  };

  // Xử lý phê duyệt thanh toán
  const handleApprovePayment = () => {
    if (selectedPayment) {
      // Would call API to update payment status
      // For now, just update the local state
      console.log("Approve payment:", selectedPayment.id);
      setActionMenu(null);
    }
  };

  // Xử lý từ chối thanh toán
  const handleRejectPayment = () => {
    if (selectedPayment) {
      // Would call API to update payment status
      console.log("Reject payment:", selectedPayment.id);
      setActionMenu(null);
    }
  };

  // Xử lý hoàn tiền
  const handleRefundPayment = () => {
    if (selectedPayment) {
      // Would call API to update payment status
      console.log("Refund payment:", selectedPayment.id);
      setActionMenu(null);
    }
  };

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(amount));
  };

  // Format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Chuyển đổi trạng thái thành văn bản và màu sắc
  const getStatusInfo = (status) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return { text: "Đang xử lý", color: "warning" };
      case PaymentStatus.COMPLETED:
        return { text: "Thành công", color: "success" };
      case PaymentStatus.FAILED:
        return { text: "Thất bại", color: "error" };
      case PaymentStatus.REFUNDED:
        return { text: "Đã hoàn tiền", color: "info" };
      default:
        return { text: "Không xác định", color: "default" };
    }
  };

  // Chuyển đổi phương thức thanh toán thành văn bản
  const getMethodText = (method) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return "Thẻ tín dụng";
      case PaymentMethod.BANK_TRANSFER:
        return "Chuyển khoản";
      case PaymentMethod.E_WALLET:
        return "Ví điện tử";
      case PaymentMethod.ZALOPAY:
        return "ZaloPay";
      default:
        return "Không xác định";
    }
  };

  // Lấy biểu tượng phương thức thanh toán
  const getMethodIcon = (method) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return <CreditCard fontSize="small" />;
      case PaymentMethod.BANK_TRANSFER:
        return <AccountBalance fontSize="small" />;
      case PaymentMethod.E_WALLET:
        return <AccountBalance fontSize="small" />;
      case PaymentMethod.ZALOPAY:
        return <AccountBalance fontSize="small" />;
      default:
        return <AttachMoney fontSize="small" />;
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    if (!filteredPayments.length) return;

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // 1. Summary sheet with filtered data
    const filteredCompleted = filteredPayments.filter(
      (p) => p.status === PaymentStatus.COMPLETED
    );
    const filteredPending = filteredPayments.filter(
      (p) => p.status === PaymentStatus.PENDING
    );
    const filteredRevenue = filteredCompleted.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const pendingRevenue = filteredPending.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const summaryData = [
      ["BÁO CÁO DOANH THU", ""],
      ["Tổng giao dịch:", filteredPayments.length.toString()],
      ["Giao dịch thành công:", filteredCompleted.length.toString()],
      ["Giao dịch đang xử lý:", filteredPending.length.toString()],
      ["Doanh thu thực thu:", formatCurrency(filteredRevenue)],
      ["Doanh thu chờ xử lý:", formatCurrency(pendingRevenue)],
      ["Ngày xuất báo cáo:", new Date().toLocaleString("vi-VN")],
      ["", ""],
      ["BỘ LỌC ĐANG ÁP DỤNG", ""],
    ];

    // Add active filters
    if (tabValue === 1) summaryData.push(["Tab:", "Đang xử lý"]);
    else if (tabValue === 2) summaryData.push(["Tab:", "Thành công"]);
    else if (tabValue === 3) summaryData.push(["Tab:", "Thất bại / Hoàn tiền"]);

    if (statusFilter !== "all")
      summaryData.push(["Trạng thái:", getStatusInfo(statusFilter).text]);
    if (methodFilter !== "all")
      summaryData.push(["Phương thức:", getMethodText(methodFilter)]);
    if (courseIdFilter !== "all") {
      const course = courseOptions.find(
        (c) => c.id.toString() === courseIdFilter
      );
      summaryData.push(["Khóa học:", course ? course.title : courseIdFilter]);
    }
    if (instructorIdFilter !== "all") {
      const instructor = instructorIdOptions.find(
        (i) => i.id.toString() === instructorIdFilter
      );
      summaryData.push([
        "Giảng viên:",
        instructor
          ? instructor.fullName || instructor.user?.username
          : instructorIdFilter,
      ]);
    }
    if (yearFilter !== "all") {
      let timeFilter = `Năm ${yearFilter}`;
      if (monthFilter !== "all") timeFilter += `, Tháng ${monthFilter}`;
      summaryData.push(["Thời gian:", timeFilter]);
    } else if (dateFilter !== "all") {
      summaryData.push([
        "Thời gian:",
        dateFilter === "today"
          ? "Hôm nay"
          : dateFilter === "week"
          ? "7 ngày qua"
          : "30 ngày qua",
      ]);
    }
    if (searchQuery) summaryData.push(["Tìm kiếm:", searchQuery]);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // 2. Revenue by payment method
    const methodStats = [];
    const methodGroups = new Map();

    filteredPayments.forEach((payment) => {
      const method = payment.paymentMethod;
      if (!methodGroups.has(method)) {
        methodGroups.set(method, {
          method: getMethodText(method),
          count: 0,
          totalAmount: 0,
          completedAmount: 0,
          pendingAmount: 0,
        });
      }

      const data = methodGroups.get(method);
      data.count++;
      const amount = parseFloat(payment.amount);
      data.totalAmount += amount;

      if (payment.status === PaymentStatus.COMPLETED) {
        data.completedAmount += amount;
      } else if (payment.status === PaymentStatus.PENDING) {
        data.pendingAmount += amount;
      }
    });

    // Convert map to array for the sheet
    methodGroups.forEach((data) => {
      methodStats.push([
        data.method,
        data.count,
        formatCurrency(data.totalAmount),
        formatCurrency(data.completedAmount),
        formatCurrency(data.pendingAmount),
        ((data.completedAmount / filteredRevenue) * 100).toFixed(2) + "%",
      ]);
    });

    // Method stats sheet
    const methodStatsData = [
      ["PHÂN TÍCH THEO PHƯƠNG THỨC THANH TOÁN", "", "", "", ""],
      [
        "Phương thức",
        "Số giao dịch",
        "Tổng tiền",
        "Đã thanh toán",
        "Đang xử lý",
        "Tỷ lệ (%)",
      ],
      ...methodStats,
    ];

    const methodStatsSheet = XLSX.utils.aoa_to_sheet(methodStatsData);

    // 3. Revenue by course (if multiple courses)
    const courseStats = [];
    const courseGroups = new Map();

    filteredPayments.forEach((payment) => {
      const courseId = payment.courseId;
      const courseTitle = payment.course?.title || `Course ID: ${courseId}`;

      if (!courseGroups.has(courseId)) {
        // Debug the instructor data structure
        console.log("Course data:", payment.course);

        // Try multiple paths to get instructor name
        let instructorName = "N/A";
        if (payment.course?.instructor?.fullName) {
          instructorName = payment.course.instructor.fullName;
        } else if (payment.course?.instructor?.user?.username) {
          instructorName = payment.course.instructor.user.username;
        }

        courseGroups.set(courseId, {
          title: courseTitle,
          count: 0,
          totalAmount: 0,
          completedAmount: 0,
          pendingAmount: 0,
          instructorName: instructorName,
        });
      }

      const data = courseGroups.get(courseId);
      data.count++;
      const amount = parseFloat(payment.amount);
      data.totalAmount += amount;

      if (payment.status === PaymentStatus.COMPLETED) {
        data.completedAmount += amount;
      } else if (payment.status === PaymentStatus.PENDING) {
        data.pendingAmount += amount;
      }
    });

    // Convert map to array for the sheet
    courseGroups.forEach((data) => {
      courseStats.push([
        data.title,
        data.count,
        formatCurrency(data.totalAmount),
        formatCurrency(data.completedAmount),
        formatCurrency(data.pendingAmount),
      ]);
    });

    // Course stats sheet
    const courseStatsData = [
      ["PHÂN TÍCH THEO KHÓA HỌC", "", "", "", ""],
      ["Khóa học", "Số giao dịch", "Tổng tiền", "Đã thanh toán", "Đang xử lý"],
      ...courseStats,
    ];

    const courseStatsSheet = XLSX.utils.aoa_to_sheet(courseStatsData);

    // 4. Time-based analysis for monthly trends
    const timeStats = [];
    const monthlyData = new Map();

    // Group by year-month
    filteredPayments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const yearMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData.has(yearMonth)) {
        monthlyData.set(yearMonth, {
          yearMonth,
          count: 0,
          totalAmount: 0,
          completedAmount: 0,
          pendingAmount: 0,
        });
      }

      const data = monthlyData.get(yearMonth);
      data.count++;
      const amount = parseFloat(payment.amount);
      data.totalAmount += amount;

      if (payment.status === PaymentStatus.COMPLETED) {
        data.completedAmount += amount;
      } else if (payment.status === PaymentStatus.PENDING) {
        data.pendingAmount += amount;
      }
    });

    // Sort by year-month
    const sortedMonths = [...monthlyData.keys()].sort();

    // Convert to array for the sheet
    sortedMonths.forEach((month) => {
      const data = monthlyData.get(month);
      const [year, monthNum] = month.split("-");
      timeStats.push([
        `${monthNum}/${year}`,
        data.count,
        formatCurrency(data.totalAmount),
        formatCurrency(data.completedAmount),
        formatCurrency(data.pendingAmount),
      ]);
    });

    // Time stats sheet
    const timeStatsData = [
      ["PHÂN TÍCH THEO THỜI GIAN", "", "", "", ""],
      ["Tháng/Năm", "Số giao dịch", "Tổng tiền", "Đã thanh toán", "Đang xử lý"],
      ...timeStats,
    ];

    const timeStatsSheet = XLSX.utils.aoa_to_sheet(timeStatsData);

    // 5. Detailed payment list
    const paymentListData = filteredPayments.map((payment) => ({
      ID: payment.id,
      "Học viên": payment.user?.username || "N/A",
      Email: payment.user?.email || "N/A",
      "Khóa học": payment.course?.title || "N/A",
      "Giảng viên":
        payment.course?.instructor?.fullName ||
        payment.course?.instructor?.user?.username ||
        "N/A",
      "Số tiền": formatCurrency(payment.amount).replace("₫", "").trim(),
      "Phương thức": getMethodText(payment.paymentMethod),
      "Trạng thái": getStatusInfo(payment.status).text,
      "Mã giao dịch": payment.transactionId || "N/A",
      "Ngày tạo": formatDate(payment.createdAt),
      "Ngày thanh toán": payment.paymentDate
        ? formatDate(payment.paymentDate)
        : "N/A",
    }));

    const paymentListSheet = XLSX.utils.json_to_sheet(paymentListData);

    // Set column widths for the payment list
    const cols = [
      { wch: 5 }, // ID
      { wch: 20 }, // Học viên
      { wch: 25 }, // Email
      { wch: 30 }, // Khóa học
      { wch: 20 }, // Giảng viên
      { wch: 15 }, // Số tiền
      { wch: 15 }, // Phương thức
      { wch: 12 }, // Trạng thái
      { wch: 20 }, // Mã giao dịch
      { wch: 20 }, // Ngày tạo
      { wch: 20 }, // Ngày thanh toán
    ];

    paymentListSheet["!cols"] = cols;

    // Add all sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");
    XLSX.utils.book_append_sheet(
      workbook,
      methodStatsSheet,
      "Theo phương thức"
    );
    XLSX.utils.book_append_sheet(workbook, courseStatsSheet, "Theo khóa học");
    XLSX.utils.book_append_sheet(workbook, timeStatsSheet, "Theo thời gian");
    XLSX.utils.book_append_sheet(
      workbook,
      paymentListSheet,
      "Danh sách chi tiết"
    );

    // Generate file name
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `bao-cao-doanh-thu_${today}.xlsx`;

    // Write and download
    XLSX.writeFile(workbook, fileName);
  };

  // Add this computed value to extract unique courses and instructors (after useEffect)
  const courseOptions = useMemo(() => {
    if (!payments) return [];
    const uniqueCourses = new Map();
    payments.forEach((payment) => {
      if (payment.course) {
        uniqueCourses.set(payment.course.id, payment.course);
      }
    });
    return Array.from(uniqueCourses.values());
  }, [payments]);

  const instructorIdOptions = useMemo(() => {
    return instructors || [];
  }, [instructors]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Quản lý thanh toán
      </Typography>

      {/* Dashboard summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AttachMoney
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng doanh thu
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Receipt sx={{ fontSize: 40, color: "success.main", mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng giao dịch
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PriceCheck
                  sx={{ fontSize: 40, color: "warning.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {pendingTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chờ xử lý
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  fullWidth
                  color="primary"
                  onClick={exportToExcel}
                  disabled={filteredPayments.length === 0}
                >
                  Xuất báo cáo doanh thu ({filteredPayments.length} giao dịch)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setPage(1);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Tất cả" />
            <Tab label="Đang xử lý" />
            <Tab label="Thành công" />
            <Tab label="Thất bại / Hoàn tiền" />
          </Tabs>
        </Box>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm theo mã giao dịch, người dùng, khóa học..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setSearchQuery("");
                          setPage(1);
                        }}
                        size="small"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  disabled={tabValue !== 0}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value={PaymentStatus.PENDING}>Đang xử lý</MenuItem>
                  <MenuItem value={PaymentStatus.COMPLETED}>
                    Thành công
                  </MenuItem>
                  <MenuItem value={PaymentStatus.FAILED}>Thất bại</MenuItem>
                  <MenuItem value={PaymentStatus.REFUNDED}>
                    Đã hoàn tiền
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Phương thức</InputLabel>
                <Select
                  value={methodFilter}
                  label="Phương thức"
                  onChange={(e) => {
                    setMethodFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value={PaymentMethod.CREDIT_CARD}>
                    Thẻ tín dụng
                  </MenuItem>
                  <MenuItem value={PaymentMethod.BANK_TRANSFER}>
                    Chuyển khoản
                  </MenuItem>
                  <MenuItem value={PaymentMethod.E_WALLET}>Ví điện tử</MenuItem>
                  <MenuItem value={PaymentMethod.ZALOPAY}>ZaloPay</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Khóa học</InputLabel>
                <Select
                  value={courseIdFilter}
                  label="Khóa học"
                  onChange={(e) => {
                    setCourseIdFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {courseOptions.map((course) => (
                    <MenuItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={instructorIdFilter}
                  label="Giảng viên"
                  onChange={(e) => {
                    setInstructorIdFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {instructorIdOptions.map((instructor) => (
                    <MenuItem
                      key={instructor.id}
                      value={instructor.id.toString()}
                    >
                      {instructor.fullName ||
                        instructor.user?.username ||
                        `ID: ${instructor.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Năm</InputLabel>
                <Select
                  value={yearFilter}
                  label="Năm"
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    // Reset month when year changes
                    if (e.target.value === "all") {
                      setMonthFilter("all");
                    }
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {["2024", "2025"].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl
                fullWidth
                size="small"
                disabled={yearFilter === "all"}
              >
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={monthFilter}
                  label="Tháng"
                  onChange={(e) => {
                    setMonthFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month.toString()}>
                      Tháng {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2} textAlign="right">
              <Button
                startIcon={<FilterList />}
                onClick={() => {
                  setStatusFilter("all");
                  setMethodFilter("all");
                  setDateFilter("all");
                  setCourseIdFilter("all");
                  setInstructorIdFilter("all");
                  setYearFilter("all");
                  setMonthFilter("all");
                  setSearchQuery("");
                  setPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã giao dịch</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Khóa học</TableCell>
              <TableCell>Phương thức</TableCell>
              <TableCell>Số tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment) => {
                const statusInfo = getStatusInfo(payment.status);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="medium">
                          #{payment.id}
                        </Typography>
                        {payment.transactionId && (
                          <Tooltip title="Sao chép">
                            <IconButton
                              size="small"
                              sx={{ ml: 0.5 }}
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  payment.transactionId
                                );
                              }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {payment.transactionId || "Chưa có"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(payment.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.user?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {payment.course?.thumbnailUrl && (
                          <Avatar
                            src={payment.course.thumbnailUrl}
                            variant="rounded"
                            sx={{ width: 30, height: 30, mr: 1 }}
                          />
                        )}
                        <Typography variant="body2">
                          {payment.course?.title || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {getMethodIcon(payment.paymentMethod)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {getMethodText(payment.paymentMethod)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                      >
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusInfo.text}
                        color={statusInfo.color as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, payment)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy giao dịch nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDetail}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        {selectedPayment?.status === PaymentStatus.PENDING && (
          <>
            <MenuItem onClick={handleApprovePayment}>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Phê duyệt</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleRejectPayment}>
              <ListItemIcon>
                <Cancel fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Từ chối</ListItemText>
            </MenuItem>
          </>
        )}
        {selectedPayment?.status === PaymentStatus.COMPLETED && (
          <MenuItem onClick={handleRefundPayment}>
            <ListItemIcon>
              <LocalAtm fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText>Hoàn tiền</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Payment Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết giao dịch</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã giao dịch
                </Typography>
                <Typography variant="body1" gutterBottom>
                  #{selectedPayment.id}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Người dùng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.user?.username} (
                  {selectedPayment.user?.email})
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Ngày tạo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedPayment.createdAt)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Phương thức thanh toán
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getMethodText(selectedPayment.paymentMethod)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số tiền
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  fontWeight="bold"
                  color="primary"
                >
                  {formatCurrency(selectedPayment.amount)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusInfo(selectedPayment.status).text}
                  color={getStatusInfo(selectedPayment.status).color as any}
                  size="small"
                  sx={{ my: 1 }}
                />

                <Typography variant="subtitle2" color="text.secondary">
                  Khóa học
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.course?.title || "Không có"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Mã giao dịch bên ngoài
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.transactionId || "Chưa có"}
                </Typography>
              </Grid>
              {selectedPayment.status === PaymentStatus.PENDING && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "warning.light",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="warning.dark">
                      Giao dịch này đang chờ xử lý
                    </Typography>
                    <Typography variant="body2">
                      Bạn có thể phê duyệt hoặc từ chối giao dịch này.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
          {selectedPayment?.status === PaymentStatus.PENDING && (
            <>
              <Button
                color="error"
                onClick={() => {
                  handleRejectPayment();
                  setDetailDialogOpen(false);
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApprovePayment();
                  setDetailDialogOpen(false);
                }}
              >
                Phê duyệt
              </Button>
            </>
          )}
          {selectedPayment?.status === PaymentStatus.COMPLETED && (
            <Button
              color="info"
              onClick={() => {
                handleRefundPayment();
                setDetailDialogOpen(false);
              }}
            >
              Hoàn tiền
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPayments;
