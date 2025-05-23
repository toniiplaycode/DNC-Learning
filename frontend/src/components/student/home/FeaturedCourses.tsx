import React, { useEffect } from "react";
import { Box, Typography, Grid, Button, Skeleton, Alert } from "@mui/material";
import CardCourse from "../../../components/common/CardCourse";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCourses } from "../../../features/courses/coursesApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { UserRole } from "../../../types/user.types";

const FeaturedCourses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { courses, status, error } = useAppSelector((state) => state.courses);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCourses());
    }
  }, [status, dispatch]);

  // Chỉ lấy khóa học có trạng thái published và phù hợp với vai trò người dùng
  const filteredCourses = courses.filter((course) => {
    const publishedMatch = course.status === "published";

    // Lọc theo đối tượng người dùng
    const userRole = currentUser?.role as string;
    const userTypeMatch =
      !course.for || // Nếu không có trường for
      course.for === "both" || // Hoặc for = 'both'
      (userRole === "student" && course.for === "student") || // Người dùng là student và khóa học cho student
      (userRole === "student_academic" && course.for === "student_academic") || // Người dùng là student_academic và khóa học cho student_academic
      (!currentUser && (course.for === "student" || course.for === "both")); // Người dùng chưa đăng nhập xem được khóa học cho student và both

    return publishedMatch && userTypeMatch;
  });

  // Giới hạn hiển thị tối đa 4 khóa học nổi bật
  const featuredCourses = filteredCourses.slice(0, 4);

  const calculateTotalLessons = (course: any) => {
    if (!course.sections) return 0;
    return course.sections.reduce(
      (total: number, section: any) => total + (section.lessons?.length || 0),
      0
    );
  };

  // Tính rating trung bình từ reviews
  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  // Format dữ liệu để phù hợp với CardCourse component
  const formatCourseData = (course: any) => ({
    id: course.id,
    title: course.title,
    instructor: {
      fullName: course.instructor?.fullName || "Giảng viên",
      avatar: course.instructor?.user?.avatarUrl,
    },
    rating: calculateAverageRating(course.reviews),
    totalRatings: course.reviews?.length || 0,
    duration: "12 tuần", // Giả định
    totalLessons: calculateTotalLessons(course),
    price: parseFloat(course.price) || 0,
    image: course.thumbnailUrl || "/src/assets/logo.png",
    category: course.category?.name || "Không phân loại",
    for: course.for,
  });

  return (
    <Box component="section" sx={{ pb: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Khóa học tiêu biểu
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/courses")}>
          Xem tất cả
        </Button>
      </Box>

      {status === "loading" && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={220}
                sx={{ borderRadius: 2, mb: 1 }}
              />
              <Skeleton variant="text" height={30} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {status === "failed" && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Không thể tải khóa học. Vui lòng thử lại sau."}
        </Alert>
      )}

      {status === "succeeded" && (
        <>
          {featuredCourses.length === 0 ? (
            <Alert severity="info">
              Hiện tại chưa có khóa học nào. Vui lòng quay lại sau.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {featuredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                  <CardCourse {...formatCourseData(course)} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default FeaturedCourses;
