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
  VerifiedUser,
  PlayLessonOutlined,
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
    {
      text: "Hệ thống đào tạo",
      icon: <School />,
      path: "/admin",
    },
    { text: "Khóa học", icon: <PlayLessonOutlined />, path: "/admin/courses" },
    { text: "Giảng viên", icon: <People />, path: "/admin/instructors" },
    { text: "Học viên/sinh viên", icon: <People />, path: "/admin/students" },
    {
      text: "Lớp học thuật",
      icon: <PeopleAltTwoTone />,
      path: "/admin/academic-classes",
    },
    {
      text: "Chứng chỉ",
      icon: <VerifiedUser />,
      path: "/admin/certificates",
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
              background: "#fff",
              color: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              backdropFilter: "blur(20px)",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 2,
                  display: { sm: "none" },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  flexGrow: 1,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  background: "linear-gradient(45deg, #fff 30%, #ffebee 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {}
              </Typography>

              <IconButton
                size="large"
                aria-label="show new notifications"
                color="inherit"
                sx={{
                  mr: 1,
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  border: "2px solid rgba(255,255,255,0.2)",
                  "&:hover": {
                    border: "2px solid rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Avatar
                  alt="Admin User"
                  src="/src/assets/logo-not-text.png"
                  sx={{
                    width: 35,
                    height: 35,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
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
                background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
                borderRight: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
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
                background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                minHeight: 70,
              }}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: "bold",
                  my: 2,
                  color: "white",
                  letterSpacing: "0.5px",
                }}
              >
                DNC LEARNING
              </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ px: 1.5, py: 1 }}>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      "&.Mui-selected": {
                        background:
                          "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                        color: "white",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
                          opacity: 0.9,
                        },
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "rgba(211, 47, 47, 0.08)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color:
                          location.pathname === item.path
                            ? "white"
                            : "primary.main",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        fontSize: "0.95rem",
                      }}
                    />
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
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                color: "white",
                py: 2.5,
                px: 3,
              }}
            >
              <Typography variant="h6" fontWeight="600">
                Thông tin tài khoản
              </Typography>
              <IconButton
                onClick={() => setProfileDialogOpen(false)}
                sx={{
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {currentUser && (
                <Box sx={{ py: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 4,
                      px: 3,
                    }}
                  >
                    <Avatar
                      src={
                        currentUser.avatarUrl
                          ? `/src/assets/${currentUser.avatarUrl}`
                          : ""
                      }
                      sx={{
                        width: 100,
                        height: 100,
                        mb: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        border: "4px solid white",
                      }}
                    />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {currentUser.username}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "error.main",
                        fontWeight: 500,
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: "rgba(211, 47, 47, 0.08)",
                      }}
                    >
                      {currentUser.role === "admin" ? "Quản trị viên" : ""}
                    </Typography>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      mx: 3,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "rgba(248, 249, 250, 0.5)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        pb: 1.5,
                        mb: 2.5,
                        color: "primary.dark",
                        fontWeight: 600,
                      }}
                    >
                      Thông tin cá nhân
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <AccountCircle
                            sx={{
                              mr: 2,
                              color: "primary.main",
                              fontSize: 28,
                            }}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Tên đăng nhập
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {currentUser.username}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <Email
                            sx={{
                              mr: 2,
                              color: "primary.main",
                              fontSize: 28,
                            }}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Email
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
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
                              mb: 2.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor: "white",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }}
                          >
                            <PhoneIcon
                              sx={{
                                mr: 2,
                                color: "primary.main",
                                fontSize: 28,
                              }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Số điện thoại
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {currentUser.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <CalendarToday
                            sx={{
                              mr: 2,
                              color: "primary.main",
                              fontSize: 28,
                            }}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Lần đăng nhập cuối
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
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

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mx: 3,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "rgba(248, 249, 250, 0.5)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        pb: 1.5,
                        mb: 2.5,
                        color: "primary.dark",
                        fontWeight: 600,
                      }}
                    >
                      Thông tin tài khoản
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Trạng thái
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                currentUser.status === "active"
                                  ? "success.main"
                                  : "error.main",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              "&::before": {
                                content: '""',
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor:
                                  currentUser.status === "active"
                                    ? "success.main"
                                    : "error.main",
                                mr: 1,
                              },
                            }}
                          >
                            {currentUser.status === "active"
                              ? "Đang hoạt động"
                              : "Không hoạt động"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Ngày tạo tài khoản
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {new Date(currentUser.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Cập nhật lần cuối
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {new Date(currentUser.updatedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Xác thực 2 lớp
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: currentUser.twoFactorEnabled
                                ? "success.main"
                                : "warning.main",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              "&::before": {
                                content: '""',
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: currentUser.twoFactorEnabled
                                  ? "success.main"
                                  : "warning.main",
                                mr: 1,
                              },
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
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => setProfileDialogOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(26, 35, 126, 0.04)",
                  },
                }}
              >
                Đóng
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setProfileDialogOpen(false);
                  navigate("/admin/profile");
                }}
                sx={{
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  background:
                    "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
                  },
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
