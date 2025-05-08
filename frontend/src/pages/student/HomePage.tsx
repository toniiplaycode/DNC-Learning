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
          position: "relative",
          backgroundImage: "url('/src/assets/banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay for better text readability
            zIndex: 1,
          },
        }}
      >
        <Container
          sx={{
            position: "relative",
            zIndex: 2, // Places content above the dark overlay
            color: "white",
            py: 8,
          }}
        >
          <Grid container>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
                sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}
              >
                Nền tảng hỗ trợ học tập
                <Box component="p" sx={{ color: "primary.light" }}>
                  {" "}
                  DNC LEARNING
                </Box>
              </Typography>
              <Typography
                variant="h6"
                paragraph
                sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}
              >
                Khám phá các khóa học từ các giảng viên chuyên nghiệp
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    fontWeight: "bold",
                    px: 4,
                    py: 1.5,
                  }}
                  onClick={() => navigate("/courses")}
                >
                  Khám phá khóa học
                </Button>
              </Stack>
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
