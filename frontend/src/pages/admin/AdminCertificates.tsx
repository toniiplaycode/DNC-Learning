import React, { useEffect, useState } from "react";
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
  Tooltip,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Block,
  CheckCircle,
  EmojiEvents,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  deleteCertificate,
  createMultipleCertificates,
  updateCertificate,
  fetchCertificates,
} from "../../features/certificates/certificatesApiSlice";
import { selectAllCertificates } from "../../features/certificates/certificatesSelectors";
import { Certificate, CertificateStatus } from "../../types/certificate.types";
import { toast } from "react-toastify";
import { fetchAllUsersCourseProgress } from "../../features/course-progress/courseProgressSlice";
import { selectAllUsersCourseProgress } from "../../features/course-progress/courseProgressSelectors";
import EmptyState from "../../components/common/EmptyState";

interface CourseProgress {
  userId: number;
  studentId: string;
  userName: string;
  fullName: string;
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  isCompleted: boolean;
}

const AdminCertificates: React.FC = () => {
  const dispatch = useAppDispatch();
  const certificates = useAppSelector(selectAllCertificates);
  const allUsersCourseProgress = useAppSelector(selectAllUsersCourseProgress);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<number | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<CertificateStatus | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState<string>("");

  useEffect(() => {
    dispatch(fetchCertificates());
    dispatch(fetchAllUsersCourseProgress());
  }, [dispatch]);

  // Xử lý chuyển tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setCourseFilter("all");
    setSelectedCertificate(null);
  };

  // Lọc danh sách chứng chỉ
  const filteredCertificates = certificates.filter((certificate) => {
    // Lọc theo trạng thái
    if (statusFilter !== "all" && certificate.status !== statusFilter)
      return false;

    // Lọc theo khóa học
    if (courseFilter !== "all") {
      const selectedCourseId = Number(courseFilter);
      const certificateCourseId = Number(certificate.courseId);
      if (certificateCourseId !== selectedCourseId) {
        return false;
      }
    }

    // Lọc theo tìm kiếm
    if (
      searchQuery &&
      !certificate.certificateNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !certificate.user?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !certificate.course?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  // Phân trang
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredCertificates.length / rowsPerPage);
  const paginatedCertificates = filteredCertificates.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Xử lý menu thao tác
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedCertificate(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Xử lý xem chi tiết
  const handleViewDetails = () => {
    setOpenDetailDialog(true);
    handleMenuClose();
  };

  // Xử lý xóa chứng chỉ
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCertificate) return;

    try {
      await dispatch(deleteCertificate(selectedCertificate)).unwrap();
      setSelectedCertificate(null);
      toast.success("Xóa chứng chỉ thành công");
    } catch (error: any) {
      toast.error(error);
    }

    setOpenDeleteDialog(false);
  };

  // Xử lý thu hồi chứng chỉ
  const handleRevokeClick = () => {
    setOpenRevokeDialog(true);
    handleMenuClose();
  };

  const handleRevokeConfirm = async () => {
    if (!selectedCertificate) return;

    try {
      await dispatch(
        updateCertificate({
          id: selectedCertificate,
          data: { status: CertificateStatus.REVOKED },
        })
      ).unwrap();
      setSelectedCertificate(null);
      toast.success("Thu hồi chứng chỉ thành công");
    } catch (error: any) {
      toast.error(error);
    }

    setOpenRevokeDialog(false);
  };

  // Lấy thông tin chứng chỉ đang chọn
  const getSelectedCertificate = (): Certificate | undefined => {
    return certificates.find((c) => c.id === selectedCertificate);
  };

  // Format date helper
  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "Không có thông tin";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Thêm hàm helper để lấy thông tin trạng thái
  const getStatusInfo = (status: CertificateStatus | undefined) => {
    if (!status) return { label: "Không xác định", color: "default" as const };

    switch (status) {
      case CertificateStatus.ACTIVE:
        return { label: "Còn hiệu lực", color: "success" as const };
      case CertificateStatus.EXPIRED:
        return { label: "Hết hạn", color: "warning" as const };
      case CertificateStatus.REVOKED:
        return { label: "Đã thu hồi", color: "error" as const };
      default:
        return { label: "Không xác định", color: "default" as const };
    }
  };

  // Thêm hàm helper để lấy thông tin dialog xác nhận
  const getStatusDialogInfo = (status: CertificateStatus) => {
    switch (status) {
      case CertificateStatus.REVOKED:
        return {
          title: "Xác nhận thu hồi chứng chỉ",
          message: "Bạn có chắc chắn muốn thu hồi chứng chỉ này không?",
          confirmText: "Thu hồi",
          color: "error" as const,
        };
      case CertificateStatus.ACTIVE:
        return {
          title: "Xác nhận kích hoạt chứng chỉ",
          message: "Bạn có chắc chắn muốn kích hoạt lại chứng chỉ này không?",
          confirmText: "Kích hoạt",
          color: "success" as const,
        };
      default:
        return {
          title: "Xác nhận thay đổi trạng thái",
          message:
            "Bạn có chắc chắn muốn thay đổi trạng thái chứng chỉ này không?",
          confirmText: "Xác nhận",
          color: "primary" as const,
        };
    }
  };

  // Thêm hàm xử lý thay đổi trạng thái
  const handleStatusChange = async () => {
    if (!selectedCertificate || !newStatus) return;

    try {
      await dispatch(
        updateCertificate({
          id: selectedCertificate,
          data: { status: newStatus },
        })
      ).unwrap();
      setOpenStatusDialog(false);
      setNewStatus(null);
      toast.success(`Cập nhật trạng thái chứng chỉ thành công`);
      dispatch(fetchCertificates());
    } catch (error: any) {
      toast.error(error);
    }

    handleMenuClose();
  };

  const eligibleForCertificate = allUsersCourseProgress.filter(
    (progress) => progress.completionPercentage === 100 || progress.isCompleted
  );

  const eligibleForSelectedCourse = eligibleForCertificate.filter(
    (item) => item.courseId === Number(selectedCourseId)
  );

  const handleCreateCertificates = async () => {
    await dispatch(
      createMultipleCertificates({
        userIds: selectedUserIds.map(Number),
        courseId: Number(selectedCourseId),
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      })
    ).unwrap();
    dispatch(fetchCertificates());
    toast.success("Tạo chứng chỉ thành công");
    setOpenCreateDialog(false);
    setSelectedUserIds([]);
    setSelectedCourseId("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setExpiryDate("");
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={"bold"} gutterBottom>
        Quản lý chứng chỉ
      </Typography>

      <Card>
        <CardContent>
          {/* Thanh công cụ */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Tìm kiếm */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo số chứng chỉ, tên học viên, khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Bộ lọc */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value={CertificateStatus.ACTIVE}>
                      Còn hiệu lực
                    </MenuItem>
                    <MenuItem value={CertificateStatus.EXPIRED}>
                      Hết hạn
                    </MenuItem>
                    <MenuItem value={CertificateStatus.REVOKED}>
                      Đã thu hồi
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    label="Khóa học"
                  >
                    <MenuItem value="all">Tất cả khóa học</MenuItem>
                    {Array.from(
                      new Set(certificates.map((cert) => cert.courseId))
                    ).map((courseId) => {
                      const course = certificates.find(
                        (cert) => cert.courseId === courseId
                      )?.course;
                      return (
                        <MenuItem key={courseId} value={courseId}>
                          {course?.title || `Khóa học ${courseId}`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenCreateDialog(true)}
                >
                  Tạo chứng chỉ
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bảng chứng chỉ */}
          <TableContainer component={Paper}>
            {paginatedCertificates.length > 0 ? (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Số chứng chỉ</TableCell>
                    <TableCell>Học viên</TableCell>
                    <TableCell>Khóa học</TableCell>
                    <TableCell>Ngày cấp</TableCell>
                    <TableCell>Ngày hết hạn</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell>{certificate.certificateNumber}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={certificate.user?.avatarUrl}
                            sx={{ mr: 2 }}
                          />
                          {certificate.user?.fullName ||
                            certificate.user?.username}
                        </Box>
                      </TableCell>
                      <TableCell>{certificate.course?.title}</TableCell>
                      <TableCell>{formatDate(certificate.issueDate)}</TableCell>
                      <TableCell>
                        {certificate.expiryDate
                          ? formatDate(certificate.expiryDate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {certificate.status ? (
                          <Chip
                            label={getStatusInfo(certificate.status).label}
                            color={getStatusInfo(certificate.status).color}
                            size="small"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, certificate.id)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={<EmojiEvents />}
                title="Chưa có chứng chỉ nào"
                description={
                  filteredCertificates.length === 0 && certificates.length > 0
                    ? "Không tìm thấy chứng chỉ phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                    : "Hệ thống chưa có chứng chỉ nào được tạo. Hãy tạo chứng chỉ đầu tiên cho học viên đã hoàn thành khóa học."
                }
                height={320}
              />
            )}
          </TableContainer>

          {/* Phân trang */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Menu thao tác */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xem chi tiết" />
        </MenuItem>

        {/* Chứng chỉ còn hiệu lực */}
        {getSelectedCertificate()?.status === CertificateStatus.ACTIVE && (
          <MenuItem
            onClick={() => {
              setNewStatus(CertificateStatus.REVOKED);
              setOpenStatusDialog(true);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <Block fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Thu hồi chứng chỉ" />
          </MenuItem>
        )}

        {/* Chứng chỉ đã thu hồi */}
        {getSelectedCertificate()?.status === CertificateStatus.REVOKED && (
          <MenuItem
            onClick={() => {
              setNewStatus(CertificateStatus.ACTIVE);
              setOpenStatusDialog(true);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Kích hoạt lại" />
          </MenuItem>
        )}

        {/* Chứng chỉ hết hạn */}
        {getSelectedCertificate()?.status === CertificateStatus.EXPIRED && (
          <MenuItem
            onClick={() => {
              setNewStatus(CertificateStatus.ACTIVE);
              setOpenStatusDialog(true);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Kích hoạt lại" />
          </MenuItem>
        )}

        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Xóa" />
        </MenuItem>
      </Menu>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa chứng chỉ này? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận thay đổi trạng thái */}
      <Dialog
        open={openStatusDialog}
        onClose={() => {
          setOpenStatusDialog(false);
          setNewStatus(null);
        }}
      >
        {newStatus && (
          <>
            <DialogTitle>{getStatusDialogInfo(newStatus).title}</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                {getStatusDialogInfo(newStatus).message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenStatusDialog(false);
                  setNewStatus(null);
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleStatusChange}
                color={getStatusDialogInfo(newStatus).color}
                autoFocus
              >
                {getStatusDialogInfo(newStatus).confirmText}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thông tin chi tiết chứng chỉ</DialogTitle>
        <DialogContent>
          {getSelectedCertificate() && (
            <Box>
              {/* Thông tin cơ bản */}
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số chứng chỉ
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.certificateNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={
                      getStatusInfo(getSelectedCertificate()?.status).label
                    }
                    color={
                      getStatusInfo(getSelectedCertificate()?.status).color
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày cấp
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(getSelectedCertificate()?.issueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày hết hạn
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.expiryDate
                      ? formatDate(getSelectedCertificate()?.expiryDate)
                      : "Không có"}
                  </Typography>
                </Grid>
              </Grid>

              {/* Thông tin học viên */}
              <Typography variant="h6" gutterBottom>
                Thông tin học viên
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.user?.username}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.user?.email}
                  </Typography>
                </Grid>
              </Grid>

              {/* Thông tin khóa học */}
              <Typography variant="h6" gutterBottom>
                Thông tin khóa học
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên khóa học
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.course?.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Danh mục
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.course?.category?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trình độ
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedCertificate()?.course?.level === "beginner"
                      ? "Cơ bản"
                      : getSelectedCertificate()?.course?.level ===
                        "intermediate"
                      ? "Trung cấp"
                      : "Nâng cao"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo chứng chỉ */}
      <Dialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setSelectedUserIds([]);
          setSelectedCourseId("");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo chứng chỉ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Khóa học</InputLabel>
                <Select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  label="Khóa học"
                  displayEmpty
                >
                  {Array.from(
                    new Set(
                      allUsersCourseProgress
                        .filter((progress) => progress.completionPercentage > 0) // Chỉ lấy các khóa có học viên đang học
                        .map((item) => item.courseId)
                    )
                  ).map((courseId) => {
                    const course = allUsersCourseProgress.find(
                      (item) => item.courseId === courseId
                    );
                    // Tính số học viên đã hoàn thành khóa học
                    const completedStudents = allUsersCourseProgress.filter(
                      (item) =>
                        item.courseId === courseId &&
                        item.completionPercentage === 100
                    ).length;
                    // Tính tổng số học viên đang học khóa học
                    const totalStudents = allUsersCourseProgress.filter(
                      (item) => item.courseId === courseId
                    ).length;

                    return (
                      <MenuItem key={courseId} value={courseId}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography>{course?.courseTitle}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {completedStudents}/{totalStudents} học viên hoàn
                            thành
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Học viên</InputLabel>
                <Select
                  multiple
                  value={selectedUserIds}
                  onChange={(e) => {
                    const value = e.target.value as string[];
                    setSelectedUserIds(value);
                  }}
                  label="Học viên"
                  renderValue={(selected) => {
                    const selectedStudents = allUsersCourseProgress
                      .filter(
                        (item) =>
                          selected.includes(item.userId) &&
                          item.courseId === selectedCourseId
                      )
                      .map((item) => `${item.fullName} (${item.studentId})`);
                    return selectedStudents.join(", ");
                  }}
                >
                  {allUsersCourseProgress
                    .filter((item) => item.courseId === selectedCourseId)
                    .map((item) => {
                      // Kiểm tra xem học viên đã có chứng chỉ cho khóa học này chưa
                      const alreadyHasCertificate = certificates.some(
                        (cert) =>
                          String(cert.userId) === String(item.userId) &&
                          String(cert.courseId) === String(selectedCourseId)
                      );

                      return (
                        <MenuItem
                          key={item.userId}
                          value={item.userId}
                          disabled={
                            item.completionPercentage < 100 ||
                            alreadyHasCertificate
                          }
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1">
                                {item.fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.studentId} - {item.userName}
                              </Typography>
                            </Box>
                            <Box sx={{ ml: 2 }}>
                              <Chip
                                label={`${item.completionPercentage}%`}
                                size="small"
                                color={
                                  item.completionPercentage === 100
                                    ? "success"
                                    : "warning"
                                }
                                sx={{ minWidth: "60px" }}
                              />
                              {alreadyHasCertificate && (
                                <Chip
                                  label="Đã có chứng chỉ"
                                  size="small"
                                  color="info"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày cấp"
                type="date"
                fullWidth
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày hết hạn"
                type="date"
                fullWidth
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: issueDate, // Không cho phép chọn ngày hết hạn trước ngày cấp
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreateDialog(false);
              setSelectedUserIds([]);
              setSelectedCourseId("");
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateCertificates}
            disabled={selectedUserIds.length === 0 || !selectedCourseId}
          >
            Tạo chứng chỉ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCertificates;
