import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  SelectChangeEvent,
  TextFieldProps,
  Alert,
  Pagination,
  FormControlLabel,
  Switch,
  InputAdornment,
  FormHelperText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
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
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet,
  ReceiptLong,
  Visibility,
  VisibilityOff,
  Favorite,
  Assessment as AssessmentIcon,
  EmojiEvents as EmojiEventsIcon,
  Grade as GradeIcon,
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
import {
  updateStudentProfile,
  updateUser,
  changePassword,
  updateStudentAcademic,
} from "../../features/users/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { fetchUserById } from "../../features/users/usersApiSlice";
import { fetchUserCourseProgress } from "../../features/course-progress/courseProgressSlice";
import { selectUserCourseProgress } from "../../features/course-progress/courseProgressSelectors";
import { fetchUserPayments } from "../../features/payments/paymentsSlice";
import { selectUserPayments } from "../../features/payments/paymentsSelectors";
import { uploadImageToCloudinary } from "../../utils/uploadImage";
import { setCredentials, updateUserInfo } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmptyState from "../../components/common/EmptyState";

type Gender = "male" | "female" | "other";

interface FormData {
  email: string;
  phone: string;
  fullName: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: Gender;
  occupation?: string;
  educationLevel?: string;
  address?: string;
  city?: string;
  country?: string;
  interests?: string;
  learningGoals?: string;
  preferredLanguage?: string;
  studentCode?: string;
  academicYear?: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// StyledTextField component
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

// ChangePasswordDialog component
const ChangePasswordDialog = React.memo(
  ({
    open,
    onClose,
    onSubmit,
    error,
    formData,
    onFormChange,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    onTogglePassword,
    isSaving,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    error: string | null;
    formData: ChangePasswordForm;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showCurrentPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    onTogglePassword: (field: "current" | "new" | "confirm") => void;
    isSaving: boolean;
  }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Đổi mật khẩu</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Mật khẩu hiện tại"
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={onFormChange}
            error={!!error}
            disabled={isSaving}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => onTogglePassword("current")}
                    edge="end"
                    disabled={isSaving}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu mới"
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={onFormChange}
            error={!!error}
            disabled={isSaving}
            helperText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => onTogglePassword("new")}
                    edge="end"
                    disabled={isSaving}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Xác nhận mật khẩu mới"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onFormChange}
            error={!!error}
            disabled={isSaving}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => onTogglePassword("confirm")}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={
            !formData.currentPassword ||
            !formData.newPassword ||
            !formData.confirmPassword
          }
        >
          Đổi mật khẩu
        </Button>
      </DialogActions>
    </Dialog>
  )
);

