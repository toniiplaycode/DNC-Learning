import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Grow,
  Fade,
  Zoom,
  Slide,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FeaturedCourses from "../../components/student/home/FeaturedCourses";
import FeaturedInstructors from "../../components/student/home/FeaturedInstructors";
import FeaturedForumDiscussions from "../../components/student/home/FeaturedForumDiscussions";
import {
  School,
  People,
  AutoStories,
  Quiz,
  Forum,
  ChatBubble,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Thêm các variants cho animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Thêm mảng features để render
  const features = [
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: "Khóa học chất lượng",
      description:
        "Học tập với các khóa học được thiết kế bởi giảng viên chuyên môn cao",
      color: "primary.main",
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: "Giảng viên chuyên nghiệp",
      description: "Đội ngũ giảng viên giàu kinh nghiệm, nhiệt tình và tận tâm",
      color: "success.main",
    },
    {
      icon: <AutoStories sx={{ fontSize: 40 }} />,
      title: "Tài liệu phong phú",
      description: "Hệ thống tài liệu học tập đa dạng, cập nhật liên tục",
      color: "info.main",
    },
    {
      icon: <Quiz sx={{ fontSize: 40 }} />,
      title: "Bài tập trắc nghiệm",
      description: "Hệ thống bài tập trắc nghiệm giúp củng cố kiến thức",
      color: "warning.main",
    },
    {
      icon: <Forum sx={{ fontSize: 40 }} />,
      title: "Diễn đàn thảo luận",
      description:
        "Không gian trao đổi, thảo luận với giảng viên và học viên khác",
      color: "primary.main",
    },
    {
      icon: <ChatBubble sx={{ fontSize: 40 }} />,
      title: "Hỗ trợ 24/7 với AI",
      description: "Chatbot AI luôn sẵn sàng giải đáp thắc mắc của bạn",
      color: "error.main",
    },
  ];

  return (
    <>
      {/* Hero Section với animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
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
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h4"
                    component={motion.h1}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    gutterBottom
                    fontWeight="bold"
                    sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}
                  >
                    Nền tảng hỗ trợ học tập
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Box component="p" sx={{ color: "primary.light" }}>
                        DNC LEARNING
                      </Box>
                    </motion.div>
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
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Features Section với animation */}
      <Box sx={{ bgcolor: "background.paper", p: 8 }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h3"
                component={motion.h2}
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  mb: 2,
                }}
              >
                Tại sao chọn DNC Learning?
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 800, mx: "auto" }}
              >
                Nền tảng học tập trực tuyến với đầy đủ công cụ hỗ trợ việc học
                tập và phát triển kỹ năng của bạn
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "box-shadow 0.3s",
                        "&:hover": {
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <CardContent
                        sx={{ flexGrow: 1, textAlign: "center", p: 4 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              p: 2,
                              borderRadius: "50%",
                              bgcolor: `${feature.color}15`,
                              color: feature.color,
                              mb: 2,
                            }}
                          >
                            {feature.icon}
                          </Box>
                        </motion.div>
                        <Typography
                          variant="h5"
                          component="h3"
                          gutterBottom
                          sx={{ fontWeight: "bold" }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Featured Sections với animation */}
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <FeaturedCourses />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FeaturedInstructors />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <FeaturedForumDiscussions />
        </motion.div>
      </Container>
    </>
  );
};

export default HomePage;
