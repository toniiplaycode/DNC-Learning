import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomContainer from "../../components/common/CustomContainer";
import CardCourse from "../../components/common/CardCourse";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectUserEnrollments,
  selectUserProgress,
} from "../../features/enrollments/enrollmentsSelectors";
import {
  fetchUserEnrollments,
  fetchUserProgress,
} from "../../features/enrollments/enrollmentsApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { fetchStudentAcademicCourses } from "../../features/users/usersApiSlice";
import { selectStudentAcademicCourses } from "../../features/users/usersSelectors";
import { useNavigate } from "react-router-dom";

const calculateTotalLessons = (course: any) => {
  if (!course || !course.sections) return 0;
  return course.sections.reduce(
    (total: number, section: any) => total + (section.lessons?.length || 0),
    0
  );
};

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const userProgress = useAppSelector(selectUserProgress);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);

  useEffect(() => {
    dispatch(fetchUserEnrollments(Number(currentUser?.id)));
    dispatch(fetchStudentAcademicCourses(Number(currentUser?.id)));
    dispatch(fetchUserProgress());
  }, [dispatch, currentUser, navigate]);

  console.log("studentAcademicCourses ", studentAcademicCourses);

  // Process academic courses
  const academicCourses = React.useMemo(() => {
    if (!Array.isArray(studentAcademicCourses)) return [];

    return studentAcademicCourses.map((item) => {
      const course = item.course;
      return {
        id: course.id,
        title: course.title,
        instructor: {
          fullName: course.instructor?.fullName,
          avatar: course.instructor?.user?.avatarUrl,
        },
        totalLessons: calculateTotalLessons(course),
        image: course.thumbnailUrl,
        category: course.category?.name,
        isAcademic: true,
        startDate: course.startDate,
        endDate: course.endDate,
      };
    });
  }, [studentAcademicCourses, navigate, dispatch, currentUser]);

  return (
    <CustomContainer>
      <Box>
        {/* Academic Courses Section */}
        {academicCourses && academicCourses.length > 0 && (
          <Box mb={4}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Khóa học thuật
            </Typography>
            <Grid container spacing={3}>
              {academicCourses.map((course) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`academic-${course.id}`}
                >
                  <CardCourse {...course} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Enrolled Courses Section */}
        {Array.isArray(userEnrollments) && userEnrollments.length > 0 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Khóa học đã đăng ký
            </Typography>
            <Grid container spacing={3}>
              {userEnrollments.map((course) => {
                const courseProgress = userProgress?.find(
                  (progress: any) => progress.courseId === course.course?.id
                );

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
                  progress: courseProgress?.completionPercentage,
                  isEnrolled: true,
                  category: course.course?.category?.name,
                };

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={`enrolled-${course.id}`}
                  >
                    <CardCourse {...courseEnrolled} />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* No Courses Message */}
        {!academicCourses.length &&
          !(Array.isArray(userEnrollments) && userEnrollments.length) && (
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              py={2}
            >
              Bạn chưa có khóa học nào
            </Typography>
          )}
      </Box>
    </CustomContainer>
  );
};

export default EnrolledCourses;
