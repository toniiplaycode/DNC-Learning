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
} from "@mui/material";
import { fetchReviewsByCourse } from "../../../features/reviews/reviewsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCourseReviews } from "../../../features/reviews/reviewsSelectors";

const CourseRating = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const courseReviews = useAppSelector(selectCourseReviews);
  const [rating, setRating] = useState<number | null>(0);
  const [reviewText, setReviewText] = useState("");
  const [showForm, setShowForm] = useState(false);

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

      <Stack spacing={2}>
        {courseReviews.map((review) => (
          <Card key={review.id} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar src={review?.student?.user?.avatarUrl} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      {review?.student?.fullName}
                    </Typography>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{ ml: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: "auto" }}
                    >
                      {new Date(review?.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{review?.reviewText}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default CourseRating;
