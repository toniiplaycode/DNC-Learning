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
  IconButton,
  Tooltip,
} from "@mui/material";
import { AccessTime, PlayCircle, Lock } from "@mui/icons-material";
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
  isAcademic?: boolean;
  startDate?: string;
  endDate?: string;
  for: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

const CardCourse: React.FC<CardCourseProps> = ({
  isAcademic,
  startDate,
  endDate,
  disabled,
  disabledTooltip,
  ...props
}) => {
  const {
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
    for: audienceType,
  } = props;

  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCardClick = () => {
    if (disabled) return;
    navigate(`/course/${id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    navigate(isEnrolled ? `/course/${id}/learn` : `/course/${id}`);
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Chưa có thông tin"
      : date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        "&:hover": {
          boxShadow: disabled ? 1 : 6,
        },
        position: "relative",
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="220"
          image={image}
          alt={title}
          sx={{
            objectFit: "cover",
            filter: disabled ? "grayscale(50%)" : "none",
          }}
        />
        {disabled && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <IconButton
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
              }}
              size="large"
            >
              <Lock />
            </IconButton>
          </Box>
        )}
        <Chip
          label={category}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            bgcolor: "rgba(255, 255, 255, 0.9)",
            fontWeight: 500,
            zIndex: 1,
          }}
        />
        {disabled && (
          <Chip
            label="Chưa mở"
            size="small"
            color="default"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              fontWeight: 500,
              zIndex: 1,
            }}
          />
        )}
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
            src={instructor.avatar || "/src/assets/logo-not-text.png"}
            sx={{ width: 24, height: 24, mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {instructor.fullName}
          </Typography>
        </Box>

        {!isEnrolled ? (
          <>
            {!isAcademic && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography
                  variant="body2"
                  color="warning.main"
                  fontWeight="bold"
                  sx={{ mr: 1 }}
                >
                  {rating.toFixed(2)}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({totalRatings})
                </Typography>
              </Box>
            )}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1, color: "text.secondary" }}
            >
              {!isAcademic && (
                <>
                  <AccessTime sx={{ fontSize: "1rem" }} />
                  <Typography variant="body2">{duration}</Typography>
                </>
              )}
              <PlayCircle sx={{ fontSize: "1rem", ml: 1 }} />
              <Typography variant="body2">{totalLessons} bài học</Typography>
            </Stack>

            {!isAcademic && (
              <Typography
                variant="h6"
                color="primary"
                sx={{ mt: "auto", fontWeight: "bold" }}
              >
                {audienceType === "student_academic"
                  ? "Dành cho sinh viên"
                  : price === 0
                  ? "Miễn phí"
                  : formatPrice(price)}
              </Typography>
            )}
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
          </>
        )}

        {!isEnrolled && !isAcademic ? (
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              position: "relative",
              ...(disabled && {
                bgcolor: "grey.400",
                "&:hover": {
                  bgcolor: "grey.400",
                },
              }),
            }}
            onClick={handleButtonClick}
            disabled={disabled}
            startIcon={disabled ? <Lock /> : undefined}
          >
            {disabled ? `Mở khóa ${formatDate(startDate)}` : "Đăng ký ngay"}
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={handleButtonClick}
            disabled={disabled}
            startIcon={disabled ? <Lock /> : undefined}
            sx={{
              ...(disabled && {
                bgcolor: "grey.400",
                "&:hover": {
                  bgcolor: "grey.400",
                },
              }),
            }}
          >
            {disabled
              ? `Mở khóa ${formatDate(startDate)}`
              : progress === 100
              ? "Xem lại"
              : "Tiếp tục học"}
          </Button>
        )}
      </CardContent>

      {disabled && disabledTooltip && (
        <Tooltip
          title={`Khóa học sẽ mở  ${formatDate(startDate)}`}
          placement="top"
          arrow
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
            }}
          />
        </Tooltip>
      )}
    </Card>
  );
};

export default CardCourse;
