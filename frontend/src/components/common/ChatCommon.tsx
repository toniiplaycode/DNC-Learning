import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Send,
  AttachFile,
  Search,
  Info,
  Close,
  School,
  Person,
  AdminPanelSettings,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useLocation } from "react-router-dom";

// Mock data học viên
const mockStudentChats = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
    lastMessage: "Em cảm ơn thầy ạ",
    timestamp: "10:30",
    unread: 2,
    course: "React & TypeScript Masterclass",
    replied: true,
    userType: "student", // Thêm loại người dùng
    studentInfo: {
      courseEnrolled: "React & TypeScript Masterclass",
      enrollDate: "15/03/2024",
      progress: 65,
      email: "nguyenvana@gmail.com",
      phone: "0987654321",
    },
    messages: [
      {
        id: 1,
        sender: "student",
        content: "Thầy ơi, em có thắc mắc về bài React Hooks ạ",
        timestamp: "10:15",
      },
      {
        id: 2,
        sender: "instructor",
        content: "Em cứ hỏi, thầy sẽ giải đáp giúp em",
        timestamp: "10:20",
      },
      {
        id: 3,
        sender: "student",
        content: "Em cảm ơn thầy ạ",
        timestamp: "10:30",
      },
    ],
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "/src/assets/avatar.png",
    lastMessage: "Em sẽ nộp bài sớm ạ",
    timestamp: "Hôm qua",
    unread: 0,
    course: "Node.js Advanced Concepts",
    replied: false,
    userType: "student",
    messages: [
      {
        id: 1,
        sender: "instructor",
        content: "Em nhớ nộp bài tập đúng hạn nhé",
        timestamp: "Hôm qua",
      },
      {
        id: 2,
        sender: "student",
        content: "Em sẽ nộp bài sớm ạ",
        timestamp: "Hôm qua",
      },
    ],
  },
];

// Mock data sinh viên trường
const mockAcademicStudentChats = [
  {
    id: 3,
    name: "Lê Minh C",
    avatar: "/src/assets/avatar.png",
    lastMessage: "Em đã hiểu rồi, cảm ơn thầy",
    timestamp: "08:45",
    unread: 1,
    faculty: "Công nghệ thông tin",
    class: "K44A",
    replied: true,
    userType: "academic_student",
    studentInfo: {
      studentCode: "SV001",
      faculty: "Công nghệ thông tin",
      class: "K44A",
      email: "leminhc@edu.vn",
      phone: "0912345678",
    },
    messages: [
      {
        id: 1,
        sender: "student",
        content: "Thầy ơi, em không hiểu bài tập về cấu trúc dữ liệu",
        timestamp: "08:30",
      },
      {
        id: 2,
        sender: "instructor",
        content: "Em đang gặp khó khăn ở phần nào vậy?",
        timestamp: "08:35",
      },
      {
        id: 3,
        sender: "student",
        content: "Em đã hiểu rồi, cảm ơn thầy",
        timestamp: "08:45",
      },
    ],
  },
];

// Mock data giảng viên
const mockInstructorChats = [
  {
    id: 4,
    name: "Giảng viên Đặng Văn D",
    avatar: "/src/assets/avatar.png",
    lastMessage: "Tôi đã cập nhật nội dung khóa học",
    timestamp: "15:20",
    unread: 3,
    department: "Khoa Công nghệ thông tin",
    replied: false,
    userType: "instructor",
    instructorInfo: {
      department: "Khoa Công nghệ thông tin",
      specialization: "Web Development",
      email: "dangvand@edu.vn",
      phone: "0987123456",
      totalCourses: 5,
    },
    messages: [
      {
        id: 1,
        sender: "admin",
        content: "Bạn cần cập nhật nội dung khóa học React trước thứ 6",
        timestamp: "14:30",
      },
      {
        id: 2,
        sender: "instructor",
        content: "Tôi đã cập nhật nội dung khóa học",
        timestamp: "15:20",
      },
    ],
  },
];

