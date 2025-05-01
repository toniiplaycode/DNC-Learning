import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
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
} from "@mui/icons-material";
import { useState } from "react";

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    { text: "Học viên", icon: <People />, path: "/admin/students" },
    { text: "Tin nhắn", icon: <Message />, path: "/admin/chats" },
    { text: "Danh mục", icon: <Category />, path: "/admin/categories" },
    { text: "Thanh toán", icon: <Receipt />, path: "/admin/payments" },
    { text: "Lịch dạy", icon: <CalendarMonth />, path: "/admin/schedules" },
    { text: "Phân công", icon: <Assignment />, path: "/admin/assignments" },
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
              >
                Admin Portal
              </Typography>

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
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold", my: 2 }}
              >
                E-Learning Admin
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
