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
  useTheme,
  Collapse,
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
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../../../components/student/notification/NotificationCenter";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCategories } from "../../../features/categories/categoriesApiSlice";
import { selectActiveCategories } from "../../../features/categories/categoriesSelectors";
import { logout } from "../../../features/auth/authApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";

// Styled components
const SearchDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: "600px",
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
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
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  // Lấy danh sách danh mục khi component được mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setIsLogin(true);
    }
  }, [currentUser]);

  // Check for user in localStorage on component mount
  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setIsLogin(true);
      } catch (error) {
        localStorage.removeItem("user"); // Remove invalid data
        setIsLogin(false);
        setUser(null);
      }
    } else {
      setIsLogin(false);
      setUser(null);
    }
  }, []);

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
    const query = event.target.value;
    setSearchQuery(query);

    // Mock search results
    if (query.trim()) {
      setSearchResults([
        {
          type: "course",
          title: "React & TypeScript",
          instructor: "John Doe",
          image: "/src/assets/courses/react-ts.png",
        },
        {
          type: "instructor",
          name: "Sarah Johnson",
          title: "AI Expert",
          avatar: "/src/assets/instructors/sarah.png",
        },
        {
          type: "forum",
          title: "Tips học lập trình hiệu quả",
          author: "Alex Johnson",
        },
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle logout function
  const handleLogout = () => {
    dispatch(logout());
    setIsLogin(false);
    setUser(null);
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
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "primary.main",
        boxShadow: 2,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Left Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
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
              }}
              onClick={() => navigate("/")}
            />

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                gap: 1,
                ml: { lg: 3 },
              }}
            >
              <Button
                color="inherit"
                startIcon={<CourseIcon />}
                endIcon={<KeyboardArrowDown />}
                onClick={handleCoursesClick}
                sx={{
                  color: "white",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                Khóa học
              </Button>
              <Menu
                anchorEl={coursesAnchor}
                open={Boolean(coursesAnchor)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    width: 280,
                    maxHeight: 400,
                    mt: 1,
                    boxShadow: 3,
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    onClick={() => {
                      navigate(`/courses?category=${category.id}`);
                      handleClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Stack spacing={1} direction="row" alignItems="center">
                      <School fontSize="small" />
                      <Box>
                        <Typography variant="body1">{category.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.courseCount} khóa học
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate("/courses")}
                  >
                    Xem tất cả khóa học
                  </Button>
                </Box>
              </Menu>

              <Button
                color="inherit"
                startIcon={<PersonIcon />}
                sx={{
                  color: "white",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
                onClick={() => navigate("/list-instructors")}
              >
                Giảng viên
              </Button>

              <Button
                color="inherit"
                startIcon={<ForumIcon />}
                sx={{
                  color: "white",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
                onClick={() => navigate("/forum")}
              >
                Diễn đàn
              </Button>
              <Button
                color="inherit"
                startIcon={<SchoolIcon />}
                onClick={() => navigate("/enrolled-courses")}
              >
                Khóa học của tôi
              </Button>
            </Box>
          </Box>

          {/* Right Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              position: { xs: "absolute", lg: "static" },
              right: 0,
              zIndex: 1,
            }}
          >
            {/* Nút Làm kiểm tra */}
            {isLogin && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Quiz />}
                onClick={() => navigate("/assessment")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  mr: 1,
                  fontWeight: "bold",
                }}
              >
                Làm kiểm tra
              </Button>
            )}

            {/* Search Button */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                px: 2,
                mr: 2,
                width: 250,
                height: "40px",
                cursor: "pointer",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
                },
              }}
              onClick={handleSearchOpen}
            >
              <Search
                sx={{
                  color: "white",
                  mr: 1,
                  fontSize: "20px",
                }}
              />
              <Typography
                color="white"
                sx={{
                  opacity: 0.9,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                }}
              >
                Tìm kiếm...
              </Typography>
            </Box>

            {/* Mobile/Tablet Search */}
            <IconButton
              color="inherit"
              sx={{ display: { xs: "flex", lg: "none" } }}
              onClick={handleSearchOpen}
            >
              <Search />
            </IconButton>

            {/* Notifications */}
            <NotificationCenter />

            {/* Desktop Profile */}
            {isLogin ? (
              <Box
                sx={{
                  display: { xs: "none", lg: "flex" },
                  alignItems: "center",
                  ml: 1,
                }}
              >
                <Button
                  onClick={handleProfileClick}
                  sx={{
                    color: "white",
                    textTransform: "none",
                    gap: 1,
                  }}
                >
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    src={user?.avatarUrl || "/src/assets/avatar.png"}
                  />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="subtitle2">
                      {user?.userStudent?.fullName || "User"}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {user?.role === "student" ? "Học viên" : "Giảng viên"}
                    </Typography>
                  </Box>
                </Button>
                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: { width: 220, mt: 1 },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      handleClose();
                    }}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    Trang cá nhân
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/settings");
                      handleClose();
                    }}
                  >
                    <SettingsIcon sx={{ mr: 1 }} />
                    Cài đặt
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} />
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              /* Login/Register Buttons */
              <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.6)",
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
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.9)",
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
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
        }}
      >
        <Box sx={{ py: 0 }}>
          {/* User Profile Section */}
          <Box
            sx={{
              bgcolor: "primary.main",
              display: "flex",
              justifyContent: isLogin ? "space-between" : "flex-end",
              alignItems: "center",
              width: "100%",
            }}
          >
            {isLogin && user && (
              <Box sx={{ px: 2, py: 3, bgcolor: "primary.main" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={user?.avatarUrl || "/src/assets/avatar.png"}
                    sx={{ width: 50, height: 50 }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      {user?.userStudent?.fullName || "User"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", opacity: 0.8 }}
                    >
                      {user?.role === "student" ? "Học viên" : "Giảng viên"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              sx={{ p: 1 }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Main Navigation */}
          <List sx={{ pt: 0 }}>
            {isLogin && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleToggleMobileSubmenu}>
                    <ListItemIcon>
                      <Dashboard />
                    </ListItemIcon>
                    <ListItemText primary="Tài khoản của tôi" />
                    {mobileSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={mobileSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => {
                        navigate("/profile");
                        handleDrawerToggle();
                      }}
                    >
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Trang cá nhân" />
                    </ListItemButton>

                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => {
                        navigate("/settings");
                        handleDrawerToggle();
                      }}
                    >
                      <ListItemIcon>
                        <SettingsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Cài đặt" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/");
                  handleDrawerToggle();
                }}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Trang chủ" />
              </ListItemButton>
            </ListItem>

            {isLogin && (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/enrolled-courses");
                      handleDrawerToggle();
                    }}
                  >
                    <ListItemIcon>
                      <CourseIcon />
                    </ListItemIcon>
                    <ListItemText primary="Khóa học của tôi" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/courses");
                  handleDrawerToggle();
                }}
              >
                <ListItemIcon>
                  <School />
                </ListItemIcon>
                <ListItemText primary="Khóa học" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/list-instructors");
                  handleDrawerToggle();
                }}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Giảng viên" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/forum");
                  handleDrawerToggle();
                }}
              >
                <ListItemIcon>
                  <ForumIcon />
                </ListItemIcon>
                <ListItemText primary="Diễn đàn" />
              </ListItemButton>
            </ListItem>

            {isLogin && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate("/assessment");
                    handleDrawerToggle();
                  }}
                >
                  <ListItemIcon>
                    <Quiz />
                  </ListItemIcon>
                  <ListItemText primary="Làm kiểm tra" />
                </ListItemButton>
              </ListItem>
            )}
          </List>

          {/* Auth Buttons */}
          {!isLogin && (
            <Box sx={{ p: 2, mt: 2 }}>
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigate("/register");
                    handleDrawerToggle();
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
                >
                  Đăng nhập
                </Button>
              </Stack>
            </Box>
          )}

          {/* Logout Button */}
          {isLogin && (
            <Box sx={{ p: 2, mt: "auto" }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
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
      >
        <Box sx={{ p: 2 }}>
          {/* Search Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <SearchInput>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm kiếm khóa học, giảng viên..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
            </SearchInput>
            <IconButton onClick={handleSearchClose}>
              <Close />
            </IconButton>
          </Box>

          {/* Search Results */}
          <Box sx={{ mt: 2 }}>
            {searchResults.map((result, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  handleSearchClose();
                  // Navigate based on result type
                  if (result.type === "course") {
                    navigate(`/courses/${result.title}`);
                  } else if (result.type === "instructor") {
                    navigate(`/instructors/${result.name}`);
                  } else if (result.type === "forum") {
                    navigate(`/forum/post/${result.title}`);
                  }
                }}
              >
                {result.type === "course" && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={result.image}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        {result.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Khóa học • {result.instructor}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                {result.type === "instructor" && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={result.avatar} />
                    <Box>
                      <Typography variant="subtitle2">{result.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Giảng viên • {result.title}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                {result.type === "forum" && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>
                      <Assignment />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {result.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diễn đàn • {result.author}
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

            {!searchQuery && (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tìm kiếm phổ biến
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {["React", "Python", "Marketing", "UI/UX", "English"].map(
                    (term) => (
                      <Chip
                        key={term}
                        label={term}
                        onClick={() => setSearchQuery(term)}
                        sx={{ m: 0.5 }}
                      />
                    )
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </SearchDialog>
    </AppBar>
  );
};

export default Header;
