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
import { fetchStudentAcademicCourses } from "../../features/users/usersApiSlice";
import { selectStudentAcademicCourses } from "../../features/users/usersSelectors";
import {
  updateStudentProfile,
  updateStudentAcademic,
} from "../../features/users/usersApiSlice";
import { toast } from "react-toastify";
import {
  UserRole,
  User,
  UserStudent,
  UserStudentAcademic,
} from "../../types/user.types";

const ProfileAccount: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser) as
    | (User & {
        userStudent?: UserStudent;
        userStudentAcademic?: UserStudentAcademic;
      })
    | null;
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);
  const userCertificates = useAppSelector(selectUserCertificates);
  const userGrades = useAppSelector(selectUserGradesByUser);
  const userProgress = useAppSelector(selectUserProgress);
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields for both roles
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",

    // Student specific fields
    fullName:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.fullName
        : currentUser?.userStudentAcademic?.fullName,
    bio:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.bio
        : "",
    dateOfBirth:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.dateOfBirth
        : undefined,
    gender:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.gender
        : undefined,
    occupation:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.occupation
        : "",
    educationLevel:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.educationLevel
        : "",
    address:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.address
        : "",
    city:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.city
        : "",
    country:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.country
        : "",
    interests:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.interests
        : "",
    learningGoals:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.learningGoals
        : "",
    preferredLanguage:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.preferredLanguage
        : "",

    // Student academic specific fields
    studentCode:
      currentUser?.role === UserRole.STUDENT_ACADEMIC
        ? currentUser?.userStudentAcademic?.studentCode
        : "",
    academicYear:
      currentUser?.role === UserRole.STUDENT_ACADEMIC
        ? currentUser?.userStudentAcademic?.academicYear
        : "",
  });
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingGrades(true);
      dispatch(fetchUserGradesByUser(Number(currentUser.id))).finally(() =>
        setLoadingGrades(false)
      );
      dispatch(fetchUserProgress());
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserEnrollments(Number(currentUser.id)));
      dispatch(fetchStudentAcademicCourses(currentUser.id.toString()));
      dispatch(fetchUserCertificates({ userId: Number(currentUser.id) }));
    }
  }, [dispatch, currentUser?.id]);

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
    console.log(formData);
  };

  const handleSaveProfile = async () => {
    try {
      if (currentUser?.role === UserRole.STUDENT) {
        const updateData = {
          userId: Number(currentUser.id),
          data: {
            user: {
              email: formData.email,
              phone: formData.phone,
            },
            student: {
              fullName: formData.fullName,
              bio: formData.bio,
              interests: formData.interests,
              learningGoals: formData.learningGoals,
            },
          },
        };
        await dispatch(updateStudentProfile(updateData)).unwrap();
      } else if (currentUser?.role === UserRole.STUDENT_ACADEMIC) {
        const updateData = {
          userId: Number(currentUser.id),
          data: {
            user: {
              email: formData.email,
              phone: formData.phone,
            },
            studentAcademic: {
              fullName: formData.fullName,
            },
          },
        };
        await dispatch(updateStudentAcademic(updateData)).unwrap();
      }
      setIsEditingProfile(false);
      toast.success("Cập nhật thông tin hồ sơ thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin hồ sơ");
    }
  };

  const handleSavePersonal = async () => {
    try {
      if (currentUser?.role === UserRole.STUDENT) {
        const updateData = {
          userId: Number(currentUser.id),
          data: {
            user: {},
            student: {
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              occupation: formData.occupation,
              educationLevel: formData.educationLevel,
            },
          },
        };
        await dispatch(updateStudentProfile(updateData)).unwrap();
      }
      setIsEditingPersonal(false);
      toast.success("Cập nhật thông tin cá nhân thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin cá nhân");
    }
  };

  const handleSaveContact = async () => {
    try {
      if (currentUser?.role === UserRole.STUDENT) {
        const updateData = {
          userId: Number(currentUser.id),
          data: {
            user: {
              phone: formData.phone,
            },
            student: {
              address: formData.address,
              city: formData.city,
              country: formData.country,
              preferredLanguage: formData.preferredLanguage,
            },
          },
        };
        await dispatch(updateStudentProfile(updateData)).unwrap();
      } else if (currentUser?.role === UserRole.STUDENT_ACADEMIC) {
        const updateData = {
          userId: Number(currentUser.id),
          data: {
            user: {
              phone: formData.phone,
            },
          },
        };
        await dispatch(updateStudentAcademic(updateData)).unwrap();
      }
      setIsEditingContact(false);
      toast.success("Cập nhật thông tin liên hệ thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin liên hệ");
    }
  };

  const handleAvatarChange = (file: File) => {
    // Xử lý upload avatar
    // Sau này sẽ gọi API để upload file và cập nhật avatar_url
  };

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
                    currentAvatar={
                      currentUser?.avatarUrl || "/src/assets/avatar.png"
                    }
                    onAvatarChange={handleAvatarChange}
                  />
                  <Typography variant="h5" gutterBottom>
                    {currentUser?.role === "student"
                      ? currentUser?.userStudent?.fullName
                      : currentUser?.userStudentAcademic?.fullName}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {currentUser?.role === "student"
                      ? "Mã học viên"
                      : "Mã sinh viên"}
                    :{" "}
                    {currentUser?.role === "student"
                      ? currentUser?.userStudent?.id
                      : currentUser?.userStudentAcademic?.studentCode}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tham gia từ{" "}
                    {currentUser?.createdAt
                      ? new Date(
                          currentUser.createdAt as string | number | Date
                        ).toLocaleDateString("vi-VN")
                      : ""}
                  </Typography>
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
                    icon={<PersonIcon />}
                    iconPosition="start"
                    label="Thông tin cá nhân"
                    sx={{
                      minHeight: 48,
                      "& .MuiTab-iconWrapper": {
                        marginRight: 1,
                        marginBottom: "0 !important",
                      },
                    }}
                  />
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

              {/* Tab Thông tin cá nhân */}
              <TabPanel value={currentTab} index={0}>
                <Stack spacing={3} px={2}>
                  {/* Profile Information */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Thông tin hồ sơ
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        size="small"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                      >
                        {isEditingProfile ? "Lưu thay đổi" : "Chỉnh sửa"}
                      </Button>
                    </Box>

                    {isEditingProfile ? (
                      <Stack spacing={2}>
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
                        {currentUser?.role === UserRole.STUDENT && (
                          <>
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
                            <TextField
                              fullWidth
                              label="Sở thích"
                              name="interests"
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
                          </>
                        )}
                        {currentUser?.role === UserRole.STUDENT_ACADEMIC && (
                          <>
                            <TextField
                              fullWidth
                              label="Mã sinh viên"
                              name="studentCode"
                              value={formData.studentCode}
                              disabled
                            />
                            <TextField
                              fullWidth
                              label="Khóa học"
                              name="academicYear"
                              value={formData.academicYear}
                              disabled
                            />
                          </>
                        )}
                      </Stack>
                    ) : (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {currentUser?.role === UserRole.STUDENT
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
                            {currentUser?.role === UserRole.STUDENT
                              ? currentUser?.userStudent?.id
                              : currentUser?.userStudentAcademic?.studentCode}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Giới thiệu
                          </Typography>
                          <Typography variant="body1">
                            {currentUser?.role === UserRole.STUDENT
                              ? currentUser?.userStudent?.bio
                              : "Sinh viên " +
                                currentUser?.userStudentAcademic?.academicYear}
                          </Typography>
                        </Box>

                        {currentUser?.role === UserRole.STUDENT && (
                          <>
                            {currentUser?.userStudent?.learningGoals && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  Mục tiêu học tập
                                </Typography>
                                <Typography variant="body1">
                                  {currentUser?.userStudent?.learningGoals}
                                </Typography>
                              </Box>
                            )}

                            {currentUser?.userStudent?.interests && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  Sở thích
                                </Typography>
                                <Typography variant="body1">
                                  {currentUser?.userStudent?.interests}
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Box>

                  <Divider />

                  {/* Personal Information */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Thông tin cá nhân
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        size="small"
                        onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                      >
                        {isEditingPersonal ? "Lưu thay đổi" : "Chỉnh sửa"}
                      </Button>
                    </Box>

                    {isEditingPersonal ? (
                      <Stack spacing={2}>
                        {currentUser?.role === UserRole.STUDENT ? (
                          <>
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
                              name="educationLevel"
                              value={formData.educationLevel}
                              onChange={handleFormChange}
                            />
                          </>
                        ) : (
                          <>
                            <TextField
                              fullWidth
                              label="Mã sinh viên"
                              name="studentCode"
                              value={formData.studentCode}
                              disabled
                            />
                            <TextField
                              fullWidth
                              label="Khóa học"
                              name="academicYear"
                              value={formData.academicYear}
                              disabled
                            />
                            <TextField
                              fullWidth
                              label="Lớp học"
                              value={
                                currentUser?.userStudentAcademic?.academicClass
                                  ?.classCode
                              }
                              disabled
                            />
                            <TextField
                              fullWidth
                              label="Học kỳ"
                              value={
                                currentUser?.userStudentAcademic?.academicClass
                                  ?.semester
                              }
                              disabled
                            />
                          </>
                        )}
                      </Stack>
                    ) : (
                      <List>
                        {currentUser?.role === UserRole.STUDENT ? (
                          <>
                            {currentUser?.userStudent?.dateOfBirth && (
                              <ListItem>
                                <ListItemIcon>
                                  <CalendarToday />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Ngày sinh"
                                  secondary={
                                    currentUser.userStudent
                                      .dateOfBirth instanceof Date
                                      ? currentUser.userStudent.dateOfBirth.toLocaleDateString(
                                          "vi-VN"
                                        )
                                      : new Date(
                                          currentUser.userStudent.dateOfBirth
                                        ).toLocaleDateString("vi-VN")
                                  }
                                />
                              </ListItem>
                            )}
                            {currentUser?.userStudent?.occupation && (
                              <ListItem>
                                <ListItemIcon>
                                  <WorkOutline />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Nghề nghiệp"
                                  secondary={
                                    currentUser?.userStudent?.occupation
                                  }
                                />
                              </ListItem>
                            )}
                            {currentUser?.userStudent?.educationLevel && (
                              <ListItem>
                                <ListItemIcon>
                                  <School />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Trình độ học vấn"
                                  secondary={
                                    currentUser?.userStudent?.educationLevel
                                  }
                                />
                              </ListItem>
                            )}
                          </>
                        ) : (
                          <>
                            <ListItem>
                              <ListItemIcon>
                                <School />
                              </ListItemIcon>
                              <ListItemText
                                primary="Mã sinh viên"
                                secondary={
                                  currentUser?.userStudentAcademic?.studentCode
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <School />
                              </ListItemIcon>
                              <ListItemText
                                primary="Khóa học"
                                secondary={
                                  currentUser?.userStudentAcademic?.academicYear
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <School />
                              </ListItemIcon>
                              <ListItemText
                                primary="Lớp học"
                                secondary={
                                  currentUser?.userStudentAcademic
                                    ?.academicClass?.classCode
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <School />
                              </ListItemIcon>
                              <ListItemText
                                primary="Học kỳ"
                                secondary={
                                  currentUser?.userStudentAcademic
                                    ?.academicClass?.semester
                                }
                              />
                            </ListItem>
                          </>
                        )}
                      </List>
                    )}
                  </Box>

                  <Divider />

                  {/* Contact Information */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Thông tin liên hệ
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        size="small"
                        onClick={() => setIsEditingContact(!isEditingContact)}
                      >
                        {isEditingContact ? "Lưu thay đổi" : "Chỉnh sửa"}
                      </Button>
                    </Box>

                    {isEditingContact ? (
                      <Stack spacing={2}>
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
                        {currentUser?.role === "student" && (
                          <>
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
                          </>
                        )}
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
                    ) : (
                      <List>
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
                                {currentUser?.status === "active" && (
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
                                  {currentUser?.email}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Email chính để nhận thông báo
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>

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
                                <Typography variant="body1">
                                  Số điện thoại
                                </Typography>
                                {currentUser?.status === "active" && (
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
                                  {currentUser?.phone}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Số điện thoại để liên hệ và xác thực
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>

                        {currentUser?.role === "student" &&
                          currentUser?.userStudent && (
                            <ListItem>
                              <ListItemIcon>
                                <LocationOn />
                              </ListItemIcon>
                              <ListItemText
                                primary="Địa chỉ"
                                secondary={
                                  <Box>
                                    <Typography variant="body2">
                                      {currentUser?.userStudent?.address}
                                    </Typography>
                                    <Stack direction="row" spacing={1} mt={0.5}>
                                      <Typography variant="body2">
                                        {currentUser?.userStudent?.city}
                                      </Typography>
                                      <Typography variant="body2">•</Typography>
                                      <Typography variant="body2">
                                        {currentUser?.userStudent?.country}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                }
                              />
                            </ListItem>
                          )}

                        {currentUser?.role === "student" &&
                          currentUser?.userStudent?.preferredLanguage && (
                            <ListItem>
                              <ListItemIcon>
                                <Language />
                              </ListItemIcon>
                              <ListItemText
                                primary="Ngôn ngữ ưu tiên"
                                secondary={
                                  <Box>
                                    <Typography variant="body2">
                                      {
                                        currentUser?.userStudent
                                          ?.preferredLanguage
                                      }
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Ngôn ngữ sử dụng trong khóa học và thông
                                      báo
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          )}
                      </List>
                    )}
                  </Box>
                </Stack>
              </TabPanel>

              {/* Tab Học tập */}
              <TabPanel value={currentTab} index={1}>
                <Stack spacing={3} px={2}>
                  {/* Current Courses */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {currentUser?.role === "student_academic"
                        ? "Các môn học đang học"
                        : "Khóa học đang học"}
                    </Typography>
                    <List>
                      {currentUser?.role === "student_academic"
                        ? studentAcademicCourses?.map((enrollment: any) => (
                            <ListItem
                              key={enrollment.id}
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
                              <ListItemText
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
                                          value={enrollment.progress || 0}
                                          sx={{ height: 6, borderRadius: 1 }}
                                        />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {enrollment.progress || 0}%
                                      </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Lớp:{" "}
                                        {enrollment.academicClass.classCode}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        • Học kỳ:{" "}
                                        {enrollment.academicClass.semester}
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      Giảng viên:{" "}
                                      {enrollment.course.instructor.fullName}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))
                        : userProgress?.map((enrollment: any) => (
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
                                          value={
                                            enrollment?.completionPercentage
                                          }
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
                                      student_name:
                                        currentUser?.userStudent?.fullName,
                                      student_code:
                                        currentUser?.userStudent?.id,
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

              {/* Tab Bảng điểm */}
              <TabPanel value={currentTab} index={2}>
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
