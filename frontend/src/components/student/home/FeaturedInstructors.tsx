import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectAllInstructors,
  selectInstructorsStatus,
} from "../../../features/user_instructors/instructorsSelectors";
import { fetchInstructors } from "../../../features/user_instructors/instructorsApiSlice";
import { useEffect } from "react";

const FeaturedInstructors = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectInstructorsStatus);
  const allInstructors = useAppSelector(selectAllInstructors);

  // Chỉ lấy 4 giảng viên đã xác minh đầu tiên
  const instructors = allInstructors
    .filter((instructor) => instructor.verificationStatus === "verified")
    .slice(0, 4);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInstructors());
    }
  }, [dispatch, status]);

  // Hàm chuyển chuỗi expertise areas thành mảng
  const parseExpertiseAreas = (
    expertiseAreas: string | undefined
  ): string[] => {
    if (!expertiseAreas) return [];
    return expertiseAreas.split(",").map((area) => area.trim());
  };

  // Hàm định dạng URL avatar
  const formatAvatarUrl = (avatarUrl: string | undefined): string => {
    if (!avatarUrl) return "/src/assets/default-avatar.png";
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `/src/assets/${avatarUrl}`;
  };

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Giảng viên tiêu biểu
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/list-instructors")}
        >
          Xem tất cả
        </Button>
      </Box>

      <Grid container spacing={3}>
        {status === "loading" && !instructors.length
          ? // Hiển thị skeleton khi đang loading
            Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Skeleton
                      variant="circular"
                      width={120}
                      height={120}
                      sx={{ mx: "auto", mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      sx={{ mx: "auto", mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      sx={{ mx: "auto", mb: 2 }}
                    />
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="center"
                      mb={2}
                    >
                      <Skeleton variant="rectangular" width="40%" height={40} />
                      <Skeleton variant="rectangular" width="40%" height={40} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : instructors.map((instructor) => (
              <Grid item xs={12} sm={6} md={3} key={instructor.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => navigate(`/view-instructor/${instructor.id}`)}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Avatar
                      src={formatAvatarUrl(instructor.user?.avatarUrl)}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: "auto",
                        mb: 2,
                        border: 3,
                        borderColor: "primary.main",
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {instructor.fullName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ mb: 2 }}
                    >
                      {instructor.professionalTitle}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="center"
                      mb={2}
                    >
                      <Box textAlign="center">
                        <Typography variant="h6" color="primary.main">
                          {instructor.totalCourses}+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Khóa học
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box textAlign="center">
                        <Typography variant="h6" color="primary.main">
                          {instructor.totalStudents
                            ? instructor.totalStudents >= 1000
                              ? `${(instructor.totalStudents / 1000).toFixed(
                                  1
                                )}K+`
                              : `${instructor.totalStudents}+`
                            : "0"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Học viên
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        {parseExpertiseAreas(instructor.expertiseAreas).map(
                          (spec) => (
                            <Chip
                              key={spec}
                              label={spec}
                              size="small"
                              sx={{ m: 0.5 }}
                            />
                          )
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};

export default FeaturedInstructors;
