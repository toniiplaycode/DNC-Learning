import { Box, Typography, Grid, Card, Button } from "@mui/material";
import { Assignment, People, School } from "@mui/icons-material";
import ForumDiscussionCard from "../forum/ForumDiscussionCard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { selectForumsStatus } from "../../../features/forums/forumsSelectors";
import { useAppDispatch } from "../../../app/hooks";
import { useAppSelector } from "../../../app/hooks";
import { selectAllForums } from "../../../features/forums/forumsSelectors";
import { fetchForums } from "../../../features/forums/forumsApiSlice";

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

  const dispatch = useAppDispatch();
  const forums = useAppSelector(selectAllForums);
  const status = useAppSelector(selectForumsStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchForums());
    }
  }, [dispatch, status, navigate]);

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

      {/* Forum Topics */}
      <Grid container spacing={3}>
        {forums?.slice(0, 3)?.map((forum) => (
          <Grid item xs={12} key={forum.id}>
            <ForumDiscussionCard forum={forum} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedForumDiscussions;
