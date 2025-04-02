import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  TextField,
  Button,
  Stack,
  Avatar,
  Grid,
  Divider,
  Paper,
  LinearProgress,
} from "@mui/material";
import { fetchReviewsByCourse } from "../../../features/reviews/reviewsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCourseReviews } from "../../../features/reviews/reviewsSelectors";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const CourseRating = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const courseReviews = useAppSelector(selectCourseReviews);
  const [rating, setRating] = useState<number | null>(0);
  const [reviewText, setReviewText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(5);

  useEffect(() => {
    if (id) {
      dispatch(fetchReviewsByCourse(Number(id)));
    }
    // Kiểm tra URL
    const currentUrl = window.location.pathname;
    setShowForm(
      currentUrl.includes("course/1/learn") || currentUrl === "/course/1/learn"
    );
  }, [dispatch, id, navigate]);

  const handleSubmitReview = () => {
    // Xử lý gửi đánh giá
    console.log("Submitting review:", { rating, reviewText });
    // Reset form
    setRating(0);
    setReviewText("");
  };

  const handleLoadMore = () => {
    setVisibleReviews((prev) => prev + 5);
  };

  const calculatePercentage = (count: number) => {
    if (courseReviews.length === 0) return 0;
    return (count / courseReviews.length) * 100;
  };

  return (
    <Box>
      {showForm && (
        <>
          <Typography variant="h6" gutterBottom>
            Đánh giá khóa học
          </Typography>
          {/* Form đánh giá */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography>Đánh giá của bạn:</Typography>
                  <Rating
                    value={rating}
                    onChange={(event, newValue) => {
                      setRating(newValue);
                    }}
                    size="large"
                  />
                  <Typography color="text.secondary">({rating} / 5)</Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Nhập đánh giá của bạn về khóa học..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={!rating || !reviewText.trim()}
                  >
                    Gửi đánh giá
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}

      {/* Danh sách đánh giá */}
      <Typography variant="h6" gutterBottom>
        Đánh giá từ học viên
      </Typography>

      <Grid container spacing={3}>
        {/* Bên trái: Hiển thị đánh giá trung bình và rating bars */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h2" color="primary" fontWeight="bold">
              {courseReviews.length > 0
                ? courseReviews[0].rating.toFixed(1)
                : "0.0"}
            </Typography>
            <Rating
              value={courseReviews.length > 0 ? courseReviews[0].rating : 0}
              precision={0.5}
              readOnly
              size="large"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {courseReviews.length} đánh giá
            </Typography>
          </Box>

          <Box sx={{ px: 2 }}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box
                key={rating}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Typography variant="body2" sx={{ mr: 1, minWidth: "30px" }}>
                  {rating}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculatePercentage(
                    courseReviews.filter((r) => r.rating === rating).length
                  )}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ ml: 1, minWidth: "40px" }}>
                  {courseReviews.filter((r) => r.rating === rating).length}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Bên phải: Hiển thị danh sách đánh giá */}
        <Grid item xs={12} md={8}>
          {courseReviews.length > 0 ? (
            <Box>
              {courseReviews.slice(0, visibleReviews).map((review, index) => (
                <Paper
                  key={review.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Avatar
                      src={review?.student?.user?.avatarUrl}
                      alt={review?.student?.fullName || "User"}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {review?.student?.fullName || "Học viên"}
                      </Typography>
                      <Rating
                        value={review.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: "auto" }}
                    >
                      {review.createdAt &&
                        formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{review?.reviewText}</Typography>
                  {index < courseReviews.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Paper>
              ))}

              {/* Nút "Xem thêm" nếu còn đánh giá chưa hiển thị */}
              {visibleReviews < courseReviews.length && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    sx={{ borderRadius: 2 }}
                  >
                    Xem thêm đánh giá
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.default",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary" align="center">
                Chưa có đánh giá nào cho khóa học này
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseRating;
