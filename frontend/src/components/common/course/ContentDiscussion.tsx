import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useDispatch, useSelector } from "react-redux";
import {
  createDiscussion,
  deleteDiscussion,
  hideDiscussion,
  fetchLessonDiscussions,
} from "../../../features/discussions/discussionsSlice";
import {
  selectLessonDiscussions,
  selectDiscussionsStatus,
  selectDiscussionsError,
} from "../../../features/discussions/discussionsSelectors";
import { Discussion, DiscussionStatus } from "../../../types/discussion.types";
import { AppDispatch } from "../../../app/store";
import { selectCurrentUser } from "../../../features/auth/authSelectors";

interface ContentDiscussionProps {
  lessonId: number;
  lessonDiscussions?: Discussion[];
  loading?: boolean;
}

const ContentDiscussion: React.FC<ContentDiscussionProps> = ({
  lessonId,
  lessonDiscussions: propDiscussions,
  loading: propLoading,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const discussions = propDiscussions || useSelector(selectLessonDiscussions);
  const status = useSelector(selectDiscussionsStatus);
  const error = useSelector(selectDiscussionsError);
  const currentUser = useSelector(selectCurrentUser);
  const [sortedDiscussions, setSortedDiscussions] = useState<Discussion[]>([]);

  // Thêm state để kiểm soát số lượng thảo luận hiển thị
  const [visibleCount, setVisibleCount] = useState(5);

  // Menu state for each discussion
  const [menuAnchorEl, setMenuAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  // Reply state
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {}
  );
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    const sortedDiscussions = [...(discussions || [])].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedDiscussions(sortedDiscussions);
  }, [dispatch, discussions, status]);

  // Load discussions for this lesson if not provided via props
  useEffect(() => {
    if (!propDiscussions && lessonId) {
      dispatch(fetchLessonDiscussions(lessonId));
    }
  }, [dispatch, lessonId, propDiscussions]);

  // Menu handlers
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    discussionId: number
  ) => {
    setMenuAnchorEl({
      ...menuAnchorEl,
      [discussionId]: event.currentTarget,
    });
  };

  const handleMenuClose = (discussionId: number) => {
    setMenuAnchorEl({
      ...menuAnchorEl,
      [discussionId]: null,
    });
  };

  // Create new discussion
  const handleCreateDiscussion = () => {
    if (newDiscussionContent.trim() && lessonId) {
      dispatch(
        createDiscussion({
          lessonId,
          content: newDiscussionContent.trim(),
        })
      );
      setNewDiscussionContent("");
    }
  };

  // Create reply
  const handleCreateReply = (parentId: number) => {
    const content = replyContent[parentId];
    if (content?.trim() && lessonId) {
      dispatch(
        createDiscussion({
          lessonId,
          parentId,
          content: content.trim(),
        })
      );
      setReplyContent({
        ...replyContent,
        [parentId]: "",
      });
      setReplyingTo(null);
    }
  };

  // Delete discussion
  const handleDeleteDiscussion = (id: number) => {
    dispatch(deleteDiscussion(id));
    handleMenuClose(id);
  };

  // Hide discussion
  const handleHideDiscussion = (id: number) => {
    dispatch(hideDiscussion(id));
    handleMenuClose(id);
  };

  // Toggle reply form
  const toggleReplyForm = (discussionId: number) => {
    setReplyingTo(replyingTo === discussionId ? null : discussionId);
    if (!replyContent[discussionId]) {
      setReplyContent({
        ...replyContent,
        [discussionId]: "",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "không rõ thời gian";
    }
  };

  // Check if current user is the author of the discussion
  const isAuthor = (userId: number) => {
    return Number(currentUser?.id) == userId;
  };

  const isLoading = propLoading || status === "loading";

  // Hàm để hiển thị thêm thảo luận
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  // Lọc thảo luận hiển thị dựa trên visibleCount
  const visibleDiscussions = sortedDiscussions.slice(0, visibleCount);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={3}>
        <Typography color="error">Lỗi: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thảo luận
      </Typography>

      {/* New discussion form */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Viết thảo luận của bạn..."
          value={newDiscussionContent}
          onChange={(e) => setNewDiscussionContent(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleCreateDiscussion}
          disabled={!newDiscussionContent.trim()}
        >
          Gửi
        </Button>
      </Paper>

      {/* List of discussions */}
      {visibleDiscussions.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ my: 2 }}>
          Chưa có thảo luận nào cho bài học này. Hãy là người đầu tiên bình
          luận!
        </Typography>
      ) : (
        visibleDiscussions.map((discussion) => (
          <Paper key={discussion.id} elevation={1} sx={{ p: 2, mb: 3 }}>
            {/* Discussion header */}
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  src={discussion.user?.avatarUrl || ""}
                  alt={discussion.user?.username || "User"}
                >
                  {(discussion.user?.username || "U")[0].toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="subtitle1">
                  {discussion.user?.username || "Unknown User"}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatDate(discussion.createdAt)}
                </Typography>
              </Grid>
              {(isAuthor(Number(discussion?.user?.id)) ||
                currentUser?.role === "admin") && (
                <Grid item>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, discussion.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl[discussion.id]}
                    open={Boolean(menuAnchorEl[discussion.id])}
                    onClose={() => handleMenuClose(discussion.id)}
                  >
                    {currentUser?.role === "instructor" && (
                      <MenuItem
                        onClick={() => handleHideDiscussion(discussion.id)}
                      >
                        Ẩn thảo luận
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => handleDeleteDiscussion(discussion.id)}
                    >
                      Xóa thảo luận
                    </MenuItem>
                  </Menu>
                </Grid>
              )}
            </Grid>

            {/* Discussion content */}
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              {discussion.content}
            </Typography>

            {/* Reply button */}
            <Button
              size="small"
              onClick={() => toggleReplyForm(discussion.id)}
              sx={{ mb: 1 }}
            >
              {replyingTo === discussion.id ? "Hủy trả lời" : "Trả lời"}
            </Button>

            {/* Reply form */}
            {replyingTo === discussion.id && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Viết câu trả lời của bạn..."
                  value={replyContent[discussion.id] || ""}
                  onChange={(e) =>
                    setReplyContent({
                      ...replyContent,
                      [discussion.id]: e.target.value,
                    })
                  }
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={() => handleCreateReply(discussion.id)}
                  disabled={!replyContent[discussion.id]?.trim()}
                >
                  Gửi
                </Button>
              </Box>
            )}

            {/* Replies */}
            {discussion.replies && discussion.replies.length > 0 && (
              <Box sx={{ mt: 2, pl: 2, borderLeft: "2px solid #e0e0e0" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Trả lời ({discussion.replies.length})
                </Typography>
                {discussion.replies.map((reply) => (
                  <Box key={reply.id} sx={{ mb: 2 }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Avatar
                          src={reply.user?.avatarUrl || ""}
                          alt={reply.user?.username || "User"}
                          sx={{ width: 32, height: 32 }}
                        >
                          {(reply.user?.username || "U")[0].toUpperCase()}
                        </Avatar>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle2">
                          {reply.user?.username || "Unknown User"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(reply.createdAt)}
                        </Typography>
                      </Grid>
                      {(isAuthor(Number(reply?.user?.id)) ||
                        currentUser?.role === "admin") && (
                        <Grid item>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, reply.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchorEl[reply.id]}
                            open={Boolean(menuAnchorEl[reply.id])}
                            onClose={() => handleMenuClose(reply.id)}
                          >
                            {currentUser?.role === "instructor" && (
                              <MenuItem
                                onClick={() => handleHideDiscussion(reply.id)}
                              >
                                Ẩn trả lời
                              </MenuItem>
                            )}
                            <MenuItem
                              onClick={() => handleDeleteDiscussion(reply.id)}
                            >
                              Xóa trả lời
                            </MenuItem>
                          </Menu>
                        </Grid>
                      )}
                    </Grid>
                    <Typography variant="body2" sx={{ mt: 1, ml: 5 }}>
                      {reply.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        ))
      )}

      {/* Show more button */}
      {sortedDiscussions.length > visibleCount && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 4 }}>
          <Button variant="outlined" onClick={handleShowMore}>
            Xem thêm thảo luận
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ContentDiscussion;
