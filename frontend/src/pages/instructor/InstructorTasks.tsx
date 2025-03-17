import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  LinearProgress,
  ListItemIcon,
} from "@mui/material";
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Assignment,
  CheckCircle,
  Delete,
  Edit,
  PriorityHigh,
  AccessTime,
  Sort,
  Done,
  CalendarToday,
} from "@mui/icons-material";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Mock data cho các công việc
const mockTasks = [
  {
    id: 1,
    title: "Cập nhật bài giảng React Hooks",
    description: "Cập nhật nội dung bài giảng cho phù hợp với React 18",
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    dueDate: "2024-04-05",
    status: "pending", // pending, in_progress, completed, overdue
    priority: "high", // low, medium, high
    type: "content", // content, assignment, review, admin
    progress: 0,
    assignedBy: "Admin",
    assignedDate: "2024-03-20",
  },
  {
    id: 2,
    title: "Chấm bài Assignment 1",
    description: "Chấm và đưa ra phản hồi cho bài tập Assignment 1",
    courseId: 1,
    courseName: "React & TypeScript Masterclass",
    dueDate: "2024-03-30",
    status: "in_progress",
    priority: "high",
    type: "assignment",
    progress: 30,
    assignedBy: "System",
    assignedDate: "2024-03-25",
  },
  {
    id: 3,
    title: "Trả lời câu hỏi của học viên",
    description: "Trả lời các câu hỏi đang chờ trong diễn đàn",
    courseId: 2,
    courseName: "Node.js Advanced Concepts",
    dueDate: "2024-03-29",
    status: "pending",
    priority: "medium",
    type: "review",
    progress: 0,
    assignedBy: "System",
    assignedDate: "2024-03-26",
  },
  {
    id: 4,
    title: "Tạo bài kiểm tra cuối kỳ",
    description: "Chuẩn bị bài kiểm tra cuối kỳ cho khóa học",
    courseId: 2,
    courseName: "Node.js Advanced Concepts",
    dueDate: "2024-04-10",
    status: "pending",
    priority: "medium",
    type: "content",
    progress: 0,
    assignedBy: "Self",
    assignedDate: "2024-03-15",
  },
  {
    id: 5,
    title: "Cập nhật thông tin cá nhân",
    description: "Cập nhật CV và thông tin giảng viên trên hệ thống",
    courseId: null,
    courseName: null,
    dueDate: "2024-03-23",
    status: "overdue",
    priority: "low",
    type: "admin",
    progress: 0,
    assignedBy: "Admin",
    assignedDate: "2024-03-10",
  },
  {
    id: 6,
    title: "Kiểm tra nội dung khóa học Docker",
    description: "Kiểm tra và phê duyệt nội dung khóa học mới",
    courseId: 3,
    courseName: "DevOps Fundamentals",
    dueDate: "2024-04-15",
    status: "completed",
    priority: "high",
    type: "review",
    progress: 100,
    assignedBy: "Admin",
    assignedDate: "2024-03-05",
    completedDate: "2024-03-25",
  },
];

// Các tùy chọn lọc
const taskTypes = [
  { value: "all", label: "Tất cả" },
  { value: "content", label: "Nội dung" },
  { value: "assignment", label: "Bài tập" },
  { value: "review", label: "Đánh giá" },
  { value: "admin", label: "Quản trị" },
];

const priorityOptions = [
  { value: "all", label: "Tất cả" },
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
];

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa bắt đầu" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
];

