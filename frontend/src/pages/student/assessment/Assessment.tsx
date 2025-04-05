import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Quiz,
  Assignment,
  Search,
  Timer,
  MenuBook,
  DocumentScanner,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CustomContainer from "../../../components/common/CustomContainer";

// Mock data cho các bài kiểm tra
const mockAssessments = [
  {
    id: 1,
    title: "Kiểm tra React Hooks cơ bản",
    description: "Đánh giá kiến thức về React Hooks",
    type: "quiz",
    course: "React & TypeScript Masterclass",
    instructor: "John Doe",
    duration: 30, // phút
    questionCount: 15,
    difficulty: "medium", // easy, medium, hard
    isCompleted: false,
    availableUntil: "2025-06-30",
    points: 100,
  },
  {
    id: 2,
    title: "Bài tập Redux Middleware",
    description: "Ứng dụng Redux Middleware vào dự án thực tế",
    type: "assignment",
    course: "React & TypeScript Masterclass",
    instructor: "John Doe",
    duration: 120, // phút
    difficulty: "hard",
    isCompleted: true,
    completedDate: "2025-05-15",
    score: 85,
    availableUntil: "2025-06-30",
    points: 200,
  },
  {
    id: 3,
    title: "Luyện tập Node.js Authentication",
    description: "Xây dựng hệ thống xác thực với Node.js và JWT",
    type: "quiz",
    course: "Node.js Advanced Concepts",
    instructor: "Jane Smith",
    duration: 45,
    questionCount: 20,
    difficulty: "hard",
    isCompleted: true,
    completedDate: "2025-05-10",
    score: 90,
    availableUntil: "2025-06-15",
    points: 150,
  },
  {
    id: 4,
    title: "Kiểm tra cơ bản TypeScript",
    description: "Kiểm tra kiến thức về TypeScript types và interfaces",
    type: "quiz",
    course: "TypeScript Fundamentals",
    instructor: "David Johnson",
    duration: 20,
    questionCount: 10,
    difficulty: "easy",
    isCompleted: false,
    availableUntil: "2025-07-20",
    points: 50,
  },
  {
    id: 5,
    title: "Bài tập RESTful API",
    description: "Xây dựng RESTful API với Express.js",
    type: "assignment",
    course: "Node.js Advanced Concepts",
    instructor: "Jane Smith",
    duration: 180,
    difficulty: "medium",
    isCompleted: false,
    availableUntil: "2025-06-25",
    points: 250,
  },
];

const Assessment = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter assessments based on tab and search
  const filteredAssessments = mockAssessments.filter((assessment) => {
    const matchesSearch = assessment.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (tabValue === 0) return matchesSearch;
    if (tabValue === 1) return assessment.type === "quiz" && matchesSearch;
    if (tabValue === 2)
      return assessment.type === "assignment" && matchesSearch;
    if (tabValue === 3) return assessment.isCompleted && matchesSearch;

    return false;
  });

  // Function to render difficulty chip
  const renderDifficultyChip = (difficulty: string) => {
    const color =
      difficulty === "easy"
        ? "success"
        : difficulty === "medium"
        ? "warning"
        : "error";

    const label =
      difficulty === "easy"
        ? "Dễ"
        : difficulty === "medium"
        ? "Trung bình"
        : "Khó";

    return <Chip size="small" color={color} label={label} />;
  };

  return (
    <CustomContainer maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Trung tâm kiểm tra & bài tập
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm bài kiểm tra hoặc bài tập..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Tất cả" icon={<DocumentScanner />} iconPosition="start" />
          <Tab label="Kiểm tra" icon={<Quiz />} iconPosition="start" />
          <Tab label="Bài tập" icon={<Assignment />} iconPosition="start" />
          <Tab label="Đã hoàn thành" icon={<School />} iconPosition="start" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredAssessments.map((assessment) => (
          <Grid item xs={12} md={6} lg={4} key={assessment.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  {assessment.type === "quiz" ? (
                    <Quiz color="primary" />
                  ) : (
                    <Assignment color="secondary" />
                  )}
                  {renderDifficultyChip(assessment.difficulty)}
                </Stack>

                <Typography variant="h6" gutterBottom>
                  {assessment.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {assessment.description}
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <MenuBook fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {assessment.course}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Timer fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {assessment.duration} phút
                    </Typography>
                  </Stack>

                  {assessment.type === "quiz" && (
                    <Typography variant="body2" color="text.secondary">
                      {assessment.questionCount} câu hỏi
                    </Typography>
                  )}

                  {assessment.isCompleted && (
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="bold"
                    >
                      Điểm: {assessment.score}/100
                    </Typography>
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: "auto" }}
                >
                  {assessment.isCompleted
                    ? `Hoàn thành: ${assessment.completedDate}`
                    : `Hạn: ${assessment.availableUntil}`}
                </Typography>
              </CardContent>

              <CardActions>
                {assessment.isCompleted ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() =>
                      navigate(
                        `/assessment/${assessment.type}/${assessment.id}/result`
                      )
                    }
                  >
                    Xem kết quả
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() =>
                      navigate(
                        `/assessment/${assessment.type}/${assessment.id}`
                      )
                    }
                  >
                    Bắt đầu làm
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}

        {filteredAssessments.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              width: "100%",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy bài kiểm tra hoặc bài tập nào
            </Typography>
          </Box>
        )}
      </Grid>
    </CustomContainer>
  );
};

export default Assessment;
