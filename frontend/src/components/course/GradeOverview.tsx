import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  LinearProgress,
} from "@mui/material";

interface GradeItem {
  id: number;
  title: string;
  type: "quiz" | "assignment" | "midterm" | "final";
  score: number;
  maxScore: number;
  weight: number;
  completedAt: string;
  feedback?: string;
}

const GradeOverview: React.FC = () => {
  // Mock data
  const mockGrades: GradeItem[] = [
    {
      id: 1,
      title: "Quiz 1: React Hooks Basics",
      type: "quiz",
      score: 8,
      maxScore: 10,
      weight: 10,
      completedAt: "2023-08-15",
    },
    {
      id: 2,
      title: "Assignment 1: Todo App",
      type: "assignment",
      score: 85,
      maxScore: 100,
      weight: 15,
      completedAt: "2023-08-20",
      feedback:
        "Good work on component structure. Could improve on state management.",
    },
    {
      id: 3,
      title: "Midterm Exam",
      type: "midterm",
      score: 75,
      maxScore: 100,
      weight: 30,
      completedAt: "2023-09-05",
      feedback:
        "Strong understanding of core concepts, but needs improvement in advanced topics.",
    },
    {
      id: 4,
      title: "Assignment 2: E-commerce App",
      type: "assignment",
      score: 92,
      maxScore: 100,
      weight: 15,
      completedAt: "2023-09-25",
      feedback:
        "Excellent work! Very clean code and good performance optimization.",
    },
  ];

  // Calculate overall grade
  const totalWeight = mockGrades.reduce((acc, grade) => acc + grade.weight, 0);
  const weightedScore = mockGrades.reduce(
    (acc, grade) => acc + (grade.score / grade.maxScore) * grade.weight,
    0
  );
  const overallPercentage =
    totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Điểm tổng kết
      </Typography>

      {/* Overall Grade Summary */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {overallPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                  variant="determinate"
                  value={overallPercentage}
                  sx={{ height: 10, borderRadius: 1 }}
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
        {mockGrades.map((grade) => (
          <Card key={grade.id} variant="outlined">
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">{grade.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành:{" "}
                    {new Date(grade.completedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" color="primary">
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
                    value={(grade.score / grade.maxScore) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Grid>
                {grade.feedback && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
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
