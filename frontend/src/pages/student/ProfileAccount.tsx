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
  CircularProgress,
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
import {
  fetchUserEnrollments,
  fetchUserProgress,
} from "../../features/enrollments/enrollmentsApiSlice";
import {
  selectUserEnrollments,
  selectUserProgress,
} from "../../features/enrollments/enrollmentsSelectors";
import { fetchUserCertificates } from "../../features/certificates/certificatesApiSlice";
import { selectUserCertificates } from "../../features/certificates/certificatesSelectors";
import { fetchUserGradesByUser } from "../../features/user-grades/userGradesSlice";
import { selectUserGradesByUser } from "../../features/user-grades/userGradesSelectors";

const ProfileAccount: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const userCertificates = useAppSelector(selectUserCertificates);
  const userGrades = useAppSelector(selectUserGradesByUser);
  const userProgress = useAppSelector(selectUserProgress);
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.userStudent?.fullName,
    email: user?.email,
    phone: user?.phone,
    address: user?.address,
    city: user?.city,
    country: user?.country,
    dateOfBirth: user?.dateOfBirth,
    gender: user?.gender,
    occupation: user?.occupation,
    education: user?.education,
    bio: user?.bio,
    interests: user?.interests,
    learningGoals: user?.learningGoals,
    preferredLanguage: user?.preferredLanguage,
  });
  const [loadingGrades, setLoadingGrades] = useState(false);

  console.log(userGrades);

  useEffect(() => {
    if (user) {
      setLoadingGrades(true);
      dispatch(fetchUserGradesByUser(Number(user.id))).finally(() =>
        setLoadingGrades(false)
      );
      dispatch(fetchUserProgress());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserEnrollments(user.id));
      dispatch(fetchUserCertificates({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

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
            label={
              currentUser?.role === "student" ? "Mã học viên" : "Mã sinh viên"
            }
            value={
              user?.userStudent?.id || user?.userStudentAcademic?.studentCode
            }
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
            value={
              user?.userStudent?.fullName || user?.userStudentAcademic?.fullName
            }
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Giới thiệu"
            name="bio"
            multiline
            rows={3}
            value={user?.userStudent?.bio}
            onChange={handleFormChange}
          />
          {user?.userStudent?.gender && (
            <FormControl fullWidth>
              <InputLabel>Giới tính</InputLabel>
              <Select
                name="gender"
                value={user?.userStudent?.gender}
                label="Giới tính"
                onChange={(e) => handleFormChange(e as any)}
              >
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </Select>
            </FormControl>
          )}
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
            value={user?.email}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phone"
            value={user?.phone}
            onChange={handleFormChange}
          />
          {user?.userStudent?.address && (
            <>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={user?.userStudent?.address}
                onChange={handleFormChange}
              />
              <TextField
                fullWidth
                label="Thành phố"
                name="city"
                value={user?.userStudent?.city}
                onChange={handleFormChange}
              />
              <TextField
                fullWidth
                label="Quốc gia"
                name="country"
                value={user?.userStudent?.country}
                onChange={handleFormChange}
              />
              <FormControl fullWidth>
                <InputLabel>Ngôn ngữ ưu tiên</InputLabel>
                <Select
                  name="preferredLanguage"
                  value={user?.userStudent?.preferredLanguage}
                  label="Ngôn ngữ ưu tiên"
                  onChange={(e) => handleFormChange(e as any)}
                >
                  <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
                  <MenuItem value="English">Tiếng Anh</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
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
      {currentUser?.role === "student" && (
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nghề nghiệp"
              name="occupation"
              value={user?.userStudent?.occupation}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Trình độ học vấn"
              name="education"
              value={user?.userStudent?.educationLevel}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Sở thích"
              name="interests"
              multiline
              rows={2}
              value={user?.userStudent?.interests}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label="Mục tiêu học tập"
              name="learningGoals"
              multiline
              rows={2}
              value={user?.userStudent?.learningGoals}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              type="date"
              label="Ngày sinh"
              name="dateOfBirth"
              value={user?.userStudent?.dateOfBirth}
              onChange={handleFormChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>
      )}

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
                    currentAvatar={user?.avatarUrl || "/src/assets/avatar.png"}
                    onAvatarChange={handleAvatarChange}
                  />
                  <Typography variant="h5" gutterBottom>
                    {user?.userStudent?.fullName ||
                      user?.userStudentAcademic?.fullName}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {currentUser?.role === "student"
                      ? "Mã học viên"
                      : "Mã sinh viên"}
                    :{" "}
                    {user?.userStudent?.id ||
                      user?.userStudentAcademic?.studentCode}
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
                        {userEnrollments?.length}
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
                        {
                          userEnrollments?.filter(
                            (enrollment) => enrollment.status === "completed"
                          )?.length
                        }
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
                      {userProgress?.map((enrollment: any) => (
                        <ListItem key={enrollment.id}>
                          <ListItemText
                            primary={enrollment?.courseTitle}
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
                                      value={enrollment?.completionPercentage}
                                      sx={{ height: 6, borderRadius: 1 }}
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {enrollment?.completionPercentage}%
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Truy cập gần nhất:{" "}
                                  {enrollment?.lastAccessTime
                                    ? new Date(
                                        enrollment?.lastAccessTime
                                      ).toLocaleDateString("vi-VN")
                                    : "Chưa truy cập"}
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
                  {currentUser?.role === "student" && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Chứng chỉ đã đạt được
                      </Typography>
                      <List>
                        {userCertificates?.length > 0
                          ? userCertificates?.map((cert) => (
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
                                  primary={cert?.course?.title}
                                  secondary={
                                    <>
                                      Cấp ngày:{" "}
                                      {new Date(
                                        cert?.createdAt
                                      ).toLocaleDateString("vi-VN")}{" "}
                                      | Số chứng chỉ: {cert?.certificateNumber}
                                    </>
                                  }
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    setSelectedCertificate({
                                      ...cert,
                                      student_name: user?.userStudent?.fullName,
                                      student_code: user?.userStudent?.id,
                                      certificate_url: cert?.certificateUrl,
                                    })
                                  }
                                  sx={{ minWidth: 100 }}
                                >
                                  Xem chi tiết
                                </Button>
                              </ListItem>
                            ))
                          : "Không có chứng chỉ"}
                      </List>
                    </Box>
                  )}
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
                      {currentUser?.role === "student"
                        ? "Mã học viên"
                        : "Mã sinh viên"}
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
                      {user?.userStudent?.id ||
                        user?.userStudentAcademic?.studentCode}
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
                      {user?.userStudent?.bio}
                    </Typography>
                  </Box>

                  {user?.userStudent?.learningGoals && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Mục tiêu học tập
                      </Typography>
                      <Typography variant="body1">
                        {user?.userStudent?.learningGoals}
                      </Typography>
                    </Box>
                  )}

                  {user?.userStudent?.interests && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Sở thích
                      </Typography>
                      <Typography variant="body1">
                        {user?.userStudent?.interests}
                      </Typography>
                    </Box>
                  )}

                  <List>
                    {user?.userStudent?.dateOfBirth && (
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ngày sinh"
                          secondary={new Date(
                            user?.userStudent?.dateOfBirth
                          ).toLocaleDateString("vi-VN")}
                        />
                      </ListItem>
                    )}
                    {user?.userStudent?.occupation && (
                      <ListItem>
                        <ListItemIcon>
                          <WorkOutline />
                        </ListItemIcon>
                        <ListItemText
                          primary="Nghề nghiệp"
                          secondary={user?.userStudent?.occupation}
                        />
                      </ListItem>
                    )}
                    {user?.userStudent?.educationLevel && (
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Trình độ học vấn"
                          secondary={user?.userStudent?.educationLevel}
                        />
                      </ListItem>
                    )}
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
                          {user?.status === "active" && (
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
                          <Typography variant="body2">{user?.email}</Typography>
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
                          {user?.status === "active" && (
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
                          <Typography variant="body2">{user?.phone}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Số điện thoại để liên hệ và xác thực
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>

                  {/* Address */}
                  {user?.userStudent && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText
                        primary="Địa chỉ"
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {user?.userStudent?.address}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={0.5}>
                              <Typography variant="body2">
                                {user?.userStudent?.city}
                              </Typography>
                              <Typography variant="body2">•</Typography>
                              <Typography variant="body2">
                                {user?.userStudent?.country}
                              </Typography>
                            </Stack>
                          </Box>
                        }
                      />
                    </ListItem>
                  )}

                  {/* Additional Contact Info */}
                  {user?.userStudent?.preferredLanguage && (
                    <ListItem>
                      <ListItemIcon>
                        <Language />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngôn ngữ ưu tiên"
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {user?.userStudent?.preferredLanguage}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Ngôn ngữ sử dụng trong khóa học và thông báo
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  )}
                </List>

                <Box sx={{ mt: 2, px: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    size="small"
                    onClick={() => setEditContactOpen(true)}
                  >
                    Cập nhật thông tin liên hệ
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
                      <Grid item xs={12} md>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4" color="primary">
                              {userGrades && userGrades.length > 0
                                ? (
                                    userGrades.reduce(
                                      (sum, grade) =>
                                        sum +
                                        (Number(grade.score) /
                                          Number(grade.maxScore)) *
                                          100 *
                                          Number(grade.weight || 1),
                                      0
                                    ) /
                                    userGrades.reduce(
                                      (sum, grade) =>
                                        sum + Number(grade.weight || 1),
                                      0
                                    )
                                  ).toFixed(2)
                                : "0.00"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Điểm trung bình
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Grade Details */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Chi tiết điểm
                    </Typography>
                    {loadingGrades ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          my: 3,
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : userGrades && userGrades.length > 0 ? (
                      currentUser?.role === "student_academic" ? (
                        // Display for academic students
                        <Card sx={{ p: 3 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                          >
                            Bảng điểm sinh viên
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          {[...userGrades]
                            .sort(
                              (a, b) =>
                                parseFloat(b.weight) - parseFloat(a.weight)
                            )
                            .map((grade) => (
                              <Box
                                key={grade.id}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  py: 0.5,
                                }}
                              >
                                <Typography variant="body1">
                                  {grade.gradeType === "assignment" &&
                                    grade.assignmentSubmission?.assignment
                                      ?.title}
                                  {grade.gradeType === "quiz" &&
                                    grade.quizAttempt?.quiz?.title}
                                  {grade.gradeType === "midterm" &&
                                    "Điểm giữa kỳ"}
                                  {grade.gradeType === "final" &&
                                    "Điểm cuối kỳ"}
                                </Typography>
                                <Box>
                                  <Typography component="span">
                                    {grade.score || 0}/{grade.maxScore || 100}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    (x
                                    {parseFloat(grade.weight || "0").toFixed(2)}
                                    )
                                  </Typography>
                                </Box>
                              </Box>
                            ))}

                          {/* Calculate and display final grade */}
                          {(() => {
                            let totalWeightedScore = 0;
                            let totalWeight = 0;

                            userGrades.forEach((grade) => {
                              const score = parseFloat(grade.score);
                              const maxScore = parseFloat(grade.maxScore);
                              const weight = parseFloat(grade.weight);

                              const weightedScore =
                                (score / maxScore) * 100 * weight;
                              totalWeightedScore += weightedScore;
                              totalWeight += weight;
                            });

                            const finalGrade =
                              totalWeight > 0
                                ? parseFloat(
                                    (totalWeightedScore / totalWeight).toFixed(
                                      2
                                    )
                                  )
                                : 0;

                            return (
                              <>
                                <Divider sx={{ my: 2 }} />
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  Điểm tổng kết:{" "}
                                  <Box component="span" fontWeight="bold">
                                    {finalGrade}/100
                                  </Box>
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(finalGrade / 100) * 100}
                                    sx={{
                                      height: 8,
                                      borderRadius: 1,
                                      bgcolor: "grey.200",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor:
                                          finalGrade >= 80
                                            ? "success.main"
                                            : finalGrade >= 60
                                            ? "warning.main"
                                            : "error.main",
                                      },
                                    }}
                                  />
                                </Box>
                              </>
                            );
                          })()}
                        </Card>
                      ) : (
                        // Display for regular students - existing course-based grade display
                        Object.values(
                          userGrades.reduce((acc, grade) => {
                            const courseId = grade.courseId;

                            // Nhóm các điểm theo khóa học
                            if (!acc[courseId]) {
                              acc[courseId] = {
                                course_id: courseId,
                                course_title:
                                  grade.course?.title ||
                                  "Khóa học không xác định",
                                grades: [],
                                completion_date: grade.gradedAt,
                                final_grade: 0,
                                total_weight: 0,
                              };
                            }

                            // Thêm điểm này vào danh sách điểm của khóa học
                            acc[courseId].grades.push(grade);

                            // Cập nhật ngày hoàn thành (lấy ngày gần nhất)
                            if (
                              new Date(grade.gradedAt) >
                              new Date(acc[courseId].completion_date)
                            ) {
                              acc[courseId].completion_date = grade.gradedAt;
                            }

                            return acc;
                          }, {})
                        ).map((course) => {
                          // Tính điểm tổng kết - PHƯƠNG PHÁP ĐỒNG NHẤT
                          let totalWeightedScore = 0;
                          let totalWeight = 0;

                          course.grades.forEach((grade) => {
                            const weight = Number(grade.weight);
                            const score = Number(grade.score);
                            const maxScore = Number(grade.maxScore);

                            // Chuẩn hóa điểm theo thang 100 trước khi nhân với trọng số
                            const weightedScore =
                              (score / maxScore) * 100 * weight;

                            totalWeightedScore += weightedScore;
                            totalWeight += weight;
                          });

                          // Chuẩn hóa điểm cuối cùng - sử dụng toFixed(2) để đảm bảo hiển thị 2 chữ số thập phân
                          course.final_grade =
                            totalWeight > 0
                              ? parseFloat(
                                  (totalWeightedScore / totalWeight).toFixed(2)
                                )
                              : 0;

                          // Sắp xếp grades theo trọng số giảm dần
                          course.grades.sort(
                            (a, b) => Number(b.weight) - Number(a.weight)
                          );

                          return (
                            <Card key={course.course_id} sx={{ mb: 2 }}>
                              <CardContent>
                                <Box sx={{ mb: 2 }}>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    {course.course_title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Cập nhật:{" "}
                                    {new Date(
                                      course.completion_date
                                    ).toLocaleDateString("vi-VN")}
                                  </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    Điểm tổng kết:{" "}
                                    <Box component="span">
                                      {course.final_grade}/100
                                    </Box>
                                  </Typography>
                                </Box>

                                <Stack spacing={1}>
                                  {/* Hiển thị tất cả grades đã được sắp xếp */}
                                  {course.grades.map((grade) => {
                                    const scorePart = `${Number(
                                      grade.score
                                    )}/${Number(grade.maxScore)}`;
                                    const weightPart = `(x${Number(
                                      grade.weight
                                    ).toFixed(2)})`;

                                    let gradeName = "";
                                    if (grade.gradeType === "midterm")
                                      gradeName = "Điểm giữa khóa:";
                                    else if (grade.gradeType === "final")
                                      gradeName = "Điểm cuối khóa:";
                                    else if (grade.gradeType === "assignment")
                                      gradeName = `${
                                        grade.assignment?.title ||
                                        grade.lesson?.title ||
                                        "Bài tập"
                                      }:`;
                                    else if (grade.gradeType === "quiz")
                                      gradeName = `${
                                        grade.quiz?.title ||
                                        grade.lesson?.title ||
                                        "Bài trắc nghiệm"
                                      }:`;
                                    else if (
                                      grade.gradeType === "participation"
                                    )
                                      gradeName = "Điểm tham gia:";
                                    else gradeName = `${grade.gradeType}:`;

                                    return (
                                      <Box
                                        key={grade.id}
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          borderBottom: "1px solid #e0e0e0",
                                          py: 0.5,
                                        }}
                                      >
                                        <Typography variant="body2">
                                          {gradeName}
                                        </Typography>
                                        <Typography variant="body2">
                                          {scorePart} {weightPart}
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Stack>

                                {/* Thêm thanh progress */}
                                <Box sx={{ mt: 2 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(course.final_grade / 100) * 100}
                                    sx={{
                                      height: 8,
                                      borderRadius: 1,
                                      bgcolor: "grey.200",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor:
                                          course.final_grade >= 80
                                            ? "success.main"
                                            : course.final_grade >= 60
                                            ? "warning.main"
                                            : "error.main",
                                      },
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })
                      )
                    ) : (
                      <Typography
                        color="text.secondary"
                        align="center"
                        sx={{ py: 3 }}
                      >
                        Chưa có thông tin điểm
                      </Typography>
                    )}
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
