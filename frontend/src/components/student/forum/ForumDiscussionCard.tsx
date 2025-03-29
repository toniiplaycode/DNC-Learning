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

const ForumDiscussionCard = ({ topic }: { topic: any }) => {
  return (
    <Card
      sx={{
        transition: "0.3s",
        "&:hover": {
          transform: "translateX(5px)",
          boxShadow: 2,
        },
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <Box
              component="img"
              src={topic.image}
              alt={topic.title}
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
                src={topic.author.avatar}
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                }}
              >
                {topic.author.name[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {topic.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={topic.category} size="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    bởi {topic.author.name}
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
                  {topic.replies} trả lời
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Favorite fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {topic.likes} lượt thích
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {topic.lastActive}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ForumDiscussionCard;
