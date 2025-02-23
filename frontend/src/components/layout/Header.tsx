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
  Badge,
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
} from "@mui/material";
import {
  Search,
  Notifications,
  KeyboardArrowDown,
  School,
  Assignment,
  Close,
  Menu as MenuIcon,
  ChevronRight,
  Forum,
  Article,
  Person,
  ExitToApp,
  School as SchoolIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  Article as ArticleIcon,
  LocalLibrary as CourseIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Lập trình", path: "/courses/programming" },
  { name: "Ngoại ngữ", path: "/courses/languages" },
  { name: "Marketing", path: "/courses/marketing" },
  { name: "Thiết kế", path: "/courses/design" },
  { name: "Kinh doanh", path: "/courses/business" },
  { name: "Phát triển cá nhân", path: "/courses/personal-development" },
];

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
  const navigate = useNavigate();
  const [coursesAnchor, setCoursesAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleCoursesClick = (event: React.MouseEvent<HTMLElement>) => {
    setCoursesAnchor(event.currentTarget);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
    navigate("/profile");
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setCoursesAnchor(null);
    setProfileAnchor(null);
    setNotificationsAnchor(null);
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

  const mobileMenu = (
    <Box sx={{ width: 280 }}>
      {/* Mobile Menu Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src="/src/assets/logo.png"
          sx={{ height: "40px" }}
        />
        <IconButton onClick={handleDrawerToggle} sx={{ ml: "auto" }}>
          <ChevronRight />
        </IconButton>
      </Box>
      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src="/src/assets/avatar.png" />
          <Box>
            <Typography variant="subtitle1">Nguyễn Văn A</Typography>
            <Typography variant="body2" color="text.secondary">
              Học viên
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />

      {/* Navigation Menu */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleCoursesClick}>
            <ListItemIcon>
              <School />
            </ListItemIcon>
            <ListItemText primary="Khóa học" />
            <KeyboardArrowDown />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/instructors")}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Giảng viên" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/forum")}>
            <ListItemIcon>
              <Forum />
            </ListItemIcon>
            <ListItemText primary="Diễn đàn" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/blog")}>
            <ListItemIcon>
              <Article />
            </ListItemIcon>
            <ListItemText primary="Blog" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />

      {/* Bottom Actions */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/logout")}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

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
                    key={category.path}
                    onClick={() => {
                      navigate(category.path);
                      handleClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Stack spacing={1} direction="row" alignItems="center">
                      <School fontSize="small" />
                      <Box>
                        <Typography variant="body1">{category.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.count || "100+"} khóa học
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
                onClick={() => navigate("/instructors")}
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
                startIcon={<ArticleIcon />}
                sx={{
                  color: "white",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
                onClick={() => navigate("/blog")}
              >
                Blog
              </Button>

              <Button
                color="inherit"
                startIcon={<SchoolIcon />}
                onClick={() => navigate("/enrolled-courses")}
                sx={{ ml: 2 }}
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
              right: 24,
              zIndex: 1,
            }}
          >
            {/* Desktop Search */}
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
            {isLogin && (
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            )}

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
                    src="/src/assets/avatar.png"
                  />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="subtitle2">Nguyễn Văn A</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Học viên
                    </Typography>
                  </Box>
                </Button>
              </Box>
            ) : (
              /* Login/Register Buttons */
              <Box sx={{ display: "flex", gap: 1 }}>
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
        {mobileMenu}
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
