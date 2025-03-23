import React, { useState } from "react";
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
  DialogContentText,
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
  Event,
  Clear,
  ContentCopy,
} from "@mui/icons-material";

// Enum cho trạng thái thanh toán
enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// Enum cho phương thức thanh toán
enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  E_WALLET = "e_wallet",
  CASH = "cash",
}

// Interface cho dữ liệu thanh toán
interface Payment {
  id: string;
  userId: number;
  userName: string;
  email: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  date: string;
  courseId?: number;
  courseName?: string;
  transactionId: string;
  invoice?: string;
  description?: string;
}

// Mock data cho thanh toán
const mockPayments: Payment[] = Array(20)
  .fill(null)
  .map((_, index) => {
    const methods = [
      PaymentMethod.CREDIT_CARD,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.E_WALLET,
      PaymentMethod.CASH,
    ];
    const statuses = [
      PaymentStatus.PENDING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ];
    const courseNames = [
      "React & TypeScript Masterclass",
      "Node.js Advanced",
      "Full-stack Web Development",
      "Mobile App Development",
      "UI/UX Design Fundamentals",
    ];

    return {
      id: `P${String(index + 1).padStart(4, "0")}`,
      userId: Math.floor(Math.random() * 1000) + 1,
      userName: `Học viên ${index + 1}`,
      email: `student${index + 1}@example.com`,
      amount: Math.floor(Math.random() * 5 + 1) * 500000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      date: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      courseId: Math.floor(Math.random() * 100) + 1,
      courseName: courseNames[Math.floor(Math.random() * courseNames.length)],
      transactionId: `TXN${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`,
      invoice: Math.random() > 0.3 ? `INV-${index + 1}` : undefined,
      description: Math.random() > 0.5 ? "Thanh toán khóa học" : undefined,
    };
  });

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(payments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState<null | HTMLElement>(null);

  // Tổng doanh thu
  const totalRevenue = payments
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0);

  // Tổng số giao dịch
  const totalTransactions = payments.length;

  // Số giao dịch đang chờ xử lý
  const pendingTransactions = payments.filter(
    (p) => p.status === PaymentStatus.PENDING
  ).length;

  // Lọc thanh toán theo các bộ lọc
  React.useEffect(() => {
    let result = payments;

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
      result = result.filter((p) => p.method === methodFilter);
    }

    // Lọc theo ngày
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      result = result.filter((p) => new Date(p.date).toDateString() === today);
    } else if (dateFilter === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      result = result.filter((p) => new Date(p.date) >= lastWeek);
    } else if (dateFilter === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      result = result.filter((p) => new Date(p.date) >= lastMonth);
    }

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(query) ||
          p.userName.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.transactionId.toLowerCase().includes(query) ||
          (p.courseName && p.courseName.toLowerCase().includes(query))
      );
    }

    setFilteredPayments(result);
  }, [payments, searchQuery, statusFilter, methodFilter, dateFilter, tabValue]);

  // Tính toán phân trang
  const pageCount = Math.ceil(filteredPayments.length / rowsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Xử lý click vào menu
  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    payment: Payment
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
      setPayments(
        payments.map((p) =>
          p.id === selectedPayment.id
            ? { ...p, status: PaymentStatus.COMPLETED }
            : p
        )
      );
      setActionMenu(null);
    }
  };

  // Xử lý từ chối thanh toán
  const handleRejectPayment = () => {
    if (selectedPayment) {
      setPayments(
        payments.map((p) =>
          p.id === selectedPayment.id
            ? { ...p, status: PaymentStatus.FAILED }
            : p
        )
      );
      setActionMenu(null);
    }
  };

  // Xử lý hoàn tiền
  const handleRefundPayment = () => {
    if (selectedPayment) {
      setPayments(
        payments.map((p) =>
          p.id === selectedPayment.id
            ? { ...p, status: PaymentStatus.REFUNDED }
            : p
        )
      );
      setActionMenu(null);
    }
  };

  // Format tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Chuyển đổi trạng thái thành văn bản và màu sắc
  const getStatusInfo = (status: PaymentStatus) => {
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
  const getMethodText = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return "Thẻ tín dụng";
      case PaymentMethod.BANK_TRANSFER:
        return "Chuyển khoản";
      case PaymentMethod.E_WALLET:
        return "Ví điện tử";
      case PaymentMethod.CASH:
        return "Tiền mặt";
      default:
        return "Không xác định";
    }
  };

  // Lấy biểu tượng phương thức thanh toán
  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return <CreditCard fontSize="small" />;
      case PaymentMethod.BANK_TRANSFER:
        return <AccountBalance fontSize="small" />;
      case PaymentMethod.E_WALLET:
        return <AccountBalance fontSize="small" />;
      case PaymentMethod.CASH:
        return <LocalAtm fontSize="small" />;
      default:
        return <AttachMoney fontSize="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
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
                  variant="outlined"
                  startIcon={<Download />}
                  fullWidth
                  sx={{ mr: 1 }}
                >
                  Xuất báo cáo
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
                  <MenuItem value={PaymentMethod.CASH}>Tiền mặt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Thời gian</InputLabel>
                <Select
                  value={dateFilter}
                  label="Thời gian"
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="today">Hôm nay</MenuItem>
                  <MenuItem value="week">7 ngày qua</MenuItem>
                  <MenuItem value="month">30 ngày qua</MenuItem>
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
            {paginatedPayments.map((payment) => {
              const statusInfo = getStatusInfo(payment.status);
              return (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.id}
                      </Typography>
                      <Tooltip title="Sao chép">
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {payment.transactionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(payment.date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{payment.userName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.courseName || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getMethodIcon(payment.method)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {getMethodText(payment.method)}
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
            })}
            {paginatedPayments.length === 0 && (
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
                  {selectedPayment.id}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Người dùng
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.userName} ({selectedPayment.email})
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Ngày giao dịch
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedPayment.date)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Phương thức thanh toán
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getMethodText(selectedPayment.method)}
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
                  {selectedPayment.courseName || "Không có"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Mã giao dịch bên ngoài
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.transactionId}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Ghi chú
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.description || "Không có"}
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
