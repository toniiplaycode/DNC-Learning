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
  CircularProgress,
  FormHelperText,
  Avatar,
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
  Close,
  CloudUpload,
  School,
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
import { selectCoursesByInstructor } from "../../features/courses/coursesSelector";
import { fetchCoursesByInstructor } from "../../features/courses/coursesApiSlice";
import {
  uploadImageToCloudinary,
  createObjectURL,
} from "../../utils/uploadImage";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";

const ForumStatus = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  CLOSED: "closed",
} as const;

const InstructorForum = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const forums = useAppSelector(selectUserForums);
  const courses = useAppSelector(selectCoursesByInstructor);

  // State cho các tabs, filter, search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
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

  // Add state for image preview
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for form values
  const [formValues, setFormValues] = useState({
    title: editingPost?.title || "",
    description: editingPost?.description || "",
    courseId: editingPost?.courseId || "",
    status: editingPost?.status || ForumStatus.ACTIVE,
    thumbnailUrl: editingPost?.thumbnailUrl || "",
  });

  // Add validation state
  const [errors, setErrors] = useState({
    title: false,
    description: false,
    courseId: false,
  });

  // Add state for manual URL input
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchForumsByUserId(currentUser.id));
      dispatch(fetchCoursesByInstructor(currentUser?.userInstructor?.id));
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
        if (filterCourse !== "all" && forum.courseId !== filterCourse) {
          return false;
        }

        // Filter by status
        if (filterStatus !== "all" && forum.status !== filterStatus) {
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
  }, [forums, searchQuery, filterCourse, filterStatus, sortBy, sortDirection]);

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

  const handleOpenAddEditDialog = (post?: any) => {
    if (post) {
      // Set editing post and form values for editing
      setEditingPost(post);
      setFormValues({
        title: post.title || "",
        description: post.description || "",
        courseId: post.courseId || "",
        status: post.status || ForumStatus.ACTIVE,
        thumbnailUrl: post.thumbnailUrl || "",
      });
      // Set image preview if post has thumbnail
      if (post.thumbnailUrl) {
        setImagePreview(post.thumbnailUrl);
      }
    } else {
      // Reset everything for new post
      setEditingPost(null);
      setFormValues({
        title: "",
        description: "",
        courseId: "",
        status: ForumStatus.ACTIVE,
        thumbnailUrl: "",
      });
      setImagePreview("");
    }
    setErrors({
      title: false,
      description: false,
      courseId: false,
    });
    setOpenAddEditDialog(true);
    handleMenuClose();
  };

  // Handler cho delete
  const handleDeleteConfirm = async () => {
    if (!selectedPost) return;

    try {
      await dispatch(deleteForum(Number(selectedPost?.id))).unwrap();
      toast.success("Xóa bài đăng thành công");

      // Refresh forums list
      dispatch(fetchForumsByUserId(currentUser?.id));
    } catch (error: any) {
      console.error("Failed to delete forum:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa bài đăng");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // Add image upload handler
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Show preview immediately
      setImagePreview(createObjectURL(file));

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);

      // Update formValues with new thumbnail URL
      setFormValues((prev) => ({
        ...prev,
        thumbnailUrl: imageUrl,
      }));

      // Show success message
      toast.success("Tải ảnh lên thành công");
    } catch (error) {
      console.error("Error uploading image:", error);
      // Clear preview on error
      setImagePreview("");
      // Show error message
      toast.error("Lỗi khi tải ảnh lên, vui lòng thử lại");
    } finally {
      setIsUploading(false);
    }
  };

  // Add submit handler
  const handleSubmit = async () => {
    // Validate
    const newErrors = {
      title: !formValues.title,
      description: !formValues.description,
      courseId: !formValues.courseId,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert courseId to number before submitting
      const forumData = {
        ...formValues,
        courseId: Number(formValues.courseId), // Convert to number
        userId: currentUser?.id,
      };

      if (editingPost) {
        await dispatch(
          updateForum({
            id: Number(editingPost.id),
            forumData,
          })
        ).unwrap();
        toast.success("Cập nhật bài đăng thành công");
      } else {
        await dispatch(createForum(forumData)).unwrap();
        toast.success("Tạo bài đăng mới thành công");
      }

      setOpenAddEditDialog(false);
      setImagePreview("");
      setManualUrl("");
      setEditingPost(null);
      setFormValues({
        title: "",
        description: "",
        courseId: "", // Reset to empty string
        status: ForumStatus.ACTIVE,
        thumbnailUrl: "",
      });

      dispatch(fetchForumsByUserId(currentUser?.id));
    } catch (error: any) {
      console.error("Failed to save forum:", error);
      toast.error(
        error.response?.data?.message?.[0] || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setIsSubmitting(false);
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

  const editorConfig = {
    height: 300,
    menubar: false,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "searchreplace",
      "visualblocks",
      "fullscreen",
      "insertdatetime",
      "table",
      "code",
      "help",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks | " +
      "bold italic underline | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat | help",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  };

  // Add handleUrlInput function after handleImageUpload
  const handleUrlInput = async (url: string) => {
    setManualUrl(url);
    if (url) {
      try {
        setIsUploading(true);
        // Validate if URL is an image
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        if (response.ok && contentType?.startsWith("image/")) {
          setImagePreview(url);
          setFormValues((prev) => ({
            ...prev,
            thumbnailUrl: url,
          }));
          toast.success("URL ảnh hợp lệ");
        } else {
          toast.error("URL không phải là ảnh hợp lệ");
          setImagePreview("");
          setFormValues((prev) => ({
            ...prev,
            thumbnailUrl: "",
          }));
        }
      } catch (error) {
        console.error("Error validating image URL:", error);
        toast.error("URL không hợp lệ");
        setImagePreview("");
        setFormValues((prev) => ({
          ...prev,
          thumbnailUrl: "",
        }));
      } finally {
        setIsUploading(false);
      }
    } else {
      setImagePreview("");
      setFormValues((prev) => ({
        ...prev,
        thumbnailUrl: "",
      }));
    }
  };

  // Helper function to get status display info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case ForumStatus.ACTIVE:
        return {
          label: "Hoạt động",
          color: "success" as const,
          icon: <Public fontSize="small" color="action" />,
          tooltip: "Công khai",
        };
      case ForumStatus.ARCHIVED:
        return {
          label: "Lưu trữ",
          color: "warning" as const,
          icon: <Lock fontSize="small" color="action" />,
          tooltip: "Đã lưu trữ",
        };
      case ForumStatus.CLOSED:
        return {
          label: "Đã đóng",
          color: "error" as const,
          icon: <Lock fontSize="small" color="action" />,
          tooltip: "Đã đóng",
        };
      default:
        return {
          label: "Không xác định",
          color: "default" as const,
          icon: <Lock fontSize="small" color="action" />,
          tooltip: "Trạng thái không xác định",
        };
    }
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
            sx={{ mb: 3 }}
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
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value={ForumStatus.ACTIVE}>Hoạt động</MenuItem>
                <MenuItem value={ForumStatus.ARCHIVED}>Lưu trữ</MenuItem>
                <MenuItem value={ForumStatus.CLOSED}>Đã đóng</MenuItem>
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

          {filteredForums.length === 0 ? (
            <Box
              sx={{
                py: 10,
                textAlign: "center",
                backgroundColor: (theme) => theme.palette.grey[100],
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Không tìm thấy bài đăng nào phù hợp
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredForums.map((forum) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={forum.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: (theme) => theme.shadows[6],
                        transform: "translateY(-4px)",
                      },
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Status indicator */}
                    <Box
                      sx={{
                        height: 4,
                        width: "100%",
                        backgroundColor: (theme) => {
                          const status = getStatusInfo(forum.status);
                          if (status.color === "success")
                            return theme.palette.success.main;
                          if (status.color === "warning")
                            return theme.palette.warning.main;
                          if (status.color === "error")
                            return theme.palette.error.main;
                          return theme.palette.grey[500];
                        },
                      }}
                    />

                    {/* Card Media */}
                    <Box
                      sx={{
                        height: 140,
                        backgroundImage: `url(${
                          forum.thumbnailUrl || "/src/assets/logo.png"
                        })`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={getStatusInfo(forum.status).label}
                          color={getStatusInfo(forum.status).color}
                          size="small"
                          sx={{
                            fontWeight: "medium",
                            backgroundColor: (theme) =>
                              `${
                                theme.palette[getStatusInfo(forum.status).color]
                                  .main
                              }80`,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          fontWeight: "medium",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {forum.title}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={forum.course?.title}
                          color="primary"
                          variant="outlined"
                          size="small"
                          icon={<School fontSize="small" />}
                          sx={{ maxWidth: "100%" }}
                        />
                      </Box>

                      {/* Interaction Stats */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mt: "auto" }}
                      >
                        <Stack direction="row" spacing={2}>
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

                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(forum.updatedAt)}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        borderTop: 1,
                        borderColor: "divider",
                        p: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewPost(Number(forum.id))}
                      >
                        Xem
                      </Button>

                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, Number(forum.id))}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
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
            handleOpenAddEditDialog(
              forums.find((f) => Number(f.id) === selectedPost)
            )
          }
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            setOpenDeleteDialog(true);
            handleMenuClose();
            setSelectedPost(
              forums.find((f) => Number(f.id) === selectedPost) || null
            );
          }}
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
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={formValues.title}
              required
              error={errors.title}
              helperText={errors.title && "Tiêu đề không được để trống"}
              onChange={(e) => {
                setFormValues({ ...formValues, title: e.target.value });
                setErrors({ ...errors, title: !e.target.value });
              }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nội dung <span style={{ color: "error.main" }}>*</span>
              </Typography>
              <Editor
                apiKey="5t3jqy6e31vy5tirxu45hnjv24i9kppbruiph5sb0rdk8zt6" // Get free API key from TinyMCE
                value={formValues.description}
                init={editorConfig}
                onEditorChange={(content) => {
                  setFormValues({ ...formValues, description: content });
                  setErrors({
                    ...errors,
                    description: !content || content === "<p></p>",
                  });
                }}
              />
              {errors.description && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 1, display: "block" }}
                >
                  Nội dung không được để trống
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Stack spacing={2}>
                {/* URL Input */}
                <TextField
                  fullWidth
                  label="URL ảnh"
                  value={manualUrl}
                  onChange={(e) => handleUrlInput(e.target.value)}
                  placeholder="Nhập URL ảnh..."
                  helperText="Nhập URL ảnh trực tiếp hoặc tải ảnh lên"
                />

                {/* Upload Button */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="forum-image-upload"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="forum-image-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      disabled={isUploading}
                    >
                      {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
                    </Button>
                  </label>
                </Box>

                {/* Image Preview */}
                {imagePreview && (
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      mt: 2,
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "background.paper",
                      }}
                      onClick={() => {
                        setImagePreview("");
                        setManualUrl("");
                        setFormValues((prev) => ({
                          ...prev,
                          thumbnailUrl: "",
                        }));
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                )}
              </Stack>
            </Box>

            <Box
              sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
            >
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                URL Ảnh thu nhỏ hiện tại
              </Typography>

              {formValues.thumbnailUrl ? (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={formValues.thumbnailUrl}
                      alt="Thumbnail"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formValues.thumbnailUrl}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setImagePreview("");
                        setFormValues((prev) => ({
                          ...prev,
                          thumbnailUrl: "",
                        }));
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  Chưa có ảnh thu nhỏ
                </Typography>
              )}
            </Box>

            <Grid container>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={errors.courseId}>
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    label="Khóa học"
                    value={formValues.courseId}
                    required
                    onChange={(e) => {
                      setFormValues({
                        ...formValues,
                        courseId: e.target.value as number, // Ensure it's treated as number
                      });
                      setErrors({ ...errors, courseId: !e.target.value });
                    }}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={Number(course.id)}>
                        {" "}
                        {/* Ensure value is number */}
                        {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.courseId && (
                    <FormHelperText>Vui lòng chọn khóa học</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    label="Trạng thái"
                    value={formValues.status}
                    onChange={(e) =>
                      setFormValues({ ...formValues, status: e.target.value })
                    }
                  >
                    <MenuItem value={ForumStatus.ACTIVE}>Hoạt động</MenuItem>
                    <MenuItem value={ForumStatus.ARCHIVED}>Lưu trữ</MenuItem>
                    <MenuItem value={ForumStatus.CLOSED}>Đã đóng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddEditDialog(false);
              setEditingPost(null);
              setImagePreview("");
              setFormValues({
                title: "",
                description: "",
                courseId: "",
                status: ForumStatus.ACTIVE,
                thumbnailUrl: "",
              });
              setErrors({
                title: false,
                description: false,
                courseId: false,
              });
            }}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting && <CircularProgress size={20} color="inherit" />
            }
          >
            {isSubmitting
              ? editingPost
                ? "Đang cập nhật..."
                : "Đang đăng..."
              : editingPost
              ? "Cập nhật"
              : "Đăng bài"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Xác nhận xóa bài đăng
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn
            tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting && <CircularProgress size={20} color="inherit" />
            }
          >
            {isSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
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
