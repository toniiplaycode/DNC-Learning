import { Container, Typography, Grid, Button, Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FeaturedCourses from "../../components/student/home/FeaturedCourses";
import FeaturedInstructors from "../../components/student/home/FeaturedInstructors";
import FeaturedForumDiscussions from "../../components/student/home/FeaturedForumDiscussions";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section with Background */}
      <Box
        sx={{
          bgcolor: "secondary.main",
          color: "text.primary",
          pt: 15,
          pb: 8,
          position: "relative",
        }}
      >
        <Container>
          <Grid container alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
              >
                Nền tảng hỗ trợ học tập
                <Box component="p" sx={{ color: "primary.main" }}>
                  {" "}
                  DNC LEARNING
                </Box>
              </Typography>
              <Typography variant="h6" paragraph>
                Khám phá các khóa học từ các giảng viên chuyên nghiệp
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "primary.dark",
                    "&:hover": { bgcolor: "primary.main" },
                  }}
                  onClick={() => navigate("/courses")}
                >
                  Khám phá khóa học
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/src/assets/banner.png"
                alt="Learning"
                sx={{ width: "100%", maxWidth: 1000, objectFit: "cover" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <FeaturedCourses />
        <FeaturedInstructors />
        <FeaturedForumDiscussions />
      </Container>
    </>
  );
};

export default HomePage;
