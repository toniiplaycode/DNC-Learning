import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Avatar,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
} from "@mui/material";
import { Close, PhotoCamera, Save } from "@mui/icons-material";
import { UserRole, UserStatus } from "../../../types/user";
import { useAppDispatch } from "../../../app/hooks";
import {
  createInstructor,
  CreateInstructorRequest,
  fetchInstructors,
  updateInstructor,
} from "../../../features/user_instructors/instructorsApiSlice";
import { toast } from "react-toastify";
import { VerificationStatus } from "../../../types/user-instructor.types";
import { updateInstructorProfile } from "../../../features/users/usersApiSlice";

interface DialogAddInstructorProps {
  open: boolean;
  onClose: () => void;
  editMode?: boolean;
  instructorData?: {
    user: {
      id: number;
      username: string;
      email: string;
      phone?: string;
      avatarUrl?: string;
    };
    instructor: {
      id: number;
      fullName: string;
      professionalTitle?: string;
      specialization: string;
      educationBackground?: string;
      teachingExperience?: string;
      bio?: string;
      expertiseAreas?: string;
      certificates?: string;
      linkedinProfile?: string;
      website?: string;
      verificationDocuments?: string;
      verificationStatus: VerificationStatus;
    };
  };
}

const DialogAddInstructor = ({
  open,
  onClose,
  editMode = false,
  instructorData,
}: DialogAddInstructorProps) => {
  const dispatch = useAppDispatch();
  const [avatar, setAvatar] = useState<string | null>(
    instructorData?.user?.avatarUrl || null
  );
  const [formData, setFormData] = useState({
    // User fields
    username: "",
    email: "",
    password: "",
    phone: "",
    role: UserRole.INSTRUCTOR,
    status: UserStatus.ACTIVE,

    // UserInstructor fields
    fullName: "",
    professionalTitle: "",
    specialization: "",
    educationBackground: "",
    teachingExperience: "",
    bio: "",
    expertiseAreas: "",
    certificates: "",
    linkedinProfile: "",
    website: "",
    verificationDocuments: "",
    verificationStatus: VerificationStatus.VERIFIED,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when in edit mode
  useEffect(() => {
    if (editMode && instructorData) {
      setFormData({
        ...formData,
        username: instructorData.user.username,
        email: instructorData.user.email,
        phone: instructorData.user.phone || "",
        fullName: instructorData.instructor.fullName,
        professionalTitle: instructorData.instructor.professionalTitle || "",
        specialization: instructorData.instructor.specialization,
        educationBackground:
          instructorData.instructor.educationBackground || "",
        teachingExperience: instructorData.instructor.teachingExperience || "",
        bio: instructorData.instructor.bio || "",
        expertiseAreas: instructorData.instructor.expertiseAreas || "",
        certificates: instructorData.instructor.certificates || "",
        linkedinProfile: instructorData.instructor.linkedinProfile || "",
        website: instructorData.instructor.website || "",
        verificationDocuments:
          instructorData.instructor.verificationDocuments || "",
        verificationStatus: instructorData.instructor.verificationStatus,
      });
      setAvatar(instructorData.user.avatarUrl || null);
    }
  }, [editMode, instructorData]);

  // Xử lý thay đổi giá trị trường input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Thêm handler riêng cho Select
  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý tải lên avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate User fields
    if (!editMode && !formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    }

    if (!editMode && !formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate UserInstructor fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = "Chuyên môn không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý lưu
  const handleSave = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);

        if (editMode && instructorData) {
          // Update existing instructor
          const updateData = {
            user: {
              username: formData.username,
              email: formData.email,
              phone: formData.phone || undefined,
              avatarUrl: avatar || undefined,
            },
            instructor: {
              fullName: formData.fullName,
              professionalTitle: formData.professionalTitle || undefined,
              specialization: formData.specialization,
              educationBackground: formData.educationBackground || undefined,
              teachingExperience: formData.teachingExperience || undefined,
              bio: formData.bio || undefined,
              expertiseAreas: formData.expertiseAreas || undefined,
              certificates: formData.certificates || undefined,
              linkedinProfile: formData.linkedinProfile || undefined,
              website: formData.website || undefined,
              verificationDocuments:
                formData.verificationDocuments || undefined,
              verificationStatus: formData.verificationStatus,
            },
          };

          await dispatch(
            updateInstructorProfile({
              userId: instructorData.user.id,
              data: updateData,
            })
          ).unwrap();
          toast.success("Cập nhật giảng viên thành công!");
        } else {
          // Create new instructor
          const instructorData: CreateInstructorRequest = {
            user: {
              username: formData.username,
              email: formData.email,
              password: formData.password,
              phone: formData.phone || undefined,
              avatarUrl: avatar || undefined,
            },
            instructor: {
              fullName: formData.fullName,
              professionalTitle: formData.professionalTitle || undefined,
              specialization: formData.specialization,
              educationBackground: formData.educationBackground || undefined,
              teachingExperience: formData.teachingExperience || undefined,
              bio: formData.bio || undefined,
              expertiseAreas: formData.expertiseAreas || undefined,
              certificates: formData.certificates || undefined,
              linkedinProfile: formData.linkedinProfile || undefined,
              website: formData.website || undefined,
              verificationDocuments:
                formData.verificationDocuments || undefined,
              verificationStatus: formData.verificationStatus,
            },
          };

          await dispatch(createInstructor(instructorData)).unwrap();
          toast.success("Tạo giảng viên thành công!");
        }

        await dispatch(fetchInstructors());
        handleReset();
        onClose();
      } catch (error: any) {
        toast.error(error.message || "Không thể lưu giảng viên");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      phone: "",
      role: UserRole.INSTRUCTOR,
      status: UserStatus.ACTIVE,
      fullName: "",
      professionalTitle: "",
      specialization: "",
      educationBackground: "",
      teachingExperience: "",
      bio: "",
      expertiseAreas: "",
      certificates: "",
      linkedinProfile: "",
      website: "",
      verificationDocuments: "",
      verificationStatus: VerificationStatus.VERIFIED,
    });
    setAvatar(null);
    setErrors({});
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {editMode ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
        </Typography>
        <IconButton onClick={handleCloseDialog} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          {/* Phần avatar */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatar || "/src/assets/avatar.png"}
                sx={{ width: 100, height: 100 }}
              />
              <input
                accept="image/*"
                type="file"
                id="avatar-upload"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
          </Box>

          <Grid spacing={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái xác minh</InputLabel>
              <Select
                name="verificationStatus"
                value={formData.verificationStatus}
                label="Trạng thái xác minh"
                onChange={handleSelectChange}
              >
                <MenuItem value={VerificationStatus.PENDING}>
                  Đang xét duyệt
                </MenuItem>
                <MenuItem value={VerificationStatus.VERIFIED}>
                  Đã xác minh
                </MenuItem>
                <MenuItem value={VerificationStatus.REJECTED}>Từ chối</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid container spacing={2}>
            {/* Thông tin tài khoản */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin tài khoản
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required={!editMode}
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                placeholder={editMode ? "Không thể thay đổi tên đăng nhập" : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required={!editMode}
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                placeholder={
                  editMode ? "Để trống nếu không muốn thay đổi mật khẩu" : ""
                }
              />
            </Grid>

            {/* Thông tin cá nhân */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin cá nhân
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Họ tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chức danh"
                name="professionalTitle"
                value={formData.professionalTitle}
                onChange={handleChange}
                placeholder="VD: Giảng viên cao cấp, Chuyên gia..."
              />
            </Grid>

            {/* Thông tin chuyên môn */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin chuyên môn
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Chuyên môn"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                error={!!errors.specialization}
                helperText={errors.specialization}
                placeholder="VD: Web Development, AI/ML"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lĩnh vực chuyên môn"
                name="expertiseAreas"
                value={formData.expertiseAreas}
                onChange={handleChange}
                placeholder="VD: React, Node.js, Python"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bằng cấp/Chứng chỉ"
                name="certificates"
                value={formData.certificates}
                onChange={handleChange}
                placeholder="VD: Thạc sĩ CNTT, AWS Certified"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kinh nghiệm giảng dạy"
                name="teachingExperience"
                value={formData.teachingExperience}
                onChange={handleChange}
                placeholder="VD: 5 năm giảng dạy tại..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Học vấn"
                name="educationBackground"
                value={formData.educationBackground}
                onChange={handleChange}
                placeholder="Mô tả quá trình học tập và bằng cấp"
              />
            </Grid>

            {/* Thông tin bổ sung */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin bổ sung
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn"
                name="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Tiểu sử"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Mô tả kinh nghiệm và chuyên môn của giảng viên"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tài liệu xác minh"
                name="verificationDocuments"
                value={formData.verificationDocuments}
                onChange={handleChange}
                placeholder="Liên kết đến các tài liệu xác minh (CV, bằng cấp, etc.)"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCloseDialog} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Đang lưu..."
            : editMode
            ? "Lưu thay đổi"
            : "Lưu giảng viên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddInstructor;
