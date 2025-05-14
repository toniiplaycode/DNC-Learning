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
  useTheme,
  Button,
  alpha,
  IconButton,
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
  OpenInNew,
  Favorite,
  PlayArrow,
  Grade,
} from "@mui/icons-material";
import CardCourse from "../../components/common/CardCourse";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchInstructorById } from "../../features/user_instructors/instructorsApiSlice";

const InstructorProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { currentInstructor, status, error } = useAppSelector(
    (state) => state.instructors
  );

  console.log("Current Instructor:", currentInstructor);

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
      for: course?.for || "both",
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
      {/* Profile Card */}
      <Card
        elevation={4}
        sx={{
          borderRadius: 4,
          my: 6,
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Avatar Column */}
            <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
              <Box sx={{ mt: { xs: 0, md: -12 }, position: "relative" }}>
                <Avatar
                  src={
                    currentInstructor.user?.avatarUrl ||
                    "/src/assets/default-avatar.png"
                  }
                  sx={{
                    width: 180,
                    height: 180,
                    border: 5,
                    borderColor: "white",
                    mx: "auto",
                    boxShadow: 4,
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
                {currentInstructor.verificationStatus === "verified" && (
                  <Chip
                    icon={<VerifiedUser />}
                    label="Đã xác thực"
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontWeight: "bold",
                      boxShadow: 2,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Rating
                  value={parseFloat(currentInstructor.averageRating || "0")}
                  precision={0.5}
                  readOnly
                  size="large"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: theme.palette.warning.main,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "medium", mt: 0.5 }}
                >
                  <strong>{currentInstructor.averageRating || "0"}</strong>/5 •{" "}
                  <strong>{currentInstructor.totalReviews || 0}</strong> đánh
                  giá
                </Typography>
              </Box>

              {/* Stats Cards */}
              <Stack spacing={2} sx={{ mt: 4 }}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    boxShadow: "none",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Person
                      sx={{ color: theme.palette.primary.main, fontSize: 32 }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {currentInstructor.totalStudents || 0}
                      </Typography>
                      <Typography variant="body2">Học viên</Typography>
                    </Box>
                  </Stack>
                </Card>

                <Card
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    boxShadow: "none",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Assignment
                      sx={{ color: theme.palette.secondary.dark, fontSize: 32 }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="secondary.dark"
                      >
                        {currentInstructor.totalCourses || 0}
                      </Typography>
                      <Typography variant="body2">Khóa học</Typography>
                    </Box>
                  </Stack>
                </Card>

                <Card
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    boxShadow: "none",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Star
                      sx={{ color: theme.palette.warning.main, fontSize: 32 }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="warning.main"
                      >
                        {currentInstructor.totalReviews || 0}
                      </Typography>
                      <Typography variant="body2">Đánh giá</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Stack>
            </Grid>

            {/* Info Column */}
            <Grid item xs={12} md={9}>
              <Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {currentInstructor.fullName}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "text.secondary", fontWeight: "medium" }}
                >
                  {currentInstructor.professionalTitle}
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    borderRadius: 3,
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {currentInstructor.specialization}
                  </Typography>
                </Paper>

                {/* Contact & Social Links */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        boxShadow: 1,
                        borderRadius: 2,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Email
                            sx={{ color: theme.palette.primary.main, mr: 1.5 }}
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {currentInstructor.user?.email ||
                              "Không có thông tin"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Phone
                            sx={{ color: theme.palette.primary.main, mr: 1.5 }}
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {currentInstructor.user?.phone ||
                              "Không có thông tin"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        boxShadow: 1,
                        borderRadius: 2,
                        height: "100%",
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        {currentInstructor.linkedinProfile && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LinkedIn sx={{ color: "#0077B5", mr: 1.5 }} />
                            <Typography
                              variant="body1"
                              component="a"
                              href={`https://linkedin.com/in/${currentInstructor.linkedinProfile}`}
                              target="_blank"
                              sx={{
                                textDecoration: "none",
                                color: "text.primary",
                                fontWeight: "medium",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              {currentInstructor.linkedinProfile}
                              <OpenInNew sx={{ ml: 0.5, fontSize: 16 }} />
                            </Typography>
                          </Box>
                        )}
                        {currentInstructor.website && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Work
                              sx={{
                                color: theme.palette.primary.main,
                                mr: 1.5,
                              }}
                            />
                            <Typography
                              variant="body1"
                              component="a"
                              href={currentInstructor.website}
                              target="_blank"
                              sx={{
                                textDecoration: "none",
                                color: "text.primary",
                                fontWeight: "medium",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              {currentInstructor.website}
                              <OpenInNew sx={{ ml: 0.5, fontSize: 16 }} />
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>

                {/* Expertise Areas */}
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  Chuyên môn
                </Typography>
                <Box sx={{ mb: 4 }}>
                  {parseExpertiseAreas(currentInstructor.expertiseAreas).map(
                    (area) => (
                      <Chip
                        key={area}
                        label={area}
                        sx={{
                          m: 0.5,
                          px: 1.5,
                          py: 2.5,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: "primary.dark",
                          fontWeight: "medium",
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        }}
                      />
                    )
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bio, Experience & Certificates Tabs */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 2, height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Person sx={{ color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  Giới thiệu
                </Typography>
              </Box>

              <Typography paragraph variant="body1" sx={{ lineHeight: 1.8 }}>
                {currentInstructor.bio || "Không có thông tin."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 2, height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Work sx={{ color: theme.palette.secondary.dark }} />
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  Kinh nghiệm giảng dạy
                </Typography>
              </Box>

              <Typography
                paragraph
                variant="body1"
                sx={{ lineHeight: 1.8, mb: 3 }}
              >
                {currentInstructor.teachingExperience || "Không có thông tin."}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <School sx={{ color: theme.palette.info.main }} />
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  Học vấn
                </Typography>
              </Box>

              <Typography paragraph variant="body1" sx={{ lineHeight: 1.8 }}>
                {currentInstructor.educationBackground || "Không có thông tin."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificates */}
      <Card sx={{ borderRadius: 4, boxShadow: 2, mb: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <Grade sx={{ color: theme.palette.success.main }} />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Chứng chỉ
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {parseCertificates(currentInstructor.certificates).length > 0 ? (
              parseCertificates(currentInstructor.certificates).map(
                (cert, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        p: 2,
                        height: "100%",
                        bgcolor:
                          index % 2 === 0
                            ? alpha(theme.palette.primary.light, 0.05)
                            : alpha(theme.palette.secondary.light, 0.05),
                        border: "1px solid",
                        borderColor:
                          index % 2 === 0
                            ? alpha(theme.palette.primary.light, 0.3)
                            : alpha(theme.palette.secondary.light, 0.3),
                        borderRadius: 2,
                        boxShadow: "none",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <School color="primary" sx={{ mt: 0.5 }} />
                        <Typography variant="body1" fontWeight="medium">
                          {cert}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                )
              )
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontStyle: "italic", pl: 2 }}>
                  Không có thông tin chứng chỉ.
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Courses Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <PlayArrow sx={{ color: theme.palette.warning.main }} />
            </Box>
            <Typography variant="h4" fontWeight="bold">
              Khóa học đang dạy
            </Typography>
          </Box>

          {mapCoursesToCardFormat().length > 3 && (
            <Button
              variant="outlined"
              endIcon={<OpenInNew />}
              sx={{
                borderRadius: 2,
                fontWeight: "bold",
                px: 2,
              }}
            >
              Xem tất cả
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {mapCoursesToCardFormat().length > 0 ? (
            mapCoursesToCardFormat().map((course) => (
              <Grid item xs={12} sm={4} md={3} key={course.id}>
                <CardCourse {...course} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  borderRadius: 4,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Giảng viên chưa có khóa học nào.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vui lòng quay lại sau để xem các khóa học mới.
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
