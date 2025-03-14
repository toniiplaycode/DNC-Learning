import { Box, Typography, Grid, Card, Button } from "@mui/material";
import { Assignment, People, School } from "@mui/icons-material";
import ForumDiscussionCard from "../forum/ForumDiscussionCard";
import { useNavigate } from "react-router-dom";

interface ForumTopic {
  id: number;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  replies: number;
  views: number;
  lastActive: string;
  image: string;
}

const forumTopics: ForumTopic[] = [
  {
    id: 1,
    title: "Lập trình web với React và TypeScript",
    category: "Lập trình",
    author: {
      name: "Alex Johnson",
      avatar: "/src/assets/forum/users/alex.png",
    },
    replies: 25,
    views: 1200,
    lastActive: "2 giờ trước",
    image: "/src/assets/forum/programming.png",
  },
  {
    id: 2,
    title: "Kinh nghiệm học tiếng Anh hiệu quả",
    category: "Ngoại ngữ",
    author: {
      name: "Emma Watson",
      avatar: "/src/assets/forum/users/emma.png",
    },
    replies: 42,
    views: 2300,
    lastActive: "30 phút trước",
    image: "/src/assets/forum/english.png",
  },
  // Thêm 2 topics khác
];

const FeaturedForumDiscussions = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Diễn đàn thảo luận
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/forum")}>
          Xem tất cả
        </Button>
      </Box>

      {/* Forum Banner */}
      <Box sx={{ mb: 4, position: "relative" }}>
        <Box
          component="img"
          src="/src/assets/forum-banner.png"
          alt="Forum Banner"
          sx={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            borderRadius: 2,
            filter: "brightness(0.7)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "white",
            zIndex: 1,
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Tham gia cộng đồng học tập
          </Typography>
          <Typography variant="subtitle1">
            Chia sẻ kiến thức, đặt câu hỏi và kết nối với mọi người
          </Typography>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[
            { icon: <School />, label: "Chủ đề", value: "1,234" },
            { icon: <Assignment />, label: "Bài viết", value: "5,678" },
            {
              icon: <People />,
              label: "Thành viên tích cực",
              value: "890",
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ textAlign: "center", py: 2 }}>
                <Box sx={{ color: "primary.main", mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Forum Topics */}
      <Grid container spacing={3}>
        {forumTopics.map((topic) => (
          <Grid item xs={12} key={topic.id}>
            <ForumDiscussionCard topic={topic} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedForumDiscussions;
