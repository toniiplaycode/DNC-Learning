import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  Divider,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  TableSortLabel,
  Chip,
  Avatar,
  TextField,
  TablePagination,
} from "@mui/material";
import {
  TrendingUp,
  DateRange,
  CloudDownload,
  Refresh,
  ShowChart,
  PieChart,
  TableChart,
  Timeline,
  Info,
  FilterList,
  Clear,
  DownloadForOfflineOutlined,
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
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllPayments } from "../../features/payments/paymentsSlice";
import { selectAllPayments } from "../../features/payments/paymentsSelectors";
import { fetchEnrollments } from "../../features/enrollments/enrollmentsApiSlice";
import { selectAllEnrollments } from "../../features/enrollments/enrollmentsSelectors";
import * as XLSX from "xlsx";
import ChartDataLabels from "chartjs-plugin-datalabels";

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
  Legend,
  ChartDataLabels
);

// Cài đặt cho biểu đồ
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(context.parsed.y * 1000000);
          }
          return label;
        },
      },
    },
    datalabels: {
      color: "#333",
      anchor: "end",
      align: "top",
      formatter: (value, context) => {
        return value.toLocaleString();
      },
      font: {
        weight: "bold",
        size: 10,
      },
      display: function (context) {
        return context.dataset.data[context.dataIndex] > 0;
      },
    },
  },
};

const pieChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    datalabels: {
      color: "#fff",
      anchor: "center",
      align: "center",
      formatter: (value, context) => {
        const sum = context.dataset.data.reduce((a, b) => a + b, 0);
        const percentage = Math.round((value / sum) * 100);
        return percentage + "%";
      },
      font: {
        weight: "bold",
        size: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

const AdminAnalytics = () => {
  const dispatch = useAppDispatch();
  const payments = useAppSelector(selectAllPayments);
  const enrollments = useAppSelector(selectAllEnrollments);
  const [timeRange, setTimeRange] = useState("year");
  const [revenuePage, setRevenuePage] = useState(1);
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [enrollmentRowsPerPage, setEnrollmentRowsPerPage] = useState(10);
  const [revenueOrder, setRevenueOrder] = useState("desc");
  const [revenueOrderBy, setRevenueOrderBy] = useState("createdAt");
  const [enrollmentOrder, setEnrollmentOrder] = useState("desc");
  const [enrollmentOrderBy, setEnrollmentOrderBy] = useState("enrollmentDate");

  // Payment filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Enrollment filter states
  const [showEnrollmentFilters, setShowEnrollmentFilters] = useState(false);
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState("all");
  const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState("all");
  const [enrollmentDateFromFilter, setEnrollmentDateFromFilter] = useState("");
  const [enrollmentDateToFilter, setEnrollmentDateToFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllPayments());
    dispatch(fetchEnrollments());
  }, [dispatch]);

  console.log(payments);
  console.log(enrollments);

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

  // Calculate stats from real data
  const stats = useMemo(() => {
    // Default values
    const result = {
      totalStudents: 0,
      activeStudents: 0,
      totalCourses: 0,
      activeCourses: 0,
      totalInstructors: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      completionRate: 0,
      avgRating: 0,
    };

    if (!payments || !enrollments) return result;

    // Get unique students and courses
    const uniqueStudents = new Set();
    const uniqueCourses = new Set();
    const uniqueInstructors = new Set();
    const completedEnrollments = [];
    const activeEnrollments = [];

    // Process enrollments
    enrollments.forEach((enrollment) => {
      uniqueStudents.add(enrollment.userId);
      uniqueCourses.add(enrollment.courseId);
      if (enrollment.status === "completed") {
        completedEnrollments.push(enrollment);
      } else if (enrollment.status === "active") {
        activeEnrollments.push(enrollment);
      }
      if (enrollment.course?.instructorId) {
        uniqueInstructors.add(enrollment.course.instructorId);
      }
    });

    // Calculate total and monthly revenue
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const monthlyRevenue = payments
      .filter((p) => {
        const date = new Date(p.createdAt);
        return (
          p.status === "completed" &&
          date.getMonth() === thisMonth &&
          date.getFullYear() === thisYear
        );
      })
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Calculate completion rate
    const completionRate =
      enrollments.length > 0
        ? Math.round((completedEnrollments.length / enrollments.length) * 100)
        : 0;

    return {
      totalStudents: uniqueStudents.size,
      activeStudents: activeEnrollments.length,
      totalCourses: uniqueCourses.size,
      activeCourses: uniqueCourses.size, // Assuming all courses are active
      totalInstructors: uniqueInstructors.size,
      totalRevenue,
      monthlyRevenue,
      completionRate,
      avgRating: 4.3, // This would need to come from reviews data
    };
  }, [payments, enrollments]);

  // Generate revenue chart data by month
  const revenueChartData = useMemo(() => {
    const months = [
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
    ];
    const revenueByMonth = Array(12).fill(0);

    if (payments) {
      const currentYear = new Date().getFullYear();

      payments
        .filter((p) => p.status === "completed")
        .forEach((payment) => {
          const date = new Date(payment.createdAt);
          if (date.getFullYear() === currentYear) {
            const monthIndex = date.getMonth();
            revenueByMonth[monthIndex] += parseFloat(payment.amount);
          }
        });
    }

    // Convert to millions for better display
    const revenueInMillions = revenueByMonth.map((amount) => amount / 1000000);

    // Calculate trend (average change over last 3 months)
    const lastThreeMonths = revenueInMillions
      .slice(-3)
      .filter((val) => val > 0);
    const trend =
      lastThreeMonths.length > 1
        ? (lastThreeMonths[lastThreeMonths.length - 1] / lastThreeMonths[0] -
            1) *
          100
        : 0;

    // Calculate moving average
    const movingAverage = [];
    for (let i = 0; i < revenueInMillions.length; i++) {
      if (i < 2) {
        movingAverage.push(null);
      } else {
        const avg =
          (revenueInMillions[i] +
            revenueInMillions[i - 1] +
            revenueInMillions[i - 2]) /
          3;
        movingAverage.push(avg);
      }
    }

    return {
      labels: months,
      datasets: [
        {
          label: "Doanh thu (triệu đồng)",
          data: revenueInMillions,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.3,
        },
        {
          label: "Trung bình 3 tháng",
          data: movingAverage,
          borderColor: "rgb(255, 99, 132)",
          borderDash: [5, 5],
          backgroundColor: "transparent",
          tension: 0.3,
          datalabels: {
            display: false,
          },
        },
      ],
      trend: trend.toFixed(1),
    };
  }, [payments]);

  // Generate new users chart data by month
  const newUsersChartData = useMemo(() => {
    const months = [
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
    ];
    const newStudentsByMonth = Array(12).fill(0);

    if (enrollments) {
      const currentYear = new Date().getFullYear();

      enrollments.forEach((enrollment) => {
        const date = new Date(
          enrollment.enrollmentDate || enrollment.createdAt
        );
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          newStudentsByMonth[monthIndex]++;
        }
      });
    }

    return {
      labels: months,
      datasets: [
        {
          label: "Học viên mới",
          data: newStudentsByMonth,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  }, [enrollments]);

  // Generate course distribution chart
  const courseDistributionData = useMemo(() => {
    const courseData = new Map();
    const colors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
      "rgba(199, 199, 199, 0.6)",
      "rgba(83, 102, 255, 0.6)",
      "rgba(255, 99, 255, 0.6)",
      "rgba(0, 162, 186, 0.6)",
    ];

    if (enrollments) {
      // Count enrollments per course
      enrollments.forEach((enrollment) => {
        if (enrollment.course?.title) {
          const courseId = enrollment.courseId.toString();
          const courseTitle = enrollment.course.title;

          if (!courseData.has(courseId)) {
            courseData.set(courseId, {
              title: courseTitle,
              count: 0,
              revenue: 0,
            });
          }

          courseData.get(courseId).count++;
        }
      });

      // Add revenue data from payments
      if (payments) {
        payments.forEach((payment) => {
          if (payment.status === "completed" && payment.courseId) {
            const courseId = payment.courseId.toString();
            if (courseData.has(courseId)) {
              courseData.get(courseId).revenue += parseFloat(payment.amount);
            }
          }
        });
      }
    }

    // Sort by enrollment count and take top 8
    const sortedCourses = Array.from(courseData.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const labels = sortedCourses.map((course) => {
      // Truncate long titles
      return course.title.length > 20
        ? course.title.substring(0, 17) + "..."
        : course.title;
    });

    const data = sortedCourses.map((course) => course.count);
    const revenueData = sortedCourses.map((course) => course.revenue / 1000000); // In millions

    return {
      labels,
      datasets: [
        {
          label: "Số lượng học viên",
          data,
          backgroundColor: colors.slice(0, labels.length),
        },
      ],
      courseDetails: sortedCourses.map((course, index) => ({
        title: course.title,
        count: course.count,
        revenue: course.revenue,
        color: colors[index % colors.length],
      })),
    };
  }, [enrollments, payments]);

  // Generate completion rate chart
  const completionRateData = useMemo(() => {
    const completed =
      enrollments?.filter((e) => e.status === "completed").length || 0;
    const active =
      enrollments?.filter((e) => e.status === "active").length || 0;
    const inactive =
      enrollments?.filter(
        (e) => e.status !== "completed" && e.status !== "active"
      ).length || 0;
    const total = completed + active + inactive;

    const completionPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
    const inactivePercentage =
      total > 0 ? Math.round((inactive / total) * 100) : 0;

    return {
      labels: [
        `Hoàn thành (${completionPercentage}%)`,
        `Đang học (${activePercentage}%)`,
        `Bỏ dở (${inactivePercentage}%)`,
      ],
      datasets: [
        {
          label: "Số học viên",
          data: [completed, active, inactive],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
        },
      ],
      stats: {
        total,
        completionPercentage,
        activePercentage,
        inactivePercentage,
      },
    };
  }, [enrollments]);

  // Add these helper functions
  const resetFilters = () => {
    setStatusFilter("all");
    setMethodFilter("all");
    setCourseFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setRevenuePage(0);
  };

  const resetEnrollmentFilters = () => {
    setEnrollmentStatusFilter("all");
    setEnrollmentCourseFilter("all");
    setEnrollmentDateFromFilter("");
    setEnrollmentDateToFilter("");
    setEnrollmentPage(0);
  };

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

  // Add pagination handler functions
  const handleChangePage = (event, newPage) => {
    setRevenuePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setRevenuePage(0);
  };

  const handleEnrollmentChangePage = (event, newPage) => {
    setEnrollmentPage(newPage);
  };

  const handleEnrollmentChangeRowsPerPage = (event) => {
    setEnrollmentRowsPerPage(parseInt(event.target.value, 10));
    setEnrollmentPage(0);
  };

  // Add filter logic
  const filteredPayments = useMemo(() => {
    if (!payments) return [];

    return payments.filter((payment) => {
      // Filter by status
      if (statusFilter !== "all" && payment.status !== statusFilter) {
        return false;
      }

      // Filter by payment method
      if (methodFilter !== "all" && payment.paymentMethod !== methodFilter) {
        return false;
      }

      // Filter by course
      if (
        courseFilter !== "all" &&
        payment.courseId.toString() !== courseFilter
      ) {
        return false;
      }

      // Filter by date range
      if (dateFromFilter) {
        const paymentDate = new Date(payment.createdAt);
        const fromDate = new Date(dateFromFilter);
        if (paymentDate < fromDate) {
          return false;
        }
      }

      if (dateToFilter) {
        const paymentDate = new Date(payment.createdAt);
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        if (paymentDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [
    payments,
    statusFilter,
    methodFilter,
    courseFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  const filteredEnrollments = useMemo(() => {
    if (!enrollments) return [];

    return enrollments.filter((enrollment) => {
      // Filter by status
      if (
        enrollmentStatusFilter !== "all" &&
        enrollment.status !== enrollmentStatusFilter
      ) {
        return false;
      }

      // Filter by course
      if (
        enrollmentCourseFilter !== "all" &&
        enrollment.courseId.toString() !== enrollmentCourseFilter
      ) {
        return false;
      }

      // Filter by date range
      const enrollmentDate = new Date(
        enrollment.enrollmentDate || enrollment.createdAt
      );

      if (enrollmentDateFromFilter) {
        const fromDate = new Date(enrollmentDateFromFilter);
        if (enrollmentDate < fromDate) {
          return false;
        }
      }

      if (enrollmentDateToFilter) {
        const toDate = new Date(enrollmentDateToFilter);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        if (enrollmentDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [
    enrollments,
    enrollmentStatusFilter,
    enrollmentCourseFilter,
    enrollmentDateFromFilter,
    enrollmentDateToFilter,
  ]);

  // Enhanced Excel export function for payments
  const exportPaymentsToExcel = () => {
    if (filteredPayments.length === 0) return;

    const workbook = XLSX.utils.book_new();

    // Payment data for export
    const paymentData = filteredPayments.map((payment) => ({
      ID: payment.id,
      "Học viên": payment.user?.username || "N/A",
      Email: payment.user?.email || "N/A",
      "Khóa học": payment.course?.title || "N/A",
      "Trạng thái": getStatusLabel(payment.status),
      "Phương thức":
        payment.paymentMethod === "zalopay"
          ? "ZaloPay"
          : payment.paymentMethod === "e_wallet"
          ? "Ví điện tử"
          : payment.paymentMethod === "bank_transfer"
          ? "Chuyển khoản"
          : "Thẻ tín dụng",
      "Số tiền": parseFloat(payment.amount),
      "Ngày tạo": new Date(payment.createdAt).toLocaleDateString("vi-VN"),
    }));

    // Summary data
    const totalAmount = filteredPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const completedAmount = filteredPayments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const pendingAmount = filteredPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const summaryData = [
      ["BÁO CÁO THANH TOÁN", ""],
      ["Ngày xuất báo cáo:", new Date().toLocaleDateString("vi-VN")],
      ["Tổng số giao dịch:", filteredPayments.length.toString()],
      ["Tổng số tiền:", formatCurrency(totalAmount)],
      ["Số tiền đã xác nhận:", formatCurrency(completedAmount)],
      ["Số tiền đang xử lý:", formatCurrency(pendingAmount)],
    ];

    // Add filter information
    if (statusFilter !== "all") {
      summaryData.push(["Lọc theo trạng thái:", getStatusLabel(statusFilter)]);
    }

    if (methodFilter !== "all") {
      const methodLabel =
        methodFilter === "zalopay"
          ? "ZaloPay"
          : methodFilter === "e_wallet"
          ? "Ví điện tử"
          : methodFilter === "bank_transfer"
          ? "Chuyển khoản"
          : "Thẻ tín dụng";
      summaryData.push(["Lọc theo phương thức:", methodLabel]);
    }

    if (courseFilter !== "all") {
      const courseName =
        payments.find((p) => p.courseId.toString() === courseFilter)?.course
          ?.title || courseFilter;
      summaryData.push(["Lọc theo khóa học:", courseName]);
    }

    if (dateFromFilter || dateToFilter) {
      summaryData.push([
        "Khoảng thời gian:",
        `${dateFromFilter || "N/A"} - ${dateToFilter || "N/A"}`,
      ]);
    }

    // Create sheets
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const dataSheet = XLSX.utils.json_to_sheet(paymentData);

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Dữ liệu chi tiết");

    // Export
    XLSX.writeFile(
      workbook,
      `bao-cao-thanh-toan-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Enhanced Excel export function for enrollments
  const exportEnrollmentsToExcel = () => {
    if (filteredEnrollments.length === 0) return;

    const workbook = XLSX.utils.book_new();

    // Enrollment data for export
    const enrollmentData = filteredEnrollments.map((enrollment) => ({
      ID: enrollment.id,
      "Học viên": enrollment.user?.username || "N/A",
      Email: enrollment.user?.email || "N/A",
      "Khóa học": enrollment.course?.title || "N/A",
      "Trạng thái":
        enrollment.status === "completed"
          ? "Hoàn thành"
          : enrollment.status === "active"
          ? "Đang học"
          : "Không hoạt động",
      "Ngày đăng ký": new Date(
        enrollment.enrollmentDate || enrollment.createdAt
      ).toLocaleDateString("vi-VN"),
      "Ngày hoàn thành": enrollment.completionDate
        ? new Date(enrollment.completionDate).toLocaleDateString("vi-VN")
        : "N/A",
    }));

    // Summary data
    const activeCount = filteredEnrollments.filter(
      (e) => e.status === "active"
    ).length;
    const completedCount = filteredEnrollments.filter(
      (e) => e.status === "completed"
    ).length;
    const inactiveCount = filteredEnrollments.filter(
      (e) => e.status !== "active" && e.status !== "completed"
    ).length;

    const summaryData = [
      ["BÁO CÁO ĐĂNG KÝ KHÓA HỌC", ""],
      ["Ngày xuất báo cáo:", new Date().toLocaleDateString("vi-VN")],
      ["Tổng số đăng ký:", filteredEnrollments.length.toString()],
      ["Số đang học:", activeCount.toString()],
      ["Số đã hoàn thành:", completedCount.toString()],
      ["Số không hoạt động:", inactiveCount.toString()],
    ];

    // Add filter information
    if (enrollmentStatusFilter !== "all") {
      const statusLabel =
        enrollmentStatusFilter === "completed"
          ? "Hoàn thành"
          : enrollmentStatusFilter === "active"
          ? "Đang học"
          : "Không hoạt động";
      summaryData.push(["Lọc theo trạng thái:", statusLabel]);
    }

    if (enrollmentCourseFilter !== "all") {
      const courseName =
        enrollments.find(
          (e) => e.courseId.toString() === enrollmentCourseFilter
        )?.course?.title || enrollmentCourseFilter;
      summaryData.push(["Lọc theo khóa học:", courseName]);
    }

    if (enrollmentDateFromFilter || enrollmentDateToFilter) {
      summaryData.push([
        "Khoảng thời gian:",
        `${enrollmentDateFromFilter || "N/A"} - ${
          enrollmentDateToFilter || "N/A"
        }`,
      ]);
    }

    // Create sheets
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const dataSheet = XLSX.utils.json_to_sheet(enrollmentData);

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Dữ liệu chi tiết");

    // Export
    XLSX.writeFile(
      workbook,
      `bao-cao-dang-ky-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Replace the courses data for filtering purposes
  const courseOptions = useMemo(() => {
    if (!payments || !enrollments) return [];

    const coursesMap = new Map();

    // Get courses from payments
    payments.forEach((payment) => {
      if (payment.course) {
        coursesMap.set(payment.courseId.toString(), {
          id: payment.courseId,
          title: payment.course.title,
        });
      }
    });

    // Get courses from enrollments
    enrollments.forEach((enrollment) => {
      if (enrollment.course) {
        coursesMap.set(enrollment.courseId.toString(), {
          id: enrollment.courseId,
          title: enrollment.course.title,
        });
      }
    });

    return Array.from(coursesMap.values());
  }, [payments, enrollments]);

  // Add these functions for sorting
  const handleRequestSort = (table, property) => {
    const isAsc =
      (table === "revenue" ? revenueOrderBy : enrollmentOrderBy) === property &&
      (table === "revenue" ? revenueOrder : enrollmentOrder) === "asc";

    if (table === "revenue") {
      setRevenueOrder(isAsc ? "desc" : "asc");
      setRevenueOrderBy(property);
    } else {
      setEnrollmentOrder(isAsc ? "desc" : "asc");
      setEnrollmentOrderBy(property);
    }
  };

  // Add these functions to format date display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Add function to sort and paginate data
  const sortData = (data, orderBy, order) => {
    return [...data].sort((a, b) => {
      // Handle sorting based on property and order
      let valueA = a[orderBy];
      let valueB = b[orderBy];

      // Convert to date for date fields
      if (orderBy.includes("Date") || orderBy === "createdAt") {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      }

      // Convert to number for numeric fields
      if (typeof valueA === "string" && !isNaN(Number(valueA))) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }

      // Compare values
      if (valueB < valueA) {
        return order === "asc" ? 1 : -1;
      }
      if (valueB > valueA) {
        return order === "asc" ? -1 : 1;
      }
      return 0;
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={4} gutterBottom>
          Phân tích & Báo cáo
        </Typography>
      </Box>

      {/* Thẻ thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng học viên
              </Typography>
              <Typography variant="h4">
                {stats.totalStudents.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                {stats.activeStudents} đang hoạt động
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
              <Typography variant="h4">{stats.totalCourses}</Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                {stats.activeCourses} khóa đang hoạt động
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
                {formatCurrency(stats.totalRevenue).replace(/₫/g, "")}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                {formatCurrency(stats.monthlyRevenue).replace(/₫/g, "")} tháng
                này
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
                {formatPercent(stats.completionRate)}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Đánh giá trung bình: {stats.avgRating.toFixed(1)}/5
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
                <Typography variant="h6">Doanh thu theo thời gian</Typography>
                <Tooltip title="Biểu đồ hiển thị doanh thu trong 12 tháng gần nhất">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300, position: "relative" }}>
                <Line data={revenueChartData} options={chartOptions} />
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "rgba(255,255,255,0.8)",
                    p: 1,
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    Xu hướng:{" "}
                    {Number(revenueChartData.trend) > 0 ? (
                      <span style={{ color: "green" }}>
                        +{revenueChartData.trend}%
                      </span>
                    ) : (
                      <span style={{ color: "red" }}>
                        {revenueChartData.trend}%
                      </span>
                    )}
                  </Typography>
                </Box>
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
                <Typography variant="h6">
                  Top khóa học theo số lượng học viên
                </Typography>
                <Tooltip title="Biểu đồ hiển thị các khóa học có nhiều học viên tham gia nhất">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 260 }}>
                <Doughnut
                  data={courseDistributionData}
                  options={{
                    ...pieChartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                      ...pieChartOptions.plugins,
                      datalabels: {
                        ...pieChartOptions.plugins.datalabels,
                        display: false, // Hide datalabels since we'll show custom legend
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ mt: 2, maxHeight: 150, overflow: "auto" }}>
                {courseDistributionData.courseDetails?.map((course, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: course.color,
                        mr: 1,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ flex: 1, mr: 1 }}
                      noWrap
                      title={course.title}
                    >
                      {course.title}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {course.count} học viên
                    </Typography>
                  </Box>
                ))}
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
                <Typography variant="h6">Người dùng mới theo tháng</Typography>
                <Tooltip title="Biểu đồ hiển thị số lượng học viên mới đăng ký trong 12 tháng gần nhất">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar data={newUsersChartData} options={chartOptions} />
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
                <Typography variant="h6">Tỷ lệ hoàn thành khóa học</Typography>
                <Tooltip title="Biểu đồ hiển thị tỷ lệ học viên hoàn thành, đang học và bỏ dở khóa học">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300, position: "relative" }}>
                <Pie data={completionRateData} options={pieChartOptions} />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    Tổng số: {completionRateData.stats.total} học viên
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lịch sử giao dịch
              </Typography>

              {/* Filter controls */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
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
                      courseOptions.find(
                        (c) => c.id.toString() === courseFilter
                      )?.title || courseFilter
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
                  onClick={exportPaymentsToExcel}
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
                        {courseOptions.map((course) => (
                          <MenuItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.title}
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

              {/* Table content */}
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={revenueOrderBy === "createdAt"}
                          direction={
                            revenueOrderBy === "createdAt"
                              ? revenueOrder
                              : "asc"
                          }
                          onClick={() =>
                            handleRequestSort("revenue", "createdAt")
                          }
                        >
                          Ngày
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Học viên</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={revenueOrderBy === "course.title"}
                          direction={
                            revenueOrderBy === "course.title"
                              ? revenueOrder
                              : "asc"
                          }
                          onClick={() =>
                            handleRequestSort("revenue", "course.title")
                          }
                        >
                          Khóa học
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Phương thức</TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={revenueOrderBy === "amount"}
                          direction={
                            revenueOrderBy === "amount" ? revenueOrder : "asc"
                          }
                          onClick={() => handleRequestSort("revenue", "amount")}
                        >
                          Số tiền
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      sortData(filteredPayments, revenueOrderBy, revenueOrder)
                        .slice(
                          revenuePage * rowsPerPage,
                          revenuePage * rowsPerPage + rowsPerPage
                        )
                        .map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {formatDate(payment.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography variant="body2">
                                  {payment.user?.username || "N/A"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {payment.user?.email || "N/A"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {payment.course?.thumbnailUrl && (
                                  <Avatar
                                    src={payment.course.thumbnailUrl}
                                    variant="rounded"
                                    sx={{ width: 30, height: 30, mr: 1 }}
                                  />
                                )}
                                <Typography variant="body2">
                                  {payment.course?.title || "N/A"}
                                </Typography>
                              </Box>
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
                            <TableCell align="right">
                              {formatCurrency(parseFloat(payment.amount))}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(payment.status)}
                                color={getStatusColor(payment.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Chưa có dữ liệu giao dịch
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Replace Pagination with TablePagination */}
              {filteredPayments.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredPayments.length}
                  rowsPerPage={rowsPerPage}
                  page={revenuePage}
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
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tham gia khóa học
              </Typography>

              {/* Filter controls */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Button
                  startIcon={<FilterList />}
                  size="small"
                  onClick={() =>
                    setShowEnrollmentFilters(!showEnrollmentFilters)
                  }
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

                {enrollmentCourseFilter !== "all" && (
                  <Chip
                    label={`Khóa học: ${
                      courseOptions.find(
                        (c) => c.id.toString() === enrollmentCourseFilter
                      )?.title || enrollmentCourseFilter
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
                        onChange={(e) =>
                          setEnrollmentStatusFilter(e.target.value)
                        }
                        label="Trạng thái"
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="active">Đang học</MenuItem>
                        <MenuItem value="completed">Đã hoàn thành</MenuItem>
                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Khóa học</InputLabel>
                      <Select
                        value={enrollmentCourseFilter}
                        onChange={(e) =>
                          setEnrollmentCourseFilter(e.target.value)
                        }
                        label="Khóa học"
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        {courseOptions.map((course) => (
                          <MenuItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.title}
                          </MenuItem>
                        ))}
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
                        onChange={(e) =>
                          setEnrollmentDateToFilter(e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {/* Table content */}
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={enrollmentOrderBy === "enrollmentDate"}
                          direction={
                            enrollmentOrderBy === "enrollmentDate"
                              ? enrollmentOrder
                              : "asc"
                          }
                          onClick={() =>
                            handleRequestSort("enrollment", "enrollmentDate")
                          }
                        >
                          Ngày đăng ký
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Học viên</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={enrollmentOrderBy === "course.title"}
                          direction={
                            enrollmentOrderBy === "course.title"
                              ? enrollmentOrder
                              : "asc"
                          }
                          onClick={() =>
                            handleRequestSort("enrollment", "course.title")
                          }
                        >
                          Khóa học
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={enrollmentOrderBy === "status"}
                          direction={
                            enrollmentOrderBy === "status"
                              ? enrollmentOrder
                              : "asc"
                          }
                          onClick={() =>
                            handleRequestSort("enrollment", "status")
                          }
                        >
                          Trạng thái
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Hoàn thành</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEnrollments.length > 0 ? (
                      sortData(
                        filteredEnrollments,
                        enrollmentOrderBy,
                        enrollmentOrder
                      )
                        .slice(
                          enrollmentPage * enrollmentRowsPerPage,
                          enrollmentPage * enrollmentRowsPerPage +
                            enrollmentRowsPerPage
                        )
                        .map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              {formatDate(
                                enrollment.enrollmentDate ||
                                  enrollment.createdAt
                              )}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography variant="body2">
                                  {enrollment.user?.username || "N/A"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {enrollment.user?.email || "N/A"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {enrollment.course?.thumbnailUrl && (
                                  <Avatar
                                    src={enrollment.course.thumbnailUrl}
                                    variant="rounded"
                                    sx={{ width: 30, height: 30, mr: 1 }}
                                  />
                                )}
                                <Typography variant="body2">
                                  {enrollment.course?.title || "N/A"}
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
                                    : "Không hoạt động"
                                }
                                color={
                                  enrollment.status === "active"
                                    ? "primary"
                                    : enrollment.status === "completed"
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {formatDate(enrollment.completionDate)}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Chưa có dữ liệu đăng ký
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Replace Pagination with TablePagination */}
              {filteredEnrollments.length > 0 && (
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
