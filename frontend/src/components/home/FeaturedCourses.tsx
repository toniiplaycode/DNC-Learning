import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Chip,
  Avatar,
  Rating,
} from "@mui/material";
import { AccessTime, PlayCircle } from "@mui/icons-material";

interface Course {
  id: number;
  title: string;
  instructor: {
    name: string;
    avatar: string;
  };
  thumbnail: string;
  rating: number;
  reviewCount: number;
  duration: string;
  lessonsCount: number;
  isBestseller: boolean;
  price: number;
}

const featuredCourses: Course[] = [
  {
    id: 1,
    title: "React & TypeScript - Xây dựng ứng dụng fullstack",
    instructor: {
      name: "John Doe",
      avatar: "/src/assets/instructors/john.png",
    },
    thumbnail: "/src/assets/courses/react-ts.png",
    rating: 4.8,
    reviewCount: 2341,
    duration: "20 giờ",
    lessonsCount: 32,
    isBestseller: true,
    price: 499000,
  },
  {
    id: 2,
    title: "Machine Learning cơ bản đến nâng cao",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/src/assets/instructors/sarah.png",
    },
    thumbnail: "/src/assets/courses/ml.png",
    rating: 4.9,
    reviewCount: 1892,
    duration: "25 giờ",
    lessonsCount: 40,
    isBestseller: true,
    price: 699000,
  },
  {
    id: 3,
    title: "UI/UX Design - Từ số 0 đến chuyên nghiệp",
    instructor: {
      name: "David Chen",
      avatar: "/src/assets/instructors/david.png",
    },
    thumbnail: "/src/assets/courses/uiux.png",
    rating: 4.7,
    reviewCount: 1563,
    duration: "18 giờ",
    lessonsCount: 28,
    isBestseller: false,
    price: 399000,
  },
  {
    id: 4,
    title: "Digital Marketing Tổng quát",
    instructor: {
      name: "Emma Wilson",
      avatar: "/src/assets/instructors/emma.png",
    },
    thumbnail: "/src/assets/courses/marketing.png",
    rating: 4.6,
    reviewCount: 1245,
    duration: "15 giờ",
    lessonsCount: 25,
    isBestseller: false,
    price: 299000,
  },
];

const FeaturedCourses = () => {
  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Khóa học nổi bật
        </Typography>
        <Button variant="outlined">Xem tất cả</Button>
      </Box>

      <Grid container spacing={3}>
        {featuredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={3} key={course.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardMedia
                component="img"
                height="160"
                image={course.thumbnail}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                {course.isBestseller && (
                  <Chip
                    label="Bestseller"
                    size="small"
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                )}
                <Typography gutterBottom variant="h6" component="div">
                  {course.title}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Avatar
                    src={course.instructor.avatar}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {course.instructor.name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} mb={1}>
                  <Rating
                    value={course.rating}
                    precision={0.1}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    {course.rating} ({course.reviewCount})
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <AccessTime sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.duration}
                  </Typography>
                  <PlayCircle sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.lessonsCount} bài học
                  </Typography>
                </Stack>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ mt: 2, fontWeight: "bold" }}
                >
                  {course.price.toLocaleString("vi-VN")}đ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedCourses;
