import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Pagination,
  InputAdornment,
  Chip,
  Avatar,
  CardActionArea,
  Tabs,
  Tab,
  CardMedia,
  Button,
} from "@mui/material";
import { Search, ThumbUp, Comment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchForums } from "../../../features/forums/forumsApiSlice";
import {
  selectAllForums,
  selectForumsStatus,
} from "../../../features/forums/forumsSelectors";
import { selectIsAuthenticated } from "../../../features/auth/authSelectors";
import CustomContainer from "../../../components/common/CustomContainer";
import logo from "../../../assets/logo.png";

const ForumDiscussions = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const forums = useAppSelector(selectAllForums);
  const status = useAppSelector(selectForumsStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Phân trang
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (status === "idle" && isAuthenticated) {
      dispatch(fetchForums());
    }
  }, [dispatch, status, navigate, isAuthenticated]);

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
  const filteredForums = forums
    .filter((forum) => {
      if (forum.status !== "active") return false;
      const matchesSearch =
        forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (tabValue) {
        case 0: // Tất cả
          return true;
        case 1: // Mới nhất
        case 2: // Cũ nhất
          return true;
        case 3: // Phổ biến
          return (forum.likeCount || 0) + (forum.replyCount || 0) > 0;
        case 4: // Đã thích
          return forum.isLiked;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sắp xếp theo tab
      switch (tabValue) {
        case 1: // Mới nhất
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 2: // Cũ nhất
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 3: // Phổ biến
          const aScore = (a.likeCount || 0) + (a.replyCount || 0);
          const bScore = (b.likeCount || 0) + (b.replyCount || 0);
          return bScore - aScore;
        default:
          return 0;
      }
    });

  // Tính toán các chỉ số để hiển thị cho trang hiện tại
  const totalPages = Math.ceil(filteredForums.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedForums = filteredForums.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Hiển thị thông báo đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return (
      <CustomContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
          }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            gutterBottom
          >
            Vui lòng đăng nhập để xem các diễn đàn thảo luận
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </Button>
        </Box>
      </CustomContainer>
    );
  }

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
          <Tab label="Cũ nhất" />
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
                  height="150"
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

                      <Box
                        sx={{
                          "& h1, & h2, & h3, & h4, & h5, & h6": {
                            fontSize: {
                              h1: "1.2rem",
                              h2: "1.1rem",
                              h3: "1rem",
                              h4: "0.95rem",
                              h5: "0.9rem",
                              h6: "0.85rem",
                            },
                            fontWeight: 600,
                            mb: 1,
                            color: "primary.main",
                            lineHeight: 1.3,
                          },
                          "& p, & div": {
                            mb: 1,
                            lineHeight: 1.5,
                            fontSize: "0.875rem",
                          },
                          "& ul, & ol": {
                            pl: 2,
                            mb: 1,
                            listStyle: "none",
                          },
                          "& li": {
                            mb: 0.5,
                            fontSize: "0.875rem",
                            color: "text.secondary",
                            "&:before": {
                              content: '"•"',
                              color: "primary.main",
                              display: "inline-block",
                              width: "1em",
                              marginLeft: "-1em",
                            },
                          },
                          "& table": {
                            width: "100%",
                            borderCollapse: "collapse",
                            mb: 1,
                            fontSize: "0.875rem",
                          },
                          "& th, & td": {
                            border: "1px solid",
                            borderColor: "divider",
                            p: 0.5,
                            fontSize: "0.875rem",
                          },
                          "& a": {
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          },
                          "& blockquote": {
                            borderLeft: "2px solid",
                            borderColor: "primary.main",
                            pl: 1,
                            py: 0.5,
                            my: 1,
                            fontSize: "0.875rem",
                            bgcolor: "action.hover",
                            fontStyle: "italic",
                          },
                          "& code, & pre": {
                            fontFamily: "monospace",
                            bgcolor: "action.hover",
                            p: 0.5,
                            borderRadius: 0.5,
                            fontSize: "0.875rem",
                          },
                          "& img": {
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: 1,
                          },
                          "& strong": {
                            fontWeight: 600,
                          },
                          "& em": {
                            fontStyle: "italic",
                          },
                          "& hr": {
                            border: "none",
                            borderTop: "1px solid",
                            borderColor: "divider",
                            my: 1,
                          },
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                          fontSize: "0.875rem",
                          color: "text.secondary",
                          mb: 2,
                        }}
                        dangerouslySetInnerHTML={{ __html: forum.description }}
                      />

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
