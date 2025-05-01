import { useEffect, useState } from "react";
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
  Button,
} from "@mui/material";
import {
  Notifications,
  Assignment,
  Message,
  Search,
  Delete,
  School,
  Schedule,
  Settings,
  DoneAll,
  Quiz as QuizIcon,
  CircleRounded,
} from "@mui/icons-material";
import {
  fetchUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../features/notifications/notificationsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserNotifications } from "../../features/notifications/notificationsSelector";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import Pagination from "@mui/material/Pagination";

const notificationTypes = [
  { value: "all", label: "Tất cả" },
  { value: "course", label: "Khóa học" },
  { value: "assignment", label: "Bài tập" },
  { value: "quiz", label: "Bài kiểm tra" },
  { value: "message", label: "Tin nhắn" },
  { value: "system", label: "Hệ thống" },
  { value: "schedule", label: "Lịch học" },
];

const readStatusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
];

const InstructorNotifications = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userNotifications = useAppSelector(selectUserNotifications);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [readFilter, setReadFilter] = useState("all"); // "all" | "read" | "unread"
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserNotifications(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return <School sx={{ color: "primary.main" }} />;
      case "assignment":
        return <Assignment sx={{ color: "primary.main" }} />;
      case "quiz":
        return <QuizIcon sx={{ color: "primary.main" }} />;
      case "message":
        return <Message sx={{ color: "success.main" }} />;
      case "schedule":
        return <Schedule sx={{ color: "warning.main" }} />;
      case "system":
        return <Settings sx={{ color: "error.main" }} />;
      default:
        return <Notifications sx={{ color: "primary.main" }} />;
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (currentUser?.id) {
      try {
        await dispatch(markAllAsRead(currentUser.id)).unwrap();
        dispatch(fetchUserNotifications(currentUser.id));
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    }
  };

  const handleDelete = async (
    event: React.MouseEvent,
    notificationId: number
  ) => {
    event.stopPropagation(); // Prevent triggering the ListItem click
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const filteredNotifications = userNotifications.filter((notif) => {
    const matchesType = typeFilter === "all" || notif.type === typeFilter;
    const matchesSearch =
      notif.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReadStatus =
      readFilter === "all" ||
      (readFilter === "read" && notif.isRead) ||
      (readFilter === "unread" && !notif.isRead);
    return matchesType && matchesSearch && matchesReadStatus;
  });

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} giờ trước`;
    } else {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleReadFilterChange = (event: any) => {
    setReadFilter(event.target.value);
    setPage(1); // Reset to first page when changing filters
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Thông báo
        </Typography>
        <Button
          startIcon={<DoneAll />}
          onClick={handleMarkAllAsRead}
          disabled={!userNotifications.some((n) => !n.isRead)}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Stack>

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
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={readFilter}
            label="Trạng thái"
            onChange={handleReadFilterChange}
          >
            {readStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Notifications List */}
      <Card>
        <List>
          {filteredNotifications.length === 0 && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo nào.
              </Typography>
            </Box>
          )}

          {paginatedNotifications.map((notification, index) => (
            <ListItem
              key={notification.id}
              onClick={() =>
                !notification.isRead && handleMarkAsRead(notification.id)
              }
              sx={{
                bgcolor: notification.isRead ? "transparent" : "action.hover",
                borderBottom:
                  index < paginatedNotifications.length - 1
                    ? "1px solid"
                    : "none",
                borderColor: "divider",
                cursor: !notification.isRead ? "pointer" : "default",
                "&:hover": {
                  bgcolor: !notification.isRead
                    ? "action.selected"
                    : "transparent",
                },
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
                      sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                    >
                      {notification.title}
                    </Typography>
                    {!notification.isRead && (
                      <Chip
                        label="Mới"
                        color="primary"
                        size="small"
                        sx={{ height: 20 }}
                      />
                    )}
                  </Stack>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {notification.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ opacity: 0.8 }}
                    >
                      {formatTimestamp(notification.createdAt)}
                    </Typography>
                  </Box>
                }
              />
              <Stack direction="row" spacing={1}>
                {!notification.isRead && (
                  <IconButton
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{ color: "primary.main" }}
                  >
                    <CircleRounded sx={{ fontSize: "10px" }} />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleDelete(e, notification.id)}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "error.light",
                      color: "error.dark",
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            </ListItem>
          ))}
        </List>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default InstructorNotifications;
