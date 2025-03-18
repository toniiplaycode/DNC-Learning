import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
  Tabs,
  Tab,
  Paper,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  Email,
  Phone,
  CalendarToday,
  School,
  Language,
  LocationOn,
  LinkedIn,
  Work,
  Assignment,
  VerifiedUser,
  Star,
  Close,
  Group,
  BarChart,
} from "@mui/icons-material";

interface DialogInstructorDetailProps {
  open: boolean;
  onClose: () => void;
  instructorId: number | null;
}

// Mock data for instructor detail
const mockInstructorDetail = {
  id: 1,
  name: "TS. Nguyễn Văn A",
  avatar: "/src/assets/avatar.png",
  cover: "/src/assets/logo.png",
  email: "nguyenvana@example.com",
  phone: "0912345678",
  address: "Quận 1, TP. Hồ Chí Minh",
  website: "https://instructor-portfolio.com",
  linkedin: "https://linkedin.com/in/instructor",
  bio: "Tiến sĩ Khoa học Máy tính với hơn 10 năm kinh nghiệm giảng dạy và nghiên cứu trong lĩnh vực AI và Phát triển Web. Tôi từng làm việc tại các công ty công nghệ hàng đầu và có niềm đam mê chia sẻ kiến thức với sinh viên và người học.",
  specialization: "Web Development, AI/ML",
  joinDate: "2022-01-15T00:00:00Z",
  verified: true,
  status: "active",
  education: [
    {
      degree: "Tiến sĩ Khoa học Máy tính",
      institution: "Đại học Quốc gia Hà Nội",
      year: "2015-2019",
    },
    {
      degree: "Thạc sĩ Kỹ thuật Phần mềm",
      institution: "Đại học Bách Khoa TP.HCM",
      year: "2012-2014",
    },
    {
      degree: "Cử nhân Công nghệ Thông tin",
      institution: "Đại học Bách Khoa Hà Nội",
      year: "2008-2012",
    },
  ],
  experience: [
    {
      position: "Senior Software Engineer",
      company: "Tech Company XYZ",
      year: "2019-2022",
    },
    {
      position: "Web Developer",
      company: "Digital Agency ABC",
      year: "2014-2019",
    },
    {
      position: "Intern Developer",
      company: "Startup DEF",
      year: "2012-2014",
    },
  ],
  courses: [
    {
      id: 101,
      title: "Lập trình Web với React & TypeScript",
      students: 245,
      rating: 4.8,
      status: "active",
    },
    {
      id: 102,
      title: "Machine Learning cơ bản",
      students: 180,
      rating: 4.5,
      status: "active",
    },
    {
      id: 103,
      title: "Node.js cho người mới bắt đầu",
      students: 120,
      rating: 4.6,
      status: "draft",
    },
  ],
  reviews: [
    {
      id: 1,
      student: "Học viên A",
      avatar: "/src/assets/avatar.png",
      rating: 5,
      date: "2023-05-15T00:00:00Z",
      comment:
        "Giảng viên rất nhiệt tình và am hiểu sâu về chủ đề. Bài giảng được trình bày rõ ràng và dễ hiểu.",
    },
    {
      id: 2,
      student: "Học viên B",
      avatar: "/src/assets/avatar.png",
      rating: 4,
      date: "2023-04-20T00:00:00Z",
      comment:
        "Khóa học rất hữu ích, tôi đã học được nhiều kỹ năng mới. Giảng viên rất tận tâm trong việc giải đáp thắc mắc.",
    },
    {
      id: 3,
      student: "Học viên C",
      avatar: "/src/assets/avatar.png",
      rating: 5,
      date: "2023-03-10T00:00:00Z",
      comment:
        "Tôi rất hài lòng với khóa học này. Nội dung cập nhật và phù hợp với nhu cầu thực tế của thị trường.",
    },
  ],
  statistics: {
    totalStudents: 545,
    totalCourses: 3,
    totalRevenue: 98500000,
    averageRating: 4.7,
    completionRate: 87,
    monthlyStudents: [45, 60, 75, 90, 85, 70, 65, 80, 95, 105, 110, 120],
    monthlyRevenue: [
      8500000, 10000000, 12500000, 15000000, 14000000, 12000000, 11000000,
      13500000, 16000000, 17500000, 18500000, 20000000,
    ],
  },
};

