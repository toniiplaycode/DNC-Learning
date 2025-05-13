import React, { useEffect, useState, useCallback, useRef } from "react";
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
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
  TextFieldProps,
  Alert,
  Pagination,
  FormControlLabel,
  Switch,
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
  Favorite,
  Receipt as ReceiptIcon,
  AccountBalanceWallet,
  Payment,
  ReceiptLong,
  Info,
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
  User,
  UserStudent,
  UserStudentAcademic,
  UserRole,
} from "../../types/user.types";
import { updateStudentProfile } from "../../features/users/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { fetchUserById } from "../../features/users/usersApiSlice";
import { fetchUserCourseProgress } from "../../features/course-progress/courseProgressSlice";
import { selectUserCourseProgress } from "../../features/course-progress/courseProgressSelectors";
import { fetchUserPayments } from "../../features/payments/paymentsSlice";
import { selectUserPayments } from "../../features/payments/paymentsSelectors";

type Gender = "male" | "female" | "other";

// Tạo component TextField tùy chỉnh
const StyledTextField = (props: TextFieldProps) => (
  <TextField
    {...props}
    fullWidth
    sx={{
      "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
        color: "rgba(0, 0, 0, 0.87)",
      },
      "& .MuiInputLabel-root.Mui-disabled": {
        color: "rgba(0, 0, 0, 0.6)",
      },
      ...props.sx,
    }}
  />
);

interface FormData {
  email: string;
  phone: string;
  fullName: string;
  bio: string;
  dateOfBirth: string;
  gender: Gender;
  occupation: string;
  educationLevel: string;
  address: string;
  city: string;
  country: string;
  interests: string;
  learningGoals: string;
  preferredLanguage: string;
  studentCode: string;
  academicYear: string;
}

