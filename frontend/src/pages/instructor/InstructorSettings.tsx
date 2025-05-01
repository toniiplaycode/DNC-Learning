import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
  Alert,
  Chip,
  TextFieldProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  PhotoCamera,
  Logout,
  AccountBox,
  School,
  ContactMail,
  Security,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { UpdateInstructorProfileData } from "../../types/user-instructor.types";
import {
  fetchUserById,
  updateInstructorProfile,
  changePassword,
} from "../../features/users/usersApiSlice";
import { selectUserId } from "../../features/users/usersSelectors";
import { uploadImageToCloudinary } from "../../utils/uploadImage";

// Tạo component TextField tùy chỉnh
const StyledTextField = (props: TextFieldProps) => (
  <TextField
    {...props}
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

const InstructorSettings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUserLocal = useAppSelector(selectCurrentUser);
  const currentUser = useAppSelector(selectUserId);
  const [showAlert, setShowAlert] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [instructor, setInstructor] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchUserById(currentUserLocal.id));
  }, [dispatch, navigate]);

  useEffect(() => {
    const instructorData = currentUser?.userInstructor;
    setInstructor(instructorData);
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  const [editMode, setEditMode] = useState<{
    account: boolean;
    basic: boolean;
    education: boolean;
    contact: boolean;
    payment: boolean;
    password: boolean;
  }>({
    account: false,
    basic: false,
    education: false,
    contact: false,
    payment: false,
    password: false,
  });

  // Then use it in useState initialization
  const [formData, setFormData] = useState<UpdateInstructorProfileData>({
    user: {
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
    },
    instructor: {
      fullName: instructor?.fullName || "",
      professionalTitle: instructor?.professionalTitle || "",
      specialization: instructor?.specialization || "",
      bio: instructor?.bio || "",
      educationBackground: instructor?.educationBackground || "",
      teachingExperience: instructor?.teachingExperience || "",
      expertiseAreas: instructor?.expertiseAreas || "",
      certificates: instructor?.certificates || "",
      linkedinProfile: instructor?.linkedinProfile || "",
      website: instructor?.website || "",
    },
  });

  // Add new state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Add useEffect to update formData when instructor data changes
  useEffect(() => {
    if (instructor) {
      setFormData((prev) => ({
        ...prev,
        user: {
          username: currentUser?.username || "",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
        },
        instructor: {
          fullName: instructor.fullName || "",
          professionalTitle: instructor.professionalTitle || "",
          specialization: instructor.specialization || "",
          bio: instructor.bio || "",
          educationBackground: instructor.educationBackground || "",
          teachingExperience: instructor.teachingExperience || "",
          expertiseAreas: instructor.expertiseAreas || "",
          certificates: instructor.certificates || "",
          linkedinProfile: instructor.linkedinProfile || "",
          website: instructor.website || "",
        },
      }));
    }
  }, [instructor]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Add change handlers
  const handleUserDataChange =
    (field: keyof UpdateUserData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [field]: event.target.value,
        },
      }));
    };

  const handleInstructorDataChange =
    (field: keyof UpdateInstructorData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        instructor: {
          ...prev.instructor,
          [field]: event.target.value,
        },
      }));
    };

  const validateSection = (section: keyof typeof editMode): boolean => {
    switch (section) {
      case "account":
        if (!formData.user.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          alert("Email không hợp lệ");
          return false;
        }
        if (formData.user.phone && !formData.user.phone.match(/^\d{10,11}$/)) {
          alert("Số điện thoại không hợp lệ");
          return false;
        }
        break;
      // ...existing validation cases...
    }
    return true;
  };

  // Thêm hàm xử lý lưu cho từng phần
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSection = async (section: keyof typeof editMode) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!currentUser?.id) return;
      if (!validateSection(section)) return;

      const dataToUpdate = {
        user: {},
        instructor: {},
      } as UpdateInstructorProfileData;

      // Only include changed fields based on section
      if (section === "account") {
        dataToUpdate.user = {
          username: formData.user.username,
          email: formData.user.email,
          phone: formData.user.phone,
        };
      } else if (section === "basic") {
        dataToUpdate.instructor = {
          fullName: formData.instructor.fullName,
          professionalTitle: formData.instructor.professionalTitle,
          specialization: formData.instructor.specialization,
          bio: formData.instructor.bio,
        };
      } else if (section === "education") {
        dataToUpdate.instructor = {
          educationBackground: formData.instructor.educationBackground,
          teachingExperience: formData.instructor.teachingExperience,
          expertiseAreas: formData.instructor.expertiseAreas,
          certificates: formData.instructor.certificates,
        };
      } else if (section === "contact") {
        dataToUpdate.instructor = {
          linkedinProfile: formData.instructor.linkedinProfile,
          website: formData.instructor.website,
        };
        dataToUpdate.user = {
          phone: formData.user.phone,
        };
      }

      await dispatch(
        updateInstructorProfile({
          userId: currentUser.id,
          data: dataToUpdate,
        })
      ).unwrap();

      console.log(dataToUpdate);

      dispatch(fetchUserById(currentUser.id));
      setEditMode({ ...editMode, [section]: false });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) return;

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG.");
      return;
    }

    // Create preview and store file
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      setPreviewDialogOpen(true);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !currentUser?.id) return;

    setIsUploading(true);
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(selectedFile);

      // Update user profile with new avatar URL
      const dataToUpdate = {
        user: {
          avatarUrl: imageUrl,
        },
        instructor: {},
      } as UpdateInstructorProfileData;

      await dispatch(
        updateInstructorProfile({
          userId: currentUser.id,
          data: dataToUpdate,
        })
      ).unwrap();

      // Refresh user data
      dispatch(fetchUserById(currentUser.id));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

      // Close dialog and clean up
      setPreviewDialogOpen(false);
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add password change handler
  const handleChangePassword = async () => {
    if (isSubmitting) return;

    // Validate passwords
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        changePassword({
          userId: currentUser.id,
          data: passwordData,
        })
      ).unwrap();

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setEditMode({ ...editMode, password: false });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      alert(
        "Không thể thay đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title and logout */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Cài đặt tài khoản
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý thông tin cá nhân và tài khoản của bạn
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<Logout />}
          onClick={() => setLogoutDialogOpen(true)}
        >
          Đăng xuất
        </Button>
      </Box>

      {/* Success Alert */}
      {showAlert && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            boxShadow: 2,
          }}
        >
          {isUploading
            ? "Cập nhật ảnh đại diện thành công!"
            : "Cập nhật thành công!"}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Profile Card */}
            <Card sx={{ p: 3 }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  src={currentUser?.avatarUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    boxShadow: 2,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {instructor?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {instructor?.professionalTitle}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={isUploading}
              >
                {isUploading ? "Đang tải lên..." : "Thay đổi ảnh"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </Button>
              {isUploading && (
                <Box sx={{ width: "100%", mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
            </Card>

            {/* Account Status Card */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Security color="primary" />
                  <Typography variant="h6">Trạng thái tài khoản</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Tài khoản
                    </Typography>
                    <Chip
                      label={
                        currentUser?.status === "active"
                          ? "Đang hoạt động"
                          : "Đã khóa"
                      }
                      color={
                        currentUser?.status === "active" ? "success" : "error"
                      }
                      sx={{ width: "100%" }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Xác thực hai lớp
                    </Typography>
                    <Chip
                      label={
                        currentUser?.twoFactorEnabled ? "Đã bật" : "Chưa bật"
                      }
                      color={
                        currentUser?.twoFactorEnabled ? "success" : "warning"
                      }
                      sx={{ width: "100%" }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Trạng thái xác thực
                    </Typography>
                    <Chip
                      label={
                        instructor?.verificationStatus === "verified"
                          ? "Đã xác thực"
                          : instructor?.verificationStatus === "pending"
                          ? "Đang chờ xác thực"
                          : "Chưa xác thực"
                      }
                      color={
                        instructor?.verificationStatus === "verified"
                          ? "success"
                          : instructor?.verificationStatus === "pending"
                          ? "warning"
                          : "error"
                      }
                      sx={{ width: "100%" }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Account Info */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <AccountBox color="primary" />
                <Typography variant="h6">Thông tin tài khoản</Typography>
                <Box flexGrow={1} />
                <IconButton
                  onClick={() =>
                    setEditMode({ ...editMode, account: !editMode.account })
                  }
                  color={editMode.account ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Box>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  label="Tên đăng nhập"
                  value={formData.user.username}
                  onChange={handleUserDataChange("username")}
                  disabled={!editMode.account}
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  value={formData.user.email}
                  onChange={handleUserDataChange("email")}
                  disabled={!editMode.account}
                  type="email"
                />
                <StyledTextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.user.phone}
                  onChange={handleUserDataChange("phone")}
                  disabled={!editMode.account}
                />
                {editMode.account && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      onClick={() =>
                        setEditMode({ ...editMode, account: false })
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSaveSection("account")}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Basic Info */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <AccountBox color="primary" />
                <Typography variant="h6">Thông tin cơ bản</Typography>
                <Box flexGrow={1} />
                <IconButton
                  onClick={() =>
                    setEditMode({ ...editMode, basic: !editMode.basic })
                  }
                  color={editMode.basic ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Box>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  label="Họ và tên"
                  value={formData.instructor.fullName}
                  onChange={handleInstructorDataChange("fullName")}
                  disabled={!editMode.basic}
                />
                <StyledTextField
                  fullWidth
                  label="Chức danh"
                  value={formData.instructor.professionalTitle}
                  onChange={handleInstructorDataChange("professionalTitle")}
                  disabled={!editMode.basic}
                />
                <StyledTextField
                  fullWidth
                  label="Chuyên môn"
                  value={formData.instructor.specialization}
                  onChange={handleInstructorDataChange("specialization")}
                  disabled={!editMode.basic}
                />
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Giới thiệu"
                  value={formData.instructor.bio}
                  onChange={handleInstructorDataChange("bio")}
                  disabled={!editMode.basic}
                />

                {editMode.basic && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      onClick={() => setEditMode({ ...editMode, basic: false })}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSaveSection("basic")}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Education & Experience */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <School color="primary" />
                <Typography variant="h6">Học vấn & Kinh nghiệm</Typography>
                <Box flexGrow={1} />
                <IconButton
                  onClick={() =>
                    setEditMode({ ...editMode, education: !editMode.education })
                  }
                  color={editMode.education ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Box>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Học vấn"
                  value={formData.instructor.educationBackground}
                  onChange={handleInstructorDataChange("educationBackground")}
                  disabled={!editMode.education}
                />
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Kinh nghiệm giảng dạy"
                  value={formData.instructor.teachingExperience}
                  onChange={handleInstructorDataChange("teachingExperience")}
                  disabled={!editMode.education}
                />
                <StyledTextField
                  fullWidth
                  label="Lĩnh vực chuyên môn"
                  value={formData.instructor.expertiseAreas}
                  onChange={handleInstructorDataChange("expertiseAreas")}
                  disabled={!editMode.education}
                  helperText="Phân tách bằng dấu phẩy (,)"
                />
                <StyledTextField
                  fullWidth
                  label="Chứng chỉ"
                  value={formData.instructor.certificates}
                  onChange={handleInstructorDataChange("certificates")}
                  disabled={!editMode.education}
                  helperText="Phân tách bằng dấu phẩy (,)"
                />
                {editMode.education && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      onClick={() =>
                        setEditMode({ ...editMode, education: false })
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSaveSection("education")}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Contact Info */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <ContactMail color="primary" />
                <Typography variant="h6">Liên hệ & Mạng xã hội</Typography>
                <Box flexGrow={1} />
                <IconButton
                  onClick={() =>
                    setEditMode({ ...editMode, contact: !editMode.contact })
                  }
                  color={editMode.contact ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Box>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  label="LinkedIn Profile"
                  value={formData.instructor.linkedinProfile}
                  onChange={handleInstructorDataChange("linkedinProfile")}
                  disabled={!editMode.contact}
                />
                <StyledTextField
                  fullWidth
                  label="Website"
                  value={formData.instructor.website}
                  onChange={handleInstructorDataChange("website")}
                  disabled={!editMode.contact}
                />

                {editMode.contact && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      onClick={() =>
                        setEditMode({ ...editMode, contact: false })
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSaveSection("contact")}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Password Change */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Security color="primary" />
                <Typography variant="h6">Đổi mật khẩu</Typography>
                <Box flexGrow={1} />
                <IconButton
                  onClick={() =>
                    setEditMode({ ...editMode, password: !editMode.password })
                  }
                  color={editMode.password ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Box>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  type="password"
                  label="Mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  disabled={!editMode.password}
                />
                <StyledTextField
                  fullWidth
                  type="password"
                  label="Mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  disabled={!editMode.password}
                />
                <StyledTextField
                  fullWidth
                  type="password"
                  label="Xác nhận mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={!editMode.password}
                />
                {editMode.password && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      onClick={() => {
                        setEditMode({ ...editMode, password: false });
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Xác nhận đăng xuất</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Đăng xuất
          </Button>
        </DialogActions>
      </Dialog>

      {/* Avatar Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          setPreviewImage(null);
          setSelectedFile(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhotoCamera color="primary" />
            <Typography variant="h6">Xem trước ảnh đại diện</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              my: 2,
            }}
          >
            <Avatar
              src={previewImage || ""}
              sx={{
                width: 200,
                height: 200,
                boxShadow: 2,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Xác nhận thay đổi ảnh đại diện?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPreviewDialogOpen(false);
              setPreviewImage(null);
              setSelectedFile(null);
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmUpload}
            variant="contained"
            color="primary"
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
          >
            {isUploading ? "Đang tải lên..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorSettings;
