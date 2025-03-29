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

  // Phân trang
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchForums());
    }
  }, [dispatch, status]);

  useEffect(() => {
    // Reset về trang 1 khi thay đổi bộ lọc hoặc tìm kiếm
    setPage(1);
  }, [tabValue, searchQuery]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Cuộn lên đầu danh sách khi chuyển trang
    window.scrollTo({
      top: document.getElementById("forums-list")?.offsetTop || 0,
      behavior: "smooth",
    });
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

  // Tính toán các chỉ số để hiển thị cho trang hiện tại
  const totalPages = Math.ceil(filteredForums.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedForums = filteredForums.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm chủ đề..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Tất cả" />
          <Tab label="Mới nhất" />
          <Tab label="Phổ biến" />
          <Tab label="Đã thích" />
        </Tabs>
      </Box>

      <Grid container spacing={3} id="forums-list">
        {status === "loading" && (
          <Grid item xs={12}>
            <Typography textAlign="center">Đang tải dữ liệu...</Typography>
          </Grid>
        )}

        {status === "failed" && (
          <Grid item xs={12}>
            <Typography textAlign="center" color="error">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </Typography>
          </Grid>
        )}

        {status === "succeeded" && paginatedForums.length === 0 && (
          <Grid item xs={12}>
            <Typography textAlign="center">
              Không tìm thấy chủ đề thảo luận nào.
            </Typography>
          </Grid>
        )}

        {paginatedForums.map((forum) => (
          <Grid item xs={12} sm={6} md={4} key={forum.id}>
            <Card
              onClick={() => navigate(`/forum/${forum.id}`)}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: (theme) => theme.shadows[5],
                },
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={forum.thumbnailUrl || logo}
                  alt={forum.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
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

      {/* Phân trang */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </CustomContainer>
  );
};

export default ForumDiscussions;