const InstructorTasks = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Dialog để thêm/sửa công việc
  const handleOpenAddEditDialog = (task?: any) => {
    setEditingTask(task || null);
    setOpenAddEditDialog(true);
  };

  // Xử lý menu action cho từng task
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    taskId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  // Xử lý đánh dấu hoàn thành công việc
  const handleMarkComplete = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "completed",
              progress: 100,
              completedDate: new Date().toISOString().split("T")[0],
            }
          : task
      )
    );
    handleMenuClose();
  };

  // Xử lý đánh dấu đang thực hiện
  const handleMarkInProgress = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId && task.status === "pending"
          ? { ...task, status: "in_progress", progress: 10 }
          : task
      )
    );
    handleMenuClose();
  };

  // Xử lý xóa công việc
  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    handleMenuClose();
  };

  // Xử lý submit khi thêm/sửa công việc
  const handleSubmitTask = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement logic to add/edit task
    setOpenAddEditDialog(false);
  };

  // Lọc và sắp xếp các công việc
  const filteredTasks = tasks
    .filter((task) => {
      // Lọc theo tìm kiếm
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo loại
      if (filterType !== "all" && task.type !== filterType) {
        return false;
      }

      // Lọc theo mức độ ưu tiên
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }

      // Lọc theo trạng thái
      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false;
      }

      // Lọc theo tab
      if (tabValue === 0) {
        return task.status !== "completed"; // Đang thực hiện
      } else if (tabValue === 1) {
        return task.status === "completed"; // Đã hoàn thành
      } else if (tabValue === 2) {
        return (
          task.status === "overdue" ||
          (task.status !== "completed" &&
            isBefore(parseISO(task.dueDate), new Date()))
        ); // Quá hạn
      } else if (tabValue === 3) {
        return true; // Tất cả
      }

      return true;
    })
    .sort((a, b) => {
      // Sắp xếp theo trường đã chọn
      let comparison = 0;

      if (sortBy === "dueDate") {
        comparison =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "priority") {
        const priorityValues = { low: 1, medium: 2, high: 3 };
        comparison =
          priorityValues[a.priority as keyof typeof priorityValues] -
          priorityValues[b.priority as keyof typeof priorityValues];
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Helper function cho định dạng ngày
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Helper function để hiển thị chip priority
  const getPriorityChip = (priority: string) => {
    switch (priority) {
      case "high":
        return <Chip label="Cao" color="error" size="small" />;
      case "medium":
        return <Chip label="Trung bình" color="warning" size="small" />;
      case "low":
        return <Chip label="Thấp" color="success" size="small" />;
      default:
        return null;
    }
  };

  // Helper function để hiển thị chip status
  const getStatusChip = (status: string) => {
    switch (status) {
      case "pending":
        return <Chip label="Chưa bắt đầu" color="default" size="small" />;
      case "in_progress":
        return <Chip label="Đang thực hiện" color="primary" size="small" />;
      case "completed":
        return <Chip label="Hoàn thành" color="success" size="small" />;
      case "overdue":
        return <Chip label="Quá hạn" color="error" size="small" />;
      default:
        return null;
    }
  };

  // Helper function để hiển thị icon type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return <Assignment color="primary" />;
      case "assignment":
        return <Assignment color="secondary" />;
      case "review":
        return <CheckCircle color="warning" />;
      case "admin":
        return <Assignment color="action" />;
      default:
        return <Assignment />;
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Typography variant="h5">Công việc cần thực hiện</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenAddEditDialog()}
              >
                Thêm công việc
              </Button>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mt: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Đang thực hiện" />
            <Tab label="Hoàn thành" />
            <Tab label="Quá hạn" />
            <Tab label="Tất cả" />
          </Tabs>
        </Box>
      </Card>

      <Card>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm công việc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Loại"
                  >
                    {taskTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Trạng thái"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Ưu tiên</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Ưu tiên"
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Sắp xếp theo">
                  <IconButton
                    onClick={() => {
                      if (sortBy === "dueDate") {
                        setSortDirection(
                          sortDirection === "asc" ? "desc" : "asc"
                        );
                      } else {
                        setSortBy("dueDate");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    <Sort />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>

          {/* Danh sách công việc */}
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="40%">Công việc</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell
                    onClick={() => {
                      setSortBy("dueDate");
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <span>Hạn chót</span>
                      {sortBy === "dueDate" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setSortBy("priority");
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <span>Ưu tiên</span>
                      {sortBy === "priority" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Tiến độ</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        Không có công việc nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getTypeIcon(task.type)}
                          <Box>
                            <Typography variant="body1">
                              {task.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {task.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {task.courseName ? (
                          <Typography variant="body2">
                            {task.courseName}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            isBefore(parseISO(task.dueDate), new Date()) &&
                            task.status !== "completed"
                              ? "Quá hạn"
                              : ""
                          }
                        >
                          <Typography
                            variant="body2"
                            color={
                              isBefore(parseISO(task.dueDate), new Date()) &&
                              task.status !== "completed"
                                ? "error"
                                : "text.primary"
                            }
                            sx={{
                              fontWeight:
                                isBefore(parseISO(task.dueDate), new Date()) &&
                                task.status !== "completed"
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {formatDate(task.dueDate)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getPriorityChip(task.priority)}</TableCell>
                      <TableCell>{getStatusChip(task.status)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <LinearProgress
                            variant="determinate"
                            value={task.progress}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                          <Typography variant="caption" align="right">
                            {task.progress}%
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, task.id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      {/* Menu thao tác */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedTask &&
          tasks.find((t) => t.id === selectedTask)?.status !== "completed" && (
            <MenuItem
              onClick={() => selectedTask && handleMarkComplete(selectedTask)}
            >
              <ListItemIcon>
                <Done fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Đánh dấu hoàn thành</ListItemText>
            </MenuItem>
          )}
        {selectedTask &&
          tasks.find((t) => t.id === selectedTask)?.status === "pending" && (
            <MenuItem
              onClick={() => selectedTask && handleMarkInProgress(selectedTask)}
            >
              <ListItemIcon>
                <AccessTime fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Đánh dấu đang thực hiện</ListItemText>
            </MenuItem>
          )}
        <MenuItem
          onClick={() =>
            selectedTask &&
            handleOpenAddEditDialog(tasks.find((t) => t.id === selectedTask))
          }
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => selectedTask && handleDeleteTask(selectedTask)}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog thêm/sửa công việc */}
      <Dialog
        open={openAddEditDialog}
        onClose={() => setOpenAddEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmitTask}>
          <DialogTitle>
            {editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Tiêu đề"
                fullWidth
                defaultValue={editingTask?.title}
                required
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                defaultValue={editingTask?.description}
              />
              <FormControl fullWidth>
                <InputLabel>Khóa học</InputLabel>
                <Select
                  label="Khóa học"
                  defaultValue={editingTask?.courseId || ""}
                >
                  <MenuItem value="">Không liên quan đến khóa học</MenuItem>
                  <MenuItem value={1}>React & TypeScript Masterclass</MenuItem>
                  <MenuItem value={2}>Node.js Advanced Concepts</MenuItem>
                  <MenuItem value={3}>DevOps Fundamentals</MenuItem>
                </Select>
              </FormControl>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Hạn chót"
                    type="date"
                    fullWidth
                    defaultValue={
                      editingTask?.dueDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Độ ưu tiên</InputLabel>
                    <Select
                      label="Độ ưu tiên"
                      defaultValue={editingTask?.priority || "medium"}
                    >
                      <MenuItem value="low">Thấp</MenuItem>
                      <MenuItem value="medium">Trung bình</MenuItem>
                      <MenuItem value="high">Cao</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <InputLabel>Loại công việc</InputLabel>
                <Select
                  label="Loại công việc"
                  defaultValue={editingTask?.type || "content"}
                >
                  <MenuItem value="content">Nội dung</MenuItem>
                  <MenuItem value="assignment">Bài tập</MenuItem>
                  <MenuItem value="review">Đánh giá</MenuItem>
                  <MenuItem value="admin">Quản trị</MenuItem>
                </Select>
              </FormControl>
              {editingTask && (
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select label="Trạng thái" defaultValue={editingTask.status}>
                    <MenuItem value="pending">Chưa bắt đầu</MenuItem>
                    <MenuItem value="in_progress">Đang thực hiện</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                    <MenuItem value="overdue">Quá hạn</MenuItem>
                  </Select>
                </FormControl>
              )}
              <TextField
                label="Tiến độ (%)"
                type="number"
                fullWidth
                defaultValue={editingTask?.progress || 0}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddEditDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingTask ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InstructorTasks;
