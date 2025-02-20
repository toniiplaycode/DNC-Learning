import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomContainer from "../components/common/CustomContainer";

interface EnrolledCourse {
  id: number;
  title: string;
  thumbnailUrl: string;
  progress: number;
  instructorName: string;
}

// Mock data - sau này sẽ được thay thế bằng dữ liệu thật từ API
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: "Khóa học React Cơ bản",
    thumbnailUrl: "https://example.com/react.jpg",
    progress: 65,
    instructorName: "Nguyễn Văn A",
  },
  {
    id: 2,
    title: "Lập trình TypeScript",
    thumbnailUrl: "https://example.com/typescript.jpg",
    progress: 30,
    instructorName: "Trần Thị B",
  },
  {
    id: 2,
    title: "Lập trình TypeScript",
    thumbnailUrl: "https://example.com/typescript.jpg",
    progress: 30,
    instructorName: "Trần Thị B",
  },
  {
    id: 2,
    title: "Lập trình TypeScript",
    thumbnailUrl: "https://example.com/typescript.jpg",
    progress: 30,
    instructorName: "Trần Thị B",
  },
  {
    id: 2,
    title: "Lập trình TypeScript",
    thumbnailUrl: "https://example.com/typescript.jpg",
    progress: 30,
    instructorName: "Trần Thị B",
  },
];

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CustomContainer>
      <Box sx={{ py: 4 }}>
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
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={course.thumbnailUrl}
                  alt={course.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: "3.6em",
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Giảng viên: {course.instructorName}
                  </Typography>
                  <Box sx={{ mt: "auto" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {course.progress}%
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      Tiếp tục học
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </CustomContainer>
  );
};

export default EnrolledCourses;