const ProfileAccount: React.FC = () => {
  const navigate = useNavigate();
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
  const userCourseProgress = useAppSelector(selectUserCourseProgress);
  const userPayments = useAppSelector(selectUserPayments);
  const [currentTab, setCurrentTab] = useState(0);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Add this near the other useState declarations in the component
  const [paymentFilter, setPaymentFilter] = useState({
    status: null,
    method: null,
    sort: "newest",
  });

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAllItems, setShowAllItems] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingGrades(true);
      dispatch(fetchUserGradesByUser(Number(currentUser.id))).finally(() =>
        setLoadingGrades(false)
      );
      dispatch(fetchUserProgress());
      if (currentUser.role == UserRole.STUDENT_ACADEMIC) {
        dispatch(fetchUserCourseProgress());
      }
      dispatch(fetchUserPayments(Number(currentUser.id)));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserEnrollments(Number(currentUser.id)));
      dispatch(fetchStudentAcademicCourses(currentUser.id.toString()));
      dispatch(fetchUserCertificates({ userId: Number(currentUser.id) }));
    }
  }, [dispatch, currentUser?.id]);

  console.log(userPayments);

  // Thêm state cho modal đổi mật khẩu
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Thêm state cho dialog chứng chỉ
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    fullName:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.fullName || ""
        : currentUser?.userStudentAcademic?.fullName || "",
    bio:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.bio || ""
        : "",
    dateOfBirth:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.dateOfBirth?.toString() || ""
        : "",
    gender:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.gender || "other"
        : "other",
    occupation:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.occupation || ""
        : "",
    educationLevel:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.educationLevel || ""
        : "",
    address:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.address || ""
        : "",
    city:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.city || ""
        : "",
    country:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.country || ""
        : "",
    interests:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.interests || ""
        : "",
    learningGoals:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.learningGoals || ""
        : "",
    preferredLanguage:
      currentUser?.role === UserRole.STUDENT
        ? currentUser?.userStudent?.preferredLanguage === "Tiếng Anh"
          ? "English"
          : currentUser?.userStudent?.preferredLanguage === "Tiếng Việt"
          ? "Vietnamese"
          : ""
        : "",
    studentCode:
      currentUser?.role === UserRole.STUDENT_ACADEMIC
        ? currentUser?.userStudentAcademic?.studentCode || ""
        : "",
    academicYear:
      currentUser?.role === UserRole.STUDENT_ACADEMIC
        ? currentUser?.userStudentAcademic?.academicYear || ""
        : "",
  });

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

  const handleAvatarChange = (file: File) => {
    // Xử lý upload avatar
    // Sau này sẽ gọi API để upload file và cập nhật avatar_url
  };

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleGenderChange = useCallback((e: SelectChangeEvent<Gender>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleSave = async () => {
    if (!currentUser?.id) return;

    try {
      const dataToUpdate = {
        user: {
          email: formData.email,
          phone: formData.phone,
        },
        student: {
          fullName: formData.fullName,
          dateOfBirth: new Date(formData.dateOfBirth),
          gender: formData.gender,
          educationLevel: formData.educationLevel,
          occupation: formData.occupation,
          bio: formData.bio,
          interests: formData.interests,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          learningGoals: formData.learningGoals,
          preferredLanguage:
            formData.preferredLanguage === "English"
              ? "Tiếng Anh"
              : "Tiếng Việt",
        },
      };

      await dispatch(
        updateStudentProfile({
          userId: currentUser.id,
          data: dataToUpdate,
        })
      ).unwrap();

      dispatch(fetchUserById(currentUser.id));
      setIsEditing(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Filter and sort payments
  const filteredPayments = React.useMemo(() => {
    if (!Array.isArray(userPayments)) return [];

    // Apply filters
    let result = [...userPayments];

    if (paymentFilter.status) {
      result = result.filter(
        (payment) => payment.status === paymentFilter.status
      );
    }

    if (paymentFilter.method) {
      result = result.filter(
        (payment) => payment.paymentMethod === paymentFilter.method
      );
    }

    // Apply sorting
    switch (paymentFilter.sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "amount_high":
        result.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        break;
      case "amount_low":
        result.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [userPayments, paymentFilter]);

  const paginatedPayments = React.useMemo(() => {
    if (showAllItems) return filteredPayments;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, page, itemsPerPage, showAllItems]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Scroll to top of payment list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
  }, [paymentFilter]);

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
                        {Array.isArray(userEnrollments)
                          ? userEnrollments.length
                          : 0}
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
                        {Array.isArray(userEnrollments)
                          ? userEnrollments.filter(
                              (enrollment) => enrollment.status === "completed"
                            )?.length
                          : 0}
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
                    label="Cá nhân"
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
                  <Tab
                    icon={<ReceiptIcon />}
                    iconPosition="start"
                    label="Thanh toán"
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
                        onClick={() => {
                          if (isEditing) {
                            handleSave();
                          } else {
                            setIsEditing(true);
                          }
                        }}
                      >
                        {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
                      </Button>
                    </Box>

                    {isEditing ? (
                      <Stack spacing={2}>
                        <StyledTextField
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleFormChange}
                        />
                        <StyledTextField
                          label="Số điện thoại"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                        />
                        <StyledTextField
                          label="Họ và tên"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleFormChange}
                        />

                        {currentUser?.role === UserRole.STUDENT ? (
                          <>
                            <StyledTextField
                              label="Giới thiệu"
                              name="bio"
                              multiline
                              rows={3}
                              value={formData.bio}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              type="date"
                              label="Ngày sinh"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleFormChange}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                            <FormControl fullWidth>
                              <InputLabel>Giới tính</InputLabel>
                              <Select
                                name="gender"
                                value={formData.gender}
                                label="Giới tính"
                                onChange={handleGenderChange}
                              >
                                <MenuItem value="male">Nam</MenuItem>
                                <MenuItem value="female">Nữ</MenuItem>
                                <MenuItem value="other">Khác</MenuItem>
                              </Select>
                            </FormControl>
                            <StyledTextField
                              label="Nghề nghiệp"
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              label="Trình độ học vấn"
                              name="educationLevel"
                              value={formData.educationLevel}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              label="Địa chỉ"
                              name="address"
                              value={formData.address}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              label="Thành phố"
                              name="city"
                              value={formData.city}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              label="Quốc gia"
                              name="country"
                              value={formData.country}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              label="Sở thích"
                              name="interests"
                              value={formData.interests}
                              onChange={handleFormChange}
                            />
                            <StyledTextField
                              label="Mục tiêu học tập"
                              name="learningGoals"
                              multiline
                              rows={2}
                              value={formData.learningGoals}
                              onChange={handleFormChange}
                            />
                            <FormControl fullWidth>
                              <InputLabel>Ngôn ngữ ưu tiên</InputLabel>
                              <Select
                                name="preferredLanguage"
                                value={formData.preferredLanguage}
                                label="Ngôn ngữ ưu tiên"
                                onChange={handleSelectChange}
                              >
                                <MenuItem value="Vietnamese">
                                  Tiếng Việt
                                </MenuItem>
                                <MenuItem value="English">Tiếng Anh</MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        ) : (
                          <>
                            <StyledTextField
                              label="Mã sinh viên"
                              name="studentCode"
                              value={formData.studentCode}
                              disabled
                            />
                            <StyledTextField
                              label="Khóa học"
                              name="academicYear"
                              value={formData.academicYear}
                              disabled
                            />
                            <StyledTextField
                              label="Lớp học"
                              value={
                                currentUser?.userStudentAcademic?.academicClass
                                  ?.classCode || ""
                              }
                              disabled
                            />
                          </>
                        )}
                      </Stack>
                    ) : (
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Email />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={currentUser?.email}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Phone />
                          </ListItemIcon>
                          <ListItemText
                            primary="Số điện thoại"
                            secondary={currentUser?.phone}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Họ và tên"
                            secondary={
                              currentUser?.role === UserRole.STUDENT
                                ? currentUser?.userStudent?.fullName
                                : currentUser?.userStudentAcademic?.fullName
                            }
                          />
                        </ListItem>

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
                            {currentUser?.userStudent?.address && (
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
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        mt={0.5}
                                      >
                                        <Typography variant="body2">
                                          {currentUser?.userStudent?.city}
                                        </Typography>
                                        <Typography variant="body2">
                                          •
                                        </Typography>
                                        <Typography variant="body2">
                                          {currentUser?.userStudent?.country}
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            )}
                            {currentUser?.userStudent?.interests && (
                              <ListItem>
                                <ListItemIcon>
                                  <Favorite />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Sở thích"
                                  secondary={
                                    currentUser?.userStudent?.interests
                                  }
                                />
                              </ListItem>
                            )}
                            {currentUser?.userStudent?.learningGoals && (
                              <ListItem>
                                <ListItemIcon>
                                  <School />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Mục tiêu học tập"
                                  secondary={
                                    currentUser?.userStudent?.learningGoals
                                  }
                                />
                              </ListItem>
                            )}
                            {currentUser?.userStudent?.preferredLanguage && (
                              <ListItem>
                                <ListItemIcon>
                                  <Language />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Ngôn ngữ ưu tiên"
                                  secondary={
                                    currentUser?.userStudent?.preferredLanguage
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
                          </>
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
                      {currentUser?.role === "student_academic" &&
                      Array.isArray(userCourseProgress) &&
                      userCourseProgress.length > 0 ? (
                        userCourseProgress.map((progress) => (
                          <ListItem
                            key={progress.courseId}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1,
                              mb: 1,
                              display: "flex",
                              flexDirection: { xs: "column", sm: "row" },
                              alignItems: { xs: "stretch", sm: "center" },
                              "&:last-child": {
                                mb: 0,
                              },
                              pb: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", width: "100%" }}>
                              {progress.courseImage && (
                                <Box sx={{ mr: 2, width: 80, height: 80 }}>
                                  <img
                                    src={progress.courseImage}
                                    alt={progress.courseTitle}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </Box>
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <ListItemText
                                  primary={progress.courseTitle}
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
                                              progress.completionPercentage
                                            }
                                            sx={{
                                              height: 6,
                                              borderRadius: 1,
                                              "& .MuiLinearProgress-bar": {
                                                backgroundColor:
                                                  progress.completionPercentage >
                                                  75
                                                    ? "success.main"
                                                    : progress.completionPercentage >
                                                      50
                                                    ? "info.main"
                                                    : progress.completionPercentage >
                                                      25
                                                    ? "warning.main"
                                                    : "error.main",
                                              },
                                            }}
                                          />
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {progress.completionPercentage.toFixed(
                                            0
                                          )}
                                          %
                                        </Typography>
                                      </Box>
                                      <Stack direction="row" spacing={1}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Bài học: {progress.completedLessons}/
                                          {progress.totalLessons}
                                        </Typography>
                                      </Stack>
                                      {progress.lastAccessedLesson && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                        >
                                          Bài học gần nhất:{" "}
                                          {progress.lastAccessedLesson.title}
                                        </Typography>
                                      )}
                                      {progress.lastAccessTime && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                        >
                                          Truy cập lần cuối:{" "}
                                          {new Date(
                                            progress.lastAccessTime
                                          ).toLocaleDateString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                mt: { xs: 2, sm: 0 },
                                ml: { xs: 0, sm: 2 },
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                size="medium"
                                startIcon={<MenuBookIcon />}
                                onClick={() =>
                                  navigate(`/course/${progress.courseId}/learn`)
                                }
                                sx={{
                                  minWidth: "150px",
                                }}
                              >
                                Tiếp tục học
                              </Button>
                            </Box>
                          </ListItem>
                        ))
                      ) : currentUser?.role === "student_academic" ? (
                        Array.isArray(studentAcademicCourses) &&
                        studentAcademicCourses.length > 0 ? (
                          studentAcademicCourses.map((enrollment: any) => (
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
                                primary={enrollment.course.title}
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
                        ) : (
                          <Typography
                            variant="body1"
                            textAlign="center"
                            color="text.secondary"
                            py={2}
                          >
                            Bạn chưa có môn học nào
                          </Typography>
                        )
                      ) : Array.isArray(userProgress) &&
                        userProgress.length > 0 ? (
                        userProgress.map((enrollment: any) => (
                          <ListItem
                            key={enrollment.id}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1,
                              mb: 1,
                              display: "flex",
                              flexDirection: { xs: "column", sm: "row" },
                              alignItems: { xs: "stretch", sm: "center" },
                              "&:last-child": {
                                mb: 0,
                              },
                              pb: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", width: "100%" }}>
                              {enrollment?.courseImage && (
                                <Box sx={{ mr: 2, width: 80, height: 80 }}>
                                  <img
                                    src={enrollment.courseImage}
                                    alt={enrollment.courseTitle}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </Box>
                              )}
                              <Box sx={{ flexGrow: 1 }}>
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
                                            sx={{
                                              height: 6,
                                              borderRadius: 1,
                                              "& .MuiLinearProgress-bar": {
                                                backgroundColor:
                                                  enrollment?.completionPercentage >
                                                  75
                                                    ? "success.main"
                                                    : enrollment?.completionPercentage >
                                                      50
                                                    ? "info.main"
                                                    : enrollment?.completionPercentage >
                                                      25
                                                    ? "warning.main"
                                                    : "error.main",
                                              },
                                            }}
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
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                mt: { xs: 2, sm: 0 },
                                ml: { xs: 0, sm: 2 },
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                size="medium"
                                startIcon={<MenuBookIcon />}
                                onClick={() =>
                                  navigate(
                                    `/course/${enrollment.courseId}/learn`
                                  )
                                }
                                sx={{
                                  minWidth: "130px",
                                }}
                              >
                                Tiếp tục học
                              </Button>
                            </Box>
                          </ListItem>
                        ))
                      ) : (
                        <Typography
                          variant="body1"
                          textAlign="center"
                          color="text.secondary"
                          py={2}
                        >
                          Bạn chưa có khóa học nào
                        </Typography>
                      )}
                    </List>
                  </Box>

                  <Divider />

                  {/* Certificates */}
                  {currentUser?.role === "student" && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Chứng chỉ đã đạt được
                      </Typography>
                      {Array.isArray(userCertificates) &&
                      userCertificates.length > 0 ? (
                        <List>
                          {userCertificates.map((cert) => (
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
                                    student_code: currentUser?.userStudent?.id,
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
                      ) : (
                        <Typography
                          variant="body1"
                          textAlign="center"
                          color="text.secondary"
                          py={2}
                        >
                          Bạn chưa có chứng chỉ nào
                        </Typography>
                      )}
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
                        variant="body1"
                        textAlign="center"
                        color="text.secondary"
                        py={3}
                      >
                        Chưa có thông tin điểm
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </TabPanel>

              {/* Tab Lịch sử thanh toán */}
              <TabPanel value={currentTab} index={3}>
                <Stack spacing={3} px={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Lịch sử thanh toán
                    </Typography>

                    {Array.isArray(userPayments) && userPayments.length > 0 ? (
                      <Box>
                        {/* Add filtering options */}
                        <Card sx={{ mb: 2, p: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                  value={paymentFilter.status || "all"}
                                  label="Trạng thái"
                                  onChange={(e) =>
                                    setPaymentFilter({
                                      ...paymentFilter,
                                      status:
                                        e.target.value !== "all"
                                          ? e.target.value
                                          : null,
                                    })
                                  }
                                >
                                  <MenuItem value="all">Tất cả</MenuItem>
                                  <MenuItem value="completed">
                                    Hoàn tất
                                  </MenuItem>
                                  <MenuItem value="pending">
                                    Đang xử lý
                                  </MenuItem>
                                  <MenuItem value="failed">Thất bại</MenuItem>
                                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Phương thức</InputLabel>
                                <Select
                                  value={paymentFilter.method || "all"}
                                  label="Phương thức"
                                  onChange={(e) =>
                                    setPaymentFilter({
                                      ...paymentFilter,
                                      method:
                                        e.target.value !== "all"
                                          ? e.target.value
                                          : null,
                                    })
                                  }
                                >
                                  <MenuItem value="all">Tất cả</MenuItem>
                                  <MenuItem value="zalopay">ZaloPay</MenuItem>
                                  <MenuItem value="e_wallet">
                                    Ví điện tử
                                  </MenuItem>
                                  <MenuItem value="bank_transfer">
                                    Chuyển khoản
                                  </MenuItem>
                                  <MenuItem value="credit_card">
                                    Thẻ tín dụng
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Sắp xếp</InputLabel>
                                <Select
                                  value={paymentFilter.sort}
                                  label="Sắp xếp"
                                  onChange={(e) =>
                                    setPaymentFilter({
                                      ...paymentFilter,
                                      sort: e.target.value,
                                    })
                                  }
                                >
                                  <MenuItem value="newest">
                                    Mới nhất trước
                                  </MenuItem>
                                  <MenuItem value="oldest">
                                    Cũ nhất trước
                                  </MenuItem>
                                  <MenuItem value="amount_high">
                                    Giá trị cao nhất
                                  </MenuItem>
                                  <MenuItem value="amount_low">
                                    Giá trị thấp nhất
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={3}
                              container
                              justifyContent="flex-end"
                            >
                              <Button
                                variant="outlined"
                                startIcon={<CloseIcon />}
                                onClick={() =>
                                  setPaymentFilter({
                                    status: null,
                                    method: null,
                                    sort: "newest",
                                  })
                                }
                              >
                                Xóa bộ lọc
                              </Button>
                            </Grid>
                          </Grid>
                        </Card>

                        {/* Items per page selector */}
                        {!showAllItems && (
                          <Box
                            sx={{
                              mt: 1,
                              mb: 2,
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mr: 2 }}
                            >
                              Hiển thị mỗi trang:
                            </Typography>
                            <FormControl size="small" sx={{ width: 80 }}>
                              <Select
                                value={itemsPerPage}
                                onChange={(e) => {
                                  setItemsPerPage(Number(e.target.value));
                                  setPage(1);
                                }}
                                displayEmpty
                              >
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        )}

                        <Card variant="outlined">
                          <List>
                            {paginatedPayments.map((payment) => (
                              <ListItem
                                key={payment.id}
                                sx={{
                                  borderBottom: "1px solid #e0e0e0",
                                  "&:last-child": { borderBottom: "none" },
                                  py: 2,
                                }}
                              >
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={12} sm={1.5}>
                                    <Avatar
                                      variant="rounded"
                                      src={payment.course?.thumbnailUrl}
                                      alt={payment.course?.title}
                                      sx={{ width: 60, height: 60 }}
                                    >
                                      <AccountBalanceWallet />
                                    </Avatar>
                                  </Grid>

                                  <Grid item xs={12} sm={6.5}>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="medium"
                                    >
                                      {payment.course?.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Mã giao dịch:{" "}
                                      {payment.transactionId || "Chưa có"}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Ngày tạo:{" "}
                                      {new Date(
                                        payment.createdAt
                                      ).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={12} sm={2.5}>
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                    >
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(parseFloat(payment.amount))}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {payment.paymentMethod === "zalopay"
                                        ? "ZaloPay"
                                        : payment.paymentMethod === "e_wallet"
                                        ? "Ví điện tử"
                                        : payment.paymentMethod ===
                                          "bank_transfer"
                                        ? "Chuyển khoản"
                                        : "Thẻ tín dụng"}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={12} sm={1.5} textAlign="right">
                                    <Chip
                                      label={
                                        payment.status === "completed"
                                          ? "Hoàn tất"
                                          : payment.status === "pending"
                                          ? "Đang xử lý"
                                          : payment.status === "failed"
                                          ? "Thất bại"
                                          : "Đã hủy"
                                      }
                                      color={
                                        payment.status === "completed"
                                          ? "success"
                                          : payment.status === "pending"
                                          ? "warning"
                                          : "error"
                                      }
                                      size="small"
                                    />
                                    {payment.paymentDate && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{ mt: 1 }}
                                      >
                                        Thanh toán:{" "}
                                        {new Date(
                                          payment.paymentDate
                                        ).toLocaleDateString("vi-VN")}
                                      </Typography>
                                    )}
                                  </Grid>
                                </Grid>
                              </ListItem>
                            ))}
                          </List>
                        </Card>

                        {/* Pagination control */}
                        {!showAllItems &&
                          filteredPayments.length > itemsPerPage && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                                mb: 2,
                              }}
                            >
                              <Pagination
                                count={Math.ceil(
                                  filteredPayments.length / itemsPerPage
                                )}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                              />
                            </Box>
                          )}

                        {/* Statistics with toggle for showing all items */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={showAllItems}
                                onChange={(e) =>
                                  setShowAllItems(e.target.checked)
                                }
                                color="primary"
                              />
                            }
                            label="Hiển thị tất cả"
                          />

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Hiển thị:{" "}
                              {showAllItems
                                ? filteredPayments.length
                                : paginatedPayments.length}{" "}
                              / {userPayments.length} giao dịch
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Giao dịch thành công:{" "}
                              {
                                filteredPayments.filter(
                                  (p) => p.status === "completed"
                                ).length
                              }
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 6,
                          px: 3,
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          border: "1px dashed",
                          borderColor: "divider",
                          maxWidth: 400,
                          mx: "auto",
                          my: 2,
                        }}
                      >
                        {/* Icon lớn với animation */}
                        <Box
                          sx={{
                            position: "relative",
                            mb: 3,
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: "primary.light",
                              opacity: 0.1,
                              animation: "pulse 2s infinite",
                            },
                            "@keyframes pulse": {
                              "0%": {
                                transform: "translate(-50%, -50%) scale(1)",
                                opacity: 0.1,
                              },
                              "50%": {
                                transform: "translate(-50%, -50%) scale(1.2)",
                                opacity: 0.2,
                              },
                              "100%": {
                                transform: "translate(-50%, -50%) scale(1)",
                                opacity: 0.1,
                              },
                            },
                          }}
                        >
                          <ReceiptLong
                            sx={{
                              fontSize: 60,
                              color: "primary.main",
                              opacity: 0.8,
                            }}
                          />
                        </Box>

                        {/* Tiêu đề */}
                        <Typography
                          variant="h6"
                          color="text.primary"
                          gutterBottom
                          sx={{
                            fontWeight: 500,
                            textAlign: "center",
                          }}
                        >
                          Chưa có giao dịch thanh toán
                        </Typography>

                        {/* Mô tả */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          sx={{
                            maxWidth: 300,
                            mb: 3,
                          }}
                        >
                          Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào.
                          Các giao dịch sẽ xuất hiện ở đây sau khi bạn thanh
                          toán khóa học.
                        </Typography>
                      </Box>
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
