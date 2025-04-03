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
import { fetchUserEnrollments } from "../../features/enrollments/enrollmentsApiSlice";
import { selectUserEnrollments } from "../../features/enrollments/enrollmentsSelectors";
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

  useEffect(() => {
    if (user) {
      setLoadingGrades(true);
      dispatch(fetchUserGradesByUser(Number(user.id))).finally(() =>
        setLoadingGrades(false)
      );
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
            label="Mã học viên"
            value={user?.userStudent?.id}
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
            value={user?.userStudent?.fullName}
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
                      {userEnrollments?.map((enrollment) => (
                        <ListItem key={enrollment.id}>
                          <ListItemText
                            primary={enrollment?.course?.title}
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
                                      value={enrollment?.progress}
                                      sx={{ height: 6, borderRadius: 1 }}
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {enrollment?.progress}%
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Truy cập gần nhất:{" "}
                                  {new Date(
                                    enrollment?.updatedAt
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
                      {userCertificates?.map((cert) => (
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
                                {new Date(cert?.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
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
                      {user?.userStudent?.id}
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

                  <List>
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
                    <ListItem>
                      <ListItemIcon>
                        <WorkOutline />
                      </ListItemIcon>
                      <ListItemText
                        primary="Nghề nghiệp"
                        secondary={user?.userStudent?.occupation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <School />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trình độ học vấn"
                        secondary={user?.userStudent?.educationLevel}
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
                            {user?.userStudent?.preferredLanguage}
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
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4" color="success.main">
                              {userEnrollments
                                ? userEnrollments.filter(
                                    (enrollment) =>
                                      enrollment.status === "completed"
                                  ).length
                                : 0}
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

                          // Tính điểm cuối cùng dựa trên trọng số
                          const weight = Number(grade.weight);
                          const score = Number(grade.score);
                          const maxScore = Number(grade.maxScore);
                          const weightedScore =
                            (score / maxScore) * 100 * weight;

                          acc[courseId].final_grade += weightedScore;
                          acc[courseId].total_weight += weight;

                          return acc;
                        }, {})
                      ).map((course) => {
                        // Chuẩn hóa điểm cuối cùng
                        course.final_grade =
                          course.total_weight > 0
                            ? Math.round(
                                (course.final_grade / course.total_weight) * 100
                              ) / 100
                            : 0;

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

                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Stack spacing={1}>
                                    {/* Điểm cuối khóa (tổng kết) */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #e0e0e0",
                                      }}
                                    >
                                      <Typography variant="body2">
                                        Điểm tổng kết:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        {course.final_grade}/100
                                      </Typography>
                                    </Box>

                                    {/* Các loại điểm cụ thể */}
                                    {course.grades
                                      .filter(
                                        (grade) => grade.gradeType === "final"
                                      )
                                      .map((grade) => (
                                        <Box
                                          key={grade.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            borderBottom: "1px solid #e0e0e0",
                                          }}
                                        >
                                          <Typography variant="body2">
                                            Điểm cuối khóa:
                                          </Typography>
                                          <Typography variant="body2">
                                            {Number(grade.score)}/
                                            {Number(grade.maxScore)} (x
                                            {Number(grade.weight)})
                                          </Typography>
                                        </Box>
                                      ))}

                                    {course.grades
                                      .filter(
                                        (grade) => grade.gradeType === "midterm"
                                      )
                                      .map((grade) => (
                                        <Box
                                          key={grade.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            borderBottom: "1px solid #e0e0e0",
                                          }}
                                        >
                                          <Typography variant="body2">
                                            Điểm giữa khóa:
                                          </Typography>
                                          <Typography variant="body2">
                                            {Number(grade.score)}/
                                            {Number(grade.maxScore)} (x
                                            {Number(grade.weight)})
                                          </Typography>
                                        </Box>
                                      ))}

                                    {course.grades
                                      .filter(
                                        (grade) => grade.gradeType === "quiz"
                                      )
                                      .map((grade) => (
                                        <Box
                                          key={grade.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            borderBottom: "1px solid #e0e0e0",
                                          }}
                                        >
                                          <Typography variant="body2">
                                            {grade.quiz?.title ||
                                              "Bài kiểm tra"}
                                            :
                                          </Typography>
                                          <Typography variant="body2">
                                            {Number(grade.score)}/
                                            {Number(grade.maxScore)} (x
                                            {Number(grade.weight)})
                                          </Typography>
                                        </Box>
                                      ))}

                                    {course.grades
                                      .filter(
                                        (grade) =>
                                          grade.gradeType === "assignment"
                                      )
                                      .map((grade) => (
                                        <Box
                                          key={grade.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            borderBottom: "1px solid #e0e0e0",
                                          }}
                                        >
                                          <Typography variant="body2">
                                            {grade.assignment?.title ||
                                              grade.lesson?.title ||
                                              "Bài tập"}
                                            :
                                          </Typography>
                                          <Typography variant="body2">
                                            {Number(grade.score)}/
                                            {Number(grade.maxScore)} (x
                                            {Number(grade.weight)})
                                          </Typography>
                                        </Box>
                                      ))}

                                    {course.grades
                                      .filter(
                                        (grade) =>
                                          grade.gradeType === "participation"
                                      )
                                      .map((grade) => (
                                        <Box
                                          key={grade.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <Typography variant="body2">
                                            Điểm tham gia:
                                          </Typography>
                                          <Typography variant="body2">
                                            {Number(grade.score)}/
                                            {Number(grade.maxScore)} (x
                                            {Number(grade.weight)})
                                          </Typography>
                                        </Box>
                                      ))}
                                  </Stack>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Bạn chưa có điểm nào trong hệ thống.
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
