import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  ThumbUp,
  PushPin,
  Public,
  Lock,
  Message,
  Sort,
  ContentCopy,
  Close,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import ForumDiscussionDetail from "../../components/common/ForumDiscussionDetail";

// Mock data cho các bài đăng diễn đàn
const mockForumPosts = [
  {
    id: 1,
    title: "Thông báo: Cập nhật nội dung khóa học React & TypeScript",
    content: "Khóa học đã được cập nhật với React 18 và TypeScript 5.0...",
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    category: "announcement", // announcement, discussion, question, resource
    status: "published", // draft, published, archived
    isPinned: true,
    isPublic: true,
    createdAt: "2024-03-15T09:30:00",
    updatedAt: "2024-03-15T09:30:00",
    views: 245,
    likes: 32,
    comments: 15,
    tags: ["react", "typescript", "update"],
  },
  {
    id: 2,
    title: "Thảo luận: TypeScript Generic là gì và khi nào nên sử dụng?",
    content: "TypeScript Generic là một tính năng mạnh mẽ cho phép...",
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    category: "discussion",
    status: "published",
    isPinned: false,
    isPublic: true,
    createdAt: "2024-03-10T14:20:00",
    updatedAt: "2024-03-12T10:15:00",
    views: 178,
    likes: 24,
    comments: 22,
    tags: ["typescript", "generic", "tips"],
  },
  {
    id: 3,
    title: "Câu hỏi thường gặp khi sử dụng Node.js với TypeScript",
    content: "Nhiều học viên thắc mắc về cách cấu hình Node.js...",
    courseId: 2,
    courseName: "Node.js Advanced Concepts",
    category: "resource",
    status: "published",
    isPinned: false,
    isPublic: true,
    createdAt: "2024-03-08T11:30:00",
    updatedAt: "2024-03-08T11:30:00",
    views: 132,
    likes: 18,
    comments: 7,
    tags: ["nodejs", "typescript", "faq"],
  },
  {
    id: 4,
    title: "[Nháp] Hướng dẫn triển khai Docker cho ứng dụng Node.js",
    content: "Phần 1: Chuẩn bị môi trường và tạo Dockerfile...",
    courseId: 3,
    courseName: "DevOps Fundamentals",
    category: "resource",
    status: "draft",
    isPinned: false,
    isPublic: false,
    createdAt: "2024-03-05T16:45:00",
    updatedAt: "2024-03-06T08:20:00",
    views: 0,
    likes: 0,
    comments: 0,
    tags: ["docker", "nodejs", "devops"],
  },
  {
    id: 5,
    title: "Lưu ý quan trọng cho Bài trắc nghiệm cuối kỳ",
    content: "Bài trắc nghiệm cuối kỳ sẽ diễn ra vào ngày 20/04/2024...",
    courseId: 2,
    courseName: "Node.js Advanced Concepts",
    category: "announcement",
    status: "published",
    isPinned: true,
    isPublic: false,
    createdAt: "2024-03-01T09:15:00",
    updatedAt: "2024-03-01T10:30:00",
    views: 98,
    likes: 12,
    comments: 5,
    tags: ["exam", "important"],
  },
];

// Enum cho tab value
enum TabValue {
  ALL = 0,
  PUBLISHED = 1,
  DRAFT = 2,
  PINNED = 3,
}

