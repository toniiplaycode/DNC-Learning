import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tooltip,
  Badge,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Block,
  CheckCircle,
  Email,
  School,
  Person,
  FilterList,
  Assignment,
  Book,
} from "@mui/icons-material";

// Mock data học viên bên ngoài
const mockStudents = Array(15)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    name: `Học viên ${index + 1}`,
    email: `student${index + 1}@example.com`,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    avatar: "/src/assets/avatar.png",
    enrolledCourses: Math.floor(Math.random() * 5) + 1,
    status: Math.random() > 0.15 ? "active" : "inactive",
    joinDate: new Date(
      Date.now() - Math.floor(Math.random() * 10000000000)
    ).toISOString(),
    lastActive: new Date(
      Date.now() - Math.floor(Math.random() * 1000000000)
    ).toISOString(),
  }));

// Mock data sinh viên trường
const mockAcademicStudents = Array(15)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    name: `Sinh viên ${index + 1}`,
    studentCode: `SV${String(index + 1).padStart(3, "0")}`,
    email: `academic${index + 1}@edu.vn`,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    avatar: "/src/assets/avatar.png",
    faculty: ["Công nghệ thông tin", "Kinh tế", "Ngoại ngữ", "Kỹ thuật"][
      index % 4
    ],
    class: `K${44 + Math.floor(index / 5)}${String.fromCharCode(
      65 + (index % 5)
    )}`,
    status: Math.random() > 0.1 ? "active" : "inactive",
    gpa: (Math.random() * 2 + 2).toFixed(2),
    enrolledCourses: Math.floor(Math.random() * 3) + 1,
  }));

