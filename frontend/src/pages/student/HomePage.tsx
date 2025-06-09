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
  Paper,
  alpha,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FeaturedCourses from "../../components/student/home/FeaturedCourses";
import FeaturedInstructors from "../../components/student/home/FeaturedInstructors";
import FeaturedForumDiscussions from "../../components/student/home/FeaturedForumDiscussions";
import {
  School,
  AutoStories,
  Timeline as TimelineIcon,
  CheckCircle,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineDot,
} from "@mui/lab";

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const timelineSteps = [
    {
      semester: "Học kỳ 1",
      title: "Kiến thức đại cương",
      description:
        "Xây dựng nền tảng kiến thức cơ bản và các môn học đại cương",
      courses: ["Môn học cơ sở", "Môn học đại cương", "Kỹ năng cơ bản"],
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.05),
      chipBgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      semester: "Học kỳ 2",
      title: "Kiến thức cơ sở ngành",
      description:
        "Tiếp cận các môn học cơ sở ngành và bắt đầu hình thành tư duy chuyên môn",
      courses: ["Môn cơ sở ngành", "Thực hành cơ bản", "Phương pháp học tập"],
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.05),
      chipBgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      semester: "Học kỳ 3",
      title: "Kiến thức chuyên ngành",
      description:
        "Đi sâu vào các môn học chuyên ngành và phát triển kỹ năng thực hành",
      courses: ["Môn chuyên ngành", "Thực hành chuyên sâu", "Dự án nhóm"],
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.05),
      chipBgColor: alpha(theme.palette.info.main, 0.1),
    },
    {
      semester: "Học kỳ 4",
      title: "Tổng hợp và thực tập",
      description:
        "Tổng hợp kiến thức, thực tập và chuẩn bị cho đồ án tốt nghiệp",
      courses: [
        "Đồ án chuyên ngành",
        "Thực tập thực tế",
        "Định hướng nghề nghiệp",
      ],
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.05),
      chipBgColor: alpha(theme.palette.warning.main, 0.1),
    },
    {
      semester: "Học kỳ ...",
      title: "Tiếp tục phát triển",
      description:
        "Khám phá thêm các học kỳ tiếp theo với nhiều kiến thức và kỹ năng chuyên sâu hơn",
      courses: ["Chuyên sâu nâng cao", "Dự án thực tế", "Nghiên cứu khoa học"],
      color: "#555",
      bgColor: alpha("#555", 0.05),
      chipBgColor: alpha("#555", 0.1),
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

      {/* Student Types Section */}
      <Box sx={{ bgcolor: "background.default", py: 6 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                component={motion.h2}
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  mb: 1,
                }}
              >
                Dành cho mọi đối tượng học viên
              </Typography>
              <Typography
                variant="body1"
                color="text.primary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                DNC Learning cung cấp chương trình học tập phù hợp với cả sinh
                viên chính quy và học viên tự do
              </Typography>
            </Box>
          </motion.div>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ mt: 2 }}
          >
            {/* Sinh viên chính quy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        p: 1.5,
                        borderRadius: "50%",
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: "primary.main",
                      }}
                    >
                      <School sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: "bold" }}
                    >
                      Sinh viên chính quy
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <List dense disablePadding>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Theo dõi tiến độ học tập theo chương trình đào tạo"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tham gia các lớp học trực tuyến với giảng viên"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tương tác và trao đổi với bạn học cùng lớp"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Được những quyền lợi như học viên tự do"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    </List>
                  </Stack>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={() => navigate("/academic-program")}
                    fullWidth
                  >
                    Xem chương trình đào tạo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Học viên tự do */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        p: 1.5,
                        borderRadius: "50%",
                        bgcolor: `${theme.palette.info.main}15`,
                        color: "info.main",
                      }}
                    >
                      <AutoStories sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: "bold" }}
                    >
                      Học viên tự do
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <List dense disablePadding>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "info.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Học tập theo tốc độ và lịch trình cá nhân"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "info.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Truy cập nội dung học tập mọi lúc, mọi nơi"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "info.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Thực hành và làm bài tập tự đánh giá"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "info.main", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Nhận chứng chỉ hoàn thành khóa học"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    </List>
                  </Stack>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    onClick={() => navigate("/courses")}
                    fullWidth
                  >
                    Khám phá khóa học
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* Learning Path Timeline Section */}
      <Box sx={{ bgcolor: "background.default", pb: 8, pt: 4 }}>
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                Chương trình đào tạo chuẩn
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 800, mx: "auto" }}
              >
                Khám phá chương trình học được thiết kế theo từng học kỳ, với
                nhiều học kỳ chuyên sâu đang chờ đón bạn
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ position: "relative", mt: 4, ml: { xs: 0, md: "-30%" } }}>
            <Timeline position="alternate">
              {timelineSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <TimelineItem>
                    <TimelineOppositeContent
                      sx={{
                        flex: 0.5,
                        display: { xs: "none", md: "block" },
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ fontWeight: "bold" }}
                      >
                        {step.semester}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot
                        sx={{
                          bgcolor: step.color,
                          p: 2,
                          boxShadow: `0 0 0 4px ${alpha(step.color, 0.1)}`,
                        }}
                      >
                        <School />
                      </TimelineDot>
                      {index < timelineSteps.length - 1 && (
                        <TimelineConnector
                          sx={{
                            bgcolor: alpha(step.color, 0.2),
                            height: "100px",
                          }}
                        />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          bgcolor: step.bgColor,
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: step.color, fontWeight: "bold", mb: 1 }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {step.description}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {step.courses.map((course, courseIndex) => (
                            <Chip
                              key={courseIndex}
                              label={course}
                              size="small"
                              sx={{
                                bgcolor: step.chipBgColor,
                                color: step.color,
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Stack>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                </motion.div>
              ))}
            </Timeline>
          </Box>
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
