import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Email,
  Phone,
  School,
  LocationOn,
  WorkOutline,
  CalendarToday,
  Edit,
  Language,
  Close as CloseIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as EmojiEventsIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  ContactPhone as ContactPhoneIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import CustomContainer from "../../components/common/CustomContainer";
import CertificateDetail from "../../components/student/profile/CertificateDetail";
import AvatarUpload from "../../components/common/AvatarUpload";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { UserStudent } from "../../../../backend/src/entities/UserStudent";
import { fetchUserEnrollments } from "../../features/enrollments/enrollmentsApiSlice";
import { selectUserEnrollments } from "../../features/enrollments/enrollmentsSelectors";

// Cập nhật mock data theo cấu trúc CSDL
const mockUserData = {
  // Từ bảng users
  id: 1,
  username: "nguyenvana",
  email: "nguyenvana@gmail.com",
  phone: "0987654321",
  role: "student",
  status: "active",
  avatar_url: "/src/assets/avatar.png",
  last_login: "2024-03-15T10:30:00",
  created_at: "2023-01-15",

  // Từ bảng user_students
  studentInfo: {
    student_code: "SV2024001",
    full_name: "Nguyễn Văn A",
    date_of_birth: "1995-05-15",
    gender: "male",
    education_level: "Đại học",
    occupation: "Developer",
    bio: "Là một lập trình viên với niềm đam mê học hỏi và phát triển bản thân",
    interests: "Programming, AI, Machine Learning",
    address: "123 Đường ABC",
    city: "TP. Hồ Chí Minh",
    country: "Việt Nam",
    learning_goals: "Trở thành Full-stack Developer",
    preferred_language: "Vietnamese",
    total_courses_enrolled: 5,
    total_courses_completed: 2,
    achievement_points: 250,
  },

  // Từ bảng enrollments và courses
  currentCourses: [
    {
      id: 1,
      title: "React & TypeScript",
      progress: 65,
      status: "active",
      enrollment_date: "2024-02-01",
      last_accessed: "2024-03-10",
    },
    {
      id: 2,
      title: "Node.js Advanced",
      progress: 30,
      status: "active",
      enrollment_date: "2024-02-15",
      last_accessed: "2024-03-09",
    },
  ],

  // Từ bảng certificates và courses
  certificates: [
    {
      id: 1,
      course_title: "JavaScript Advanced",
      certificate_number: "CERT-001",
      issue_date: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      course_title: "Web Development",
      certificate_number: "CERT-002",
      issue_date: "2023-12-20",
      status: "active",
    },
  ],

  // Từ bảng user_achievements và achievements
  achievements: [
    {
      id: 1,
      name: "Học viên tích cực",
      description: "Hoàn thành 5 khóa học",
      badge_image_url: "🏆",
      points: 100,
    },
    {
      id: 2,
      name: "Siêu sao bài tập",
      description: "Nộp 20 bài tập đúng hạn",
      badge_image_url: "⭐",
      points: 150,
    },
  ],

  // Từ bảng user_grades
  recentGrades: [
    {
      course_title: "React & TypeScript",
      grade_type: "assignment",
      score: 95,
      max_score: 100,
      graded_at: "2024-03-08",
    },
    {
      course_title: "Node.js Advanced",
      grade_type: "quiz",
      score: 85,
      max_score: 100,
      graded_at: "2024-03-05",
    },
  ],

  // Từ bảng class_attendance
  attendance: {
    total_classes: 20,
    present: 18,
    absent: 1,
    late: 1,
    attendance_rate: 90,
  },

  // Thêm dữ liệu điểm số
  grades: {
    overall: {
      gpa: 3.7,
      totalCredits: 45,
      completedCourses: 5,
    },
    courseGrades: [
      {
        course_id: 1,
        course_title: "React & TypeScript",
        final_grade: 85,
        assignments_average: 88,
        quizzes_average: 82,
        midterm_grade: 85,
        final_exam_grade: 90,
        participation_grade: 95,
        attendance_percentage: 95,
        status: "completed",
        completion_date: "2024-02-15",
      },
      {
        course_id: 2,
        course_title: "Node.js Advanced",
        final_grade: 78,
        assignments_average: 75,
        quizzes_average: 80,
        midterm_grade: 76,
        final_exam_grade: 82,
        participation_grade: 90,
        attendance_percentage: 88,
        status: "completed",
        completion_date: "2024-01-20",
      },
      // ... more courses
    ],
  },
};