const AdminStudents = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);

  // Các tùy chọn lọc
  const faculties = ["Công nghệ thông tin", "Kinh tế", "Ngoại ngữ", "Kỹ thuật"];
  const classes = ["K44A", "K44B", "K45A", "K45B", "K46A"];

  // Xử lý chuyển tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setSelectedStudent(null);
  };

  // Lọc danh sách học viên
  const filteredStudents =
    tabValue === 0
      ? mockStudents.filter((student) => {
          if (statusFilter !== "all" && student.status !== statusFilter)
            return false;
          if (
            searchQuery &&
            !student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !student.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
            return false;
          return true;
        })
      : mockAcademicStudents.filter((student) => {
          if (statusFilter !== "all" && student.status !== statusFilter)
            return false;
          if (facultyFilter !== "all" && student.faculty !== facultyFilter)
            return false;
          if (classFilter !== "all" && student.class !== classFilter)
            return false;
          if (
            searchQuery &&
            !student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !student.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !student.studentCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
            return false;
          return true;
        });

  // Phân trang
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Xử lý menu thao tác
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Xử lý xem chi tiết
  const handleViewDetails = () => {
    setOpenDetailDialog(true);
    handleMenuClose();
  };

  // Xử lý xóa học viên
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    // Xử lý xóa học viên
    console.log(`Xóa học viên ID: ${selectedStudent}`);
    setOpenDeleteDialog(false);
  };

  // Xử lý khóa/mở khóa học viên
  const handleBlockClick = () => {
    setOpenBlockDialog(true);
    handleMenuClose();
  };

  const handleBlockConfirm = () => {
    // Xử lý khóa/mở khóa học viên
    const student =
      tabValue === 0
        ? mockStudents.find((s) => s.id === selectedStudent)
        : mockAcademicStudents.find((s) => s.id === selectedStudent);

    console.log(
      `${
        student?.status === "active" ? "Khóa" : "Mở khóa"
      } học viên ID: ${selectedStudent}`
    );
    setOpenBlockDialog(false);
  };

  // Xử lý thêm học viên
  const handleAddStudent = () => {
    setOpenAddDialog(true);
  };

  // Xử lý tạo bài tập cho sinh viên trường
  const handleCreateAssignment = () => {
    setOpenAssignmentDialog(true);
  };

  // Lấy thông tin học viên đang chọn
  const getSelectedStudent = () => {
    return tabValue === 0
      ? mockStudents.find((s) => s.id === selectedStudent)
      : mockAcademicStudents.find((s) => s.id === selectedStudent);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý học viên
      </Typography>

      {/* Tabs chuyển đổi loại học viên */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Person sx={{ mr: 1 }} />
              Học viên bên ngoài
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <School sx={{ mr: 1 }} />
              Sinh viên trường
            </Box>
          }
        />
      </Tabs>

      <Card>
        <CardContent>
          {/* Thanh công cụ */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Tìm kiếm */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={
                  tabValue === 0
                    ? "Tìm kiếm theo tên, email..."
                    : "Tìm kiếm theo tên, mã sinh viên, email..."
                }
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

            {/* Bộ lọc */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                  </Select>
                </FormControl>

                {tabValue === 1 && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Khoa</InputLabel>
                      <Select
                        value={facultyFilter}
                        onChange={(e) => setFacultyFilter(e.target.value)}
                        label="Khoa"
                      >
                        <MenuItem value="all">Tất cả các khoa</MenuItem>
                        {faculties.map((faculty) => (
                          <MenuItem key={faculty} value={faculty}>
                            {faculty}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Lớp</InputLabel>
                      <Select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        label="Lớp"
                      >
                        <MenuItem value="all">Tất cả các lớp</MenuItem>
                        {classes.map((className) => (
                          <MenuItem key={className} value={className}>
                            {className}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddStudent}
            >
              Thêm {tabValue === 0 ? "học viên" : "sinh viên"}
            </Button>

            {tabValue === 1 && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Assignment />}
                onClick={handleCreateAssignment}
              >
                Tạo bài tập cho lớp
              </Button>
            )}
          </Box>

          {/* Bảng học viên */}
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Học viên</TableCell>
                  {tabValue === 1 && <TableCell>Mã SV</TableCell>}
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  {tabValue === 0 ? (
                    <>
                      <TableCell>Khóa học</TableCell>
                      <TableCell>Ngày tham gia</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Khoa</TableCell>
                      <TableCell>Lớp</TableCell>
                      <TableCell>Điểm TB</TableCell>
                    </>
                  )}
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={student.avatar} sx={{ mr: 2 }} />
                        {student.name}
                      </Box>
                    </TableCell>
                    {tabValue === 1 && (
                      <TableCell>{student.studentCode}</TableCell>
                    )}
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    {tabValue === 0 ? (
                      <>
                        <TableCell>
                          <Chip
                            label={`${student.enrolledCourses} khóa học`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(student.joinDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{student.faculty}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.gpa}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Chip
                        label={
                          student.status === "active" ? "Hoạt động" : "Khóa"
                        }
                        color={
                          student.status === "active" ? "success" : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, student.id)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={tabValue === 0 ? 8 : 10} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Phân trang */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Menu thao tác */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xem chi tiết" />
        </MenuItem>
        <MenuItem onClick={handleBlockClick}>
          <ListItemIcon>
            {getSelectedStudent()?.status === "active" ? (
              <Block fontSize="small" color="error" />
            ) : (
              <CheckCircle fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              getSelectedStudent()?.status === "active"
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"
            }
          />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Xóa" />
        </MenuItem>
      </Menu>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa{" "}
            {tabValue === 0 ? "học viên" : "sinh viên"} này? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận khóa/mở khóa */}
      <Dialog open={openBlockDialog} onClose={() => setOpenBlockDialog(false)}>
        <DialogTitle>
          {getSelectedStudent()?.status === "active"
            ? "Xác nhận khóa tài khoản"
            : "Xác nhận mở khóa tài khoản"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getSelectedStudent()?.status === "active"
              ? "Khi khóa tài khoản, người dùng sẽ không thể đăng nhập vào hệ thống. Bạn có chắc chắn muốn khóa tài khoản này không?"
              : "Khi mở khóa tài khoản, người dùng sẽ có thể đăng nhập vào hệ thống. Bạn có chắc chắn muốn mở khóa tài khoản này không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlockDialog(false)}>Hủy</Button>
          <Button
            onClick={handleBlockConfirm}
            color={
              getSelectedStudent()?.status === "active" ? "error" : "success"
            }
            autoFocus
          >
            {getSelectedStudent()?.status === "active" ? "Khóa" : "Mở khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo bài tập cho sinh viên */}
      {openAssignmentDialog && (
        <Dialog
          open={openAssignmentDialog}
          onClose={() => setOpenAssignmentDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Tạo bài tập cho sinh viên</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Bài tập sẽ được gán cho sinh viên thuộc:
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Khoa:</strong>{" "}
                {facultyFilter !== "all" ? facultyFilter : "Tất cả các khoa"}
              </Typography>
              <Typography variant="body2">
                <strong>Lớp:</strong>{" "}
                {classFilter !== "all" ? classFilter : "Tất cả các lớp"}
              </Typography>
              <Typography variant="body2">
                <strong>Số sinh viên:</strong> {filteredStudents.length}
              </Typography>
            </Box>

            {/* Form tạo bài tập */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField label="Tiêu đề bài tập" fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Mô tả bài tập" fullWidth multiline rows={4} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hạn nộp"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Điểm tối đa"
                  type="number"
                  fullWidth
                  defaultValue={100}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssignmentDialog(false)}>Hủy</Button>
            <Button variant="contained" color="primary">
              Tạo bài tập
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminStudents;