// TabPanel component
const TabPanel = ({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    sx={{ py: 3 }}
  >
    {value === index && children}
  </Box>
);

// PersonalInfoTab component
const PersonalInfoTab = React.memo(
  ({
    isEditing,
    formData,
    validationErrors,
    handleFormChange,
    handleGenderChange,
    handleSelectChange,
    currentUser,
    handleSave,
    isSaving,
  }: {
    isEditing: boolean;
    formData: FormData;
    validationErrors: Record<string, string>;
    handleFormChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handleGenderChange: (e: SelectChangeEvent<Gender>) => void;
    handleSelectChange: (e: SelectChangeEvent<string>) => void;
    currentUser: User | null;
    handleSave: () => void;
    isSaving: boolean;
  }) => (
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
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <CircularProgress size={20} />
            ) : isEditing ? (
              "Lưu thay đổi"
            ) : (
              "Chỉnh sửa"
            )}
          </Button>
        </Box>

        {isEditing ? (
          <Stack spacing={2}>
            {validationErrors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.general}
              </Alert>
            )}
            {/* Email không được phép chỉnh sửa */}
            <StyledTextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              helperText="Email không được phép chỉnh sửa"
            />
            <StyledTextField
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
            />
            <StyledTextField
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleFormChange}
              error={!!validationErrors.fullName}
              helperText={validationErrors.fullName}
            />
            {currentUser?.role === UserRole.STUDENT ? (
              <>
                <StyledTextField
                  type="date"
                  label="Ngày sinh"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange}
                  error={!!validationErrors.dateOfBirth}
                  helperText={validationErrors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth error={!!validationErrors.gender}>
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
                  {validationErrors.gender && (
                    <FormHelperText>{validationErrors.gender}</FormHelperText>
                  )}
                </FormControl>
                <StyledTextField
                  label="Nghề nghiệp"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleFormChange}
                  error={!!validationErrors.occupation}
                  helperText={validationErrors.occupation}
                />
                <StyledTextField
                  label="Trình độ học vấn"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleFormChange}
                  error={!!validationErrors.educationLevel}
                  helperText={validationErrors.educationLevel}
                />
                <StyledTextField
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                />
                <StyledTextField
                  label="Thành phố"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  error={!!validationErrors.city}
                  helperText={validationErrors.city}
                />
                <StyledTextField
                  label="Quốc gia"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  error={!!validationErrors.country}
                  helperText={validationErrors.country}
                />
                <StyledTextField
                  label="Sở thích"
                  name="interests"
                  value={formData.interests}
                  onChange={handleFormChange}
                  error={!!validationErrors.interests}
                  helperText={validationErrors.interests}
                />
                <StyledTextField
                  label="Mục tiêu học tập"
                  name="learningGoals"
                  multiline
                  rows={2}
                  value={formData.learningGoals}
                  onChange={handleFormChange}
                  error={!!validationErrors.learningGoals}
                  helperText={validationErrors.learningGoals}
                />
                <FormControl
                  fullWidth
                  error={!!validationErrors.preferredLanguage}
                >
                  <InputLabel>Ngôn ngữ ưu tiên</InputLabel>
                  <Select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    label="Ngôn ngữ ưu tiên"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
                    <MenuItem value="English">Tiếng Anh</MenuItem>
                  </Select>
                  {validationErrors.preferredLanguage && (
                    <FormHelperText>
                      {validationErrors.preferredLanguage}
                    </FormHelperText>
                  )}
                </FormControl>
              </>
            ) : (
              <>
                {/* Các trường không được phép chỉnh sửa cho student_academic */}
                <StyledTextField
                  label="Mã sinh viên"
                  name="studentCode"
                  value={formData.studentCode}
                  disabled
                  helperText="Mã sinh viên không được phép chỉnh sửa"
                />
                <StyledTextField
                  label="Khóa học"
                  name="academicYear"
                  value={formData.academicYear}
                  disabled
                  helperText="Khóa học không được phép chỉnh sửa"
                />
                <StyledTextField
                  label="Lớp học"
                  value={
                    currentUser?.userStudentAcademic?.academicClass
                      ?.classCode || ""
                  }
                  disabled
                  helperText="Lớp học không được phép chỉnh sửa"
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
                secondaryTypographyProps={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="Số điện thoại"
                secondary={currentUser?.phone}
                secondaryTypographyProps={{ color: "text.secondary" }}
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
                secondaryTypographyProps={{ color: "text.secondary" }}
              />
            </ListItem>
            {currentUser?.role === UserRole.STUDENT ? (
              <>
                {/* Hiển thị các trường thông tin của student */}
                {currentUser?.userStudent?.dateOfBirth && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ngày sinh"
                      secondary={
                        currentUser.userStudent.dateOfBirth instanceof Date
                          ? currentUser.userStudent.dateOfBirth.toLocaleDateString(
                              "vi-VN"
                            )
                          : new Date(
                              currentUser.userStudent.dateOfBirth
                            ).toLocaleDateString("vi-VN")
                      }
                      secondaryTypographyProps={{ color: "text.secondary" }}
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
                      secondary={currentUser?.userStudent?.occupation}
                      secondaryTypographyProps={{ color: "text.secondary" }}
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
                      secondary={currentUser?.userStudent?.educationLevel}
                      secondaryTypographyProps={{ color: "text.secondary" }}
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
                      secondaryTypographyProps={{ color: "text.secondary" }}
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
                      secondary={currentUser?.userStudent?.interests}
                      secondaryTypographyProps={{ color: "text.secondary" }}
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
                      secondary={currentUser?.userStudent?.learningGoals}
                      secondaryTypographyProps={{ color: "text.secondary" }}
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
                      secondary={currentUser?.userStudent?.preferredLanguage}
                      secondaryTypographyProps={{ color: "text.secondary" }}
                    />
                  </ListItem>
                )}
              </>
            ) : (
              <>
                {/* Hiển thị các trường thông tin của student_academic */}
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mã sinh viên"
                    secondary={currentUser?.userStudentAcademic?.studentCode}
                    secondaryTypographyProps={{ color: "text.secondary" }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Khóa học"
                    secondary={currentUser?.userStudentAcademic?.academicYear}
                    secondaryTypographyProps={{ color: "text.secondary" }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lớp học"
                    secondary={
                      currentUser?.userStudentAcademic?.academicClass?.classCode
                    }
                    secondaryTypographyProps={{ color: "text.secondary" }}
                  />
                </ListItem>
              </>
            )}
          </List>
        )}
      </Box>
    </Stack>
  )
);

