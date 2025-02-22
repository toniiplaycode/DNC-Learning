import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import CardCourse from "../common/CardCourse";

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
  },
];

const FeaturedCourses: React.FC = () => {
  return (
    <Box component="section" sx={{ pb: 6 }}>
      <>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Khóa học nổi bật
        </Typography>
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
