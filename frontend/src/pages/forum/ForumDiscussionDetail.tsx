import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Divider,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Visibility,
  Share,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

interface Reply {
  id: number;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

// Mock data cho chi tiết bài thảo luận
const mockDiscussionDetail = {
  id: 1,
  title: "Lập trình web với React và TypeScript",
  content: `
    Xin chào mọi người,
    
    Mình muốn chia sẻ một số kinh nghiệm học và làm việc với React & TypeScript:

    1. Bắt đầu với JavaScript thuần trước
    2. Học TypeScript cơ bản
    3. Thực hành với các dự án nhỏ
    4. Tìm hiểu về React Hooks và Function Components
    5. Áp dụng TypeScript vào React projects

    Mọi người có thêm kinh nghiệm gì không? Hãy chia sẻ nhé!
  `,
  category: "Lập trình",
  author: {
    name: "Alex Johnson",
    avatar: "/src/assets/avatar.png",
    role: "Senior Developer",
    joinDate: "Tham gia từ 01/2023",
  },
  image: "/src/assets/logo.png",
  tags: ["React", "TypeScript", "Frontend", "Web Development"],
  stats: {
    views: 1520,
    replies: 25,
    likes: 142,
  },
  createdAt: "2 ngày trước",
  isLiked: false,
};

// Mock data cho replies
const mockReplies: Reply[] = Array(5)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    content:
      "Cảm ơn bạn đã chia sẻ! Mình cũng đang học React với TypeScript và thấy rất hữu ích. Theo kinh nghiệm của mình, việc hiểu rõ về type system của TypeScript rất quan trọng khi làm việc với React...",
    author: {
      name: `User ${index + 1}`,
      avatar: "/src/assets/avatar.png",
    },
    createdAt: "1 ngày trước",
    likes: Math.floor(Math.random() * 50),
    isLiked: Math.random() > 0.5,
  }));

const ForumDiscussionDetail = () => {
  const { id } = useParams();
  const [liked, setLiked] = useState(mockDiscussionDetail.isLiked);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<Reply[]>(mockReplies);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;

    const newReply: Reply = {
      id: replies.length + 1,
      content: replyContent,
      author: {
        name: "Current User",
        avatar: "/src/assets/avatar.png",
      },
      createdAt: "Vừa xong",
      likes: 0,
      isLiked: false,
    };

    setReplies([newReply, ...replies]);
    setReplyContent("");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Main Discussion */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {mockDiscussionDetail.title}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar
              src={mockDiscussionDetail.author.avatar}
              sx={{ width: 48, height: 48 }}
            />
            <Box>
              <Typography variant="subtitle1">
                {mockDiscussionDetail.author.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mockDiscussionDetail.author.role} •{" "}
                {mockDiscussionDetail.author.joinDate}
              </Typography>
            </Box>
          </Stack>

          {mockDiscussionDetail.image && (
            <Box sx={{ mb: 3 }}>
              <img
                src={mockDiscussionDetail.image}
                alt={mockDiscussionDetail.title}
                style={{
                  width: "30%",
                  height: "auto",
                  borderRadius: 8,
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </Box>
          )}

          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
            {mockDiscussionDetail.content}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {mockDiscussionDetail.tags.map((tag) => (
              <Chip key={tag} label={tag} variant="outlined" size="small" />
            ))}
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={handleLike}>
                {liked ? <ThumbUp color="primary" /> : <ThumbUpOutlined />}
              </IconButton>
              <Typography>{mockDiscussionDetail.stats.likes}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Comment color="action" />
              <Typography>{mockDiscussionDetail.stats.replies}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Visibility color="action" />
              <Typography>{mockDiscussionDetail.stats.views}</Typography>
            </Stack>
            <IconButton>
              <Share />
            </IconButton>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Đăng {mockDiscussionDetail.createdAt}
          </Typography>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trả lời thảo luận
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập nội dung trả lời..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitReply}
            disabled={!replyContent.trim()}
          >
            Đăng trả lời
          </Button>
        </CardContent>
      </Card>

      {/* Replies */}
      <Typography variant="h6" gutterBottom>
        Các trả lời ({replies.length})
      </Typography>
      <Stack spacing={2}>
        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Avatar
                  src={reply.author.avatar}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {reply.author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {reply.createdAt}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {reply.content}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={() => {
                    const updatedReplies = replies.map((r) =>
                      r.id === reply.id
                        ? {
                            ...r,
                            isLiked: !r.isLiked,
                            likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                          }
                        : r
                    );
                    setReplies(updatedReplies);
                  }}
                >
                  {reply.isLiked ? (
                    <ThumbUp color="primary" />
                  ) : (
                    <ThumbUpOutlined />
                  )}
                </IconButton>
                <Typography>{reply.likes}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default ForumDiscussionDetail;
