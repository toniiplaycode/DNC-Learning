import { useState } from "react";
import {
  Box,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Notifications,
  Star,
  Assignment,
  Message,
  Search,
  Delete,
  CheckCircle,
} from "@mui/icons-material";

// Mock data
const mockNotifications = [
  {
    id: 1,
    type: "review",
    title: "Đánh giá mới",
    message: "Nguyễn Văn A đã đánh giá khóa học React & TypeScript",
    course: "React & TypeScript Masterclass",
    timestamp: "10 phút trước",
    read: false,
    rating: 5,
  },
  {
    id: 2,
    type: "assignment",
    title: "Nộp bài tập",
    message: "15 học viên đã nộp Assignment 1: React Hooks",
    course: "React & TypeScript Masterclass",
    timestamp: "1 giờ trước",
    read: true,
  },
  {
    id: 3,
    type: "message",
    title: "Tin nhắn mới",
    message: "Trần Thị B đã gửi tin nhắn trong khóa học Node.js",
    course: "Node.js Advanced Concepts",
    timestamp: "2 giờ trước",
    read: false,
  },
];

const notificationTypes = [
  { value: "all", label: "Tất cả" },
  { value: "review", label: "Đánh giá" },
  { value: "assignment", label: "Bài tập" },
  { value: "message", label: "Tin nhắn" },
];

const InstructorNotifications = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "review":
        return <Star sx={{ color: "warning.main" }} />;
      case "assignment":
        return <Assignment sx={{ color: "info.main" }} />;
      case "message":
        return <Message sx={{ color: "success.main" }} />;
      default:
        return <Notifications sx={{ color: "primary.main" }} />;
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesType = typeFilter === "all" || notif.type === typeFilter;
    const matchesSearch =
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Thông báo
      </Typography>

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Loại thông báo</InputLabel>
          <Select
            value={typeFilter}
            label="Loại thông báo"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {notificationTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Notifications List */}
      <Card>
        <List>
          {filteredNotifications.map((notification, index) => (
            <ListItem
              key={notification.id}
              sx={{
                bgcolor: notification.read ? "transparent" : "action.hover",
                borderBottom:
                  index < filteredNotifications.length - 1
                    ? "1px solid"
                    : "none",
                borderColor: "divider",
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "background.default" }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 0.5 }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: notification.read ? 400 : 600 }}
                    >
                      {notification.title}
                    </Typography>
                    {!notification.read && (
                      <Chip
                        label="Mới"
                        color="primary"
                        size="small"
                        sx={{ height: 20 }}
                      />
                    )}
                    {notification.rating && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Star sx={{ color: "warning.main", fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          {notification.rating}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: 1 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {notification.course}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ opacity: 0.8 }}
                      >
                        • {notification.timestamp}
                      </Typography>
                    </Stack>
                  </Box>
                }
              />
              <Stack direction="row" spacing={1}>
                {!notification.read && (
                  <IconButton
                    size="small"
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{ color: "primary.main" }}
                  >
                    <CheckCircle />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => handleDelete(notification.id)}
                  sx={{ color: "error.main" }}
                >
                  <Delete />
                </IconButton>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Card>
    </Box>
  );
};

export default InstructorNotifications;
