import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  LinearProgress,
} from "@mui/material";
import { Grade as GradeIcon } from "@mui/icons-material";
import { fetchUserCourseGrades } from "../../../features/user-grades/userGradesSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useParams } from "react-router-dom";
import { selectUserCourseGrades } from "../../../features/user-grades/userGradesSelectors";
import { GradeType, UserGrade } from "../../../types/user-grade.types";
import { format } from "date-fns";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import EmptyState from "../EmptyState";

const GradeOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const userCourseGrades = useAppSelector(selectUserCourseGrades);

  useEffect(() => {
    if (currentUser?.id && id) {
      dispatch(
        fetchUserCourseGrades({
          userId: Number(currentUser?.id),
          courseId: Number(id),
        })
      );
    }
  }, [dispatch, currentUser, id]);

  // Hàm lấy tiêu đề cho mỗi điểm
  const getGradeTitle = (grade: UserGrade): string => {
    if (grade.gradeType === GradeType.ASSIGNMENT && grade.assignment) {
      return grade.assignment.title;
    } else if (grade.gradeType === GradeType.QUIZ && grade.quiz) {
      return grade.quiz.title;
    } else if (grade.lesson) {
      return grade.lesson.title;
    } else {
      const gradeTypeMap = {
        [GradeType.MIDTERM]: "Bài thi giữa kỳ",
        [GradeType.FINAL]: "Bài thi cuối kỳ",
        [GradeType.PARTICIPATION]: "Điểm tham gia",
        [GradeType.ASSIGNMENT]: "Bài tập",
        [GradeType.QUIZ]: "Bài trắc nghiệm",
      };
      return gradeTypeMap[grade.gradeType] || "Không xác định";
    }
  };

  // Calculate overall grade
  const totalWeight = userCourseGrades.reduce(
    (acc: number, grade: UserGrade) => acc + Number(grade.weight),
    0
  );

  const weightedScore = userCourseGrades.reduce(
    (acc: number, grade: UserGrade) =>
      acc +
      (Number(grade.score) / Number(grade.maxScore)) * Number(grade.weight),
    0
  );

  const overallPercentage =
    totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

  if (!userCourseGrades || userCourseGrades.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Điểm tổng kết
        </Typography>
        <EmptyState
          icon={<GradeIcon />}
          title="Chưa có điểm số"
          description="Bạn chưa có bất kỳ điểm số nào được ghi nhận. Điểm số sẽ xuất hiện sau khi bạn hoàn thành các bài tập và bài kiểm tra."
          iconColor="info.main"
          iconBgColor="info.light"
          height={250}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Điểm tổng kết
      </Typography>

      {/* Overall Grade Summary */}
      <Card
        sx={{
          mb: 3,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            boxShadow: (theme) => `0 4px 20px ${theme.palette.primary.main}10`,
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h4"
                color="primary"
                sx={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {overallPercentage.toFixed(1)}%
                <GradeIcon
                  sx={{
                    fontSize: 32,
                    opacity: 0.8,
                    color:
                      overallPercentage >= 80
                        ? "success.main"
                        : overallPercentage >= 60
                        ? "warning.main"
                        : "error.main",
                  }}
                />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Điểm trung bình
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                  variant="determinate"
                  value={overallPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        overallPercentage >= 80
                          ? "success.main"
                          : overallPercentage >= 60
                          ? "warning.main"
                          : "error.main",
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" gutterBottom>
        Chi tiết điểm số
      </Typography>
      <Stack spacing={2}>
        {userCourseGrades.map((grade: UserGrade) => (
          <Card
            key={grade.id}
            variant="outlined"
            sx={{
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow: (theme) =>
                  `0 4px 20px ${theme.palette.primary.main}10`,
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {getGradeTitle(grade)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành: {format(new Date(grade.gradedAt), "dd/MM/yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      color={
                        (Number(grade.score) / Number(grade.maxScore)) * 100 >=
                        80
                          ? "success.main"
                          : (Number(grade.score) / Number(grade.maxScore)) *
                              100 >=
                            60
                          ? "warning.main"
                          : "error.main"
                      }
                    >
                      {grade.score}/{grade.maxScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({grade.weight}%)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <LinearProgress
                    variant="determinate"
                    value={(Number(grade.score) / Number(grade.maxScore)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          (Number(grade.score) / Number(grade.maxScore)) *
                            100 >=
                          80
                            ? "success.main"
                            : (Number(grade.score) / Number(grade.maxScore)) *
                                100 >=
                              60
                            ? "warning.main"
                            : "error.main",
                      },
                    }}
                  />
                </Grid>
                {grade.feedback && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        p: 1,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      Nhận xét: {grade.feedback}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default GradeOverview;
