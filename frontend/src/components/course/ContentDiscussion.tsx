import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { MoreVert, ThumbUp, ThumbUpOutlined, Reply } from "@mui/icons-material";

interface Comment {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
    role: "student" | "instructor";
  };
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface ContentDiscussionProps {
  contentId: number;
  contentTitle: string;
}

const mockComments: Comment[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: "John Doe",
      avatar: "/src/assets/avatar.png",
      role: "student",
    },
    content: "Làm thế nào để xử lý re-render tối ưu trong React?",
    createdAt: "2 giờ trước",
    replies: [
      {
        id: 2,
        user: {
          id: 2,
          name: "Instructor Alex",
          avatar: "/src/assets/avatar.png",
          role: "instructor",
        },
        content: `Để tối ưu re-render trong React, bạn có thể:
        1. Sử dụng React.memo() cho component
        2. Tối ưu useCallback và useMemo
        3. Tránh inline function trong props
        4. Phân chia component hợp lý`,
        createdAt: "1 giờ trước",
      },
    ],
  },
];

const CommentItem = ({
  comment,
  isReply = false,
}: {
  comment: Comment;
  isReply?: boolean;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Card sx={{ mb: 2, boxShadow: 0, ml: isReply ? 6 : 0 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar src={comment.user.avatar} />
          <Box sx={{ flex: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">{comment.user.name}</Typography>
                {comment.user.role === "instructor" && (
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    Giảng viên
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {comment.createdAt}
                </Typography>
              </Stack>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Stack>

            <Typography sx={{ my: 1, whiteSpace: "pre-line" }}>
              {comment.content}
            </Typography>

            <Stack direction="row" spacing={2}>
              {!isReply && (
                <Button
                  size="small"
                  startIcon={<Reply />}
                  sx={{ color: "text.secondary" }}
                >
                  Trả lời
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Chỉnh sửa</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Xóa</MenuItem>
      </Menu>
    </Card>
  );
};

const ContentDiscussion: React.FC<ContentDiscussionProps> = ({
  contentId,
  contentTitle,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    // Handle submit comment
    setNewComment("");
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thảo luận
      </Typography>

      {/* Comment form */}
      <Card sx={{ mb: 4, boxShadow: 0 }}>
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            disabled={!newComment.trim()}
            onClick={handleSubmitComment}
          >
            Đăng bình luận
          </Button>
        </CardContent>
      </Card>

      {/* Comments list */}
      <Stack spacing={2}>
        {mockComments.map((comment) => (
          <Box key={comment.id}>
            <CommentItem comment={comment} />
            {comment.replies?.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ContentDiscussion;