const ProfileAccount: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: mockUserData.studentInfo.full_name,
    email: mockUserData.email,
    phone: mockUserData.phone,
    address: mockUserData.studentInfo.address,
    city: mockUserData.studentInfo.city,
    country: mockUserData.studentInfo.country,
    dateOfBirth: mockUserData.studentInfo.date_of_birth,
    gender: mockUserData.studentInfo.gender,
    occupation: mockUserData.studentInfo.occupation,
    education: mockUserData.studentInfo.education_level,
    bio: mockUserData.studentInfo.bio,
    interests: mockUserData.studentInfo.interests,
    learningGoals: mockUserData.studentInfo.learning_goals,
    preferredLanguage: mockUserData.studentInfo.preferred_language,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserEnrollments(user.id));
    }
  }, [dispatch, user?.id]);

  console.log("userEnrollments", userEnrollments);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("user"); // Remove invalid data
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  console.log("currentUser", user);

  // Thêm state cho form mật khẩu
  const [formPassword, setFormPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Thêm state cho modal đổi mật khẩu
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Thêm state cho dialog chứng chỉ
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const TabPanel = (props: {
    children?: React.ReactNode;
    index: number;
    value: number;
  }) => {
    const { children, value, index } = props;
    return (
      <Box
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        sx={{ py: 3 }}
      >
        {value === index && children}
      </Box>
    );
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (type: "profile" | "contact" | "personal") => {
    console.log("Submitting:", type, formData);

    switch (type) {
      case "profile":
        setEditProfileOpen(false);
        break;
      case "contact":
        setEditContactOpen(false);
        break;
      case "personal":
        setEditPersonalOpen(false);
        break;
    }
  };

  // Thêm hàm xử lý đổi mật khẩu
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm hàm submit mật khẩu
  const handlePasswordSubmit = () => {
    if (formPassword.newPassword !== formPassword.confirmPassword) {
      // Hiển thị thông báo lỗi
      return;
    }
    console.log("Submitting new password:", formPassword);
    setChangePasswordOpen(false);
    // Reset form
    setFormPassword({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAvatarChange = (file: File) => {
    // Xử lý upload avatar
    console.log("Upload avatar:", file);
    // Sau này sẽ gọi API để upload file và cập nhật avatar_url
  };

  const EditProfileModal = () => (
    <Dialog
      open={editProfileOpen}
      onClose={() => setEditProfileOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Chỉnh sửa hồ sơ
          <IconButton onClick={() => setEditProfileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Mã học viên"
            value={mockUserData.studentInfo.student_code}
            disabled
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                fontFamily: "monospace",
              },
            }}
          />
          <TextField
            fullWidth
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Giới thiệu"
            name="bio"
            multiline
            rows={3}
            value={formData.bio}
            onChange={handleFormChange}
          />
          <FormControl fullWidth>
            <InputLabel>Giới tính</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              label="Giới tính"
              onChange={(e) => handleFormChange(e as any)}
            >
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditProfileOpen(false)}>Hủy</Button>
        <Button variant="contained" onClick={() => handleSubmit("profile")}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );

  const EditContactModal = () => (
    <Dialog
      open={editContactOpen}
      onClose={() => setEditContactOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Cập nhật thông tin liên hệ
          <IconButton onClick={() => setEditContactOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Thành phố"
            name="city"
            value={formData.city}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Quốc gia"
            name="country"
            value={formData.country}
            onChange={handleFormChange}
          />
          <FormControl fullWidth>
            <InputLabel>Ngôn ngữ ưu tiên</InputLabel>
            <Select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              label="Ngôn ngữ ưu tiên"
              onChange={(e) => handleFormChange(e as any)}
            >
              <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
              <MenuItem value="English">Tiếng Anh</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditContactOpen(false)}>Hủy</Button>
        <Button variant="contained" onClick={() => handleSubmit("contact")}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Thêm modal đổi mật khẩu
  const ChangePasswordModal = () => (
    <Dialog
      open={changePasswordOpen}
      onClose={() => setChangePasswordOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Đổi mật khẩu
          <IconButton onClick={() => setChangePasswordOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Mật khẩu hiện tại"
            name="currentPassword"
            type="password"
            value={formPassword.currentPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            fullWidth
            label="Mật khẩu mới"
            name="newPassword"
            type="password"
            value={formPassword.newPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            fullWidth
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type="password"
            value={formPassword.confirmPassword}
            onChange={handlePasswordChange}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setChangePasswordOpen(false)}>Hủy</Button>
        <Button variant="contained" onClick={handlePasswordSubmit}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Thêm modal chỉnh sửa thông tin cá nhân
  const EditPersonalModal = () => (
    <Dialog
      open={editPersonalOpen}
      onClose={() => setEditPersonalOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Cập nhật thông tin cá nhân
          <IconButton onClick={() => setEditPersonalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Nghề nghiệp"
            name="occupation"
            value={formData.occupation}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Trình độ học vấn"
            name="education"
            value={formData.education}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Sở thích"
            name="interests"
            multiline
            rows={2}
            value={formData.interests}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Mục tiêu học tập"
            name="learningGoals"
            multiline
            rows={2}
            value={formData.learningGoals}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày sinh"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleFormChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditPersonalOpen(false)}>Hủy</Button>
        <Button variant="contained" onClick={() => handleSubmit("personal")}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <CustomContainer>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thông tin tài khoản
        </Typography>

        <Grid container spacing={3}>
          {/* Left Column - Profile Summary */}
          <Grid item xs={12} md={4}>
            {/* Profile Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <AvatarUpload
                    currentAvatar={user?.avatarUrl}
                    onAvatarChange={handleAvatarChange}
                  />
                  <Typography variant="h5" gutterBottom>
                    {user?.userStudent?.fullName ||
                      user?.userStudentAcademy?.fullName}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Mã học viên: {user?.userStudent?.id}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tham gia từ{" "}
                    {new Date(user?.createdAt).toLocaleDateString("vi-VN")}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    sx={{ mt: 1 }}
                    onClick={() => setEditProfileOpen(true)}
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Learning Stats */}
                <Grid
                  container
                  spacing={2}
                  display="flex"
                  justifyContent="center"
                >
                  <Grid item>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <SchoolIcon
                        color="primary"
                        sx={{ fontSize: 32, mb: 1 }}
                      />
                      <Typography variant="h6">
                        {mockUserData.studentInfo.total_courses_enrolled}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Khóa học
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <CheckCircleIcon
                        color="success"
                        sx={{ fontSize: 32, mb: 1 }}
                      />
                      <Typography variant="h6">
                        {mockUserData.studentInfo.total_courses_completed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đã hoàn thành
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Nút đổi mật khẩu */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Tabbed Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                >
                  <Tab
                    icon={<MenuBookIcon />}
                    iconPosition="start"
                    label="Học tập"
                    sx={{
                      minHeight: 48,
                      "& .MuiTab-iconWrapper": {
                        marginRight: 1,
                        marginBottom: "0 !important",
                      },
                    }}
                  />
                  <Tab
                    icon={<PersonIcon />}
                    iconPosition="start"
                    label="cá nhân"
                    sx={{
                      minHeight: 48,
                      "& .MuiTab-iconWrapper": {
                        marginRight: 1,
                        marginBottom: "0 !important",
                      },
                    }}
                  />
                  <Tab
                    icon={<ContactPhoneIcon />}
                    iconPosition="start"
                    label="liên hệ"
                    sx={{
                      minHeight: 48,
                      "& .MuiTab-iconWrapper": {
                        marginRight: 1,
                        marginBottom: "0 !important",
                      },
                    }}
                  />
                  <Tab
                    icon={<AssessmentIcon />}
                    iconPosition="start"
                    label="Bảng điểm"
                    sx={{
                      minHeight: 48,
                      "& .MuiTab-iconWrapper": {
                        marginRight: 1,
                        marginBottom: "0 !important",
                      },
                    }}
                  />
                </Tabs>
              </Box>

              {/* Tab Học tập */}
              <TabPanel value={currentTab} index={0}>
                <Stack spacing={3} px={2}>
                  {/* Current Courses */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Khóa học đang học
                    </Typography>
                    <List>
                      {mockUserData.currentCourses.map((course) => (
                        <ListItem key={course.id}>
                          <ListItemText
                            primary={course.title}
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={course.progress}
                                      sx={{ height: 6, borderRadius: 1 }}
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {course.progress}%
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Truy cập gần nhất:{" "}
                                  {new Date(
                                    course.last_accessed
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Divider />

                  {/* Certificates */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Chứng chỉ đã đạt được
                    </Typography>
                    <List>
                      {mockUserData.certificates.map((cert) => (
                        <ListItem
                          key={cert.id}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            mb: 1,
                            "&:last-child": {
                              mb: 0,
                            },
                          }}
                        >
                          <ListItemIcon>
                            <School color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={cert.course_title}
                            secondary={
                              <>
                                Cấp ngày:{" "}
                                {new Date(cert.issue_date).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
                                | Số chứng chỉ: {cert.certificate_number}
                              </>
                            }
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              setSelectedCertificate({
                                ...cert,
                                student_name:
                                  mockUserData.studentInfo.full_name,
                                student_code:
                                  mockUserData.studentInfo.student_code,
                                grade: "Xuất sắc",
                                instructor_name: "John Doe",
                                instructor_title: "Senior Developer",
                                certificate_url: "/path/to/certificate.jpg",
                              })
                            }
                            sx={{ minWidth: 100 }}
                          >
                            Xem chi tiết
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Stack>
              </TabPanel>

              {/* Tab Thông tin cá nhân */}
              <TabPanel value={currentTab} index={1}>
                <Stack spacing={2} px={2}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Mã học viên
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                        fontWeight: "medium",
                        color: "primary.main",
                      }}
                    >
                      {mockUserData.studentInfo.student_code}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Giới thiệu
                    </Typography>
                    <Typography variant="body1">
                      {mockUserData.studentInfo.bio}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Mục tiêu học tập
                    </Typography>
                    <Typography variant="body1">
                      {mockUserData.studentInfo.learning_goals}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Sở thích
                    </Typography>
                    <Typography variant="body1">
                      {mockUserData.studentInfo.interests}
                    </Typography>
                  </Box>

                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngày sinh"
                        secondary={new Date(
                          mockUserData.studentInfo.date_of_birth
                        ).toLocaleDateString("vi-VN")}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkOutline />
                      </ListItemIcon>
                      <ListItemText
                        primary="Nghề nghiệp"
                        secondary={mockUserData.studentInfo.occupation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <School />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trình độ học vấn"
                        secondary={mockUserData.studentInfo.education_level}
                      />
                    </ListItem>
                  </List>

                  {/* Nút chỉnh sửa thông tin cá nhân */}
                  <Box sx={{ mt: 2, px: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      size="small"
                      onClick={() => setEditPersonalOpen(true)}
                    >
                      Cập nhật thông tin cá nhân
                    </Button>
                  </Box>
                </Stack>
              </TabPanel>

              {/* Tab Thông tin liên hệ */}
              <TabPanel value={currentTab} index={2}>
                <List>
                  {/* Email */}
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body1">Email</Typography>
                          {mockUserData.status === "active" && (
                            <Chip
                              label="Đã xác thực"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {mockUserData.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Email chính để nhận thông báo
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>

                  {/* Phone */}
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body1">Số điện thoại</Typography>
                          {mockUserData.status === "active" && (
                            <Chip
                              label="Đã xác thực"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {mockUserData.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Số điện thoại để liên hệ và xác thực
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>

                  {/* Address */}
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Địa chỉ"
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {mockUserData.studentInfo.address}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Typography variant="body2">
                              {mockUserData.studentInfo.city}
                            </Typography>
                            <Typography variant="body2">•</Typography>
                            <Typography variant="body2">
                              {mockUserData.studentInfo.country}
                            </Typography>
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>

                  {/* Additional Contact Info */}
                  <ListItem>
                    <ListItemIcon>
                      <Language />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ngôn ngữ ưu tiên"
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {mockUserData.studentInfo.preferred_language}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ngôn ngữ sử dụng trong khóa học và thông báo
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2, px: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    size="small"
                    onClick={() => setEditPersonalOpen(true)}
                  >
                    Cập nhật thông tin cá nhân
                  </Button>
                </Box>
              </TabPanel>

              {/* Tab Bảng điểm */}
              <TabPanel value={currentTab} index={3}>
                <Stack spacing={3} px={2}>
                  {/* Overall Statistics */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Tổng quan
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={4}>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4" color="primary">
                              {mockUserData.grades.overall.gpa}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Điểm trung bình
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={4}>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4">
                              {mockUserData.grades.overall.totalCredits}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tổng số tín chỉ
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={4}>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4" color="success.main">
                              {mockUserData.grades.overall.completedCourses}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Khóa học hoàn thành
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Course Grades */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Chi tiết điểm từng khóa học
                    </Typography>
                    {mockUserData.grades.courseGrades.map((course) => (
                      <Card key={course.course_id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {course.course_title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Hoàn thành:{" "}
                              {new Date(
                                course.completion_date
                              ).toLocaleDateString("vi-VN")}
                            </Typography>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Stack spacing={1}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Điểm cuối khóa:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {course.final_grade}/100
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Điểm bài tập:
                                  </Typography>
                                  <Typography variant="body2">
                                    {course.assignments_average}/100
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Điểm kiểm tra:
                                  </Typography>
                                  <Typography variant="body2">
                                    {course.quizzes_average}/100
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Stack spacing={1}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Điểm giữa kỳ:
                                  </Typography>
                                  <Typography variant="body2">
                                    {course.midterm_grade}/100
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Điểm cuối kỳ:
                                  </Typography>
                                  <Typography variant="body2">
                                    {course.final_exam_grade}/100
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Tỷ lệ tham gia:
                                  </Typography>
                                  <Typography variant="body2">
                                    {course.attendance_percentage}%
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          </Grid>

                          <LinearProgress
                            variant="determinate"
                            value={course.final_grade}
                            sx={{
                              mt: 2,
                              height: 8,
                              borderRadius: 1,
                              backgroundColor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                  course.final_grade >= 80
                                    ? "success.main"
                                    : course.final_grade >= 65
                                    ? "warning.main"
                                    : "error.main",
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Stack>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <EditProfileModal />
      <EditContactModal />
      <EditPersonalModal />
      <ChangePasswordModal />

      {/* Add CertificateDetail dialog */}
      {selectedCertificate && (
        <CertificateDetail
          open={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}
    </CustomContainer>
  );
};

export default ProfileAccount;
