import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
  Pagination,
  Stack,
  Tooltip,
  Avatar,
  Rating,
  Divider,
  Badge,
} from "@mui/material";
import {
  Search,
  FilterList,
  Visibility,
  Clear,
  ThumbUp,
  ThumbDown,
  Flag,
  Person,
  School,
  Message,
  Report,
} from "@mui/icons-material";

// Interface cho đánh giá
interface Review {
  id: number;
  content: string;
  rating: number;
  studentId: number;
  studentName: string;
  studentAvatar: string;
  instructorId: number;
  instructorName: string;
  courseId?: number;
  courseName?: string;
  classId?: number;
  className?: string;
  departmentId?: number;
  departmentName?: string;
  createdAt: string;
  reportCount: number; // Số lượng báo cáo về đánh giá này
  helpful: number; // Số người thấy hữu ích
  unhelpful: number; // Số người không thấy hữu ích
  studentType: "online" | "academic"; // online: học viên, academic: sinh viên
}

// Mock data cho đánh giá
const mockReviews: Review[] = Array(30)
  .fill(null)
  .map((_, index) => {
    const isAcademic = Math.random() > 0.5;
    let department = null;

    if (isAcademic) {
      department = [
        "Công nghệ thông tin",
        "Hệ thống thông tin",
        "Kỹ thuật phần mềm",
        "An toàn thông tin",
        "Khoa học máy tính",
      ][Math.floor(Math.random() * 5)];
    }

    return {
      id: index + 1,
      content: [
        "Giảng viên rất nhiệt tình và chuyên nghiệp.",
        "Bài giảng dễ hiểu, tài liệu đầy đủ.",
        "Tôi rất hài lòng với khóa học này, giảng viên giải thích rất chi tiết.",
        "Giảng viên có kiến thức sâu rộng nhưng thi thoảng nói hơi nhanh.",
        "Giảng viên rất tận tâm, luôn sẵn sàng giải đáp thắc mắc.",
        "Nội dung khóa học rất hay, giảng viên truyền đạt tốt.",
        "Giảng viên đôi khi không trả lời câu hỏi kịp thời.",
        "Khóa học rất thực tế, giảng viên có nhiều kinh nghiệm thực tế.",
        "Bài tập nhiều nhưng giảng viên hướng dẫn rất tận tình.",
        "Giảng viên thiếu kinh nghiệm thực tế, chỉ giảng dạy lý thuyết.",
      ][Math.floor(Math.random() * 10)],
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 sao
      studentId: 1000 + index,
      studentName: `${isAcademic ? "Sinh viên" : "Học viên"} ${index + 1}`,
      studentAvatar: "/src/assets/avatar.png",
      instructorId: Math.floor(Math.random() * 10) + 1,
      instructorName: `Giảng viên ${Math.floor(Math.random() * 10) + 1}`,
      courseId: isAcademic ? undefined : Math.floor(Math.random() * 10) + 1,
      courseName: isAcademic
        ? undefined
        : [
            "React & TypeScript Masterclass",
            "Node.js Advanced",
            "Full-stack Web Development",
            "Mobile App Development",
            "UI/UX Design Fundamentals",
            "Data Science with Python",
            "Machine Learning Fundamentals",
            "Cloud Computing Essentials",
            "DevOps for Beginners",
            "Blockchain Development",
          ][Math.floor(Math.random() * 10)],
      classId: isAcademic ? Math.floor(Math.random() * 10) + 1 : undefined,
      className: isAcademic
        ? [
            "CNTT-K22A",
            "CNTT-K22B",
            "HTTT-K22",
            "KTPM-K22",
            "MMT-K22",
            "ATTT-K22",
            "CNTT-K21A",
            "CNTT-K21B",
            "HTTT-K21",
            "KTPM-K21",
          ][Math.floor(Math.random() * 10)]
        : undefined,
      departmentId: isAcademic ? Math.floor(Math.random() * 5) + 1 : undefined,
      departmentName: isAcademic ? department : undefined,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      reportCount: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : 0,
      helpful: Math.floor(Math.random() * 20),
      unhelpful: Math.floor(Math.random() * 5),
      studentType: isAcademic ? "academic" : "online",
    };
  });

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Danh sách giảng viên (duy nhất)
  const instructors = Array.from(
    new Set(reviews.map((review) => review.instructorName))
  ).map((name) => ({
    id: reviews.find((r) => r.instructorName === name)?.instructorId,
    name,
  }));

  // Danh sách khoa (duy nhất)
  const departments = Array.from(
    new Set(
      reviews
        .filter((r) => r.departmentName)
        .map((review) => review.departmentName)
    )
  ).map((name) => ({
    id: reviews.find((r) => r.departmentName === name)?.departmentId,
    name,
  }));

  // Danh sách lớp (duy nhất)
  const classes = Array.from(
    new Set(
      reviews.filter((r) => r.className).map((review) => review.className)
    )
  );

  // Định dạng ngày tháng
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lọc đánh giá
  useEffect(() => {
    let filtered = [...reviews];

    // Lọc theo loại học viên
    if (typeFilter !== "all") {
      filtered = filtered.filter((review) => review.studentType === typeFilter);
    }

    // Lọc theo giảng viên
    if (instructorFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.instructorId === Number(instructorFilter)
      );
    }

    // Lọc theo khoa (chỉ áp dụng cho sinh viên trường)
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.departmentId === Number(departmentFilter)
      );
    }

    // Lọc theo lớp (chỉ áp dụng cho sinh viên trường)
    if (classFilter !== "all") {
      filtered = filtered.filter((review) => review.className === classFilter);
    }

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.content.toLowerCase().includes(query) ||
          review.studentName.toLowerCase().includes(query) ||
          review.instructorName.toLowerCase().includes(query) ||
          (review.courseName &&
            review.courseName.toLowerCase().includes(query)) ||
          (review.className && review.className.toLowerCase().includes(query))
      );
    }

    setFilteredReviews(filtered);
    setPage(1); // Reset trang khi thay đổi bộ lọc
  }, [
    reviews,
    searchQuery,
    typeFilter,
    instructorFilter,
    departmentFilter,
    classFilter,
  ]);

  // Phân trang
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredReviews.length / rowsPerPage);

  // Xem chi tiết đánh giá
  const handleViewDetail = (review: Review) => {
    setSelectedReview(review);
    setDetailDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý đánh giá
      </Typography>

      {/* Bộ lọc và tìm kiếm */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm đánh giá..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchQuery("")}
                        size="small"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại người dùng</InputLabel>
                <Select
                  value={typeFilter}
                  label="Loại người dùng"
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    if (e.target.value !== "academic") {
                      setDepartmentFilter("all");
                      setClassFilter("all");
                    }
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="online">Học viên</MenuItem>
                  <MenuItem value="academic">Sinh viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={instructorFilter}
                  label="Giảng viên"
                  onChange={(e) => setInstructorFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả giảng viên</MenuItem>
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Hiển thị bộ lọc khoa chỉ khi đã chọn loại người dùng là sinh viên */}
            {(typeFilter === "academic" || typeFilter === "all") && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Khoa"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả khoa</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Hiển thị bộ lọc lớp chỉ khi đã chọn loại người dùng là sinh viên */}
            {(typeFilter === "academic" || typeFilter === "all") && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lớp</InputLabel>
                  <Select
                    value={classFilter}
                    label="Lớp"
                    onChange={(e) => setClassFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả lớp</MenuItem>
                    {classes.map((className) => (
                      <MenuItem key={className} value={className}>
                        {className}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setInstructorFilter("all");
                  setDepartmentFilter("all");
                  setClassFilter("all");
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hiển thị danh sách đánh giá */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người đánh giá</TableCell>
              <TableCell>Đánh giá</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Khóa học/Lớp</TableCell>
              <TableCell>Khoa</TableCell>
              <TableCell>Ngày đánh giá</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={review.studentAvatar}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                      <Typography variant="body2">
                        {review.studentName}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          review.studentType === "academic"
                            ? "Sinh viên"
                            : "Học viên"
                        }
                        color={
                          review.studentType === "academic"
                            ? "secondary"
                            : "primary"
                        }
                        variant="outlined"
                        sx={{ height: 20 }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {review.content}
                  </Typography>
                  {review.reportCount > 0 && (
                    <Chip
                      icon={<Flag fontSize="small" />}
                      label={`${review.reportCount} báo cáo`}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ mt: 0.5, height: 20 }}
                    />
                  )}
                </TableCell>
                <TableCell>{review.instructorName}</TableCell>
                <TableCell>
                  {review.courseName || review.className || "-"}
                </TableCell>
                <TableCell>{review.departmentName || "-"}</TableCell>
                <TableCell>{formatDate(review.createdAt)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetail(review)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedReviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không có đánh giá nào phù hợp với bộ lọc
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
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

      {/* Dialog chi tiết đánh giá */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người đánh giá
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", mb: 2, mt: 1 }}
                  >
                    <Avatar
                      src={selectedReview.studentAvatar}
                      sx={{ mr: 1, width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {selectedReview.studentName}
                      </Typography>
                      <Chip
                        size="small"
                        icon={
                          selectedReview.studentType === "academic" ? (
                            <School fontSize="small" />
                          ) : (
                            <Person fontSize="small" />
                          )
                        }
                        label={
                          selectedReview.studentType === "academic"
                            ? "Sinh viên"
                            : "Học viên"
                        }
                        color={
                          selectedReview.studentType === "academic"
                            ? "secondary"
                            : "primary"
                        }
                      />
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary">
                    Giảng viên được đánh giá
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedReview.instructorName}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Khóa học / Lớp học
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedReview.courseName ||
                      selectedReview.className ||
                      "-"}
                  </Typography>

                  {selectedReview.studentType === "academic" && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Khoa
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedReview.departmentName || "-"}
                      </Typography>
                    </>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian đánh giá
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedReview.createdAt)}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Đánh giá
                    </Typography>
                    <Rating
                      value={selectedReview.rating}
                      readOnly
                      sx={{ mt: 0.5 }}
                    />

                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<ThumbUp fontSize="small" />}
                        label={selectedReview.helpful}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        icon={<ThumbDown fontSize="small" />}
                        label={selectedReview.unhelpful}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                      {selectedReview.reportCount > 0 && (
                        <Chip
                          icon={<Flag fontSize="small" />}
                          label={`${selectedReview.reportCount} báo cáo`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Nội dung đánh giá
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, mb: 2, bgcolor: "background.default" }}
                  >
                    <Typography variant="body1">
                      {selectedReview.content}
                    </Typography>
                  </Paper>
                </Grid>

                {selectedReview.reportCount > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, mt: 1, bgcolor: "error.light" }}>
                      <Typography variant="subtitle2" color="error.dark">
                        <Report
                          fontSize="small"
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />
                        Đánh giá này đã bị báo cáo {selectedReview.reportCount}{" "}
                        lần
                      </Typography>
                      <Typography variant="body2" color="error.dark">
                        Vui lòng xem xét nội dung và quyết định có ẩn đánh giá
                        này hay không.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
              {selectedReview.reportCount > 0 && (
                <Button color="error" variant="outlined">
                  Ẩn đánh giá
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminReviews;
