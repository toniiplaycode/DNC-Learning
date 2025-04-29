import { useState, useEffect, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { addMessage } from "../../../features/messages/messagesSlice";
import { useAppDispatch } from "../../../app/hooks";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Tooltip,
  Alert,
  Button,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  LibraryBooks,
  People,
  Assessment,
  Settings,
  Assignment,
  Message,
  Notifications,
  CalendarMonth,
  Quiz,
  Forum,
  Comment,
  PeopleAltTwoTone,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Logo from "../../../assets/logo.png";
import { useAppSelector } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { selectAllMessages } from "../../../features/messages/messagesSelector";
import { fetchUserNotifications } from "../../../features/notifications/notificationsSlice";
import { selectUserNotifications } from "../../../features/notifications/notificationsSelector";

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;
const TRANSITION_DURATION = "0.3s";

const menuItems = [
  { text: "Tổng quan", icon: <Dashboard />, path: "/instructor" },
  { text: "Khóa học", icon: <LibraryBooks />, path: "/instructor/courses" },
  {
    text: "Học viên/sinh viên",
    icon: <People />,
    path: "/instructor/students",
  },
  {
    text: "Lớp học thuật",
    icon: <PeopleAltTwoTone />,
    path: "/instructor/studentsAcademic",
  },
  { text: "Bài tập", icon: <Assignment />, path: "/instructor/assignments" },
  { text: "Trắc nghiệm", icon: <Quiz />, path: "/instructor/quiz" },
  { text: "Tin nhắn", icon: <Message />, path: "/instructor/chats" },
  {
    text: "Lịch trình",
    icon: <CalendarMonth />,
    path: "/instructor/schedules",
  },
  {
    text: "Công việc",
    icon: <Assignment />,
    path: "/instructor/tasks",
  },
  {
    text: "Diễn đàn",
    icon: <Forum />,
    path: "/instructor/forum",
  },
  {
    text: "Đánh giá",
    icon: <Comment />,
    path: "/instructor/reviews",
  },
  { text: "Thống kê", icon: <Assessment />, path: "/instructor/analytics" },
  {
    text: "Thông báo",
    icon: <Notifications />,
    path: "/instructor/notifications",
  },
  { text: "Cài đặt", icon: <Settings />, path: "/instructor/settings" },
];

const InstructorLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const messages = useAppSelector(selectAllMessages);
  const userNotifications = useAppSelector(selectUserNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  // Thêm state kiểm tra xem có phải admin đang impersonate không
  const [adminImpersonating, setAdminImpersonating] = useState(false);
  const [impersonatedInstructorName, setImpersonatedInstructorName] =
    useState("");

  useEffect(() => {
    if (currentUser?.role !== "instructor") {
      navigate("/instructor/login");
    }
    dispatch(fetchUserNotifications(currentUser.id));
  }, [currentUser, navigate]);

  useEffect(() => {
    // Kiểm tra xem có phải admin đang impersonate không
    const isImpersonating =
      localStorage.getItem("adminImpersonating") === "true";
    setAdminImpersonating(isImpersonating);

    if (isImpersonating) {
      setImpersonatedInstructorName(
        localStorage.getItem("impersonatedInstructorName") || ""
      );
    }
  }, []);

  // Thêm hàm để kết thúc impersonation
  const handleEndImpersonation = () => {
    localStorage.removeItem("adminImpersonating");
    localStorage.removeItem("impersonatedInstructorId");
    localStorage.removeItem("impersonatedInstructorName");
    navigate("/admin/instructors");
  };

  const unreadMessagesCount = useMemo(() => {
    if (!messages || !currentUser) return 0;
    return messages.filter(
      (msg) => !msg.isRead && msg.receiver.id === currentUser.id
    ).length;
  }, [messages, currentUser]);

  const unreadNotificationsCount = useMemo(() => {
    return userNotifications.filter((notification) => !notification.isRead)
      .length;
  }, [userNotifications]);

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
      console.log("Socket connected in InstructorLayout");
    });

    socketRef.current.on("newMessage", handleNewMessage);
    socketRef.current.on("messageRead", handleMessageRead);

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

  useEffect(() => {
    setUnreadCount(unreadMessagesCount);
  }, [unreadMessagesCount]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItemsWithBadges = useMemo(
    () =>
      menuItems.map((item) => {
        if (item.text === "Tin nhắn") {
          return {
            ...item,
            icon: (
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    right: -3,
                    top: 3,
                    border: `2px solid ${theme.palette.primary.main}`,
                    padding: "0 4px",
                  },
                }}
              >
                <Message />
              </Badge>
            ),
          };
        }
        if (item.text === "Thông báo") {
          return {
            ...item,
            icon: (
              <Badge
                badgeContent={unreadNotificationsCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    right: -3,
                    top: 3,
                    border: `2px solid ${theme.palette.primary.main}`,
                    padding: "0 4px",
                  },
                }}
              >
                <Notifications />
              </Badge>
            ),
          };
        }
        return item;
      }),
    [unreadCount, unreadNotificationsCount, theme.palette.primary.main]
  );

  const drawer = (isMobileDrawer = false) => (
    <Box
      sx={{
        height: "100%",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        overflow: "hidden",
        transition: `all ${TRANSITION_DURATION} ease`,
      }}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: 1,
          borderColor: "primary.light",
          transition: `all ${TRANSITION_DURATION} ease`,
        }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            width: 70,
            height: 70,
            objectFit: "contain",
            transition: `all ${TRANSITION_DURATION} ease`,
          }}
        />
      </Box>

      {/* Menu Items */}
      <List sx={{ mt: 1 }}>
        {menuItemsWithBadges.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip
              title={!isExpanded && !isMobileDrawer ? item.text : ""}
              placement="right"
            >
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    handleDrawerToggle();
                  }
                }}
                sx={{
                  py: 1.5,
                  minHeight: 48,
                  justifyContent:
                    isExpanded || isMobileDrawer ? "initial" : "center",
                  transition: `all ${TRANSITION_DURATION} ease`,
                  "&.Mui-selected": {
                    bgcolor: "primary.dark",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isExpanded || isMobileDrawer ? 2 : "auto",
                    justifyContent: "center",
                    transition: `all ${TRANSITION_DURATION} ease`,
                    color:
                      location.pathname === item.path
                        ? "#fff"
                        : "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: isExpanded || isMobileDrawer ? 1 : 0,
                    visibility:
                      isExpanded || isMobileDrawer ? "visible" : "hidden",
                    transform:
                      isExpanded || isMobileDrawer
                        ? "translateX(0)"
                        : "translateX(-20px)",
                    transition: `all ${TRANSITION_DURATION} ease`,
                    "& .MuiTypography-root": {
                      fontSize: "0.95rem",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color:
                        location.pathname === item.path
                          ? "#fff"
                          : "rgba(255, 255, 255, 0.7)",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile AppBar */}
      {currentUser?.role === "instructor" && (
        <AppBar
          position="fixed"
          sx={{
            display: { md: "none" },
            bgcolor: "primary.main",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                }}
              />
            </Box>
            <Box sx={{ width: 48 }} />
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {currentUser?.role === "instructor" && (
        <Box
          component="nav"
          sx={{
            width: { md: isExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH },
            flexShrink: { md: 0 },
            transition: `width ${TRANSITION_DURATION} ease`,
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                bgcolor: "primary.main",
              },
            }}
          >
            {drawer(true)}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: isExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
                bgcolor: "primary.main",
                transition: `all ${TRANSITION_DURATION} ease`,
                overflowX: "hidden",
              },
            }}
            open
          >
            {drawer(false)}
          </Drawer>
        </Box>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - ${
              isExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH
            }px)`,
          },
          mt: { xs: 7, md: 0 },
          transition: `all ${TRANSITION_DURATION} ease`,
        }}
      >
        {/* Hiển thị thông báo khi admin đang impersonate */}
        {adminImpersonating && (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <strong>Chế độ xem giảng viên:</strong> Bạn đang xem với tư cách
              là giảng viên "{impersonatedInstructorName}"
            </span>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={handleEndImpersonation}
              sx={{ ml: 2 }}
            >
              Quay lại trang quản trị
            </Button>
          </Alert>
        )}

        <Outlet />
      </Box>
    </Box>
  );
};

export default InstructorLayout;
