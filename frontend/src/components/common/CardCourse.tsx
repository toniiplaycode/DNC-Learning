import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  Stack,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";
import { AccessTime, PlayCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface CardCourseProps {
  id: number;
  title: string;
  instructor: {
    fullName: string;
    avatar?: string;
  };
  rating: number;
  totalRatings: number;
  duration: string;
  totalLessons: number;
  price: number;
  image: string;
  progress?: number;
  isEnrolled?: boolean;
  category: string;
}

const CardCourse: React.FC<CardCourseProps> = ({
  id,
  title,
  instructor,
  rating,
  totalRatings,
  duration,
  totalLessons,
  price,
  image,
  progress = 0,
  isEnrolled = false,
  category,
}) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/course/${id}`)}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="220"
          image={image}
          alt={title}
          sx={{ objectFit: "cover" }}
        />
        <Chip
          label={category}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            bgcolor: "rgba(255, 255, 255, 0.9)",
            fontWeight: 500,
          }}
        />
      </Box>

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
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar
            src={instructor.avatar || "/src/assets/avatar.png"}
            sx={{ width: 24, height: 24, mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {instructor.fullName || instructor.name}
          </Typography>
        </Box>

        {!isEnrolled ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography
                variant="body2"
                color="warning.main"
                fontWeight="bold"
                sx={{ mr: 1 }}
              >
                {rating}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "flex",
                  color: "warning.main",
                  fontSize: "1rem",
                }}
              >
                {"★".repeat(Math.floor(rating))}
                {"☆".repeat(5 - Math.floor(rating))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({totalRatings})
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1, color: "text.secondary" }}
            >
              <AccessTime sx={{ fontSize: "1rem" }} />
              <Typography variant="body2">{duration}</Typography>
              <PlayCircle sx={{ fontSize: "1rem", ml: 1 }} />
              <Typography variant="body2">{totalLessons} bài học</Typography>
            </Stack>

            <Typography
              variant="h6"
              color="primary"
              sx={{ mt: "auto", fontWeight: "bold" }}
            >
              {formatPrice(price)}
            </Typography>
          </>
        ) : (
          <>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round((progress / 100) * totalLessons)} / {totalLessons}{" "}
                bài học
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/course/${id}/learn`);
              }}
            >
              {progress === 100 ? "Xem lại" : "Tiếp tục học"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CardCourse;
