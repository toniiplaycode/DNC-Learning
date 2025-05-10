import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  TextField,
  Button,
  IconButton,
  Divider,
  Pagination,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  Send,
  Reply,
  ExpandMore,
  ExpandLess,
  Sort,
  DeleteOutline,
} from "@mui/icons-material";
import ScrollOnTop from "./ScrollOnTop";
import {
  selectCurrentForum,
  selectForumsStatus,
} from "../../features/forums/forumsSelectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createForumReply,
  fetchForumById,
  removeForumReply,
  toggleLikeForum,
} from "../../features/forums/forumsApiSlice";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { createNotification } from "../../features/notifications/notificationsSlice";

interface ForumUser {
  id: number | string;
  username: string;
  role: string;
  avatarUrl?: string;
}

interface ForumReply {
  id: number | string;
  replyId: number | string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ForumUser;
  likeCount?: number;
  isLiked?: boolean;
}

interface ForumDiscussion {
  id: number | string;
  courseId: number | string;
  userId: number | string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number | string;
    title: string;
  };
  user?: ForumUser;
  replies?: ForumReply[];
  replyCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  views?: number;
  isPinned?: boolean;
}

interface ForumDiscussionDetailProps {
  discussion?: ForumDiscussion;
  onReplySubmit?: (
    forumId: number,
    content: string,
    replyId: number | null
  ) => Promise<void>;
  onReplyDelete?: (replyId: number) => Promise<void>;
  onLikeToggle?: (forumId: number) => Promise<void>;
}

