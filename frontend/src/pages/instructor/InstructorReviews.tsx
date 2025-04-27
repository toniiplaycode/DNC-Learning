import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Rating,
  Avatar,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CardContent,
} from "@mui/material";
import { Search, Star, Visibility } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectInstructorReviews } from "../../features/reviews/reviewsSelectors";
import { fetchReviewsByInstructor } from "../../features/reviews/reviewsSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { formatDateTime } from "../../utils/formatters";

// Enum cho các tab
enum TabValue {
  ALL = "all",
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

const InstructorReviews = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorReviews = useAppSelector(selectInstructorReviews);

  // State cho các tabs, filter, search
  const [tabValue, setTabValue] = useState<TabValue>(TabValue.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchReviewsByInstructor(Number(currentUser?.userInstructor?.id)));
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (instructorReviews && instructorReviews.length > 0) {
      setReviews(instructorReviews);
    }
  }, [instructorReviews]);

  // Handler cho tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };

  // Lọc đánh giá dựa trên tab, filter và search
  const filteredReviews =
    reviews
      ?.filter((review) => {
        // Ensure review exists before filtering
        if (!review) return false;

        // Lọc theo tab
        if (tabValue === TabValue.POSITIVE && review.rating < 4) return false;
        if (tabValue === TabValue.NEUTRAL && review.rating !== 3) return false;
        if (tabValue === TabValue.NEGATIVE && review.rating > 2) return false;

        // Lọc theo rating
        if (filterRating !== "all" && review.rating !== parseInt(filterRating))
          return false;

        // Lọc theo khóa học
        if (
          filterCourse !== "all" &&
          review.courseId?.toString() !== filterCourse
        )
          return false;

        // Tìm kiếm
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            review.reviewText?.toLowerCase().includes(query) ||
            review.student?.fullName?.toLowerCase().includes(query) ||
            review.course?.title?.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .filter(Boolean) || [];

  // Tính toán thống kê đánh giá
  const totalReviews = reviews?.length || 0;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review?.rating || 0), 0) /
        totalReviews
      : 0;
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    ratingCounts[review.rating - 1]++;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Đánh giá từ học viên
      </Typography>

      {/* Statistics Card */}
      <Card sx={{ mb: 3 }}>
        <Grid container p={3}>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" spacing={1}>
              <Typography variant="h3">{averageRating.toFixed(1)}</Typography>
              <Rating
                value={averageRating}
                precision={0.1}
                readOnly
                size="large"
              />
              <Typography variant="subtitle1">
                {totalReviews} đánh giá
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ px: 3 }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Stack
                  key={star}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography>{star} sao</Typography>
                  <Box sx={{ flexGrow: 1, mx: 1 }}>
                    <Paper
                      sx={{
                        width: `${
                          (ratingCounts[star - 1] / totalReviews) * 100
                        }%`,
                        bgcolor: `primary.main`,
                        height: 8,
                        minWidth: "4px",
                      }}
                    />
                  </Box>
                  <Typography>
                    {ratingCounts[star - 1]} (
                    {Math.round((ratingCounts[star - 1] / totalReviews) * 100)}
                    %)
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Search and Filters */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <TextField
          placeholder="Tìm kiếm đánh giá..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sao</InputLabel>
          <Select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            label="Sao"
            size="small"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="5">5 sao</MenuItem>
            <MenuItem value="4">4 sao</MenuItem>
            <MenuItem value="3">3 sao</MenuItem>
            <MenuItem value="2">2 sao</MenuItem>
            <MenuItem value="1">1 sao</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Khóa học</InputLabel>
          <Select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            label="Khóa học"
            size="small"
          >
            <MenuItem value="all">Tất cả khóa học</MenuItem>
            {Array.from(
              new Set(instructorReviews?.filter(Boolean).map((r) => r.course))
            ).map((course) => (
              <MenuItem key={course.id} value={course.id.toString()}>
                {course.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Tất cả" value={TabValue.ALL} />
        <Tab
          label="Tích cực (4-5 sao)"
          value={TabValue.POSITIVE}
          sx={{ color: "success.main" }}
        />
        <Tab
          label="Trung lập (3 sao)"
          value={TabValue.NEUTRAL}
          sx={{ color: "warning.main" }}
        />
        <Tab
          label="Tiêu cực (1-2 sao)"
          value={TabValue.NEGATIVE}
          sx={{ color: "error.main" }}
        />
      </Tabs>

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy đánh giá nào
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        src={review.student?.user?.avatarUrl}
                        alt={review.student?.fullName}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {review.student?.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(review.createdAt)}
                        </Typography>
                        <Rating
                          value={review.rating}
                          readOnly
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4} sx={{ textAlign: { sm: "right" } }}>
                    <Chip
                      label={review.course?.title}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1">{review.reviewText}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default InstructorReviews;
