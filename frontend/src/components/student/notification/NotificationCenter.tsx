import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Menu,
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
  Quiz,
  Message,
  Event,
  School,
  Circle,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchUserNotifications,
  markAllAsRead,
} from "../../../features/notifications/notificationsSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { selectUserNotifications } from "../../../features/notifications/notificationsSelector";
import { markAsRead } from "../../../features/notifications/notificationsSlice";

const NotificationCenter = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userNotifications = useAppSelector(selectUserNotifications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserNotifications(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    if (currentUser?.id) {
      try {
        await dispatch(markAllAsRead(currentUser.id)).unwrap();
        dispatch(fetchUserNotifications(currentUser.id));
        handleClose();
      } catch (error) {
        console.error("Error marking all as read:", error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return <School color="primary" />;
      case "assignment":
        return <Assignment color="error" />;
      case "quiz":
        return <Quiz color="warning" />;
      case "message":
        return <Message color="info" />;
      case "schedule":
        return <Event color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const filteredNotifications =
    activeTab === 0
      ? userNotifications
      : userNotifications.filter((n) => !n.isRead);

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

        {userNotifications.length > 0 && (
          <>
            <Box sx={{ pb: 2, textAlign: "center" }}>
              <Button size="small" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả là đã đọc
              </Button>
            </Box>
            <Divider />
          </>
        )}

        <List sx={{ p: 0 }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead
                      ? "transparent"
                      : "action.hover",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Circle sx={{ color: "primary.main", fontSize: 8 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {notification.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {new Date(notification.createdAt).toLocaleString()}
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
      </Menu>
    </>
  );
};

export default NotificationCenter;
