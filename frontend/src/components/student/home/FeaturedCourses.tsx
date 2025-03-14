import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import CardCourse from "../../../components/common/CardCourse";
import { useNavigate } from "react-router-dom";

const mockCourses = [
  {
    id: 1,
    title: "React & TypeScript - Xây dựng ứng dụng fullstack",
    instructor: {
      name: "John Doe",
      avatar: "/path/to/avatar1.jpg",
    },
    rating: 4.8,
    totalRatings: 2341,
    duration: "20 giờ",
    totalLessons: 32,
    price: 499000,
    image: "/src/assets/logo.png",
    isBestseller: true,
    isEnrolled: true,
    progress: 65,
    category: "Công nghệ thông tin",
  },
  {
    id: 2,
    title: "Machine Learning cơ bản đến nâng cao",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/path/to/avatar2.jpg",
    },
    rating: 4.9,
    totalRatings: 1892,
    duration: "25 giờ",
    totalLessons: 40,
    price: 699000,
    image: "/src/assets/logo.png",
    isBestseller: true,
    isEnrolled: false,
    progress: 0,
    category: "Công nghệ thông tin",
  },
  {
    id: 2,
    title: "Machine Learning cơ bản đến nâng cao",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/path/to/avatar2.jpg",
    },
    rating: 4.9,
    totalRatings: 1892,
    duration: "25 giờ",
    totalLessons: 40,
    price: 699000,
    image: "/src/assets/logo.png",
    isBestseller: true,
    isEnrolled: false,
    progress: 0,
    category: "Công nghệ thông tin",
  },
  {
    id: 2,
    title: "Machine Learning cơ bản đến nâng cao",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/path/to/avatar2.jpg",
    },
    rating: 4.9,
    totalRatings: 1892,
    duration: "25 giờ",
    totalLessons: 40,
    price: 699000,
    image: "/src/assets/logo.png",
    isBestseller: true,
    isEnrolled: false,
    progress: 0,
    category: "Công nghệ thông tin",
  },
  {
    id: 2,
    title: "Machine Learning cơ bản đến nâng cao",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/path/to/avatar2.jpg",
    },
    rating: 4.9,
    totalRatings: 1892,
    duration: "25 giờ",
    totalLessons: 40,
    price: 699000,
    image: "/src/assets/logo.png",
    isBestseller: true,
    isEnrolled: false,
    progress: 0,
    category: "Công nghệ thông tin",
  },
];

const FeaturedCourses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box component="section" sx={{ pb: 6 }}>
      <>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Khóa học tiêu biểu
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/courses")}>
            Xem tất cả
          </Button>
        </Box>
        <Grid container spacing={3}>
          {mockCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
              <CardCourse {...course} />
            </Grid>
          ))}
        </Grid>
      </>
    </Box>
  );
};

export default FeaturedCourses;
