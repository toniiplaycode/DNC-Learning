import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { FavoriteOutlined, ChatBubbleOutline } from "@mui/icons-material";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  image: string;
  likes: number;
  comments: number;
}

const featuredPosts: BlogPost[] = [
  {
    id: 1,
    title: "10 Xu hướng công nghệ nổi bật 2024",
    excerpt:
      "Khám phá những công nghệ đang định hình tương lai của ngành phần mềm và AI...",
    author: {
      name: "Tech Insider",
      avatar: "/src/assets/blog/authors/tech-insider.png",
    },
    date: "15/03/2024",
    readTime: "5 phút",
    image: "/src/assets/blog/tech-trends.png",
    likes: 245,
    comments: 89,
  },
  {
    id: 2,
    title: "Cách xây dựng thói quen học tập hiệu quả",
    excerpt:
      "Phương pháp học tập khoa học và bền vững dành cho người đi làm...",
    author: {
      name: "Learning Expert",
      avatar: "/src/assets/blog/authors/learning-expert.png",
    },
    date: "14/03/2024",
    readTime: "7 phút",
    image: "/src/assets/blog/learning-habits.png",
    likes: 189,
    comments: 56,
  },
  {
    id: 3,
    title: "Tương lai của AI trong giáo dục",
    excerpt: "AI đang thay đổi cách chúng ta dạy và học như thế nào...",
    author: {
      name: "AI Educator",
      avatar: "/src/assets/blog/authors/ai-educator.png",
    },
    date: "13/03/2024",
    readTime: "6 phút",
    image: "/src/assets/blog/ai-education.png",
    likes: 312,
    comments: 94,
  },
];

const FeaturedPosts = () => {
  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Bài viết nổi bật
        </Typography>
        <Button variant="outlined">Xem tất cả</Button>
      </Box>

      <Grid container spacing={3}>
        {featuredPosts.map((post) => (
          <Grid item xs={12} md={4} key={post.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={post.image}
                alt={post.title}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.excerpt}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={post.author.avatar}
                        sx={{ width: 24, height: 24 }}
                      >
                        {post.author.name[0]}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {post.author.name}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {post.readTime}
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FavoriteOutlined fontSize="small" color="error" />
                      <Typography variant="body2" color="text.secondary">
                        {post.likes}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ChatBubbleOutline fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        {post.comments}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {post.date}
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedPosts;