// LearningTab component
const LearningTab = React.memo(
  ({
    currentUser,
    userEnrollments,
    userProgress,
    userCourseProgress,
    studentAcademicCourses,
    userCertificates,
    navigate,
    setSelectedCertificate,
  }: {
    currentUser: User | null;
    userEnrollments: any[];
    userProgress: any[];
    userCourseProgress: any[];
    studentAcademicCourses: any[];
    userCertificates: any[];
    navigate: (path: string) => void;
    setSelectedCertificate: (certificate: any) => void;
  }) => (
    <Stack spacing={3} px={2}>
      <Box>
        <Typography variant="h6" gutterBottom>
          {currentUser?.role === UserRole.STUDENT_ACADEMIC
            ? "Các môn học đang học"
            : "Khóa học đang học"}
        </Typography>
        <List>
          {currentUser?.role === UserRole.STUDENT_ACADEMIC &&
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
                                value={progress.completionPercentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 1,
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor:
                                      progress.completionPercentage > 75
                                        ? "success.main"
                                        : progress.completionPercentage > 50
                                        ? "info.main"
                                        : progress.completionPercentage > 25
                                        ? "warning.main"
                                        : "error.main",
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {progress.completionPercentage.toFixed(0)}%
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
                    sx={{ minWidth: "150px" }}
                  >
                    Tiếp tục học
                  </Button>
                </Box>
              </ListItem>
            ))
          ) : currentUser?.role === UserRole.STUDENT_ACADEMIC ? (
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
                          <Typography variant="body2" color="text.secondary">
                            {enrollment.progress || 0}%
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Lớp: {enrollment.academicClass.classCode}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Giảng viên: {enrollment.course.instructor.fullName}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <EmptyState
                icon={<SchoolIcon />}
                title="Chưa có môn học nào"
                description="Bạn chưa được đăng ký vào bất kỳ môn học nào. Hãy liên hệ với giảng viên hoặc quản trị viên để được hỗ trợ."
              />
            )
          ) : Array.isArray(userProgress) && userProgress.length > 0 ? (
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
                                value={enrollment?.completionPercentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 1,
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor:
                                      enrollment?.completionPercentage > 75
                                        ? "success.main"
                                        : enrollment?.completionPercentage > 50
                                        ? "info.main"
                                        : enrollment?.completionPercentage > 25
                                        ? "warning.main"
                                        : "error.main",
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {enrollment?.completionPercentage}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
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
                      navigate(`/course/${enrollment.courseId}/learn`)
                    }
                    sx={{ minWidth: "130px" }}
                  >
                    Tiếp tục học
                  </Button>
                </Box>
              </ListItem>
            ))
          ) : (
            <EmptyState
              icon={<MenuBookIcon />}
              title="Chưa có khóa học nào"
              description="Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học có sẵn và bắt đầu học ngay hôm nay!"
            />
          )}
        </List>
      </Box>

      {currentUser?.role === UserRole.STUDENT && (
        <>
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom>
              Chứng chỉ đã đạt được
            </Typography>
            {Array.isArray(userCertificates) && userCertificates.length > 0 ? (
              <List>
                {userCertificates.map((cert) => (
                  <ListItem
                    key={cert.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
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
                          student_name: currentUser?.userStudent?.fullName,
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
              <EmptyState
                icon={<EmojiEventsIcon />}
                title="Chưa có chứng chỉ nào"
                description="Bạn chưa đạt được chứng chỉ nào. Hãy hoàn thành các khóa học để nhận chứng chỉ!"
                height={250}
              />
            )}
          </Box>
        </>
      )}
    </Stack>
  )
);

// GradesTab component
const GradesTab = React.memo(
  ({
    currentUser,
    userGrades,
    loadingGrades,
  }: {
    currentUser: User | null;
    userGrades: any[];
    loadingGrades: boolean;
  }) => (
    <Stack spacing={3} px={2}>
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
                            (Number(grade.score) / Number(grade.maxScore)) *
                              100 *
                              Number(grade.weight || 1),
                          0
                        ) /
                        userGrades.reduce(
                          (sum, grade) => sum + Number(grade.weight || 1),
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

      <Box>
        <Typography variant="h6" gutterBottom>
          Chi tiết điểm
        </Typography>
        {loadingGrades ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : userGrades && userGrades.length > 0 ? (
          currentUser?.role === UserRole.STUDENT_ACADEMIC ? (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
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
                .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight))
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
                        grade.assignmentSubmission?.assignment?.title}
                      {grade.gradeType === "quiz" &&
                        grade.quizAttempt?.quiz?.title}
                      {grade.gradeType === "midterm" && "Điểm giữa kỳ"}
                      {grade.gradeType === "final" && "Điểm cuối kỳ"}
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
                        (x{parseFloat(grade.weight || "0").toFixed(2)})
                      </Typography>
                    </Box>
                  </Box>
                ))}
              {(() => {
                let totalWeightedScore = 0;
                let totalWeight = 0;
                userGrades.forEach((grade) => {
                  const score = parseFloat(grade.score);
                  const maxScore = parseFloat(grade.maxScore);
                  const weight = parseFloat(grade.weight);
                  const weightedScore = (score / maxScore) * 100 * weight;
                  totalWeightedScore += weightedScore;
                  totalWeight += weight;
                });
                const finalGrade =
                  totalWeight > 0
                    ? parseFloat((totalWeightedScore / totalWeight).toFixed(2))
                    : 0;
                return (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
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
            Object.values(
              userGrades.reduce((acc, grade) => {
                const courseId = grade.courseId;
                if (!acc[courseId]) {
                  acc[courseId] = {
                    course_id: courseId,
                    course_title:
                      grade.course?.title || "Khóa học không xác định",
                    grades: [],
                    completion_date: grade.gradedAt,
                    final_grade: 0,
                    total_weight: 0,
                  };
                }
                acc[courseId].grades.push(grade);
                if (
                  new Date(grade.gradedAt) >
                  new Date(acc[courseId].completion_date)
                ) {
                  acc[courseId].completion_date = grade.gradedAt;
                }
                return acc;
              }, {})
            ).map((course) => {
              let totalWeightedScore = 0;
              let totalWeight = 0;
              course.grades.forEach((grade) => {
                const weight = Number(grade.weight);
                const score = Number(grade.score);
                const maxScore = Number(grade.maxScore);
                const weightedScore = (score / maxScore) * 100 * weight;
                totalWeightedScore += weightedScore;
                totalWeight += weight;
              });
              course.final_grade =
                totalWeight > 0
                  ? parseFloat((totalWeightedScore / totalWeight).toFixed(2))
                  : 0;
              course.grades.sort((a, b) => Number(b.weight) - Number(a.weight));
              return (
                <Card key={course.course_id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {course.course_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cập nhật:{" "}
                        {new Date(course.completion_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Điểm tổng kết:{" "}
                        <Box component="span">{course.final_grade}/100</Box>
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      {course.grades.map((grade) => {
                        const scorePart = `${Number(grade.score)}/${Number(
                          grade.maxScore
                        )}`;
                        const weightPart = `(x${Number(grade.weight).toFixed(
                          2
                        )})`;
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
                        else if (grade.gradeType === "participation")
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
                            <Typography variant="body2">{gradeName}</Typography>
                            <Typography variant="body2">
                              {scorePart} {weightPart}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
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
          <EmptyState
            icon={<GradeIcon />}
            title="Chưa có thông tin điểm"
            description="Bạn chưa có bất kỳ điểm số nào được ghi nhận. Điểm số sẽ xuất hiện sau khi bạn hoàn thành các bài tập và bài kiểm tra."
          />
        )}
      </Box>
    </Stack>
  )
);

// PaymentsTab component
const PaymentsTab = React.memo(
  ({
    userPayments,
    paymentFilter,
    setPaymentFilter,
    page,
    itemsPerPage,
    showAllItems,
    setShowAllItems,
    handlePageChange,
  }: {
    userPayments: any[];
    paymentFilter: any;
    setPaymentFilter: (filter: any) => void;
    page: number;
    itemsPerPage: number;
    showAllItems: boolean;
    setShowAllItems: (value: boolean) => void;
    handlePageChange: (
      event: React.ChangeEvent<unknown>,
      value: number
    ) => void;
  }) => {
    const filteredPayments = React.useMemo(() => {
      if (!Array.isArray(userPayments)) return [];
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

    return (
      <Stack spacing={3} px={2}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Lịch sử thanh toán
          </Typography>
          {Array.isArray(userPayments) && userPayments.length > 0 ? (
            <Box>
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
                              e.target.value !== "all" ? e.target.value : null,
                          })
                        }
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="completed">Hoàn tất</MenuItem>
                        <MenuItem value="pending">Đang xử lý</MenuItem>
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
                              e.target.value !== "all" ? e.target.value : null,
                          })
                        }
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="zalopay">ZaloPay</MenuItem>
                        <MenuItem value="e_wallet">Ví điện tử</MenuItem>
                        <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                        <MenuItem value="credit_card">Thẻ tín dụng</MenuItem>
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
                        <MenuItem value="newest">Mới nhất trước</MenuItem>
                        <MenuItem value="oldest">Cũ nhất trước</MenuItem>
                        <MenuItem value="amount_high">
                          Giá trị cao nhất
                        </MenuItem>
                        <MenuItem value="amount_low">
                          Giá trị thấp nhất
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3} container justifyContent="flex-end">
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
                        handlePageChange(e, 1);
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
                          <Typography variant="subtitle1" fontWeight="medium">
                            {payment.course?.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mã giao dịch: {payment.transactionId || "Chưa có"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ngày tạo:{" "}
                            {new Date(payment.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2.5}>
                          <Typography variant="body1" fontWeight="medium">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(parseFloat(payment.amount))}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {payment.paymentMethod === "zalopay"
                              ? "ZaloPay"
                              : payment.paymentMethod === "e_wallet"
                              ? "Ví điện tử"
                              : payment.paymentMethod === "bank_transfer"
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
                              {new Date(payment.paymentDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              </Card>
              {!showAllItems && filteredPayments.length > itemsPerPage && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                    mb: 2,
                  }}
                >
                  <Pagination
                    count={Math.ceil(filteredPayments.length / itemsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
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
                      onChange={(e) => setShowAllItems(e.target.checked)}
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
                      filteredPayments.filter((p) => p.status === "completed")
                        .length
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <EmptyState
              icon={<ReceiptLong />}
              title="Chưa có giao dịch thanh toán"
              description="Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào. Các giao dịch sẽ xuất hiện ở đây sau khi bạn thanh toán khóa học."
            />
          )}
        </Box>
      </Stack>
    );
  }
);

// Main ProfileAccount component
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
  const [paymentFilter, setPaymentFilter] = useState({
    status: null,
    method: null,
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAllItems, setShowAllItems] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (currentUser?.id && !isNaN(Number(currentUser.id))) {
      setLoadingGrades(true);
      dispatch(fetchUserGradesByUser(Number(currentUser.id))).finally(() =>
        setLoadingGrades(false)
      );
      dispatch(fetchUserProgress());
      if (currentUser.role === UserRole.STUDENT_ACADEMIC) {
        dispatch(fetchUserCourseProgress());
      }
      dispatch(fetchUserPayments(Number(currentUser.id)));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.id && !isNaN(Number(currentUser.id))) {
      dispatch(fetchUserEnrollments(Number(currentUser.id)));
      dispatch(fetchStudentAcademicCourses(currentUser.id.toString()));
      dispatch(fetchUserCertificates({ userId: Number(currentUser.id) }));
    }
  }, [dispatch, currentUser?.id]);

  useEffect(() => {
    setPage(1);
  }, [paymentFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAvatarChange = async (file: File) => {
    if (!currentUser?.id) return;
    try {
      setIsUploading(true);
      setUploadError(null);
      const imageUrl = await uploadImageToCloudinary(file);

      // Cập nhật user với avatar mới
      const updatedUser = await dispatch(
        updateUser({
          userId: currentUser.id,
          userData: { avatarUrl: imageUrl },
        })
      ).unwrap();

      // Cập nhật state và localStorage ngay lập tức
      const freshUser = await dispatch(fetchUserById(currentUser.id)).unwrap();
      dispatch(updateUserInfo(freshUser));
      localStorage.setItem("user", JSON.stringify(freshUser));

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadError(
        error instanceof Error ? error.message : "Lỗi khi tải lên ảnh đại diện"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleGenderChange = useCallback((e: SelectChangeEvent<Gender>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const validateFormData = (formData: FormData, role: UserRole) => {
    const errors: Record<string, string> = {};
    if (!formData.email) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!formData.phone) {
      errors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
    if (!formData.fullName) {
      errors.fullName = "Họ và tên là bắt buộc";
    }
    if (role === UserRole.STUDENT) {
      if (!formData.dateOfBirth) errors.dateOfBirth = "Ngày sinh là bắt buộc";
      if (!formData.gender) errors.gender = "Giới tính là bắt buộc";
      if (!formData.educationLevel)
        errors.educationLevel = "Trình độ học vấn là bắt buộc";
      if (!formData.occupation) errors.occupation = "Nghề nghiệp là bắt buộc";
      if (!formData.address) errors.address = "Địa chỉ là bắt buộc";
      if (!formData.city) errors.city = "Thành phố là bắt buộc";
      if (!formData.country) errors.country = "Quốc gia là bắt buộc";
      if (!formData.interests) errors.interests = "Sở thích là bắt buộc";
      if (!formData.learningGoals)
        errors.learningGoals = "Mục tiêu học tập là bắt buộc";
      if (!formData.preferredLanguage)
        errors.preferredLanguage = "Ngôn ngữ ưu tiên là bắt buộc";
    }
    return errors;
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      const errors = validateFormData(formData, currentUser.role);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      if (currentUser.role === UserRole.STUDENT) {
        const formattedDateOfBirth = formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
          : undefined;
        const dataToUpdate = {
          user: {
            phone: formData.phone, // Chỉ cập nhật phone, không cập nhật email
          },
          student: {
            fullName: formData.fullName,
            dateOfBirth: formattedDateOfBirth,
            gender: formData.gender || undefined,
            educationLevel: formData.educationLevel || undefined,
            occupation: formData.occupation || undefined,
            bio: formData.bio || undefined,
            interests: formData.interests || undefined,
            address: formData.address || undefined,
            city: formData.city || undefined,
            country: formData.country || undefined,
            learningGoals: formData.learningGoals || undefined,
            preferredLanguage:
              formData.preferredLanguage === "English"
                ? "Tiếng Anh"
                : formData.preferredLanguage === "Vietnamese"
                ? "Tiếng Việt"
                : undefined,
          },
        };
        await dispatch(
          updateStudentProfile({ userId: currentUser.id, data: dataToUpdate })
        ).unwrap();

        // Sau khi cập nhật thành công
        const freshUser = await dispatch(
          fetchUserById(currentUser.id)
        ).unwrap();
        dispatch(updateUserInfo(freshUser));
        localStorage.setItem("user", JSON.stringify(freshUser));

        setIsEditing(false);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else if (currentUser.role === UserRole.STUDENT_ACADEMIC) {
        const dataToUpdate = {
          userId: currentUser.id,
          user: {
            phone: formData.phone, // Chỉ cập nhật phone, không cập nhật email
          },
          studentAcademic: {
            fullName: formData.fullName,
          },
        };

        try {
          await dispatch(updateStudentAcademic(dataToUpdate)).unwrap();

          // Sau khi cập nhật thành công, fetch lại thông tin user mới nhất
          const freshUser = await dispatch(
            fetchUserById(currentUser.id)
          ).unwrap();
          dispatch(updateUserInfo(freshUser));
          localStorage.setItem("user", JSON.stringify(freshUser));

          setIsEditing(false);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        } catch (error: any) {
          console.error("Error updating academic profile:", error);
          if (error.message?.includes("phone")) {
            setValidationErrors({
              phone: "Số điện thoại đã tồn tại hoặc không hợp lệ",
            });
          } else {
            setValidationErrors({
              general: "Có lỗi xảy ra khi cập nhật thông tin",
            });
          }
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.message?.includes("date_of_birth")) {
        setValidationErrors({
          dateOfBirth: "Định dạng ngày sinh không hợp lệ",
        });
      } else if (error.message?.includes("phone")) {
        setValidationErrors({
          phone: "Số điện thoại đã tồn tại hoặc không hợp lệ",
        });
      } else {
        setValidationErrors({
          general: "Có lỗi xảy ra khi cập nhật thông tin",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleTogglePassword = useCallback(
    (field: "current" | "new" | "confirm") => {
      switch (field) {
        case "current":
          setShowCurrentPassword((prev) => !prev);
          break;
        case "new":
          setShowNewPassword((prev) => !prev);
          break;
        case "confirm":
          setShowConfirmPassword((prev) => !prev);
          break;
      }
    },
    []
  );

  const handleClosePasswordDialog = useCallback(() => {
    setChangePasswordOpen(false);
    setPasswordError(null);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, []);

  const handlePasswordChange = async () => {
    if (!currentUser?.id) {
      toast.error("User not found");
      return;
    }

    // Basic validation
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setPasswordError("");
      setIsSaving(true);

      const result = await dispatch(
        changePassword({
          userId: currentUser.id,
          data: {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword,
          },
        })
      ).unwrap();

      // Clear form and show success message
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangePasswordOpen(false);
      setIsSaving(false);

      // Show success message using toast
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(
        error.message ||
          "Failed to change password. Please check your current password and try again."
      );
      setIsSaving(false);
    }
  };

  const dialogProps = useMemo(
    () => ({
      open: changePasswordOpen,
      onClose: handleClosePasswordDialog,
      onSubmit: handlePasswordChange,
      error: passwordError,
      formData: passwordForm,
      onFormChange: handlePasswordFormChange,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      onTogglePassword: handleTogglePassword,
      isSaving: isSaving,
    }),
    [
      changePasswordOpen,
      handleClosePasswordDialog,
      handlePasswordChange,
      passwordError,
      passwordForm,
      handlePasswordFormChange,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      handleTogglePassword,
      isSaving,
    ]
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <CustomContainer>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thông tin tài khoản
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
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
                  <Box sx={{ position: "relative" }}>
                    <AvatarUpload
                      currentAvatar={
                        currentUser?.avatarUrl ||
                        "/src/assets/logo-not-text.png"
                      }
                      onAvatarChange={handleAvatarChange}
                    />
                    {isUploading && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "rgba(0, 0, 0, 0.5)",
                          borderRadius: "50%",
                        }}
                      >
                        <CircularProgress size={40} color="primary" />
                      </Box>
                    )}
                  </Box>
                  {uploadError && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {uploadError}
                    </Typography>
                  )}
                  <Typography variant="h5" gutterBottom>
                    {currentUser?.role === UserRole.STUDENT
                      ? currentUser?.userStudent?.fullName
                      : currentUser?.userStudentAcademic?.fullName}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {currentUser?.role === UserRole.STUDENT
                      ? "Mã học viên"
                      : "Mã sinh viên"}
                    :{" "}
                    {currentUser?.role === UserRole.STUDENT
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
                      ? new Date(currentUser.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : ""}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
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
              <TabPanel value={currentTab} index={0}>
                <PersonalInfoTab
                  isEditing={isEditing}
                  formData={formData}
                  validationErrors={validationErrors}
                  handleFormChange={handleFormChange}
                  handleGenderChange={handleGenderChange}
                  handleSelectChange={handleSelectChange}
                  currentUser={currentUser}
                  handleSave={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  isSaving={isSaving}
                />
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                <LearningTab
                  currentUser={currentUser}
                  userEnrollments={userEnrollments}
                  userProgress={userProgress}
                  userCourseProgress={userCourseProgress}
                  studentAcademicCourses={studentAcademicCourses}
                  userCertificates={userCertificates}
                  navigate={navigate}
                  setSelectedCertificate={setSelectedCertificate}
                />
              </TabPanel>
              <TabPanel value={currentTab} index={2}>
                <GradesTab
                  currentUser={currentUser}
                  userGrades={userGrades}
                  loadingGrades={loadingGrades}
                />
              </TabPanel>
              <TabPanel value={currentTab} index={3}>
                <PaymentsTab
                  userPayments={userPayments}
                  paymentFilter={paymentFilter}
                  setPaymentFilter={setPaymentFilter}
                  page={page}
                  itemsPerPage={itemsPerPage}
                  showAllItems={showAllItems}
                  setShowAllItems={setShowAllItems}
                  handlePageChange={handlePageChange}
                />
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {selectedCertificate && (
        <CertificateDetail
          open={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}
      <ChangePasswordDialog {...dialogProps} />
    </CustomContainer>
  );
};

export default ProfileAccount;
