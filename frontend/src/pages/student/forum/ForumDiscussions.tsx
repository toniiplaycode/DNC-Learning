import { useState } from "react";
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
} from "@mui/material";
import { Search } from "@mui/icons-material";
import ForumDiscussionCard from "../../../components/student/forum/ForumDiscussionCard";

// Cập nhật interface
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
  tags?: string[];
  content?: string;
}

// Mock data
const mockDiscussions: ForumTopic[] = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: `${
      [
        "Lập trình web với React và TypeScript",
        "Kinh nghiệm học Machine Learning từ cơ bản",
        "Chia sẻ lộ trình học Frontend Developer",
        "Hỏi đáp về Microservices Architecture",
      ][index % 4]
    }`,
    category: ["Lập trình", "AI/ML", "Frontend", "Backend"][index % 4],
    author: {
      name: `${
        ["Alex Johnson", "Emma Watson", "John Smith", "Sarah Parker"][index % 4]
      }`,
      avatar: `/src/assets/avatar.png`,
    },
    replies: Math.floor(Math.random() * 100),
    views: Math.floor(Math.random() * 5000) + 500,
    lastActive: `${
      ["2 giờ trước", "30 phút trước", "1 ngày trước", "1 tuần trước"][
        index % 4
      ]
    }`,
    image: "/src/assets/logo.png",
    tags: [
      "React",
      "TypeScript",
      "JavaScript",
      "Frontend",
      "Backend",
      "DevOps",
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
  }));

const categories = ["Tất cả", "Lập trình", "AI/ML", "Frontend", "Backend"];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "mostCommented", label: "Nhiều bình luận nhất" },
];

const ForumDiscussions = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const itemsPerPage = 6;

  // Get all unique tags
  const allTags = Array.from(
    new Set(mockDiscussions.flatMap((discussion) => discussion.tags || []))
  );

  // Filter discussions
  const filteredDiscussions = mockDiscussions.filter((discussion) => {
    const matchesSearch = discussion.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || discussion.category === selectedCategory;
    const matchesTags =
      selectedTags.length === 0 ||
      (discussion.tags &&
        selectedTags.some((tag) => discussion.tags.includes(tag)));

    return matchesSearch && matchesCategory && matchesTags;
  });

  // Sort discussions
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.views - a.views;
      case "mostCommented":
        return b.replies - a.replies;
      default:
        // Giả lập sort theo thời gian dựa vào lastActive
        const timeMap: { [key: string]: number } = {
          "30 phút trước": 4,
          "2 giờ trước": 3,
          "1 ngày trước": 2,
          "1 tuần trước": 1,
        };
        return timeMap[b.lastActive] - timeMap[a.lastActive];
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedDiscussions.length / itemsPerPage);
  const displayedDiscussions = sortedDiscussions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Diễn đàn thảo luận
      </Typography>

      <Grid container spacing={3}>
        {/* Filters - Left Sidebar */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            order: { xs: 1, md: 0 },
            position: { xs: "static", md: "sticky" },
            top: { md: 24 },
            alignSelf: { md: "flex-start" },
            height: { md: "fit-content" },
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bộ lọc tìm kiếm
              </Typography>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm thảo luận..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Danh mục"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sắp xếp theo"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Typography gutterBottom>Tags</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {allTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleTagToggle(tag)}
                        color={
                          selectedTags.includes(tag) ? "primary" : "default"
                        }
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {displayedDiscussions.length} trên tổng số{" "}
                  {filteredDiscussions.length} thảo luận
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Discussions List - Right Content */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{
            order: { xs: 2, md: 1 },
          }}
        >
          <Stack spacing={3}>
            {displayedDiscussions.map((discussion) => (
              <ForumDiscussionCard key={discussion.id} topic={discussion} />
            ))}
          </Stack>

          {/* Pagination */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ForumDiscussions;
