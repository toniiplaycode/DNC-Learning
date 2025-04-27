import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
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
import {
  toggleLikeForum,
  createForumReply,
  fetchForumsByUserId,
  removeForumReply,
} from "../../features/forums/forumsApiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserForums } from "../../features/forums/forumsSelectors";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  updateForum,
  deleteForum,
  createForum,
} from "../../features/forums/forumsApiSlice";

const InstructorForum = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const forums = useAppSelector(selectUserForums);

  // State cho các tabs, filter, search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // State cho posts và dialogs
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewPostId, setViewPostId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchForumsByUserId(currentUser.id));
    }
  }, [dispatch, currentUser]);

  // Filter forums based on current filters
  const filteredForums = useMemo(() => {
    return forums
      .filter((forum) => {
        // Filter by search
        if (
          searchQuery &&
          !forum.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !forum.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Filter by course
        if (filterCourse !== "all" && forum.course?.id !== filterCourse) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const multiplier = sortDirection === "desc" ? -1 : 1;

        switch (sortBy) {
          case "updatedAt":
            return (
              multiplier *
              (new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime())
            );

          case "replyCount":
            return multiplier * ((b.replyCount || 0) - (a.replyCount || 0));

          case "likeCount":
            return multiplier * ((b.likeCount || 0) - (a.likeCount || 0));

          case "title":
            return multiplier * a.title.localeCompare(b.title);

          default:
            return 0;
        }
      });
  }, [forums, searchQuery, filterCourse, sortBy, sortDirection]);

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
  const handleTogglePin = (forumId: number) => {
    dispatch(
      updateForum({
        id: forumId,
        changes: {
          isPinned: !forums.find((f) => f.id === forumId)?.isPinned,
        },
      })
    );
    handleMenuClose();
  };

  // Handler cho visibility
  const handleToggleVisibility = (forumId: number) => {
    dispatch(
      updateForum({
        id: forumId,
        changes: {
          status:
            forums.find((f) => f.id === forumId)?.status === "active"
              ? "draft"
              : "active",
        },
      })
    );
    handleMenuClose();
  };

  // Handler cho delete
  const handleDeleteConfirm = () => {
    if (selectedPost) {
      dispatch(deleteForum(selectedPost));
      setOpenDeleteDialog(false);
      handleMenuClose();
    }
  };

  // Handler cho submit form
  const handleSubmitPost = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    try {
      if (editingPost) {
        // Update existing forum
        await dispatch(
          updateForum({
            id: editingPost.id,
            changes: {
              title: formData.get("title") as string,
              description: formData.get("content") as string,
              courseId: formData.get("courseId") as string,
              status: formData.get("status") as string,
              // ...other fields
            },
          })
        ).unwrap();
      } else {
        // Create new forum
        await dispatch(
          createForum({
            title: formData.get("title") as string,
            description: formData.get("content") as string,
            courseId: formData.get("courseId") as string,
            status: formData.get("status") as string,
            // ...other fields
          })
        ).unwrap();
      }
      setOpenAddEditDialog(false);
    } catch (error) {
      console.error("Failed to save forum:", error);
    }
  };

  // Helper function cho định dạng ngày giờ
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Thêm function để mở dialog xem chi tiết
  const handleViewPost = (postId: number) => {
    setViewPostId(postId);
    setOpenViewDialog(true);
    handleMenuClose();
  };

  // Tìm bài đăng đang được xem
  const viewingForum = forums.find((forum) => Number(forum.id) === viewPostId);

  // Add useMemo to get unique courses from forums
  const courseOptions = useMemo(() => {
    const uniqueCourses = new Map();

    // Add "All courses" option
    uniqueCourses.set("all", { id: "all", title: "Tất cả khóa học" });

    // Add courses from forums
    forums.forEach((forum) => {
      if (forum.course) {
        uniqueCourses.set(forum.course.id, forum.course);
      }
    });

    return Array.from(uniqueCourses.values());
  }, [forums]);

  const handleReplySubmit = async (
    forumId: number,
    content: string,
    replyId: number | null
  ) => {
    await dispatch(createForumReply({ forumId, content, replyId }));
    // Fetch updated forums
    dispatch(fetchForumsByUserId(currentUser.id));
  };

  const handleReplyDelete = async (replyId: number) => {
    await dispatch(removeForumReply(replyId));
    // Fetch updated forums
    dispatch(fetchForumsByUserId(currentUser.id));
  };

  const handleLikeToggle = async (forumId: number) => {
    await dispatch(toggleLikeForum(forumId));
    // Fetch updated forums
    dispatch(fetchForumsByUserId(currentUser.id));
  };

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
          <Typography variant="h5" fontWeight={"bold"}>
            Quản lý diễn đàn
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenAddEditDialog()}
          >
            Tạo bài đăng mới
          </Button>
        </Stack>

        <Divider />

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
                {courseOptions.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => setSortBy(e.target.value)}
                endAdornment={
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    }}
                    sx={{ mr: 2 }}
                  >
                    <Sort
                      fontSize="small"
                      sx={{
                        transform: `rotate(${
                          sortDirection === "asc" ? 0 : 180
                        }deg)`,
                        transition: "transform 0.2s ease-in-out",
                      }}
                    />
                  </IconButton>
                }
                sx={{ pr: 4 }}
              >
                <MenuItem value="updatedAt">Ngày cập nhật</MenuItem>
                <MenuItem value="replyCount">Bình luận</MenuItem>
                <MenuItem value="likeCount">Lượt thích</MenuItem>
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
                  <TableCell align="center">Tương tác</TableCell>
                  <TableCell>Cập nhật</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredForums.length === 0 ? (
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
                  filteredForums.map((forum) => (
                    <TableRow key={forum.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {forum.isPinned && (
                            <Tooltip title="Đã ghim">
                              <PushPin fontSize="small" color="warning" />
                            </Tooltip>
                          )}
                          <Box>
                            <Typography variant="body1">
                              {forum.title}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Tooltip
                                title={
                                  forum.status === "active"
                                    ? "Công khai"
                                    : "Nháp"
                                }
                              >
                                {forum.status === "active" ? (
                                  <Public fontSize="small" color="action" />
                                ) : (
                                  <Lock fontSize="small" color="action" />
                                )}
                              </Tooltip>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {forum.course?.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={forum.status === "active" ? "Đã đăng" : "Nháp"}
                          color={
                            forum.status === "active" ? "success" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="center"
                        >
                          <Tooltip title="Bình luận">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Message fontSize="small" color="action" />
                              <Typography variant="body2">
                                {forum.replyCount}
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
                                {forum.likeCount}
                              </Typography>
                            </Stack>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(forum.updatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, Number(forum.id))}
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
            handleOpenAddEditDialog(forums.find((f) => f.id === selectedPost))
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
            {forums.find((f) => f.id === selectedPost)?.isPinned
              ? "Bỏ ghim"
              : "Ghim bài đăng"}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => selectedPost && handleToggleVisibility(selectedPost)}
        >
          <ListItemIcon>
            {forums.find((f) => f.id === selectedPost)?.status === "active" ? (
              <Public fontSize="small" />
            ) : (
              <Lock fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {forums.find((f) => f.id === selectedPost)?.status === "active"
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
                name="title"
              />

              <TextField
                label="Nội dung"
                fullWidth
                multiline
                rows={10}
                defaultValue={editingPost?.content}
                required
                name="content"
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Khóa học</InputLabel>
                    <Select
                      label="Khóa học"
                      defaultValue={editingPost?.courseId || 1}
                      required
                      name="courseId"
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
                      name="category"
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
                      name="status"
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
                      name="visibility"
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
                name="tags"
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
          {viewingForum && (
            <ForumDiscussionDetail
              discussion={{
                id: viewingForum.id,
                courseId: viewingForum.courseId,
                userId: viewingForum.userId,
                title: viewingForum.title,
                description: viewingForum.description,
                thumbnailUrl: viewingForum.thumbnailUrl,
                status: viewingForum.status,
                createdAt: viewingForum.createdAt,
                updatedAt: viewingForum.updatedAt,
                course: viewingForum.course && {
                  id: viewingForum.course.id,
                  title: viewingForum.course.title,
                },
                user: viewingForum.user && {
                  id: viewingForum.user.id,
                  username: viewingForum.user.username,
                  avatarUrl: viewingForum.user.avatarUrl,
                  role: viewingForum.user.role,
                },
                replies: viewingForum.replies,
                replyCount: viewingForum.replyCount,
                likeCount: viewingForum.likeCount,
                isLiked: viewingForum.isLiked,
              }}
              onReplySubmit={handleReplySubmit}
              onReplyDelete={handleReplyDelete}
              onLikeToggle={handleLikeToggle}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InstructorForum;
