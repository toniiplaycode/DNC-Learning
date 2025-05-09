import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { io, Socket } from "socket.io-client";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Grid,
  Button,
  DialogActions,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  People,
  Settings,
  Notifications,
  Person,
  Logout,
  Category,
  Receipt,
  BarChart,
  Feedback,
  Message,
  CalendarMonth,
  Assignment,
  Class,
  PeopleAlt,
  PeopleAltTwoTone,
  Close,
  Email,
  Phone as PhoneIcon,
  CalendarToday,
  AccountCircle,
} from "@mui/icons-material";
import { fetchMessagesByUser } from "../../../features/messages/messagesSlice";
import { selectAllMessages } from "../../../features/messages/messagesSelector";
import { addMessage } from "../../../features/messages/messagesSlice";
import { logout } from "../../../features/auth/authApiSlice";

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const messages = useAppSelector(selectAllMessages);
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    // Fetch messages every 30 seconds
    const fetchMessages = () => {
      dispatch(fetchMessagesByUser(currentUser.id));
    };

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, 30000);

    return () => clearInterval(interval);
  }, [dispatch, currentUser?.id]);

  // Socket connection and message handling
  useEffect(() => {
    if (!currentUser?.id) return;

    socketRef.current = io("http://localhost:3000", {
      auth: {
        userId: currentUser.id,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    const handleNewMessage = (message: any) => {
      dispatch(addMessage(message));

      // Force immediate badge update
      if (message.receiver.id === currentUser.id && !message.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleMessageRead = ({ messageId }: { messageId: number }) => {
      // Update messages in Redux store
      dispatch({
        type: "messages/messageRead",
        payload: messageId,
      });

      // Force immediate badge update
      setUnreadCount((prev) => {
        const newCount = messages.filter(
          (msg) =>
            !msg.isRead &&
            msg.id !== messageId &&
            msg.receiver.id === currentUser.id
        ).length;
        return newCount;
      });
    };

    socketRef.current.on("connect", () => {
      console.log("Socket connected in AdminLayout");
    });

    socketRef.current.on("newMessage", handleNewMessage);
    socketRef.current.on("messageRead", handleMessageRead);

    // Initial unread count
    setUnreadCount(
      messages.filter(
        (msg) => !msg.isRead && msg.receiver.id === currentUser.id
      ).length
    );

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("newMessage", handleNewMessage);
        socketRef.current.off("messageRead", handleMessageRead);
        socketRef.current.disconnect();
      }
    };
  }, [currentUser?.id, dispatch, messages]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);

    // Disconnect socket before logout
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    dispatch(logout());
  };

  // Handle profile dialog open
  const handleOpenProfileDialog = () => {
    setProfileDialogOpen(true);
    handleMenuClose();
  };

  const menuItems = [
    { text: "Khóa học", icon: <School />, path: "/admin" },
    { text: "Giảng viên", icon: <People />, path: "/admin/instructors" },
    { text: "Học viên/sinh viên", icon: <People />, path: "/admin/students" },
    {
      text: "Lớp học thuật",
      icon: <PeopleAltTwoTone />,
      path: "/admin/academic-classes",
    },
    {
      text: "Tin nhắn",
      icon: (
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Message />
        </Badge>
      ),
      path: "/admin/chats",
    },
    { text: "Danh mục", icon: <Category />, path: "/admin/categories" },
    { text: "Thanh toán", icon: <Receipt />, path: "/admin/payments" },
    { text: "Lịch dạy", icon: <CalendarMonth />, path: "/admin/schedules" },
    { text: "Thống kê", icon: <BarChart />, path: "/admin/analytics" },
    { text: "Đánh giá", icon: <Feedback />, path: "/admin/reviews" },
    { text: "Cài đặt", icon: <Settings />, path: "/admin/settings" },
  ];

  useEffect(() => {
    // Bỏ qua kiểm tra nếu đang ở trang login
    if (location.pathname === "/admin/login") {
      return;
    }

    // Kiểm tra đăng nhập và role một lần
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/admin/login");
    }
  }, [currentUser, navigate, location.pathname]);

  // Chỉ render layout khi ở trang login hoặc là admin
  const shouldRenderLayout =
    location.pathname === "/admin/login" || currentUser?.role === "admin";

  if (!shouldRenderLayout) {
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {location.pathname !== "/admin/login" && (
        <>
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
              ml: { sm: `${open ? drawerWidth : 0}px` },
              bgcolor: "background.paper",
              color: "text.primary",
              boxShadow: 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
              ></Typography>

              <IconButton
                size="large"
                aria-label="show new notifications"
                color="inherit"
              >
                <Notifications />
              </IconButton>

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar alt="Admin User" src="/src/assets/avatar.png" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleOpenProfileDialog}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Hồ sơ</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => navigate("/admin/settings")}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cài đặt</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <ListItemIcon>
                    {isLoggingOut ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Logout fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                  </ListItemText>
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: "border-box",
              },
              display: { xs: "none", sm: "block" },
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: [1],
              }}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold", my: 2 }}
              >
                DNC LEARNING
              </Typography>
            </Toolbar>
            <Divider />
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={location.pathname === item.path}
                  >
                    <ListItemIcon sx={{ mr: -2 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Drawer>

          {/* Profile Dialog */}
          <Dialog
            open={profileDialogOpen}
            onClose={() => setProfileDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Thông tin tài khoản
              <IconButton onClick={() => setProfileDialogOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {currentUser && (
                <Box sx={{ py: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Avatar
                      src={
                        currentUser.avatarUrl
                          ? `/src/assets/${currentUser.avatarUrl}`
                          : ""
                      }
                      sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <Typography variant="h5" fontWeight="bold">
                      {currentUser.username}
                    </Typography>
                    <Typography variant="subtitle1" color="primary">
                      {currentUser.role === "admin" ? "Quản trị viên" : ""}
                    </Typography>
                  </Box>

                  <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        pb: 1,
                        mb: 2,
                      }}
                    >
                      Thông tin cá nhân
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <AccountCircle
                            sx={{ mr: 2, color: "primary.main" }}
                          />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Tên đăng nhập
                            </Typography>
                            <Typography variant="body1">
                              {currentUser.username}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Email sx={{ mr: 2, color: "primary.main" }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {currentUser.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      {currentUser.phone && (
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <PhoneIcon sx={{ mr: 2, color: "primary.main" }} />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Số điện thoại
                              </Typography>
                              <Typography variant="body1">
                                {currentUser.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <CalendarToday
                            sx={{ mr: 2, color: "primary.main" }}
                          />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Lần đăng nhập cuối
                            </Typography>
                            <Typography variant="body1">
                              {currentUser.lastLogin
                                ? new Date(
                                    currentUser.lastLogin
                                  ).toLocaleString("vi-VN")
                                : "Chưa có thông tin"}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        pb: 1,
                        mb: 2,
                      }}
                    >
                      Thông tin tài khoản
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Trạng thái
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                currentUser.status === "active"
                                  ? "success.main"
                                  : "error.main",
                              fontWeight: "medium",
                            }}
                          >
                            {currentUser.status === "active"
                              ? "Đang hoạt động"
                              : "Không hoạt động"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày tạo tài khoản
                          </Typography>
                          <Typography variant="body1">
                            {new Date(currentUser.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Cập nhật lần cuối
                          </Typography>
                          <Typography variant="body1">
                            {new Date(currentUser.updatedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Xác thực 2 lớp
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: currentUser.twoFactorEnabled
                                ? "success.main"
                                : "warning.main",
                              fontWeight: "medium",
                            }}
                          >
                            {currentUser.twoFactorEnabled
                              ? "Đã bật"
                              : "Chưa bật"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProfileDialogOpen(false)}>Đóng</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setProfileDialogOpen(false);
                  navigate("/admin/profile");
                }}
              >
                Chỉnh sửa
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: location.pathname === "/admin/login" ? 0 : 3,
          width:
            location.pathname === "/admin/login"
              ? "100%"
              : { sm: `calc(100% - ${drawerWidth}px)` },
          mt: location.pathname === "/admin/login" ? 0 : 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
