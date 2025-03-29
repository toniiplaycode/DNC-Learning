import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
  InputAdornment,
  Chip,
  Button,
  Avatar,
  CardActionArea,
  IconButton,
  Tabs,
  Tab,
  CardMedia,
} from "@mui/material";
import {
  Check,
  FilterAlt,
  Search,
  ThumbUp,
  Comment,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchForums } from "../../../features/forums/forumsApiSlice";
import {
  selectAllForums,
  selectForumsStatus,
} from "../../../features/forums/forumsSelectors";
import CustomContainer from "../../../components/common/CustomContainer";
import logo from "../../../assets/logo.png";

const ForumDiscussions = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const forums = useAppSelector(selectAllForums);
  const status = useAppSelector(selectForumsStatus);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchForums());
    }
  }, [dispatch, status]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter forums based on search query and active tab
  const filteredForums = forums.filter((forum) => {
    const matchesSearch =
      forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forum.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (tabValue === 0) return matchesSearch; // All forums
    if (tabValue === 3) return matchesSearch && forum.isLiked; // Liked by you

    return matchesSearch;
  });

  return (
    <CustomContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Diễn đàn thảo luận
        </Typography>
      </Box>

      <Box>
        <TextField
          fullWidth
          placeholder="Tìm kiếm trong diễn đàn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <FilterAlt />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Tất cả thảo luận" />
          <Tab
            label="Bạn đã thích"
            icon={<ThumbUp fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {status === "loading" && (
        <Typography align="center">Đang tải dữ liệu...</Typography>
      )}

      {status === "failed" && (
        <Typography align="center" color="error">
          Đã xảy ra lỗi khi tải dữ liệu diễn đàn.
        </Typography>
      )}

      {status === "succeeded" && filteredForums.length === 0 && (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Không có thảo luận nào phù hợp với tìm kiếm của bạn
          </Typography>
          <Typography color="text.secondary">
            Hãy thử tìm kiếm với từ khóa khác hoặc tạo một thảo luận mới
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredForums.map((forum) => (
          <Grid item xs={12} key={forum.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                ":hover": { boxShadow: 2 },
              }}
            >
              <CardActionArea onClick={() => navigate(`/forum/${forum.id}`)}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <CardMedia
                        component="img"
                        image={forum.thumbnailUrl || logo}
                        alt={forum.title}
                        sx={{
                          width: "100%",
                          height: { xs: "100%", md: 200 },
                          borderRadius: 1,
                          objectFit: "cover",
                          mb: 2,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={
                            forum.course?.title || `Khóa học ${forum.courseId}`
                          }
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {forum.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                        }}
                      >
                        {forum.description}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={3}
                        sx={{ mt: 2 }}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Avatar
                            src={forum.user?.avatarUrl}
                            alt={forum.user?.username}
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography variant="body2">
                            {forum.user?.username || "Người dùng"}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(forum.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Chip
                          icon={<Comment fontSize="small" />}
                          label={forum.replyCount || 0}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<ThumbUp fontSize="small" />}
                          label={forum.likeCount || 0}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </CustomContainer>
  );
};

export default ForumDiscussions;
