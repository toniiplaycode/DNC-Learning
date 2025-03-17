import { useState } from "react";
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
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Mock data cho đánh giá
const mockReviews = [
  {
    id: 1,
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    userId: 101,
    userName: "Nguyễn Văn A",
    userAvatar: "/src/assets/avatar.png",
    rating: 5,
    title: "Khóa học tuyệt vời!",
    review:
      "Nội dung rất chi tiết và dễ hiểu. Giảng viên giải thích rõ ràng và đưa ra nhiều ví dụ thực tế. Tôi đã học được rất nhiều từ khóa học này.",
    date: "2024-03-20T08:30:00",
    instructorResponse: {
      content:
        "Cảm ơn bạn đã đánh giá tích cực! Rất vui khi khóa học đã giúp ích cho bạn.",
      date: "2024-03-21T10:15:00",
    },
    isHelpful: 12,
    isFlagged: false,
    isPinned: true,
    tags: ["positive", "responded"],
  },
  {
    id: 2,
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    userId: 102,
    userName: "Trần Thị B",
    userAvatar: "/src/assets/avatar.png",
    rating: 4,
    title: "Khóa học bổ ích",
    review:
      "Nội dung tốt, nhưng có một số phần hơi nhanh. Tổng thể vẫn là một khóa học rất đáng giá. Tôi đã áp dụng được nhiều kiến thức vào dự án thực tế.",
    date: "2024-03-18T14:20:00",
    instructorResponse: null,
    isHelpful: 8,
    isFlagged: false,
    isPinned: false,
    tags: ["positive", "needs_response"],
  },
  {
    id: 3,
    courseId: 2,
    courseName: "Node.js Advanced Concepts",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "/src/assets/avatar.png",
    rating: 3,
    title: "Cần cập nhật một số nội dung",
    review:
      "Khóa học có nhiều kiến thức bổ ích, nhưng một số phần đã lỗi thời so với phiên bản mới của Node.js. Hy vọng giảng viên sẽ cập nhật nội dung sớm.",
    date: "2024-03-15T09:45:00",
    instructorResponse: null,
    isHelpful: 5,
    isFlagged: true,
    isPinned: false,
    tags: ["neutral", "needs_response", "flagged"],
  },
  {
    id: 4,
    courseId: 3,
    courseName: "DevOps Fundamentals",
    userId: 104,
    userName: "Phạm Thị D",
    userAvatar: "/src/assets/avatar.png",
    rating: 2,
    title: "Thiếu bài tập thực hành",
    review:
      "Lý thuyết được giải thích tốt, nhưng thiếu nhiều bài tập thực hành. Rất khó để hiểu sâu về các khái niệm mà không có thực hành đầy đủ.",
    date: "2024-03-12T16:30:00",
    instructorResponse: {
      content:
        "Cảm ơn bạn đã góp ý. Tôi sẽ bổ sung thêm các bài tập thực hành trong bản cập nhật sắp tới của khóa học.",
      date: "2024-03-13T11:20:00",
    },
    isHelpful: 10,
    isFlagged: false,
    isPinned: false,
    tags: ["negative", "responded", "improvement"],
  },
  {
    id: 5,
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    userId: 105,
    userName: "Hoàng Văn E",
    userAvatar: "/src/assets/avatar.png",
    rating: 5,
    title: "Khóa học xuất sắc cho người mới",
    review:
      "Tôi là người mới học React và TypeScript, khóa học này đã giúp tôi hiểu được các khái niệm từ cơ bản đến nâng cao một cách rõ ràng. Bài tập thực hành rất hữu ích.",
    date: "2024-03-10T10:15:00",
    instructorResponse: null,
    isHelpful: 15,
    isFlagged: false,
    isPinned: false,
    tags: ["positive", "needs_response"],
  },
];

// Enum cho các tab
enum TabValue {
  ALL = "all",
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

const InstructorReviews = () => {
  // State cho các tabs, filter, search
  const [tabValue, setTabValue] = useState<TabValue>(TabValue.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [reviews] = useState(mockReviews);

  // Handler cho tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };

  // Lọc đánh giá dựa trên tab, filter và search
  const filteredReviews = reviews.filter((review) => {
    // Lọc theo tab
    if (tabValue === TabValue.POSITIVE && review.rating < 4) return false;
    if (tabValue === TabValue.NEUTRAL && review.rating !== 3) return false;
    if (tabValue === TabValue.NEGATIVE && review.rating > 2) return false;

    // Lọc theo rating
    if (filterRating !== "all" && review.rating !== parseInt(filterRating))
      return false;

    // Lọc theo khóa học
    if (filterCourse !== "all" && review.courseId.toString() !== filterCourse)
      return false;

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        review.title.toLowerCase().includes(query) ||
        review.review.toLowerCase().includes(query) ||
        review.userName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Tính toán thống kê đánh giá
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
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
                        bgcolor: `rating.star${star}`,
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
            <MenuItem value="1">React & TypeScript Masterclass</MenuItem>
            <MenuItem value="2">Node.js Advanced Concepts</MenuItem>
            <MenuItem value="3">DevOps Fundamentals</MenuItem>
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
              {review.isPinned && (
                <Chip
                  icon={<Star />}
                  label="Đánh giá nổi bật"
                  color="primary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                />
              )}

              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar src={review.userAvatar} alt={review.userName} />
                      <Box>
                        <Typography variant="subtitle1">
                          {review.userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(parseISO(review.date), "dd MMM yyyy", {
                            locale: vi,
                          })}
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
                      label={review.courseName}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  {review.title}
                </Typography>
                <Typography variant="body1">{review.review}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default InstructorReviews;
