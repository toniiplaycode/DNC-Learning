import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  TextFieldProps,
} from "@mui/material";
import {
  Edit,
  PhotoCamera,
  Notifications,
  Security,
  Language,
  Email,
  Star,
  FilterList,
  Close,
  Add,
} from "@mui/icons-material";

// Thêm interface cho dữ liệu instructor
interface InstructorProfile {
  id: number;
  userId: number;
  fullName: string;
  professionalTitle: string;
  specialization: string;
  educationBackground: string;
  teachingExperience: string;
  bio: string;
  expertiseAreas: string[];
  certificates: string[];
  linkedinProfile: string;
  website: string;
  paymentInfo: any;
  ratingAverage: number;
  totalStudents: number;
  totalCourses: number;
  totalReviews: number;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDocuments: string[];
  bankAccountInfo: any;
}

// Thêm style cho input disabled
const disabledInputStyle = {
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)", // Giữ màu text như bình thường
    color: "rgba(0, 0, 0, 0.87)",
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: "rgba(0, 0, 0, 0.6)", // Giữ màu label như bình thường
  },
};

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
  const [showAlert, setShowAlert] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: "vi",
    twoFactorAuth: false,
  });
  const [openRatings, setOpenRatings] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  // Thêm state để quản lý trạng thái chỉnh sửa
  const [editMode, setEditMode] = useState<{
    basic: boolean;
    education: boolean;
    contact: boolean;
    payment: boolean;
  }>({
    basic: false,
    education: false,
    contact: false,
    payment: false,
  });

  // Mock data cho instructor profile
  const instructorProfile: InstructorProfile = {
    id: 1,
    userId: 1,
    fullName: "John Doe",
    professionalTitle: "Senior Software Engineer",
    specialization: "Web Development, React, TypeScript",
    educationBackground: "Master in Computer Science, Stanford University",
    teachingExperience: "5+ years teaching experience in web development",
    bio: "Passionate about teaching and helping others learn programming. Experienced in both industry and education.",
    expertiseAreas: ["Frontend Development", "React", "TypeScript", "Node.js"],
    certificates: [
      "AWS Certified Developer",
      "Google Certified Educator",
      "Microsoft Certified Trainer",
    ],
    linkedinProfile: "linkedin.com/in/johndoe",
    website: "johndoe.dev",
    paymentInfo: {
      preferredPaymentMethod: "bank_transfer",
      paypalEmail: "john@example.com",
    },
    ratingAverage: 4.8,
    totalStudents: 1234,
    totalCourses: 15,
    totalReviews: 245,
    verificationStatus: "verified",
    verificationDocuments: ["id_card.pdf", "degree.pdf"],
    bankAccountInfo: {
      bankName: "VietcomBank",
      accountNumber: "1234567890",
      accountHolder: "NGUYEN VAN A",
    },
  };

  // Mock data cho ratings
  const ratingStats = {
    totalRatings: 245,
    averageRating: 4.8,
    ratingDistribution: {
      5: 180,
      4: 45,
      3: 12,
      2: 5,
      1: 3,
    },
  };

  // Mock data cho chi tiết đánh giá
  const detailedRatings = [
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      avatar: "/src/assets/avatar.png",
      rating: 5,
      comment: "Giảng viên nhiệt tình, bài giảng dễ hiểu",
      courseName: "React & TypeScript Masterclass",
      date: "2024-03-20",
    },
    {
      id: 2,
      studentName: "Trần Thị B",
      avatar: "/src/assets/avatar.png",
      rating: 4,
      comment: "Khóa học rất hay và thực tế",
      courseName: "Node.js Advanced Concepts",
      date: "2024-03-19",
    },
    // ... thêm mock data
  ];

  // Mock data cho danh sách khóa học
  const courses = [
    { id: "all", name: "Tất cả khóa học" },
    { id: "1", name: "React & TypeScript Masterclass" },
    { id: "2", name: "Node.js Advanced Concepts" },
    { id: "3", name: "Python for Data Science" },
  ];

  // Lọc đánh giá theo khóa học
  const filteredRatings = detailedRatings.filter(
    (rating) =>
      selectedCourse === "all" ||
      rating.courseName === courses.find((c) => c.id === selectedCourse)?.name
  );

  // Thêm hàm xử lý lưu cho từng phần
  const handleSaveSection = (section: keyof typeof editMode) => {
    setEditMode({ ...editMode, [section]: false });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Cài đặt tài khoản
      </Typography>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cập nhật thành công!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Thông tin cơ bản */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Thông tin cơ bản</Typography>
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
                {/* Avatar section */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src="/src/assets/avatar.png"
                    sx={{ width: 100, height: 100 }}
                  />
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                    >
                      Thay đổi ảnh
                      <input type="file" hidden accept="image/*" />
                    </Button>
                  </Box>
                </Box>

                <StyledTextField
                  fullWidth
                  label="Họ và tên"
                  defaultValue={instructorProfile.fullName}
                  disabled={!editMode.basic}
                />
                <StyledTextField
                  fullWidth
                  label="Chức danh"
                  defaultValue={instructorProfile.professionalTitle}
                  disabled={!editMode.basic}
                />
                <StyledTextField
                  fullWidth
                  label="Chuyên môn"
                  defaultValue={instructorProfile.specialization}
                  disabled={!editMode.basic}
                />
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Giới thiệu"
                  defaultValue={instructorProfile.bio}
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

            {/* Học vấn & Kinh nghiệm */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Học vấn & Kinh nghiệm</Typography>
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
                  defaultValue={instructorProfile.educationBackground}
                  disabled={!editMode.education}
                />
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Kinh nghiệm giảng dạy"
                  defaultValue={instructorProfile.teachingExperience}
                  disabled={!editMode.education}
                />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Chứng chỉ
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {instructorProfile.certificates.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        onDelete={() => {}}
                        color="primary"
                      />
                    ))}
                    <Button variant="outlined" size="small" startIcon={<Add />}>
                      Thêm chứng chỉ
                    </Button>
                  </Stack>
                </Box>

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

            {/* Thông tin liên hệ và mạng xã hội */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Liên hệ & Mạng xã hội</Typography>
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
                  defaultValue={instructorProfile.linkedinProfile}
                  disabled={!editMode.contact}
                />
                <StyledTextField
                  fullWidth
                  label="Website"
                  defaultValue={instructorProfile.website}
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

            {/* Thông tin thanh toán */}
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Thông tin thanh toán</Typography>
                <IconButton
                  onClick={() =>
                    setEditMode({ ...editMode, payment: !editMode.payment })
                  }
                  color={editMode.payment ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Box>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  label="Tên ngân hàng"
                  defaultValue={instructorProfile.bankAccountInfo.bankName}
                  disabled={!editMode.payment}
                />
                <StyledTextField
                  fullWidth
                  label="Số tài khoản"
                  defaultValue={instructorProfile.bankAccountInfo.accountNumber}
                  disabled={!editMode.payment}
                />
                <StyledTextField
                  fullWidth
                  label="Chủ tài khoản"
                  defaultValue={instructorProfile.bankAccountInfo.accountHolder}
                  disabled={!editMode.payment}
                />

                {editMode.payment && (
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      onClick={() =>
                        setEditMode({ ...editMode, payment: false })
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSaveSection("payment")}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Thống kê */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thống kê
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng số học viên
                  </Typography>
                  <Typography variant="h4">
                    {instructorProfile.totalStudents}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số khóa học
                  </Typography>
                  <Typography variant="h4">
                    {instructorProfile.totalCourses}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đánh giá trung bình
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4">
                      {instructorProfile.ratingAverage}
                    </Typography>
                    <Star color="warning" />
                  </Stack>
                </Box>
              </Stack>
            </Card>

            {/* Thông báo */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Notifications color="primary" />
                  <Typography variant="h6">Thông báo</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Email thông báo"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pushNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Thông báo đẩy"
                />
              </Stack>
            </Card>

            {/* Bảo mật */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Security color="primary" />
                  <Typography variant="h6">Bảo mật</Typography>
                </Box>
                <Button variant="outlined" fullWidth>
                  Đổi mật khẩu
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          twoFactorAuth: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Xác thực 2 lớp"
                />
              </Stack>
            </Card>

            {/* Ngôn ngữ */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Language color="primary" />
                  <Typography variant="h6">Ngôn ngữ</Typography>
                </Box>
                <StyledTextField
                  select
                  fullWidth
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </StyledTextField>
              </Stack>
            </Card>

            {/* Thêm card đánh giá */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Star color="primary" />
                  <Typography variant="h6">Đánh giá từ học viên</Typography>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {ratingStats.averageRating}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    mb={1}
                  >
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        sx={{
                          color:
                            index < Math.floor(ratingStats.averageRating)
                              ? "warning.main"
                              : "grey.300",
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography color="text.secondary">
                    {ratingStats.totalRatings} lượt đánh giá
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  {Object.entries(ratingStats.ratingDistribution)
                    .reverse()
                    .map(([rating, count]) => (
                      <Box
                        key={rating}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ minWidth: 20 }}>
                          {rating}★
                        </Typography>
                        <Box
                          sx={{
                            flexGrow: 1,
                            bgcolor: "grey.100",
                            height: 8,
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${
                                (count / ratingStats.totalRatings) * 100
                              }%`,
                              bgcolor: "warning.main",
                              height: "100%",
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                </Stack>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenRatings(true)}
                  >
                    Xem chi tiết đánh giá
                  </Button>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog chi tiết đánh giá */}
      <Dialog
        open={openRatings}
        onClose={() => setOpenRatings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Star color="warning" />
              <Typography variant="h6">Chi tiết đánh giá</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Lọc theo khóa học</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Lọc theo khóa học"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Đóng">
                <IconButton
                  edge="end"
                  onClick={() => setOpenRatings(false)}
                  size="small"
                >
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {filteredRatings.length > 0 ? (
            <List>
              {filteredRatings.map((rating) => (
                <ListItem
                  key={rating.id}
                  divider
                  sx={{ flexDirection: "column", alignItems: "flex-start" }}
                >
                  <Box sx={{ width: "100%", display: "flex", mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar src={rating.avatar} />
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">
                        {rating.studentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rating.courseName}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Stack direction="row" spacing={0.5}>
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            sx={{
                              fontSize: 16,
                              color:
                                index < rating.rating
                                  ? "warning.main"
                                  : "grey.300",
                            }}
                          />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(rating.date).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 7 }}>
                    {rating.comment}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                Không có đánh giá nào cho khóa học này
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InstructorSettings;
