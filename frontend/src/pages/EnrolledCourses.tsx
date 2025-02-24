import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomContainer from "../components/common/CustomContainer";
import CardCourse from "../components/common/CardCourse";

// Mock data - sau này sẽ được thay thế bằng dữ liệu thật từ API
const mockEnrolledCourses = [
  {
    id: 1,
    title: "Khóa học React Cơ bản",
    instructor: {
      name: "Nguyễn Văn A",
      avatar: "/path/to/avatar1.jpg",
    },
    rating: 4.8,
    totalRatings: 2341,
    duration: "20 giờ",
    totalLessons: 32,
    price: 499000,
    image: "/src/assets/logo.png",
    progress: 65,
    isEnrolled: true,
    category: "Công nghệ thông tin",
  },
  {
    id: 2,
    title: "Lập trình TypeScript",
    instructor: {
      name: "Trần Thị B",
      avatar: "/path/to/avatar2.jpg",
    },
    rating: 4.9,
    totalRatings: 1892,
    duration: "25 giờ",
    totalLessons: 40,
    price: 699000,
    image: "/src/assets/logo.png",
    progress: 30,
    isEnrolled: true,
    category: "Công nghệ thông tin",
  },
  {
    id: 3,
    title: "Machine Learning cơ bản đến nâng cao",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/path/to/avatar3.jpg",
    },
    rating: 4.7,
    totalRatings: 1234,
    duration: "30 giờ",
    totalLessons: 45,
    price: 899000,
    image: "/src/assets/logo.png",
    progress: 15,
    isEnrolled: true,
    category: "Công nghệ thông tin",
  },
];

const EnrolledCourses: React.FC = () => {
  return (
    <CustomContainer>
      <Box>
        <Typography variant="h4" fontWeight="bold" py={2}>
          Khóa học của tôi
        </Typography>

        <Grid container spacing={3}>
          {mockEnrolledCourses.map((course) => (
            <Grid
              item
              xs={12} // 1 cột trên mobile nhỏ (<600px)
              sm={6} // 2 cột trên mobile lớn (>=600px)
              md={4} // 3 cột trên tablet (>=900px)
              lg={3} // 4 cột trên desktop (>=1200px)
              key={course.id}
            >
              <CardCourse {...course} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </CustomContainer>
  );
};

export default EnrolledCourses;
