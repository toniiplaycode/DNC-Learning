import { useState } from "react";
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
} from "@mui/material";
import { Send, AttachFile, Search, Info, Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

// Mock data
const mockChats = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
    lastMessage: "Em cảm ơn thầy ạ",
    timestamp: "10:30",
    unread: 2,
    course: "React & TypeScript Masterclass",
    replied: true,
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

// Thêm danh sách khóa học
const courses = [
  "Tất cả",
  "React & TypeScript Masterclass",
  "Node.js Advanced Concepts",
  "Docker & Kubernetes",
];

// Thêm styles cho list chat
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

// Chuyển StudentInfo thành StudentInfoDialog
const StudentInfoDialog = ({
  student,
  open,
  onClose,
}: {
  student: any;
  open: boolean;
  onClose: () => void;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ m: 0, p: 2 }}>
      <Typography variant="h6">Thông tin học viên</Typography>
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Stack direction="row" spacing={2}>
        <Avatar src={student.avatar} sx={{ width: 80, height: 80 }} />
        <Box flex={1}>
          <Typography variant="h6">{student.name}</Typography>
          <Stack spacing={2} mt={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Khóa học
              </Typography>
              <Typography variant="body1">
                {student.studentInfo?.courseEnrolled}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Ngày đăng ký
              </Typography>
              <Typography variant="body1">
                {student.studentInfo?.enrollDate}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tiến độ học tập
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <LinearProgress
                  variant="determinate"
                  value={student.studentInfo?.progress || 0}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {student.studentInfo?.progress}%
                </Typography>
              </Stack>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {student.studentInfo?.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">
                  {student.studentInfo?.phone}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Stack>
    </DialogContent>
  </Dialog>
);

const InstructorChats = () => {
  const [selectedChat, setSelectedChat] = useState<any>(mockChats[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState("Tất cả");
  const [replyFilter, setReplyFilter] = useState("all"); // all, replied, unreplied

  // Filter chats
  const filteredChats = mockChats.filter((chat) => {
    const matchesCourse =
      courseFilter === "Tất cả" || chat.course === courseFilter;
    const matchesReply =
      replyFilter === "all" ||
      (replyFilter === "replied" && chat.replied) ||
      (replyFilter === "unreplied" && !chat.replied);
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCourse && matchesReply && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // TODO: Implement send message logic
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <Box sx={{ p: 3, height: "100vh" }}>
      <Grid container spacing={3} sx={{ height: "100%" }}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            {/* Filters */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Stack spacing={2}>
                {/* Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "grey.50",
                    },
                  }}
                />

                {/* Course Filter */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={courseFilter}
                    label="Khóa học"
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Reply Status Filter */}
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="Tất cả"
                    onClick={() => setReplyFilter("all")}
                    color={replyFilter === "all" ? "primary" : "default"}
                    variant={replyFilter === "all" ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Đã trả lời"
                    onClick={() => setReplyFilter("replied")}
                    color={replyFilter === "replied" ? "primary" : "default"}
                    variant={replyFilter === "replied" ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Chưa trả lời"
                    onClick={() => setReplyFilter("unreplied")}
                    color={replyFilter === "unreplied" ? "primary" : "default"}
                    variant={
                      replyFilter === "unreplied" ? "filled" : "outlined"
                    }
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Chat List */}
            <List
              sx={{
                overflow: "auto",
                maxHeight: "calc(100vh - 200px)",
                p: 1,
                "&::-webkit-scrollbar": {
                  width: 6,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "grey.300",
                  borderRadius: 3,
                },
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
                    <Avatar
                      src={chat.avatar}
                      sx={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: chat.unread ? 600 : 400,
                            color: chat.unread
                              ? "text.primary"
                              : "text.secondary",
                          }}
                        >
                          {chat.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {chat.course}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          color: chat.unread
                            ? "text.primary"
                            : "text.secondary",
                          fontWeight: chat.unread ? 500 : 400,
                          opacity: chat.unread ? 1 : 0.8,
                        }}
                      >
                        {chat.lastMessage}
                      </Typography>
                    }
                  />
                  <Stack alignItems="flex-end" spacing={0.5} minWidth={65}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: chat.unread ? "primary.main" : "text.secondary",
                        fontWeight: chat.unread ? 600 : 400,
                      }}
                    >
                      {chat.timestamp}
                    </Typography>
                    {chat.unread > 0 && (
                      <Badge
                        badgeContent={chat.unread}
                        color="primary"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: 10,
                            height: 18,
                            minWidth: 18,
                            top: 10,
                            right: 10,
                          },
                        }}
                      />
                    )}
                  </Stack>
                </StyledListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Chat Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            {selectedChat ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={selectedChat.avatar} />
                      <Typography variant="subtitle1">
                        {selectedChat.name}
                      </Typography>
                    </Stack>
                    <IconButton
                      onClick={() => setInfoDialogOpen(true)}
                      color="primary"
                    >
                      <Info />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Messages */}
                <Box
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    overflow: "auto",
                    bgcolor: "grey.50",
                  }}
                >
                  {selectedChat.messages.map((msg: any) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: "flex",
                        justifyContent:
                          msg.sender === "instructor"
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
                            msg.sender === "instructor"
                              ? "primary.main"
                              : "background.paper",
                          color:
                            msg.sender === "instructor"
                              ? "white"
                              : "text.primary",
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
                }}
              >
                <Typography color="text.secondary">
                  Chọn một cuộc trò chuyện để bắt đầu
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Student Info Dialog */}
      <StudentInfoDialog
        student={selectedChat}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />
    </Box>
  );
};

export default InstructorChats;
