import React, { useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Divider,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  School,
  WorkOutline,
  Star,
  Person,
  Assignment,
  LinkedIn,
  VerifiedUser,
  Email,
  Phone,
  Work,
  LocationOn,
} from "@mui/icons-material";
import CardCourse from "../../components/common/CardCourse";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchInstructorById } from "../../features/user_instructors/instructorsApiSlice";

const InstructorProfile = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { currentInstructor, status, error } = useAppSelector(
    (state) => state.instructors
  );

  useEffect(() => {
    dispatch(fetchInstructorById(Number(id)));
  }, [dispatch, id]);

  // Phân tích chứng chỉ từ chuỗi thành mảng
  const parseCertificates = (
    certificates: string | null | undefined
  ): string[] => {
    if (!certificates) return [];
    return certificates.split(",").map((cert) => cert.trim());
  };

  // Phân tích expertise areas từ chuỗi thành mảng
  const parseExpertiseAreas = (
    expertiseAreas: string | null | undefined
  ): string[] => {
    if (!expertiseAreas) return [];
    return expertiseAreas.split(",").map((area) => area.trim());
  };

  // Chuyển đổi các khóa học sang định dạng cho CardCourse
  const mapCoursesToCardFormat = () => {
    if (!currentInstructor || !currentInstructor.courses) return [];

    return currentInstructor.courses.map((course) => ({
      id: course.id,
      title: course.title,
      instructor: {
        fullName: currentInstructor.fullName,
        avatar:
          currentInstructor.user?.avatarUrl || "/src/assets/default-avatar.png",
      },
      rating: parseFloat(currentInstructor.averageRating || "0"),
      totalRatings: course.reviews?.length || 0,
      duration: `${
        course.sections?.reduce(
          (total, section) =>
            total +
            section.lessons.reduce(
              (lessonTotal, lesson) => lessonTotal + (lesson.duration || 0),
              0
            ),
          0
        ) || 0
      } giờ`,
      totalLessons:
        course.sections?.reduce(
          (total, section) => total + section.lessons.length,
          0
        ) || 0,
      price: parseFloat(course.price || "0"),
      image: course.thumbnailUrl || "/src/assets/logo.png",
      category: course?.category?.name || "Khóa học",
    }));
  };

  // Xử lý trạng thái loading
  if (status === "loading") {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Xử lý lỗi
  if (status === "failed" || !currentInstructor) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" color="error">
          {error || "Không thể tải thông tin giảng viên. Vui lòng thử lại sau."}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Profile Header Card */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: "linear-gradient(to right, #f5f7fa, #e4e8f0)",
        }}
      >
        <Grid container spacing={3}>
          {/* Avatar */}
          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Avatar
              src={
                currentInstructor.user?.avatarUrl
                  ? `/src/assets/${currentInstructor.user.avatarUrl}`
                  : "/src/assets/default-avatar.png"
              }
              sx={{
                width: 180,
                height: 180,
                border: 3,
                borderColor: "primary.main",
                mx: "auto",
                boxShadow: 3,
              }}
            />
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Rating
                value={parseFloat(currentInstructor.averageRating || "0")}
                precision={0.5}
                readOnly
                size="large"
              />
              <Typography variant="body2">
                ({currentInstructor.averageRating || "0"}/5 -{" "}
                {currentInstructor.totalReviews || 0} đánh giá)
              </Typography>
            </Box>
          </Grid>

          {/* Basic Info and Contact */}
          <Grid item xs={12} md={9}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {currentInstructor.fullName}
                </Typography>
                {currentInstructor.verificationStatus === "verified" && (
                  <VerifiedUser color="primary" sx={{ fontSize: 24, ml: 1 }} />
                )}
              </Box>

              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 2, mt: 0.5 }}
              >
                {currentInstructor.professionalTitle}
              </Typography>

              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {currentInstructor.specialization}
              </Typography>

              {/* Thông tin liên hệ ở đây */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {currentInstructor.user?.email || "Không có thông tin"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Phone color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {currentInstructor.user?.phone || "Không có thông tin"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    {currentInstructor.linkedinProfile && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LinkedIn color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {currentInstructor.linkedinProfile}
                        </Typography>
                      </Box>
                    )}
                    {currentInstructor.website && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <WorkOutline color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {currentInstructor.website}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Stats Row */}
              <Box
                sx={{
                  py: 1,
                  display: "flex",
                  gap: 2,
                  flexDirection: "row",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <Person color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {currentInstructor.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Học viên
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <Assignment color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {currentInstructor.totalCourses || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khóa học
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <Star color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {currentInstructor.totalReviews || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đánh giá
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Two-column Content */}
      <Grid>
        {/* Left Column - Bio & Expertise */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="primary.main"
              >
                Giới thiệu
              </Typography>
              <Typography paragraph variant="body1">
                {currentInstructor.bio || "Không có thông tin."}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="primary.main"
              >
                Chuyên môn
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {parseExpertiseAreas(currentInstructor.expertiseAreas).map(
                  (area) => (
                    <Chip
                      key={area}
                      label={area}
                      sx={{ m: 0.5, px: 1 }}
                      variant="outlined"
                    />
                  )
                )}
              </Stack>

              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="primary.main"
              >
                Chứng chỉ
              </Typography>
              <List>
                {parseCertificates(currentInstructor.certificates).length >
                0 ? (
                  parseCertificates(currentInstructor.certificates).map(
                    (cert) => (
                      <ListItem key={cert} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <School color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={cert} />
                      </ListItem>
                    )
                  )
                ) : (
                  <Typography variant="body1">
                    Không có thông tin chứng chỉ.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="primary.main"
              >
                Kinh nghiệm giảng dạy
              </Typography>
              <Typography paragraph variant="body1">
                {currentInstructor.teachingExperience || "Không có thông tin."}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="primary.main"
              >
                Học vấn
              </Typography>
              <Typography paragraph variant="body1">
                {currentInstructor.educationBackground || "Không có thông tin."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Không còn Card thông tin liên hệ ở đây nữa */}
        </Grid>
      </Grid>

      {/* Courses Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" fontWeight="bold" py={2} color="primary.main">
          Khóa học đang dạy
        </Typography>
        <Grid container spacing={3}>
          {mapCoursesToCardFormat().length > 0 ? (
            mapCoursesToCardFormat().map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CardCourse {...course} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">
                  Giảng viên chưa có khóa học nào.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default InstructorProfile;
