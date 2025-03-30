import { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Visibility,
  Share,
  Send,
  Reply,
  ExpandMore,
  ExpandLess,
  Sort,
} from "@mui/icons-material";
import ScrollOnTop from "./ScrollOnTop";
import {
  selectCurrentForum,
  selectForumsStatus,
} from "../../features/forums/forumsSelectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchForumById } from "../../features/forums/forumsApiSlice";
import { useParams } from "react-router-dom";

interface ForumUser {
  id: number | string;
  username: string;
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
}

const ForumDiscussionDetail = ({
  discussion: propDiscussion,
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

  const discussion = propDiscussion || currentForum;

  useEffect(() => {
    if (id && !propDiscussion) {
      dispatch(fetchForumById(Number(id)));
    }
    // Khởi tạo trạng thái like từ discussion
    if (discussion) {
      setIsLiked(discussion.isLiked || false);
      setLikeCount(discussion.likeCount || 0);
    }
  }, [id, dispatch, propDiscussion, discussion]);

  if (!discussion && status === "loading") {
    return <Typography>Đang tải thảo luận...</Typography>;
  }

  if (!discussion) {
    return <Typography>Không tìm thấy thảo luận</Typography>;
  }

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

  const handleSubmitComment = () => {
    if (comment.trim()) {
      console.log("Gửi bình luận:", {
        content: comment,
        forumId: discussion.id,
        replyId: replyingTo,
      });
      setComment("");
      setReplyingTo(null);
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

  const handleLikeClick = async () => {
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

      // Gọi API like/unlike
      // await dispatch(toggleForumLike(discussion.id));

      // Nếu có lỗi thì revert lại
    } catch (error) {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      console.error("Error toggling like:", error);
    }
  };

  // Render một reply và các phản hồi con của nó
  const renderReply = (reply: ForumReply) => {
    const childReplies = getChildReplies(reply.id);

    return (
      <Box key={reply.id} sx={{ mb: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2}>
              <Avatar
                src={
                  reply.user?.avatarUrl
                    ? `/src/assets/${reply.user.avatarUrl}`
                    : undefined
                }
                alt={reply.user?.username || "User"}
              />
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1">
                    {reply.user?.username || "Người dùng"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(reply.createdAt)}
                  </Typography>
                </Stack>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {reply.content}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => setReplyingTo(Number(reply.id))}
                  >
                    <Reply fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Hiển thị các phản hồi con */}
        {childReplies.length > 0 && (
          <Box sx={{ pl: 6, mt: 1 }}>
            {childReplies.map((childReply) => (
              <Card key={childReply.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      src={
                        childReply.user?.avatarUrl
                          ? `/src/assets/${childReply.user.avatarUrl}`
                          : undefined
                      }
                      alt={childReply.user?.username || "User"}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="subtitle1">
                          {childReply.user?.username || "Người dùng"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(childReply.createdAt)}
                        </Typography>
                      </Stack>

                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {childReply.content}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => setReplyingTo(Number(childReply.id))}
                        >
                          <Reply fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ScrollOnTop />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={
                  discussion.user?.avatarUrl
                    ? `/src/assets/${discussion.user.avatarUrl}`
                    : discussion.thumbnailUrl
                    ? `/src/assets/${discussion.thumbnailUrl}`
                    : "/src/assets/logo.png"
                }
                alt={discussion.user?.username || "User"}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1">
                    {discussion.user?.username || "Người dùng"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {formatDate(discussion.createdAt)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <IconButton>
                <Share />
              </IconButton>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <img
              src={
                discussion.thumbnailUrl
                  ? discussion.thumbnailUrl
                  : "/src/assets/logo.png"
              }
              alt={discussion.title}
              style={{ width: "300px", height: "300px" }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {discussion.title}
            </Typography>
          </Box>

          {/* Hiển thị description với HTML */}
          <Box
            sx={{
              mt: 2,
              mb: 3,
              // Heading styles
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                fontSize: (theme) => ({
                  h1: "2rem",
                  h2: "1.5rem",
                  h3: "1.3rem",
                  h4: "1.1rem",
                  h5: "1rem",
                  h6: "0.9rem",
                }),
                fontWeight: 600,
                mb: 2,
                color: "primary.main",
              },
              // Paragraph and text styles
              "& p, & div": {
                mb: 2,
                lineHeight: 1.6,
              },
              // List styles
              "& ul, & ol": {
                pl: 3,
                mb: 2,
              },
              "& li": {
                mb: 1,
              },
              // Table styles
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                mb: 2,
              },
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                p: 1,
              },
              // Link styles
              "& a": {
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              },
              // Blockquote styles
              "& blockquote": {
                borderLeft: "4px solid",
                borderColor: "primary.main",
                pl: 2,
                py: 1,
                my: 2,
                bgcolor: "action.hover",
              },
              // Code styles
              "& code, & pre": {
                fontFamily: "monospace",
                bgcolor: "action.hover",
                p: 1,
                borderRadius: 1,
              },
              // Image styles
              "& img": {
                maxWidth: "100%",
                height: "auto",
              },
            }}
            dangerouslySetInnerHTML={{ __html: discussion.description }}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {discussion.course && (
              <Chip
                label={discussion.course.title}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                ml: "auto", // Đẩy về bên phải
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  "&:hover": {
                    color: "text.primary",
                  },
                }}
              >
                <Comment fontSize="small" />
                <Typography variant="body2">
                  {discussion.replyCount || 0}
                </Typography>
              </Box>

              <Box
                onClick={handleLikeClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  color: isLiked ? "primary.main" : "text.secondary",
                  "&:hover": {
                    color: isLiked ? "primary.dark" : "text.primary",
                  },
                  transition: "color 0.2s ease",
                }}
              >
                {isLiked ? (
                  <ThumbUp fontSize="small" />
                ) : (
                  <ThumbUpOutlined fontSize="small" />
                )}
                <Typography variant="body2">{likeCount}</Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box id="comments-section">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={() => setShowComments(!showComments)}
            sx={{
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Typography variant="h6">
              Bình luận ({discussion.replyCount || 0})
            </Typography>
            <IconButton size="small">
              {showComments ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>

          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={handleSortChange}
            size="small"
            aria-label="comment sort order"
          >
            <ToggleButton
              value="newest"
              aria-label="sort by newest"
              sx={{
                px: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Sort sx={{ transform: "scaleY(-1)" }} />
                <Typography variant="body2">Mới nhất</Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton
              value="oldest"
              aria-label="sort by oldest"
              sx={{
                px: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Sort />
                <Typography variant="body2">Cũ nhất</Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Collapse in={showComments}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {replyingTo ? "Trả lời bình luận" : "Thêm bình luận"}
              </Typography>
              {replyingTo && (
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label="Đang trả lời bình luận"
                    onDelete={() => setReplyingTo(null)}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Viết bình luận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                endIcon={<Send />}
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
              >
                Gửi bình luận
              </Button>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            {currentComments.map((reply) => renderReply(reply))}
          </Stack>

          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
                mb: 2,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Collapse>
      </Box>
    </Container>
  );
};

export default ForumDiscussionDetail;