const InstructorForum = () => {
  const navigate = useNavigate();

  // State cho các tabs, filter, search
  const [tabValue, setTabValue] = useState<TabValue>(TabValue.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // State cho posts và dialogs
  const [posts, setPosts] = useState(mockForumPosts);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewPostId, setViewPostId] = useState<number | null>(null);

  // Handlers cho menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    postId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // Handler cho tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };

  // Handlers cho dialog
  const handleOpenAddEditDialog = (post?: any) => {
    if (post) {
      setEditingPost(post);
    } else {
      setEditingPost(null);
    }
    setOpenAddEditDialog(true);
    handleMenuClose();
  };

  // Handler cho pin/unpin
  const handleTogglePin = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, isPinned: !post.isPinned } : post
      )
    );
    handleMenuClose();
  };

  // Handler cho visibility
  const handleToggleVisibility = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, isPublic: !post.isPublic } : post
      )
    );
    handleMenuClose();
  };

  // Handler cho delete
  const handleDeleteConfirm = () => {
    if (selectedPost) {
      setPosts(posts.filter((post) => post.id !== selectedPost));
      setOpenDeleteDialog(false);
      handleMenuClose();
    }
  };

  // Handler cho submit form
  const handleSubmitPost = (event: React.FormEvent) => {
    event.preventDefault();
    // Xử lý tạo hoặc cập nhật bài đăng
    setOpenAddEditDialog(false);

    // Nếu là chỉnh sửa, cập nhật post hiện có
    if (editingPost) {
      // Trong thực tế, sẽ gọi API để cập nhật
      const updatedPosts = posts.map((post) =>
        post.id === editingPost.id
          ? { ...post, ...editingPost, updatedAt: new Date().toISOString() }
          : post
      );
      setPosts(updatedPosts);
    } else {
      // Nếu là tạo mới
      const newPost = {
        id: Math.max(...posts.map((p) => p.id)) + 1,
        title: "Bài đăng mới",
        content: "Nội dung bài đăng mới",
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        category: "discussion",
        status: "draft",
        isPinned: false,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        tags: [],
      };
      setPosts([...posts, newPost]);
    }
  };

  // Lọc và sắp xếp bài đăng theo các tiêu chí
  const filteredPosts = posts
    .filter((post) => {
      // Lọc theo tìm kiếm
      if (
        searchQuery &&
        !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo loại
      if (filterCategory !== "all" && post.category !== filterCategory) {
        return false;
      }

      // Lọc theo khóa học
      if (filterCourse !== "all" && post.courseId.toString() !== filterCourse) {
        return false;
      }

      // Lọc theo tab
      if (tabValue === TabValue.PUBLISHED) {
        return post.status === "published";
      } else if (tabValue === TabValue.DRAFT) {
        return post.status === "draft";
      } else if (tabValue === TabValue.PINNED) {
        return post.isPinned;
      }

      return true;
    })
    .sort((a, b) => {
      // Sắp xếp theo trường đã chọn
      let comparison = 0;

      if (sortBy === "updatedAt") {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === "views") {
        comparison = a.views - b.views;
      } else if (sortBy === "comments") {
        comparison = a.comments - b.comments;
      } else if (sortBy === "likes") {
        comparison = a.likes - b.likes;
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Helper function cho định dạng ngày giờ
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Helper function để hiển thị chip category
  const getCategoryChip = (category: string) => {
    switch (category) {
      case "announcement":
        return <Chip label="Thông báo" color="error" size="small" />;
      case "discussion":
        return <Chip label="Thảo luận" color="primary" size="small" />;
      case "question":
        return <Chip label="Câu hỏi" color="warning" size="small" />;
      case "resource":
        return <Chip label="Tài nguyên" color="success" size="small" />;
      default:
        return null;
    }
  };

  // Helper function để hiển thị status
  const getStatusChip = (status: string) => {
    switch (status) {
      case "published":
        return <Chip label="Đã đăng" color="success" size="small" />;
      case "draft":
        return <Chip label="Nháp" color="default" size="small" />;
      case "archived":
        return <Chip label="Đã lưu trữ" color="secondary" size="small" />;
      default:
        return null;
    }
  };

  // Thêm function để mở dialog xem chi tiết
  const handleViewPost = (postId: number) => {
    setViewPostId(postId);
    setOpenViewDialog(true);
    handleMenuClose();
  };

  // Tìm bài đăng đang được xem
  const viewingPost = posts.find((post) => post.id === viewPostId);

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ p: 2 }}
        >
          <Typography variant="h5">Quản lý diễn đàn</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenAddEditDialog()}
          >
            Tạo bài đăng mới
          </Button>
        </Stack>

        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="forum tabs"
          >
            <Tab label="Tất cả" />
            <Tab label="Đã đăng" />
            <Tab label="Nháp" />
            <Tab label="Ghim" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              placeholder="Tìm kiếm bài đăng..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Phân loại</InputLabel>
              <Select
                value={filterCategory}
                label="Phân loại"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="announcement">Thông báo</MenuItem>
                <MenuItem value="discussion">Thảo luận</MenuItem>
                <MenuItem value="question">Câu hỏi</MenuItem>
                <MenuItem value="resource">Tài nguyên</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Khóa học</InputLabel>
              <Select
                value={filterCourse}
                label="Khóa học"
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <MenuItem value="all">Tất cả khóa học</MenuItem>
                <MenuItem value="1">React & TypeScript Masterclass</MenuItem>
                <MenuItem value="2">Node.js Advanced Concepts</MenuItem>
                <MenuItem value="3">DevOps Fundamentals</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => setSortBy(e.target.value)}
                endAdornment={
                  <IconButton
                    size="small"
                    onClick={() =>
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                    sx={{ mr: 2 }}
                  >
                    <Sort
                      fontSize="small"
                      sx={{
                        transform: `rotate(${
                          sortDirection === "asc" ? 0 : 180
                        }deg)`,
                      }}
                    />
                  </IconButton>
                }
                sx={{ pr: 4 }}
              >
                <MenuItem value="updatedAt">Ngày cập nhật</MenuItem>
                <MenuItem value="views">Lượt xem</MenuItem>
                <MenuItem value="comments">Bình luận</MenuItem>
                <MenuItem value="likes">Lượt thích</MenuItem>
                <MenuItem value="title">Tiêu đề</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Phân loại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Tương tác</TableCell>
                  <TableCell>Cập nhật</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ py: 2 }}
                      >
                        Không tìm thấy bài đăng nào phù hợp
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {post.isPinned && (
                            <Tooltip title="Đã ghim">
                              <PushPin
                                fontSize="small"
                                color="warning"
                                sx={{ mr: 1 }}
                              />
                            </Tooltip>
                          )}
                          <Box>
                            <Typography variant="body1">
                              {post.title}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              {post.isPublic ? (
                                <Tooltip title="Công khai">
                                  <Public fontSize="small" color="action" />
                                </Tooltip>
                              ) : (
                                <Tooltip title="Riêng tư (Chỉ học viên)">
                                  <Lock fontSize="small" color="action" />
                                </Tooltip>
                              )}
                              {post.tags.length > 0 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {post.tags.join(", ")}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {post.courseName}
                        </Typography>
                      </TableCell>
                      <TableCell>{getCategoryChip(post.category)}</TableCell>
                      <TableCell>{getStatusChip(post.status)}</TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="center"
                        >
                          <Tooltip title="Lượt xem">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Visibility fontSize="small" color="action" />
                              <Typography variant="body2">
                                {post.views}
                              </Typography>
                            </Stack>
                          </Tooltip>
                          <Tooltip title="Bình luận">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Message fontSize="small" color="action" />
                              <Typography variant="body2">
                                {post.comments}
                              </Typography>
                            </Stack>
                          </Tooltip>
                          <Tooltip title="Lượt thích">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <ThumbUp fontSize="small" color="action" />
                              <Typography variant="body2">
                                {post.likes}
                              </Typography>
                            </Stack>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(post.updatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, post.id)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedPost && handleViewPost(selectedPost)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem bài đăng</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() =>
            selectedPost &&
            handleOpenAddEditDialog(posts.find((p) => p.id === selectedPost))
          }
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => selectedPost && handleDuplicate(selectedPost)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Tạo bản sao</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => selectedPost && handleTogglePin(selectedPost)}>
          <ListItemIcon>
            <PushPin fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {posts.find((p) => p.id === selectedPost)?.isPinned
              ? "Bỏ ghim"
              : "Ghim bài đăng"}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => selectedPost && handleToggleVisibility(selectedPost)}
        >
          <ListItemIcon>
            {posts.find((p) => p.id === selectedPost)?.isPublic ? (
              <Public fontSize="small" />
            ) : (
              <Lock fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {posts.find((p) => p.id === selectedPost)?.isPublic
              ? "Chỉ học viên đã đăng ký"
              : "Công khai"}
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => selectedPost && handleDeleteConfirm()}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa bài đăng</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog thêm/sửa bài đăng */}
      <Dialog
        open={openAddEditDialog}
        onClose={() => setOpenAddEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmitPost}>
          <DialogTitle>
            {editingPost ? "Chỉnh sửa bài đăng" : "Thêm bài đăng mới"}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Tiêu đề"
                fullWidth
                defaultValue={editingPost?.title}
                required
              />

              <TextField
                label="Nội dung"
                fullWidth
                multiline
                rows={10}
                defaultValue={editingPost?.content}
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Khóa học</InputLabel>
                    <Select
                      label="Khóa học"
                      defaultValue={editingPost?.courseId || 1}
                      required
                    >
                      <MenuItem value={1}>
                        React & TypeScript Masterclass
                      </MenuItem>
                      <MenuItem value={2}>Node.js Advanced Concepts</MenuItem>
                      <MenuItem value={3}>DevOps Fundamentals</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Phân loại</InputLabel>
                    <Select
                      label="Phân loại"
                      defaultValue={editingPost?.category || "discussion"}
                      required
                    >
                      <MenuItem value="announcement">Thông báo</MenuItem>
                      <MenuItem value="discussion">Thảo luận</MenuItem>
                      <MenuItem value="question">Câu hỏi</MenuItem>
                      <MenuItem value="resource">Tài nguyên</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      label="Trạng thái"
                      defaultValue={editingPost?.status || "draft"}
                      required
                    >
                      <MenuItem value="draft">Lưu nháp</MenuItem>
                      <MenuItem value="published">Đăng ngay</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Hiển thị cho</InputLabel>
                    <Select
                      label="Hiển thị cho"
                      defaultValue={
                        editingPost
                          ? editingPost.isPublic
                            ? "public"
                            : "enrolled"
                          : "enrolled"
                      }
                      required
                    >
                      <MenuItem value="public">Tất cả (Công khai)</MenuItem>
                      <MenuItem value="enrolled">
                        Chỉ học viên đã đăng ký
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                label="Tags (phân cách bằng dấu phẩy)"
                fullWidth
                defaultValue={editingPost?.tags.join(", ")}
                placeholder="react, typescript, learning"
              />

              <FormControl>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Checkbox
                    defaultChecked={editingPost?.isPinned || false}
                    id="pinned"
                  />
                  <label htmlFor="pinned">
                    Ghim bài đăng này lên đầu diễn đàn
                  </label>
                </Stack>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddEditDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingPost ? "Cập nhật" : "Đăng bài"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa bài đăng?</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn
            tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết bài đăng */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Chi tiết bài đăng</Typography>
            <IconButton onClick={() => setOpenViewDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {viewingPost && (
            <ForumDiscussionDetail
              discussion={{
                id: viewingPost.id,
                title: viewingPost.title,
                content: viewingPost.content,
                author: {
                  id: 1, // ID của giảng viên
                  name: "Instructor", // Tên giảng viên
                  avatar: "/src/assets/avatar.png",
                  role: "instructor",
                },
                createdAt: viewingPost.createdAt,
                updatedAt: viewingPost.updatedAt,
                category: viewingPost.category,
                tags: viewingPost.tags,
                views: viewingPost.views,
                likes: viewingPost.likes,
                isPinned: viewingPost.isPinned,
                comments: Array(viewingPost.comments).fill({
                  id: 1,
                  content: "Mock comment content",
                  author: {
                    id: 2,
                    name: "Student User",
                    avatar: "/src/assets/avatar.png",
                  },
                  createdAt: new Date().toISOString(),
                  likes: 0,
                }),
              }}
              isInstructorView={true} // Thêm prop để chỉ ra rằng đang xem với tư cách giảng viên
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InstructorForum;