const ForumDiscussionDetail = ({
  discussion: propDiscussion,
  onReplySubmit,
  onReplyDelete,
  onLikeToggle,
}: ForumDiscussionDetailProps) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const currentForum = useAppSelector(selectCurrentForum);
  const status = useAppSelector(selectForumsStatus);
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(true);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const commentsPerPage = 5;
  const currentUser = useSelector(selectCurrentUser);
  const commentFormRef = useRef<HTMLDivElement>(null);

  // Thêm state cho dialog xác nhận xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<number | null>(null);

  const discussion = useMemo(
    () => propDiscussion || currentForum,
    [propDiscussion, currentForum]
  );

  useEffect(() => {
    if (id && !propDiscussion) {
      dispatch(fetchForumById(Number(id)));
    }
  }, [id, dispatch, propDiscussion, comment]);

  useEffect(() => {
    if (discussion) {
      setIsLiked(discussion.isLiked || false);
      setLikeCount(discussion.likeCount || 0);
    }
  }, [discussion?.id, discussion?.isLiked, discussion?.likeCount]);

  if (!discussion && status === "loading") {
    return <Typography>Đang tải thảo luận...</Typography>;
  }

  if (!discussion) {
    return <Typography>Không tìm thấy thảo luận</Typography>;
  }

  const handleReplyClick = (replyId: number) => {
    setReplyingTo(replyId);
    // Scroll to comment form
    setTimeout(() => {
      commentFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  // Tổ chức replies theo cấu trúc phân cấp
  const topLevelReplies =
    discussion.replies?.filter((reply) => reply.replyId === null) || [];
  const nestedReplies =
    discussion.replies?.filter((reply) => reply.replyId !== null) || [];

  // Hàm lấy replies con
  const getChildReplies = (parentId: number | string) => {
    return nestedReplies.filter((reply) => reply.replyId === parentId);
  };

  // Sắp xếp và phân trang comments
  const sortedReplies = [...topLevelReplies].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const indexOfLastComment = page * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = sortedReplies.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(sortedReplies.length / commentsPerPage);

  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    newSort: "newest" | "oldest"
  ) => {
    if (newSort !== null) {
      setSortOrder(newSort);
      setPage(1); // Reset về trang 1 khi thay đổi sắp xếp
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Scroll to comments section
    const commentsSection = document.getElementById("comments-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmitComment = async () => {
    if (comment.trim() && discussion) {
      try {
        let newReply;
        if (onReplySubmit) {
          newReply = await onReplySubmit(
            Number(discussion.id),
            comment,
            replyingTo
          );
        } else {
          // Fallback to original behavior
          newReply = await dispatch(
            createForumReply({
              content: comment,
              forumId: Number(discussion.id),
              replyId: replyingTo,
            })
          ).unwrap();
        }

        // Handle notifications
        if (newReply) {
          // Notify discussion owner if the commenter is not the owner
          if (discussion.user?.id !== currentUser?.id) {
            const ownerNotification = {
              userIds: [discussion.user?.id],
              title: "Bình luận mới trong bài viết của bạn",
              content: `${currentUser?.username} đã bình luận trong bài viết "${discussion.title}"`,
              type: "message",
            };
            dispatch(createNotification(ownerNotification));
          }

          // If this is a reply to another comment, notify that user
          if (replyingTo) {
            const parentReply = discussion.replies?.find(
              (reply) => reply.id == replyingTo
            );
            if (parentReply && parentReply.user.id != currentUser?.id) {
              const replyNotification = {
                userIds: [parentReply.user.id],
                title: "Phản hồi mới cho bình luận của bạn",
                content: `${currentUser?.username} đã trả lời bình luận của bạn trong "${discussion.title}"`,
                type: "message",
              };
              dispatch(createNotification(replyNotification));
            }
          }
        }

        // Reset form state
        setComment("");
        setReplyingTo(null);

        // Refresh discussion data
        dispatch(fetchForumById(Number(discussion.id)));
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleDeleteReply = async () => {
    if (replyToDelete) {
      try {
        if (onReplyDelete) {
          await onReplyDelete(replyToDelete);
        } else {
          await dispatch(removeForumReply(replyToDelete));
          if (discussion?.id) {
            dispatch(fetchForumById(Number(discussion.id)));
          }
        }
        handleCloseDeleteDialog();
      } catch (error) {
        console.error("Error deleting reply:", error);
      }
    }
  };

  const handleLikeClick = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

      if (onLikeToggle && discussion) {
        await onLikeToggle(Number(discussion.id));
      } else {
        await dispatch(toggleLikeForum(Number(discussion.id)));
      }
    } catch (error) {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      console.error("Error toggling like:", error);
    }
  };

  // Kiểm tra xem bình luận có phải của user hiện tại không
  const isCurrentUserReply = (reply: ForumReply) => {
    return currentUser?.id === reply.user.id;
  };

  // Xử lý mở dialog xác nhận xóa
  const handleOpenDeleteDialog = (replyId: number) => {
    setReplyToDelete(replyId);
    setDeleteDialogOpen(true);
  };

  // Xử lý đóng dialog xác nhận xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReplyToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2, mt: 2 }}>
      <ScrollOnTop />

      {/* Main post card styled like social media */}
      <Card
        sx={{
          my: 2,
          px: 2,
          borderRadius: 2,
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* User header like social media */}
        <CardContent sx={{ pb: 1 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Avatar
              src={discussion.user?.avatarUrl || "/src/assets/logo.png"}
              alt={discussion.user?.username || "User"}
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {discussion.user?.username || "Người dùng"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(discussion.createdAt)}
              </Typography>
            </Box>
            <IconButton size="small">
              <Share fontSize="small" />
            </IconButton>
          </Stack>

          {/* Post title like a status update */}
          <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 400 }}>
            {discussion.title}
          </Typography>
        </CardContent>

        {/* Media content takes full width - no padding */}
        {discussion.thumbnailUrl && (
          <Box
            sx={{
              width: "100%",
              maxHeight: "500px",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={discussion.thumbnailUrl || "/src/assets/logo.png"}
              alt={discussion.title}
              style={{
                minWidth: "80%",
                maxWidth: "80%",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </Box>
        )}

        {/* Post content */}
        <CardContent sx={{ pt: 2 }}>
          <Box
            sx={{
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                fontSize: {
                  h1: "1.5rem",
                  h2: "1.3rem",
                  h3: "1.15rem",
                  h4: "1rem",
                  h5: "0.9rem",
                  h6: "0.85rem",
                },
                fontWeight: 500,
                mb: 1.5,
              },
              "& p, & div": {
                mb: 1.5,
                lineHeight: 1.5,
                fontSize: "0.95rem",
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 1,
                mb: 1.5,
              },
            }}
            dangerouslySetInnerHTML={{ __html: discussion.description }}
          />

          {/* Course tag */}
          {discussion.course && (
            <Chip
              label={discussion.course.title}
              size="small"
              sx={{
                mt: 1,
                mr: 1,
                fontSize: "0.75rem",
                borderRadius: "4px",
                bgcolor: "action.hover",
                color: "text.primary",
              }}
            />
          )}
        </CardContent>

        {/* Social interaction buttons */}
        <Box
          sx={{ px: 2, py: 1, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Button
              startIcon={
                isLiked ? (
                  <ThumbUp fontSize="small" color="primary" />
                ) : (
                  <ThumbUpOutlined fontSize="small" />
                )
              }
              onClick={handleLikeClick}
              sx={{
                color: isLiked ? "primary.main" : "text.secondary",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "transparent",
                  color: isLiked ? "primary.dark" : "text.primary",
                },
              }}
            >
              {likeCount > 0 ? `Thích (${likeCount})` : "Thích"}
            </Button>

            <Button
              startIcon={<Comment fontSize="small" />}
              onClick={() => {
                setShowComments(!showComments);
                if (!showComments) {
                  setTimeout(() => {
                    document
                      .getElementById("comments-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                "&:hover": { bgcolor: "transparent", color: "text.primary" },
              }}
            >
              {discussion.replyCount > 0
                ? `Bình luận (${discussion.replyCount})`
                : "Bình luận"}
            </Button>
          </Stack>
        </Box>
      </Card>

      {/* Comments section like social media */}
      <Collapse in={showComments}>
        <Card
          id="comments-section"
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            mb: 2,
            boxShadow: "none",
          }}
        >
          {/* Comment form */}
          <CardContent sx={{ pb: 1 }} ref={commentFormRef}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                src={currentUser?.avatarUrl || "/src/assets/logo.png"}
                alt={currentUser?.username || "User"}
                sx={{ width: 36, height: 36 }}
              />
              <Box sx={{ flex: 1 }}>
                {replyingTo && (
                  <Chip
                    label="Đang trả lời bình luận"
                    onDelete={() => setReplyingTo(null)}
                    size="small"
                    sx={{ mb: 1, fontSize: "0.75rem" }}
                  />
                )}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Viết bình luận của bạn..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSubmitComment}
                          disabled={!comment.trim()}
                          color="primary"
                          size="small"
                        >
                          <Send fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 4,
                      bgcolor: "action.hover",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            </Stack>
          </CardContent>

          <Divider />

          {/* Comment sorting options */}
          <Box sx={{ px: 2, py: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                {discussion.replyCount || 0} bình luận
              </Typography>
              <ToggleButtonGroup
                value={sortOrder}
                exclusive
                onChange={handleSortChange}
                size="small"
              >
                <ToggleButton
                  value="newest"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.75rem",
                    textTransform: "none",
                    borderRadius: "4px",
                  }}
                >
                  Mới nhất
                </ToggleButton>
                <ToggleButton
                  value="oldest"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.75rem",
                    textTransform: "none",
                    borderRadius: "4px",
                  }}
                >
                  Cũ nhất
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          <Divider />

          {/* Comments list styled like social media */}
          <Box sx={{ maxHeight: "600px", overflow: "auto" }}>
            {currentComments.length > 0 ? (
              currentComments.map((reply) => (
                <Box
                  key={reply.id}
                  sx={{
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={1.5}>
                    <Avatar
                      src={reply.user?.avatarUrl || "/src/assets/logo.png"}
                      alt={reply.user?.username || "User"}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          bgcolor: "action.hover",
                          p: 1.5,
                          borderRadius: "12px",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={500}
                          display="inline"
                        >
                          {reply.user?.username || "Người dùng"}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {reply.content}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={2} sx={{ ml: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {formatDate(reply.createdAt)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => handleReplyClick(Number(reply.id))}
                        >
                          Trả lời
                        </Typography>
                        {isCurrentUserReply(reply) && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={() =>
                              handleOpenDeleteDialog(Number(reply.id))
                            }
                          >
                            Xóa
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Child replies */}
                  {getChildReplies(reply.id).length > 0 && (
                    <Box sx={{ pl: 6, mt: 1 }}>
                      {getChildReplies(reply.id).map((childReply) => (
                        <Box key={childReply.id} sx={{ mb: 1 }}>
                          <Stack direction="row" spacing={1.5}>
                            <Avatar
                              src={
                                childReply.user?.avatarUrl ||
                                "/src/assets/logo.png"
                              }
                              alt={childReply.user?.username || "User"}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  bgcolor: "action.hover",
                                  p: 1,
                                  borderRadius: "12px",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={500}
                                  display="inline"
                                  fontSize="0.85rem"
                                >
                                  {childReply.user?.username || "Người dùng"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontSize="0.85rem"
                                  sx={{ mt: 0.5 }}
                                >
                                  {childReply.content}
                                </Typography>
                              </Box>

                              <Stack direction="row" spacing={2} sx={{ ml: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontSize="0.7rem"
                                >
                                  {formatDate(childReply.createdAt)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontSize="0.7rem"
                                  sx={{
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                  onClick={() =>
                                    handleReplyClick(Number(childReply.id))
                                  }
                                >
                                  Trả lời
                                </Typography>
                                {isCurrentUserReply(childReply) && (
                                  <Typography
                                    variant="caption"
                                    color="error"
                                    fontSize="0.7rem"
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                    onClick={() =>
                                      handleOpenDeleteDialog(
                                        Number(childReply.id)
                                      )
                                    }
                                  >
                                    Xóa
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </Typography>
              </Box>
            )}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                size="small"
                shape="rounded"
              />
            </Box>
          )}
        </Card>
      </Collapse>

      {/* Dialog xác nhận xóa bình luận */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bình luận này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteReply} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default React.memo(ForumDiscussionDetail);