// Mock data admin
const mockAdminChats = [
  {
    id: 5,
    name: "Admin Nguyễn Văn E",
    avatar: "/src/assets/avatar.png",
    lastMessage: "Hệ thống sẽ bảo trì vào cuối tuần",
    timestamp: "Hôm qua",
    unread: 0,
    department: "IT Support",
    replied: true,
    userType: "admin",
    messages: [
      {
        id: 1,
        sender: "admin",
        content: "Hệ thống sẽ bảo trì vào cuối tuần",
        timestamp: "Hôm qua",
      },
      {
        id: 2,
        sender: "instructor",
        content: "Tôi đã nhận được thông báo, cảm ơn bạn",
        timestamp: "Hôm qua",
      },
    ],
  },
];

// Danh sách khóa học
const courses = [
  "Tất cả",
  "React & TypeScript Masterclass",
  "Node.js Advanced Concepts",
  "Docker & Kubernetes",
];

// Danh sách khoa (faculty)
const faculties = [
  "Tất cả",
  "Công nghệ thông tin",
  "Kinh tế",
  "Ngoại ngữ",
  "Kỹ thuật",
];

// Styles cho list chat
const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  transition: "all 0.2s ease",
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  width: "auto",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
  },
}));

// Dialog thông tin người dùng
const UserInfoDialog = ({ user, open, onClose }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thông tin chi tiết</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box textAlign="center" mb={2}>
          <Avatar
            src={user.avatar}
            sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
          />
          <Typography variant="h6">{user.name}</Typography>

          {user.userType === "student" && (
            <Chip
              icon={<Person />}
              label="Học viên"
              color="primary"
              size="small"
            />
          )}

          {user.userType === "academic_student" && (
            <Chip
              icon={<School />}
              label="Sinh viên trường"
              color="secondary"
              size="small"
            />
          )}

          {user.userType === "instructor" && (
            <Chip
              icon={<School />}
              label="Giảng viên"
              color="info"
              size="small"
            />
          )}

          {user.userType === "admin" && (
            <Chip
              icon={<AdminPanelSettings />}
              label="Quản trị viên"
              color="error"
              size="small"
            />
          )}
        </Box>

        {/* Thông tin học viên */}
        {user.userType === "student" && user.studentInfo && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Thông tin học viên
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Khóa học</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.courseEnrolled}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Ngày đăng ký</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.enrollDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Số điện thoại</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.phone}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Tiến độ học tập
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={user.studentInfo.progress}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption">
                  {user.studentInfo.progress}% hoàn thành
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Thông tin sinh viên trường */}
        {user.userType === "academic_student" && user.studentInfo && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Thông tin sinh viên
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Mã sinh viên</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.studentCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Khoa</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.faculty}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Lớp</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.class}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Số điện thoại</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.studentInfo.phone}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Thông tin giảng viên */}
        {user.userType === "instructor" && user.instructorInfo && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Thông tin giảng viên
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Khoa phòng</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.instructorInfo.department}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Chuyên môn</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.instructorInfo.specialization}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.instructorInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Số điện thoại</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.instructorInfo.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Số khóa học</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.instructorInfo.totalCourses} khóa học
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ChatCommon = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("Tất cả");
  const [facultyFilter, setFacultyFilter] = useState("Tất cả");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState(""); // "instructor" hoặc "admin"
  const [readStatusFilter, setReadStatusFilter] = useState("all"); // Giá trị: "all", "unread", "read"

  const location = useLocation();

  // Xác định vai trò người dùng dựa trên URL
  useEffect(() => {
    if (location.pathname.includes("/admin")) {
      setUserRole("admin");
    } else if (location.pathname.includes("/instructor")) {
      setUserRole("instructor");
    }
  }, [location]);

  // Danh sách chat dựa vào vai trò người dùng
  const getAllChats = () => {
    if (userRole === "admin") {
      // Admin chỉ chat với giảng viên và admin khác
      return [...mockInstructorChats, ...mockAdminChats];
    } else {
      // Instructor chat với học viên, sinh viên và admin
      return [
        ...mockStudentChats,
        ...mockAcademicStudentChats,
        ...mockAdminChats,
      ];
    }
  };

  // Lọc chat theo bộ lọc
  const getFilteredChats = () => {
    let chats = getAllChats();

    // Lọc theo tìm kiếm
    if (searchQuery) {
      chats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Lọc theo loại người dùng
    if (userTypeFilter !== "all") {
      chats = chats.filter((chat) => chat.userType === userTypeFilter);
    }

    // Lọc theo khóa học (chỉ áp dụng cho học viên)
    if (courseFilter !== "Tất cả") {
      chats = chats.filter(
        (chat) => chat.userType !== "student" || chat.course === courseFilter
      );
    }

    // Lọc theo khoa (chỉ áp dụng cho sinh viên trường)
    if (facultyFilter !== "Tất cả") {
      chats = chats.filter(
        (chat) =>
          chat.userType !== "academic_student" || chat.faculty === facultyFilter
      );
    }

    // Lọc theo trạng thái đọc
    if (
      readStatusFilter === "unread" &&
      chats.some((chat) => chat.unread === 0)
    ) {
      chats = chats.filter((chat) => chat.unread > 0);
    }
    if (readStatusFilter === "read" && chats.some((chat) => chat.unread > 0)) {
      chats = chats.filter((chat) => chat.unread === 0);
    }

    return chats;
  };

  const filteredChats = getFilteredChats();

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    // Thêm tin nhắn mới vào cuộc trò chuyện
    const newMessage = {
      id: selectedChat.messages.length + 1,
      sender: userRole === "admin" ? "admin" : "instructor",
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Cập nhật selectedChat
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: message,
      timestamp: newMessage.timestamp,
      replied: true,
      unread: 0,
    });

    setMessage("");
  };

  return (
    <Box>
      <Typography marginLeft={1} variant="h4" gutterBottom>
        {userRole === "admin"
          ? "Trò chuyện quản trị"
          : "Trò chuyện với học viên"}
      </Typography>

      <Grid container spacing={2}>
        {/* Danh sách người chat */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: "85vh", display: "flex", flexDirection: "column" }}
          >
            {/* Bộ lọc và tìm kiếm */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ mb: 2 }}
              />

              {/* Bộ lọc người dùng phù hợp với từng vai trò */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Loại người dùng</InputLabel>
                <Select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  label="Loại người dùng"
                >
                  <MenuItem value="all">Tất cả</MenuItem>

                  {userRole === "instructor" && (
                    <>
                      <MenuItem value="student">Học viên</MenuItem>
                      <MenuItem value="academic_student">
                        Sinh viên trường
                      </MenuItem>
                      <MenuItem value="admin">Quản trị viên</MenuItem>
                    </>
                  )}

                  {userRole === "admin" && (
                    <>
                      <MenuItem value="instructor">Giảng viên</MenuItem>
                      <MenuItem value="admin">Quản trị viên</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>

              {/* Bộ lọc khóa học (chỉ hiển thị cho instructor khi đang xem học viên) */}
              {userRole === "instructor" && userTypeFilter === "student" && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    label="Khóa học"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Bộ lọc khoa (chỉ hiển thị cho instructor khi đang xem sinh viên trường) */}
              {userRole === "instructor" &&
                userTypeFilter === "academic_student" && (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Khoa</InputLabel>
                    <Select
                      value={facultyFilter}
                      onChange={(e) => setFacultyFilter(e.target.value)}
                      label="Khoa"
                    >
                      {faculties.map((faculty) => (
                        <MenuItem key={faculty} value={faculty}>
                          {faculty}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

              {/* Bộ lọc theo trạng thái đọc */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={readStatusFilter}
                  label="Trạng thái"
                  onChange={(e) => setReadStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="unread">Chưa đọc</MenuItem>
                  <MenuItem value="read">Đã đọc</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Danh sách chat */}
            <List
              sx={{
                overflow: "auto",
                flexGrow: 1,
                p: 0,
              }}
            >
              {filteredChats.map((chat) => (
                <StyledListItem
                  key={chat.id}
                  selected={selectedChat?.id === chat.id}
                  onClick={() => setSelectedChat(chat)}
                  disableRipple
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      badgeContent={chat.unread}
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                    >
                      <Avatar src={chat.avatar} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: chat.unread ? "bold" : "normal",
                            maxWidth: "70%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {chat.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: chat.unread
                              ? "error.main"
                              : "text.secondary",
                          }}
                        >
                          {chat.timestamp}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: chat.unread
                              ? "text.primary"
                              : "text.secondary",
                            fontWeight: chat.unread ? "medium" : "normal",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {chat.lastMessage}
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {/* Hiển thị icon tương ứng với loại người dùng */}
                          {chat.userType === "student" && (
                            <Person fontSize="small" color="action" />
                          )}
                          {chat.userType === "academic_student" && (
                            <School fontSize="small" color="action" />
                          )}
                          {chat.userType === "instructor" && (
                            <School fontSize="small" color="primary" />
                          )}
                          {chat.userType === "admin" && (
                            <AdminPanelSettings
                              fontSize="small"
                              color="error"
                            />
                          )}

                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {chat.userType === "student" && chat.course}
                            {chat.userType === "academic_student" &&
                              `${chat.faculty} - ${chat.class}`}
                            {chat.userType === "instructor" && chat.department}
                            {chat.userType === "admin" && "Quản trị viên"}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </StyledListItem>
              ))}

              {filteredChats.length === 0 && (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Không tìm thấy cuộc trò chuyện
                  </Typography>
                </Box>
              )}
            </List>
          </Card>
        </Grid>

        {/* Nội dung chat */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{ height: "85vh", display: "flex", flexDirection: "column" }}
          >
            {selectedChat ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Header chat */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={selectedChat.avatar} sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedChat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedChat.userType === "student" && (
                          <>Học viên • {selectedChat.course}</>
                        )}
                        {selectedChat.userType === "academic_student" && (
                          <>
                            Sinh viên • {selectedChat.faculty} -{" "}
                            {selectedChat.class}
                          </>
                        )}
                        {selectedChat.userType === "instructor" && (
                          <>Giảng viên • {selectedChat.department}</>
                        )}
                        {selectedChat.userType === "admin" && (
                          <>Quản trị viên</>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setInfoDialogOpen(true)}>
                    <Info />
                  </IconButton>
                </Box>

                {/* Chat messages */}
                <Box
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    overflow: "auto",
                    bgcolor: "grey.50",
                  }}
                >
                  {selectedChat.messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: "flex",
                        justifyContent:
                          (userRole === "admin" && msg.sender === "admin") ||
                          (userRole === "instructor" &&
                            msg.sender === "instructor")
                            ? "flex-end"
                            : "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "70%",
                          p: 2,
                          borderRadius: 2,
                          bgcolor:
                            (userRole === "admin" && msg.sender === "admin") ||
                            (userRole === "instructor" &&
                              msg.sender === "instructor")
                              ? "primary.main"
                              : "background.paper",
                          color:
                            (userRole === "admin" && msg.sender === "admin") ||
                            (userRole === "instructor" &&
                              msg.sender === "instructor")
                              ? "white"
                              : "text.primary",
                          boxShadow: 1,
                        }}
                      >
                        <Typography variant="body2">{msg.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign: "right",
                            mt: 0.5,
                            opacity: 0.8,
                          }}
                        >
                          {msg.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                  <TextField
                    fullWidth
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    multiline
                    maxRows={4}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton>
                            <AttachFile />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                          >
                            <Send />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Typography color="text.secondary" variant="h6" gutterBottom>
                  Chọn một cuộc trò chuyện để bắt đầu
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  textAlign="center"
                >
                  {userRole === "admin"
                    ? "Bạn có thể nhắn tin với giảng viên để trao đổi thông tin quan trọng."
                    : "Bạn có thể nhắn tin với học viên, sinh viên để hỗ trợ trong quá trình học tập."}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* User Info Dialog */}
      <UserInfoDialog
        user={selectedChat}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />
    </Box>
  );
};

export default ChatCommon;
