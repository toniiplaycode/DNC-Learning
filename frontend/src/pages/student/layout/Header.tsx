import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  Dialog,
  styled,
  Stack,
  Chip,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Collapse,
  alpha,
  useTheme,
  useScrollTrigger,
} from "@mui/material";
import {
  Search,
  KeyboardArrowDown,
  School,
  Assignment,
  Close,
  Menu as MenuIcon,
  ExitToApp,
  School as SchoolIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  Article as ArticleIcon,
  LocalLibrary as CourseIcon,
  Quiz,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Dashboard,
  CalendarMonth,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../../../components/student/notification/NotificationCenter";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCategories } from "../../../features/categories/categoriesApiSlice";
import { selectActiveCategories } from "../../../features/categories/categoriesSelectors";
import { logout } from "../../../features/auth/authApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { fetchCourses } from "../../../features/courses/coursesApiSlice";
import { selectAllCourses } from "../../../features/courses/coursesSelector";
import { fetchInstructors } from "../../../features/user_instructors/instructorsApiSlice";
import { selectAllInstructors } from "../../../features/user_instructors/instructorsSelectors";
import { selectAllForums } from "../../../features/forums/forumsSelectors";
import { fetchForums } from "../../../features/forums/forumsApiSlice";
import { toast } from "react-toastify";

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  transition: "all 0.3s ease",
}));

const SearchDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: "600px",
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
}));

const SearchInput = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  transition: "all 0.2s ease",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "white",
  fontWeight: 500,
  borderRadius: "8px",
  padding: "6px 12px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    transform: "translateY(-2px)",
  },
}));

