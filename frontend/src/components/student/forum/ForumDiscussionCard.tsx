import { Favorite, People } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ForumDiscussionCard = ({ forum }: { forum: any }) => {
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        transition: "0.3s",
        "&:hover": {
          transform: "translateX(5px)",
          boxShadow: 2,
        },
        cursor: "pointer",
      }}
      onClick={() => {
        navigate(`/forum/${forum.id}`);
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <Box
              component="img"
              src={forum.thumbnailUrl || "src/assets/logo.png"}
              alt={forum.title}
              sx={{
                width: "100%",
                height: "100px",
                objectFit: "cover",
                borderRadius: 1,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={forum?.user?.avatarUrl}
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                }}
              >
                {forum?.user?.username}
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {forum.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={forum.course.title}
                    size="small"
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    bởi {forum?.user?.username}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack
              direction="row"
              spacing={3}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <People fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {forum?.replyCount} trả lời
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Favorite fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {forum?.likeCount} lượt thích
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {new Date(forum?.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ForumDiscussionCard;
