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
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllReviews } from "../../features/reviews/reviewsSlice";
import { selectAllReviews } from "../../features/reviews/reviewsSelectors";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Interface cho đánh giá
interface Review {
  id: string;
  userStudentId: string;
  reviewType: string;
  courseId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    fullName: string;
    avatarUrl: string;
  };
  course: {
    id: string;
    title: string;
  };
}

const AdminReviews = () => {
  const dispatch = useAppDispatch();
  const reviews = useAppSelector(selectAllReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  useEffect(() => {
    let filtered = [...reviews];

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.course.title.toLowerCase().includes(query) ||
          review.student.fullName.toLowerCase().includes(query) ||
          review.reviewText.toLowerCase().includes(query)
      );
    }

    // Lọc theo đánh giá
    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    // Sắp xếp
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
    setPage(1); // Reset trang khi thay đổi bộ lọc
  }, [reviews, searchQuery, ratingFilter, sortBy]);

  // Phân trang
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const pageCount = Math.ceil(filteredReviews.length / rowsPerPage);

  // Xem chi tiết đánh giá
  const handleViewDetail = (review: Review) => {
    setSelectedReview(review);
    setDetailDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý đánh giá khóa học
      </Typography>

      {/* Bộ lọc và tìm kiếm */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm đánh giá..."
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Đánh giá</InputLabel>
                <Select
                  value={ratingFilter}
                  label="Đánh giá"
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="5">5 sao</MenuItem>
                  <MenuItem value="4">4 sao</MenuItem>
                  <MenuItem value="3">3 sao</MenuItem>
                  <MenuItem value="2">2 sao</MenuItem>
                  <MenuItem value="1">1 sao</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp"
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="oldest">Cũ nhất</MenuItem>
                  <MenuItem value="highest">Đánh giá cao nhất</MenuItem>
                  <MenuItem value="lowest">Đánh giá thấp nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hiển thị danh sách đánh giá */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Khóa học</TableCell>
              <TableCell>Học viên</TableCell>
              <TableCell>Đánh giá</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Ngày đánh giá</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {review.course.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={review.student.avatarUrl}
                      alt={review.student.fullName}
                    />
                    <Typography>{review.student.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Rating value={review.rating} readOnly />
                </TableCell>
                <TableCell>
                  <Typography>{review.reviewText}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {paginatedReviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy đánh giá nào
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
                      src={selectedReview.student.avatarUrl}
                      sx={{ mr: 1, width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {selectedReview.student.fullName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian đánh giá
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(
                      new Date(selectedReview.createdAt),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: vi,
                      }
                    )}
                  </Typography>
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
                      {selectedReview.reviewText}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminReviews;