const DialogInstructorDetail = ({
  open,
  onClose,
  instructorId,
}: DialogInstructorDetailProps) => {
  const [tabValue, setTabValue] = useState(0);

  // Sử dụng mockInstructorDetail mỗi lần cho mục đích demo
  const instructor = mockInstructorDetail;

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xử lý chuyển tab
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!instructor) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="instructor-detail-dialog"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Thông tin chi tiết giảng viên</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Hồ sơ giảng viên */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
            }}
          >
            <Avatar src={instructor.avatar} sx={{ width: 120, height: 120 }} />
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Typography variant="h5">{instructor.name}</Typography>
                {instructor.verified && (
                  <Tooltip title="Giảng viên đã được xác minh">
                    <VerifiedUser color="primary" />
                  </Tooltip>
                )}
                <Chip
                  label={
                    instructor.status === "active"
                      ? "Đang hoạt động"
                      : instructor.status === "blocked"
                      ? "Đã bị khóa"
                      : instructor.status === "pending"
                      ? "Chờ xác minh"
                      : "Không hoạt động"
                  }
                  color={
                    instructor.status === "active"
                      ? "success"
                      : instructor.status === "blocked"
                      ? "error"
                      : instructor.status === "pending"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                />
              </Box>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {instructor.specialization}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Tooltip title="Email">
                  <IconButton size="small" color="primary">
                    <Email />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Điện thoại">
                  <IconButton size="small" color="primary">
                    <Phone />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Website">
                  <IconButton size="small" color="primary">
                    <Language />
                  </IconButton>
                </Tooltip>
                <Tooltip title="LinkedIn">
                  <IconButton size="small" color="primary">
                    <LinkedIn />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Tab navigation */}
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="Thông tin chung" />
          <Tab label="Khóa học" />
          <Tab label="Đánh giá" />
          <Tab label="Thống kê" />
        </Tabs>

        {/* Tab thông tin chung */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin liên hệ
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={instructor.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText
                        primary="Số điện thoại"
                        secondary={instructor.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText
                        primary="Địa chỉ"
                        secondary={instructor.address}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Language />
                      </ListItemIcon>
                      <ListItemText
                        primary="Website"
                        secondary={instructor.website}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LinkedIn />
                      </ListItemIcon>
                      <ListItemText
                        primary="LinkedIn"
                        secondary={instructor.linkedin}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngày tham gia"
                        secondary={new Date(
                          instructor.joinDate
                        ).toLocaleDateString("vi-VN")}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Giới thiệu
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {instructor.bio}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Chuyên môn
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {instructor.specialization
                        .split(", ")
                        .map((spec, index) => (
                          <Chip
                            key={index}
                            label={spec}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Học vấn
                  </Typography>
                  <List>
                    {instructor.education.map((edu, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <Divider variant="inset" component="li" />
                        )}
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <School />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={edu.degree}
                            secondary={`${edu.institution} | ${edu.year}`}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kinh nghiệm làm việc
                  </Typography>
                  <List>
                    {instructor.experience.map((exp, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <Divider variant="inset" component="li" />
                        )}
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <Work />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={exp.position}
                            secondary={`${exp.company} | ${exp.year}`}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab khóa học */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Số học viên</TableCell>
                  <TableCell>Đánh giá</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instructor.courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.students}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating
                          value={course.rating}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({course.rating})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          course.status === "active" ? "Đang mở" : "Bản nháp"
                        }
                        color={
                          course.status === "active" ? "success" : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab đánh giá */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    Đánh giá từ học viên ({instructor.reviews.length})
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Rating
                      value={instructor.statistics.averageRating}
                      precision={0.1}
                      readOnly
                    />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {instructor.statistics.averageRating}/5
                    </Typography>
                  </Box>
                </Box>

                <List>
                  {instructor.reviews.map((review) => (
                    <React.Fragment key={review.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={review.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography variant="subtitle1">
                                {review.student}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {new Date(review.date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Rating
                                value={review.rating}
                                size="small"
                                readOnly
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2">
                                {review.comment}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Tab thống kê */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tổng quan
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Group />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tổng số học viên"
                        secondary={instructor.statistics.totalStudents}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tổng số khóa học"
                        secondary={instructor.statistics.totalCourses}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Star />
                      </ListItemIcon>
                      <ListItemText
                        primary="Đánh giá trung bình"
                        secondary={`${instructor.statistics.averageRating}/5`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BarChart />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tỉ lệ hoàn thành khóa học"
                        secondary={`${instructor.statistics.completionRate}%`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Doanh thu
                  </Typography>
                  <Typography variant="h4" gutterBottom color="primary">
                    {formatCurrency(instructor.statistics.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng doanh thu từ tất cả các khóa học
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Tab Panel component
function TabPanel(props: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instructor-tabpanel-${index}`}
      aria-labelledby={`instructor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default DialogInstructorDetail;
