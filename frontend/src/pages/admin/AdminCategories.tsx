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
import { useAppDispatch } from "../../app/hooks";
import { useAppSelector } from "../../app/hooks";
import { selectAllCategories } from "../../features/categories/categoriesSelectors";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "../../features/categories/categoriesApiSlice";
import { toast } from "react-toastify";

const AdminCategories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "mostCourses" | "leastCourses"
  >("newest");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Xử lý tìm kiếm, lọc và sắp xếp
  const filteredCategories = categories
    .filter((category) => {
      // Lọc theo từ khóa tìm kiếm
      if (
        searchQuery &&
        !category.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo trạng thái
      if (statusFilter !== "all" && category.status !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "mostCourses":
          return (b.courseCount ?? 0) - (a.courseCount ?? 0);
        case "leastCourses":
          return (a.courseCount ?? 0) - (b.courseCount ?? 0);
        default:
          return 0;
      }
    });

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
      name: "",
      description: "",
      status: "active",
    });
    setOpenAddEditDialog(true);
  };

  // Mở dialog chỉnh sửa danh mục
  const handleOpenEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status,
    });
    setOpenAddEditDialog(true);
  };

  // Mở dialog xóa danh mục
  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  // Xử lý lưu danh mục (thêm/sửa)
  const handleSaveCategory = async () => {
    if (!formData.name) {
      return; // Don't proceed if name is empty
    }
    try {
      if (selectedCategory) {
        // Update existing category
        await dispatch(
          updateCategory({
            id: selectedCategory.id,
            categoryData: formData,
          })
        ).unwrap();
        toast.success("Cập nhật danh mục thành công");
      } else {
        // Create new category
        await dispatch(createCategory(formData as Category)).unwrap();
        toast.success("Tạo danh mục thành công");
      }
      setOpenAddEditDialog(false);
      setFormData({
        name: "",
        description: "",
        status: "active",
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      toast.error(
        selectedCategory
          ? "Không thể cập nhật danh mục"
          : "Không thể tạo danh mục"
      );
    }
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    // Kiểm tra nếu danh mục có khóa học
    if (selectedCategory.courseCount && selectedCategory.courseCount > 0) {
      toast.error("Không thể xóa danh mục đang có khóa học");
      setOpenDeleteDialog(false);
      return;
    }

    try {
      await dispatch(deleteCategory(selectedCategory.id)).unwrap();
      setOpenDeleteDialog(false);
      setSelectedCategory(null);
      toast.success("Xóa danh mục thành công");
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      toast.error("Không thể xóa danh mục");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Quản lý danh mục khóa học
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp"
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="oldest">Cũ nhất</MenuItem>
                  <MenuItem value="mostCourses">Nhiều khóa học nhất</MenuItem>
                  <MenuItem value="leastCourses">Ít khóa học nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} textAlign="right">
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
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCategories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{category.name}</Typography>
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<MenuBook fontSize="small" />}
                    label={category.courseCount ?? 0}
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
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
              >
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Ẩn</MenuItem>
              </Select>
            </FormControl>
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
