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
} from "@mui/icons-material";
import { fetchMessagesByUser } from "../../../features/messages/messagesSlice";
import { selectAllMessages } from "../../../features/messages/messagesSelector";
import { addMessage } from "../../../features/messages/messagesSlice";

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const menuItems = [
    { text: "Bảng điều khiển", icon: <Dashboard />, path: "/admin" },
    { text: "Khóa học", icon: <School />, path: "/admin/courses" },
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
                <MenuItem onClick={() => navigate("/admin/profile")}>
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
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Đăng xuất</ListItemText>
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
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Drawer>
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
