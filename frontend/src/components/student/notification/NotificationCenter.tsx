import React, { useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Assignment,
  Announcement,
  Event,
  School,
  Circle,
} from "@mui/icons-material";

interface Notification {
  id: number;
  type: "course" | "assignment" | "announcement" | "event";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
  course?: {
    name: string;
    image: string;
  };
}

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "course",
      title: "Bài học mới đã được thêm",
      description:
        "React Hooks Advanced đã được thêm vào khóa học React & TypeScript",
      timestamp: "2024-03-20T10:30:00",
      read: false,
      link: "/course/1/learn",
      course: {
        name: "React & TypeScript",
        image: "/src/assets/logo.png",
      },
    },
    {
      id: 2,
      type: "assignment",
      title: "Deadline sắp đến",
      description: "Bài tập Todo App cần nộp trong 2 ngày",
      timestamp: "2024-03-19T15:45:00",
      read: false,
      link: "/course/1/learn",
      course: {
        name: "React & TypeScript",
        image: "/src/assets/logo.png",
      },
    },
    {
      id: 3,
      type: "announcement",
      title: "Thông báo bảo trì hệ thống",
      description: "Hệ thống sẽ bảo trì từ 23:00 - 24:00 ngày 21/03/2024",
      timestamp: "2024-03-18T09:00:00",
      read: true,
    },
    {
      id: 4,
      type: "event",
      title: "Workshop: React Performance",
      description:
        "Workshop về tối ưu hiệu năng React sẽ diễn ra vào 19:00 ngày 25/03/2024",
      timestamp: "2024-03-17T14:20:00",
      read: true,
      link: "/events/1",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Đánh dấu là đã đọc
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Chuyển hướng nếu có link
    if (notification.link) {
      handleClose();
      // navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return <School color="primary" />;
      case "assignment":
        return <Assignment color="error" />;
      case "announcement":
        return <Announcement color="warning" />;
      case "event":
        return <Event color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const filteredNotifications =
    activeTab === 0 ? notifications : notifications.filter((n) => !n.read);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: "80vh",
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" gutterBottom>
            Thông báo
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{ mb: 1 }}
          >
            <Tab label="Tất cả" />
            <Tab label="Chưa đọc" disabled={unreadCount === 0} />
          </Tabs>
        </Box>

        <List sx={{ p: 0 }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? "transparent" : "action.hover",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    {notification.course ? (
                      <Avatar src={notification.course.image} />
                    ) : (
                      <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Circle sx={{ color: "primary.main", fontSize: 8 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {notification.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                Không có thông báo nào
              </Typography>
            </Box>
          )}
        </List>

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Button
                size="small"
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                  );
                }}
              >
                Đánh dấu tất cả là đã đọc
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
