import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  createReview,
  fetchReviewsByCourse,
  updateReview,
  deleteReview,
} from "../../../features/reviews/reviewsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectCourseReviews,
  selectReviewsStatus,
} from "../../../features/reviews/reviewsSelectors";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { ReviewType } from "../../../types/review.types";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

const CourseRating = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const courseReviews = useAppSelector(selectCourseReviews);
  const [rating, setRating] = useState<number | null>(0);
  const [reviewText, setReviewText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(5);
  const currentUser = useAppSelector(selectCurrentUser);

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number | null>(0);
  const [editReviewText, setEditReviewText] = useState("");

  // State for menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  // Check if the current user has already submitted a review
  const hasUserReview = useMemo(() => {
    if (!currentUser?.userStudent?.id || !courseReviews?.length) return false;
    return courseReviews.some(
      (review) => review.userStudentId === currentUser.userStudent.id
    );
  }, [courseReviews, currentUser?.userStudent?.id]);

  useEffect(() => {
    dispatch(fetchReviewsByCourse(Number(id)));

    // We no longer need this URL check since we'll use hasUserReview instead
    // const currentUrl = window.location.pathname;
    // setShowForm(
    //   currentUrl.includes("course/1/learn") || currentUrl === "/course/1/learn"
    // );
  }, [dispatch, id, navigate]);

  // Update showForm based on whether user has already reviewed
  useEffect(() => {
    // Only show form if user hasn't already submitted a review
    setShowForm(!hasUserReview);
  }, [hasUserReview]);

  const handleSubmitReview = useCallback(() => {
    dispatch(
      createReview({
        userStudentId: Number(currentUser?.userStudent?.id),
        courseId: Number(id),
        reviewType: ReviewType.COURSE,
        rating: rating || 0,
        reviewText,
      })
    ).then(() => {
      // Fetch updated reviews after successful submission
      dispatch(fetchReviewsByCourse(Number(id)));

      // Reset form
      setRating(0);
      setReviewText("");
    });
  }, [dispatch, currentUser?.userStudent?.id, id, rating, reviewText]);

  const handleUpdateReview = useCallback(() => {
    if (editingReviewId) {
      dispatch(
        updateReview({
          id: editingReviewId,
          updateData: {
            rating: editRating || 0,
            reviewText: editReviewText,
          },
        })
      ).then(() => {
        // Only after successful update:
        // 1. Fetch the updated reviews
        dispatch(fetchReviewsByCourse(Number(id)));

        // 2. Exit edit mode
        setEditMode(false);
        setEditingReviewId(null);
        setEditRating(0);
        setEditReviewText("");
      });
    }
  }, [dispatch, editingReviewId, editRating, editReviewText, id]);

  const handleDeleteReview = () => {
    if (selectedReviewId) {
      dispatch(deleteReview(selectedReviewId));
      handleCloseMenu();
    }
  };

  const handleLoadMore = () => {
    setVisibleReviews((prev) => prev + 5);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    reviewId: number
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReviewId(reviewId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedReviewId(null);
  };

  const handleEditClick = () => {
    const reviewToEdit = courseReviews.find(
      (review) => review.id === selectedReviewId
    );
    if (reviewToEdit) {
      setEditMode(true);
      setEditingReviewId(reviewToEdit.id);
      setEditRating(reviewToEdit.rating);
      setEditReviewText(reviewToEdit.reviewText || "");
    }
    handleCloseMenu();
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingReviewId(null);
    setEditRating(0);
    setEditReviewText("");
  };

  const calculatePercentage = (count: number) => {
    if (courseReviews.length === 0) return 0;
    return (count / courseReviews.length) * 100;
  };

  const isCurrentUserReview = (review: any) => {
    return currentUser?.userStudent?.id === review.userStudentId;
  };

  // Add a useMemo to sort reviews with the user's review at the top
  const sortedReviews = useMemo(() => {
    if (!courseReviews || !currentUser?.userStudent?.id) {
      return courseReviews || [];
    }

    // Sort reviews: user's review first, then by date (newest first)
    return [...courseReviews].sort((a, b) => {
      // If review A belongs to current user, it should come first
      if (a.userStudentId === currentUser.userStudent.id) return -1;
      // If review B belongs to current user, it should come first
      if (b.userStudentId === currentUser.userStudent.id) return 1;

      // Otherwise sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [courseReviews, currentUser?.userStudent?.id]);

  return (
    <Box sx={{ my: 2 }}>
      {/* Only show form if user hasn't already submitted a review and isn't editing */}
      {showForm &&
        !editMode &&
        !hasUserReview &&
        currentUser?.role !== "student_academic" && (
          <>
            <Typography variant="h6" gutterBottom>
              Đánh giá khóa học
            </Typography>
            {/* Form đánh giá */}
            <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
              <Stack spacing={2}>
                <Box>
                  <Rating
                    name="rating"
                    value={rating}
                    onChange={(event, newValue) => {
                      setRating(newValue);
                    }}
                    size="large"
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Nhập nhận xét của bạn về khóa học..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={!rating}
                >
                  Gửi đánh giá
                </Button>
              </Stack>
            </Paper>
          </>
        )}

      {/* Edit form - shows when in edit mode */}
      {editMode && (
        <>
          <Typography variant="h6" gutterBottom>
            Chỉnh sửa đánh giá
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
            <Stack spacing={2}>
              <Box>
                <Typography component="legend">Đánh giá của bạn</Typography>
                <Rating
                  name="editRating"
                  value={editRating}
                  onChange={(event, newValue) => {
                    setEditRating(newValue);
                  }}
                  size="large"
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Nhập nhận xét của bạn về khóa học..."
                value={editReviewText}
                onChange={(e) => setEditReviewText(e.target.value)}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={cancelEdit}>
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdateReview}
                  disabled={!editRating}
                >
                  Cập nhật
                </Button>
              </Box>
            </Stack>
          </Paper>
        </>
      )}

      {/* Rating summary */}
      <Typography variant="h6" gutterBottom>
        Đánh giá từ học viên
      </Typography>

      {/* Rating stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h3" component="div" fontWeight="bold">
              {courseReviews.length > 0
                ? (
                    courseReviews.reduce(
                      (acc, review) => acc + review.rating,
                      0
                    ) / courseReviews.length
                  ).toFixed(1)
                : "0.0"}
            </Typography>
            <Rating
              value={
                courseReviews.length > 0
                  ? courseReviews.reduce(
                      (acc, review) => acc + review.rating,
                      0
                    ) / courseReviews.length
                  : 0
              }
              readOnly
              precision={0.5}
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {courseReviews.length} đánh giá
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={1}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = courseReviews.filter(
                (review) => Math.round(review.rating) === star
              ).length;
              return (
                <Box
                  key={star}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Typography variant="body2" sx={{ minWidth: "30px" }}>
                    {star}★
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculatePercentage(count)}
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: "40px" }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Grid>
      </Grid>

      {/* Review list */}
      {sortedReviews.slice(0, visibleReviews).map((review) => (
        <Card key={review.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  src={review.student?.user?.avatarUrl || ""}
                  alt={review.student?.fullName || ""}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {review.student?.fullName || "Học viên"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Menu for edit/delete if this is the current user's review */}
              {isCurrentUserReview(review) && (
                <Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, review.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={
                      Boolean(menuAnchorEl) && selectedReviewId === review.id
                    }
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={handleEditClick}>Chỉnh sửa</MenuItem>
                    <MenuItem onClick={handleDeleteReview}>Xóa</MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>

            <Rating
              value={review.rating}
              readOnly
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">{review.reviewText}</Typography>

            {/* Optionally highlight the user's review */}
            {isCurrentUserReview(review) && (
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  bgcolor: "primary.light",
                  color: "white",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                }}
              >
                Đánh giá của bạn
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Show more button */}
      {sortedReviews.length > visibleReviews && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="outlined" onClick={handleLoadMore}>
            Xem thêm đánh giá
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CourseRating;
