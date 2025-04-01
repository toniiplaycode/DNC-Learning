import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomContainer from "../../components/common/CustomContainer";
import CardCourse from "../../components/common/CardCourse";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserEnrollments } from "../../features/enrollments/enrollmentsSelectors";
import { fetchUserEnrollments } from "../../features/enrollments/enrollmentsApiSlice";

const EnrolledCourses: React.FC = () => {
  const dispatch = useAppDispatch();
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserEnrollments(user?.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("user"); // Remove invalid data
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  return (
    <CustomContainer>
      <Box>
        <Typography variant="h4" fontWeight="bold" py={2}>
          Khóa học của tôi
        </Typography>

        <Grid container spacing={3}>
          {userEnrollments?.map((course) => {
            const calculateTotalLessons = (course: any) => {
              if (!course.sections) return 0;
              return course.sections.reduce(
                (total: number, section: any) =>
                  total + (section.lessons?.length || 0),
                0
              );
            };

            const courseEnrolled = {
              id: course.course?.id,
              title: course.course?.title,
              instructor: {
                fullName: course.course?.instructor?.fullName,
                avatar: course.course?.instructor?.user?.avatarUrl,
              },
              totalLessons: calculateTotalLessons(course.course),
              price: course.course?.price,
              image: course.course?.thumbnailUrl,
              progress: course.progress,
              isEnrolled: true,
              category: course.course?.category?.name,
            };

            return (
              <Grid
                item
                xs={12} // 1 cột trên mobile nhỏ (<600px)
                sm={6} // 2 cột trên mobile lớn (>=600px)
                md={4} // 3 cột trên tablet (>=900px)
                lg={3} // 4 cột trên desktop (> =1200px)
                key={course.id}
              >
                <CardCourse {...courseEnrolled} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </CustomContainer>
  );
};

export default EnrolledCourses;
