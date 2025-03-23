import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  Grid,
  Pagination,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Search,
  Clear,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  VisibilityOff,
  School,
  MenuBook,
} from "@mui/icons-material";

// Mock data cho danh mục khóa học
const mockCategories = [
  {
    id: 1,
    name: "Lập trình web",
    description: "Các khóa học về phát triển ứng dụng web",
    status: "active",
    order: 1,
    courseCount: 15,
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-10-05T00:00:00Z",
  },
  {
    id: 2,
    name: "Phát triển di động",
    description: "Khóa học về ứng dụng di động iOS, Android",
    status: "active",
    order: 2,
    courseCount: 8,
    createdAt: "2023-02-10T00:00:00Z",
    updatedAt: "2023-09-20T00:00:00Z",
  },
  {
    id: 3,
    name: "Thiết kế UI/UX",
    description: "Khóa học về thiết kế giao diện người dùng",
    status: "active",
    order: 3,
    courseCount: 6,
    createdAt: "2023-03-05T00:00:00Z",
    updatedAt: "2023-11-10T00:00:00Z",
  },
  {
    id: 4,
    name: "Machine Learning",
    description: "Các khóa học về học máy và trí tuệ nhân tạo",
    status: "active",
    order: 4,
    courseCount: 10,
    createdAt: "2023-04-20T00:00:00Z",
    updatedAt: "2023-10-25T00:00:00Z",
  },
  {
    id: 5,
    name: "Devops",
    description: "Khóa học về CI/CD, Docker, Kubernetes",
    status: "inactive",
    order: 5,
    courseCount: 4,
    createdAt: "2023-05-15T00:00:00Z",
    updatedAt: "2023-08-30T00:00:00Z",
  },
  {
    id: 6,
    name: "Database Administration",
    description: "Quản trị cơ sở dữ liệu",
    status: "active",
    order: 6,
    courseCount: 7,
    createdAt: "2023-06-10T00:00:00Z",
    updatedAt: "2023-09-15T00:00:00Z",
  },
  {
    id: 7,
    name: "Blockchain",
    description: "Công nghệ blockchain và phát triển ứng dụng",
    status: "inactive",
    order: 7,
    courseCount: 3,
    createdAt: "2023-07-05T00:00:00Z",
    updatedAt: "2023-11-20T00:00:00Z",
  },
];

const AdminCategories = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    description: "",
    status: "active",
    order: 0,
  });

  // Xử lý tìm kiếm và lọc
  const filteredCategories = categories
    .filter((category) => {
      // Lọc theo từ khóa tìm kiếm
      if (
        searchQuery &&
        !category.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !category.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo trạng thái
      if (statusFilter !== "all" && category.status !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.order - b.order);

  // Phân trang
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const pageCount = Math.ceil(filteredCategories.length / rowsPerPage);

  // Mở dialog thêm danh mục
  const handleOpenAddDialog = () => {
    setSelectedCategory(null);
    setFormData({
      id: 0,
      name: "",
      description: "",
      status: "active",
      order: categories.length + 1,
    });
    setOpenAddEditDialog(true);
  };

  // Mở dialog chỉnh sửa danh mục
  const handleOpenEditDialog = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      status: category.status,
      order: category.order,
    });
    setOpenAddEditDialog(true);
  };

  // Mở dialog xóa danh mục
  const handleOpenDeleteDialog = (category: any) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  // Xử lý lưu danh mục (thêm/sửa)
  const handleSaveCategory = () => {
    if (selectedCategory) {
      // Cập nhật danh mục đã có
      setCategories(
        categories.map((category) =>
          category.id === selectedCategory.id
            ? {
                ...category,
                name: formData.name,
                description: formData.description,
                status: formData.status,
                order: formData.order,
                updatedAt: new Date().toISOString(),
              }
            : category
        )
      );
    } else {
      // Thêm danh mục mới
      const newCategory = {
        id: categories.length + 1,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        order: formData.order,
        courseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCategories([...categories, newCategory]);
    }
    setOpenAddEditDialog(false);
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      setCategories(
        categories.filter((category) => category.id !== selectedCategory.id)
      );
    }
    setOpenDeleteDialog(false);
  };

  // Xử lý thay đổi thứ tự hiển thị
  const handleChangeOrder = (categoryId: number, direction: "up" | "down") => {
    const categoryIndex = categories.findIndex(
      (category) => category.id === categoryId
    );

    if (
      (direction === "up" && categoryIndex === 0) ||
      (direction === "down" && categoryIndex === categories.length - 1)
    ) {
      return; // Không thể di chuyển lên trên đầu hoặc xuống dưới cuối
    }

    const newCategories = [...categories];
    const swapIndex =
      direction === "up" ? categoryIndex - 1 : categoryIndex + 1;

    // Đổi thứ tự order
    const tempOrder = newCategories[categoryIndex].order;
    newCategories[categoryIndex].order = newCategories[swapIndex].order;
    newCategories[swapIndex].order = tempOrder;

    // Đổi vị trí trong mảng
    [newCategories[categoryIndex], newCategories[swapIndex]] = [
      newCategories[swapIndex],
      newCategories[categoryIndex],
    ];

    setCategories(newCategories);
  };

  // Xử lý thay đổi trạng thái
  const handleToggleStatus = (categoryId: number) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              status: category.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Quản lý danh mục khóa học
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchQuery("")}
                        size="small"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Đã ẩn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5} textAlign="right">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
              >
                Thêm danh mục mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>STT</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="center">Khóa học</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thứ tự</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCategories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{category.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {category.id}
                  </Typography>
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<MenuBook fontSize="small" />}
                    label={category.courseCount}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      category.status === "active" ? "Đang hoạt động" : "Đã ẩn"
                    }
                    color={category.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleChangeOrder(category.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <Typography sx={{ mx: 1 }}>{category.order}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleChangeOrder(category.id, "down")}
                      disabled={index === paginatedCategories.length - 1}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(category)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        category.status === "active"
                          ? "Ẩn danh mục"
                          : "Hiện danh mục"
                      }
                    >
                      <IconButton
                        size="small"
                        color={
                          category.status === "active" ? "default" : "success"
                        }
                        onClick={() => handleToggleStatus(category.id)}
                      >
                        {category.status === "active" ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(category)}
                        disabled={category.courseCount > 0}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy danh mục nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Dialog thêm/sửa danh mục */}
      <Dialog
        open={openAddEditDialog}
        onClose={() => setOpenAddEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Tên danh mục"
              fullWidth
              margin="normal"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label="Mô tả"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.status}
                    label="Trạng thái"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as string,
                      })
                    }
                  >
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="inactive">Ẩn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Thứ tự hiển thị"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEditDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveCategory}
            color="primary"
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {selectedCategory ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.name}"? Hành
            động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteCategory} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategories;