const Header = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectActiveCategories);
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [coursesAnchor, setCoursesAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const courses = useAppSelector(selectAllCourses);
  const instructors = useAppSelector(selectAllInstructors);
  const forums = useAppSelector(selectAllForums);
  const theme = useTheme();

  // Track scroll position for header elevation effect
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  // Check user role and redirect if not authorized
  useEffect(() => {
    if (
      currentUser &&
      currentUser.role !== "student" &&
      currentUser.role !== "student_academic"
    ) {
      // Kiểm tra xem đã hiển thị toast trong session này chưa
      const hasShownToast = sessionStorage.getItem("unauthorizedToastShown");

      if (!hasShownToast) {
        // Đánh dấu đã hiển thị toast
        sessionStorage.setItem("unauthorizedToastShown", "true");
        dispatch(logout());
        navigate("/login");
        toast.error("Hãy nhập với tài khoản học viên hoặc sinh viên !");
      } else {
        // Chỉ logout và navigate, không hiển thị toast
        dispatch(logout());
        navigate("/login");
      }
    } else if (
      currentUser &&
      (currentUser.role === "student" ||
        currentUser.role === "student_academic")
    ) {
      // Reset flag khi user hợp lệ
      sessionStorage.removeItem("unauthorizedToastShown");
    }
  }, [currentUser, navigate, dispatch]);

  // Lấy danh sách danh mục khi component được mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCourses());
    dispatch(fetchInstructors());
    dispatch(fetchForums());
  }, [dispatch]);

  const handleCoursesClick = (event: React.MouseEvent<HTMLElement>) => {
    setCoursesAnchor(event.currentTarget);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setCoursesAnchor(null);
    setProfileAnchor(null);
  };

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim()) {
      const filteredResults = [
        // Search courses
        ...courses
          .filter(
            (course) =>
              course.title.toLowerCase().includes(query) ||
              course.description.toLowerCase().includes(query)
          )
          .map((course) => ({
            type: "course",
            id: course.id,
            title: course.title,
            image: course.thumbnailUrl,
            instructor: course.instructor?.fullName || "Không xác định",
            for: course.for || "both",
          })),

        // Search instructors
        ...instructors
          .filter((instructor) =>
            instructor.fullName.toLowerCase().includes(query)
          )
          .map((instructor) => ({
            type: "instructor",
            id: instructor.id,
            title: instructor.fullName,
            image: instructor.avatarUrl,
          })),

        // Search forums
        ...forums
          .filter((forum) => forum.title.toLowerCase().includes(query))
          .map((forum) => ({
            type: "forum",
            id: forum.id,
            title: forum.title,
          })),
      ];

      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result: any) => {
    handleSearchClose();
    switch (result.type) {
      case "course":
        navigate(`/course/${result.id}`);
        break;
      case "instructor":
        navigate(`/view-instructor/${result.id}`);
        break;
      case "forum":
        navigate(`/forum/${result.id}`);
        break;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle logout function
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    // Close any open menus
    setProfileAnchor(null);
    setMobileOpen(false);
  };

  // Toggle mobile submenu
  const handleToggleMobileSubmenu = () => {
    setMobileSubmenuOpen(!mobileSubmenuOpen);
  };

  return (
    <StyledAppBar
      position="fixed"
      elevation={scrollTrigger ? 4 : 0}
      sx={{
        borderBottom: scrollTrigger
          ? "none"
          : `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 2 } }}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            py: 0.5,
            minHeight: "64px",
            px: "0 !important",
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.5 },
              width: { xs: "100%", lg: "auto" },
              position: { xs: "relative", lg: "static" },
            }}
          >
            {/* Mobile/Tablet Menu Button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { lg: "none" },
                position: { xs: "absolute", lg: "static" },
                left: 0,
                zIndex: 1,
                bgcolor: alpha(theme.palette.common.white, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box
              component="img"
              src="/src/assets/logo.png"
              sx={{
                height: { xs: "60px", lg: "80px" },
                cursor: "pointer",
                display: "block",
                position: { xs: "absolute", lg: "static" },
                left: "50%",
                transform: { xs: "translateX(-50%)", lg: "none" },
                ml: { xs: 0, lg: 0 },
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: { xs: "translateX(-50%)", lg: "scale(1.05)" },
                },
              }}
              onClick={() => navigate("/")}
            />

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                gap: 0.75,
                ml: { lg: 2 },
              }}
            >
              <NavButton
                startIcon={<CourseIcon sx={{ fontSize: 18 }} />}
                endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
                onClick={handleCoursesClick}
                sx={{ px: 1.5, py: 0.75 }}
              >
                Khóa học
              </NavButton>
              <Menu
                anchorEl={coursesAnchor}
                open={Boolean(coursesAnchor)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    width: 300,
                    maxHeight: 400,
                    mt: 1.5,
                    borderRadius: 2,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    overflow: "auto",
                  },
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate("/courses")}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 500,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    Xem tất cả khóa học
                  </Button>
                </Box>
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    onClick={() => {
                      navigate(`/courses?category=${category.id}`);
                      handleClose();
                    }}
                    sx={{
                      py: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <Stack spacing={1} direction="row" alignItems="center">
                      <School fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.courseCount} khóa học
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Menu>

              <NavButton
                startIcon={<PersonIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate("/list-instructors")}
                sx={{ px: 1.5, py: 0.75 }}
              >
                Giảng viên
              </NavButton>

              <NavButton
                startIcon={<ForumIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate("/forum")}
                sx={{ px: 1.5, py: 0.75 }}
              >
                Diễn đàn
              </NavButton>
              <NavButton
                startIcon={<SchoolIcon sx={{ fontSize: 18 }} />}
                onClick={() => {
                  if (currentUser) {
                    navigate("/enrolled-courses");
                  } else {
                    navigate("/login");
                  }
                }}
                sx={{ px: 1.5, py: 0.75 }}
              >
                Khóa học của tôi
              </NavButton>

              {currentUser?.role === "student_academic" && (
                <NavButton
                  startIcon={<MenuBookIcon sx={{ fontSize: 18 }} />}
                  onClick={() => {
                    if (currentUser) {
                      navigate("/academic-program");
                    } else {
                      navigate("/login");
                    }
                  }}
                  sx={{ px: 1.5, py: 0.75 }}
                >
                  Chương trình đào tạo
                </NavButton>
              )}
            </Box>
          </Box>

          {/* Right Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              position: { xs: "absolute", lg: "static" },
              right: 0,
              zIndex: 1,
            }}
          >
            {/* Nút Làm kiểm tra */}
            {currentUser && currentUser.role === "student_academic" && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Quiz sx={{ fontSize: 16 }} />}
                onClick={() => navigate("/assessment")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  mr: 0.75,
                  fontWeight: "bold",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                  fontSize: "0.85rem",
                  py: 0.75,
                  px: 1.5,
                }}
              >
                Làm kiểm tra
              </Button>
            )}

            {currentUser && currentUser.role === "student_academic" && (
              <Button
                variant="contained"
                startIcon={<CalendarMonth sx={{ fontSize: 16 }} />}
                onClick={() => navigate("/teaching-schedules")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  mr: 0.75,
                  fontWeight: "bold",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                  fontSize: "0.85rem",
                  py: 0.75,
                  px: 1.5,
                }}
              >
                học trực tuyến
              </Button>
            )}

            {/* Search Button */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                bgcolor: alpha(theme.palette.common.white, 0.1),
                borderRadius: "20px",
                px: 2,
                mr: 0.75,
                width:
                  currentUser?.role !== "student_academic" ? "280px" : "50px",
                height: "36px",
                cursor: "pointer",
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  boxShadow: `0 0 10px ${alpha(
                    theme.palette.common.white,
                    0.1
                  )}`,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={handleSearchOpen}
            >
              <Search
                sx={{
                  color: "white",
                  mr: 1,
                  fontSize: "18px",
                }}
              />
              {currentUser?.role !== "student_academic" && (
                <Typography variant="body2" color="white">
                  Tìm kiếm...
                </Typography>
              )}
            </Box>

            {/* Mobile/Tablet Search */}
            <IconButton
              color="inherit"
              sx={{
                display: { xs: "flex", lg: "none" },
                bgcolor: alpha(theme.palette.common.white, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                },
                padding: "6px",
              }}
              onClick={handleSearchOpen}
            >
              <Search sx={{ fontSize: "1.25rem" }} />
            </IconButton>

            {/* Notifications */}
            {currentUser && <NotificationCenter />}

            {/* Desktop Profile */}
            {currentUser ? (
              <Box
                sx={{
                  display: { xs: "none", lg: "flex" },
                  alignItems: "center",
                  ml: 0.75,
                }}
              >
                <Button
                  onClick={handleProfileClick}
                  sx={{
                    color: "white",
                    textTransform: "none",
                    gap: 1,
                    borderRadius: "12px",
                    padding: "4px 8px",
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      border: `2px solid ${alpha(
                        theme.palette.common.white,
                        0.6
                      )}`,
                    }}
                    src={
                      currentUser.avatarUrl || "/src/assets/logo-not-text.png"
                    }
                  />
                  <Box
                    sx={{
                      textAlign: "left",
                      display: { xs: "none", xl: "block" },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      {(() => {
                        const fullName =
                          currentUser.userStudent?.fullName ||
                          currentUser.userStudentAcademic?.fullName ||
                          "User";
                        const nameParts = fullName.split(" ");
                        return nameParts.length >= 2
                          ? nameParts.slice(-2).join(" ")
                          : fullName;
                      })()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, fontSize: "0.7rem" }}
                    >
                      {currentUser.role === "student"
                        ? "Học viên"
                        : "Sinh viên"}
                    </Typography>
                  </Box>
                </Button>
                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      width: 240,
                      mt: 1.5,
                      borderRadius: 2,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                    },
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      handleClose();
                    }}
                    sx={{
                      py: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <PersonIcon
                      sx={{ mr: 1.5, color: theme.palette.primary.main }}
                    />
                    <Typography fontWeight={500}>Trang cá nhân</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                      },
                    }}
                  >
                    <ExitToApp
                      sx={{ mr: 1.5, color: theme.palette.error.main }}
                    />
                    <Typography fontWeight={500} color="error.main">
                      Đăng xuất
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              /* Login/Register Buttons */
              <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "white",
                    borderColor: alpha(theme.palette.common.white, 0.4),
                    borderRadius: "8px",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    fontSize: "0.8rem",
                    py: 0.5,
                    "&:hover": {
                      borderColor: alpha(theme.palette.common.white, 0.8),
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${alpha(
                        theme.palette.common.black,
                        0.1
                      )}`,
                    },
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/register")}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    borderRadius: "8px",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                    fontSize: "0.8rem",
                    py: 0.5,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile/Tablet Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 300,
            borderRadius: "0 16px 16px 0",
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box sx={{ py: 0 }}>
          {/* User Profile Section */}
          <Box
            sx={{
              backgroundImage: (theme) =>
                `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              display: "flex",
              justifyContent: currentUser ? "space-between" : "flex-end",
              alignItems: "center",
              width: "100%",
            }}
          >
            {currentUser && (
              <Box sx={{ px: 2, py: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={
                      currentUser.avatarUrl || "/src/assets/logo-not-text.png"
                    }
                    sx={{
                      width: 56,
                      height: 56,
                      border: (theme) =>
                        `3px solid ${alpha(theme.palette.common.white, 0.6)}`,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      {(() => {
                        const fullName =
                          currentUser.userStudent?.fullName || "User";
                        const nameParts = fullName.split(" ");
                        return nameParts.length >= 2
                          ? nameParts.slice(-2).join(" ")
                          : fullName;
                      })()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", opacity: 0.8 }}
                    >
                      {currentUser.role === "student"
                        ? "Học viên"
                        : "Giảng viên"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              sx={{
                p: 1,
                m: 1,
                bgcolor: alpha("#fff", 0.1),
                "&:hover": {
                  bgcolor: alpha("#fff", 0.2),
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Main Navigation */}
          <List sx={{ pt: 1, px: 1.5 }}>
            {currentUser && (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={handleToggleMobileSubmenu}
                    sx={{
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Dashboard color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tài khoản của tôi"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    {mobileSubmenuOpen ? (
                      <ExpandLess color="primary" />
                    ) : (
                      <ExpandMore color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>

                <Collapse in={mobileSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        borderRadius: 2,
                        mb: 0.5,
                        ml: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                      onClick={() => {
                        navigate("/profile");
                        handleDrawerToggle();
                      }}
                    >
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trang cá nhân"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItemButton>

                    <ListItemButton
                      sx={{
                        pl: 4,
                        borderRadius: 2,
                        ml: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                      onClick={() => {
                        navigate("/settings");
                        handleDrawerToggle();
                      }}
                    >
                      <ListItemIcon>
                        <SettingsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Cài đặt"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate("/");
                  handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <SchoolIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Trang chủ"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>

            {currentUser && (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate("/enrolled-courses");
                      handleDrawerToggle();
                    }}
                    sx={{
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <CourseIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Khóa học của tôi"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>

                {currentUser.role === "student_academic" && (
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate("/academic-program");
                        handleDrawerToggle();
                      }}
                      sx={{
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <ListItemIcon>
                        <MenuBookIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Chương trình đào tạo"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}

                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate("/teaching-schedules");
                      handleDrawerToggle();
                    }}
                    sx={{
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <CalendarMonth color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Lịch học trực tuyến"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate("/courses");
                  handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Khóa học"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate("/list-instructors");
                  handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Giảng viên"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate("/forum");
                  handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <ForumIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Diễn đàn"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>

            {currentUser && (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate("/assessment");
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon>
                    <Quiz color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Làm kiểm tra"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>

          {/* Auth Buttons */}
          {!currentUser && (
            <Box sx={{ p: 2, mt: 2 }}>
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigate("/register");
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: "10px",
                    py: 1.2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontWeight: 600,
                  }}
                >
                  Đăng ký
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    navigate("/login");
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: "10px",
                    py: 1.2,
                    fontWeight: 600,
                  }}
                >
                  Đăng nhập
                </Button>
              </Stack>
            </Box>
          )}

          {/* Logout Button */}
          {currentUser && (
            <Box sx={{ p: 2, mt: 2, mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                sx={{
                  borderRadius: "10px",
                  py: 1.2,
                  fontWeight: 600,
                  borderWidth: "2px",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderWidth: "2px",
                    bgcolor: alpha("#f44336", 0.04),
                  },
                }}
              >
                Đăng xuất
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onClose={handleSearchClose}
        fullWidth
        maxWidth="md"
        TransitionProps={{
          style: { animation: "fadeIn 0.3s" },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Search Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <SearchInput
              sx={{
                bgcolor: (theme) => alpha(theme.palette.common.black, 0.05),
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              }}
            >
              <SearchIconWrapper>
                <Search color="primary" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm kiếm khóa học, giảng viên, diễn đàn..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                sx={{ py: 0.5 }}
              />
            </SearchInput>
            <IconButton
              onClick={handleSearchClose}
              sx={{
                ml: 1,
                bgcolor: (theme) => alpha(theme.palette.common.black, 0.05),
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.common.black, 0.1),
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Search Results */}
          <Box sx={{ mt: 3 }}>
            {searchResults.map((result, index) => (
              <MenuItem
                key={index}
                onClick={() => handleSearchResultClick(result)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  p: 1.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  },
                }}
              >
                {result.type === "course" && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={result.image}
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {result.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Khóa học • {result.instructor}
                        {result.for && (
                          <Chip
                            size="small"
                            label={
                              result.for === "student"
                                ? "Học viên"
                                : result.for === "student_academic"
                                ? "Sinh viên"
                                : "Tất cả"
                            }
                            color={
                              result.for === "student"
                                ? "error"
                                : result.for === "student_academic"
                                ? "primary"
                                : "info"
                            }
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: "0.6rem",
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                {result.type === "instructor" && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={result.image}
                      sx={{
                        width: 50,
                        height: 50,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {result.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Giảng viên
                      </Typography>
                    </Box>
                  </Stack>
                )}

                {result.type === "forum" && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        width: 50,
                        height: 50,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Assignment />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {result.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diễn đàn
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </MenuItem>
            ))}

            {searchQuery && searchResults.length === 0 && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Không tìm thấy kết quả nào
                </Typography>
              </Box>
            )}

            {searchQuery.length == 0 && (
              <Box sx={{ p: 2 }}>
                {/* Popular Categories */}
                <Typography variant="subtitle2" gutterBottom>
                  Danh mục phổ biến
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                  {categories.slice(0, 5).map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      onClick={() => {
                        setSearchQuery(category.name);
                        handleSearchChange({
                          target: { value: category.name },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>

                {/* Featured Courses */}
                <Typography variant="subtitle2" gutterBottom>
                  Khóa học tiêu biểu
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={5}>
                  {courses.slice(0, 5).map((course) => (
                    <Chip
                      key={course.id}
                      label={course.title}
                      onClick={() => {
                        setSearchQuery(course.title);
                        handleSearchChange({
                          target: { value: course.title },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>

                {/* Top Instructors */}
                <Typography variant="subtitle2" gutterBottom>
                  Giảng viên tiêu biểu
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {instructors.slice(0, 5).map((instructor) => (
                    <Chip
                      key={instructor.id}
                      avatar={<Avatar src={instructor.avatarUrl} />}
                      label={instructor.fullName}
                      onClick={() => {
                        setSearchQuery(instructor.fullName);
                        handleSearchChange({
                          target: { value: instructor.fullName },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </SearchDialog>
    </StyledAppBar>
  );
};

export default Header;
