import { useState, useEffect, use } from "react";
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
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  Button,
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
  { text: "Kiểm tra", icon: <Quiz />, path: "/instructor/quiz" },
  { text: "Thống kê", icon: <Assessment />, path: "/instructor/analytics" },
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

  // Thêm state kiểm tra xem có phải admin đang impersonate không
  const [adminImpersonating, setAdminImpersonating] = useState(false);
  const [impersonatedInstructorName, setImpersonatedInstructorName] =
    useState("");

  useEffect(() => {
    if (currentUser?.role !== "instructor") {
      navigate("/instructor/login");
    }
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
        {menuItems.map((item) => (
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
