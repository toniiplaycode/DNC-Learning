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
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
  Pagination,
  Stack,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Autocomplete,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Search,
  Clear,
  Check,
  School,
  Class,
  Person,
  FilterList,
  SaveAlt,
  CheckCircle,
  Cancel,
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  MoreVert,
} from "@mui/icons-material";

// Interface cho dữ liệu giảng viên
interface Instructor {
  id: number;
  name: string;
  email: string;
  avatar: string;
  department: string;
  expertise: string[];
  currentAssignments: number;
}

// Interface cho dữ liệu khóa học
interface Course {
  id: number;
  title: string;
  category: string;
  type: "online" | "academic";
  department?: string;
  class?: string;
}

// Interface cho phân công
interface InstructorAssignment {
  id: number;
  instructorId: number;
  instructorName: string;
  instructorAvatar: string;
  courseId: number;
  courseTitle: string;
  courseType: "online" | "academic";
  department?: string;
  class?: string;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  assignedBy: string;
  assignedDate: string;
}

// Mock data cho giảng viên
const mockInstructors: Instructor[] = Array(10)
  .fill(null)
  .map((_, index) => {
    const expertiseOptions = [
      "Web Development",
      "Mobile Development",
      "AI/ML",
      "Database",
      "UI/UX Design",
      "DevOps",
      "Blockchain",
      "Data Science",
      "Cloud Computing",
      "Network Security",
    ];

    // Lấy ngẫu nhiên 2-4 chuyên môn cho mỗi giảng viên
    const expertise = [];
    const expertiseCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < expertiseCount; i++) {
      const randomExpertise =
        expertiseOptions[Math.floor(Math.random() * expertiseOptions.length)];
      if (!expertise.includes(randomExpertise)) {
        expertise.push(randomExpertise);
      }
    }

    return {
      id: index + 1,
      name: `Giảng viên ${index + 1}`,
      email: `instructor${index + 1}@example.com`,
      avatar: "/src/assets/avatar.png",
      department: ["CNTT", "Kinh tế", "Ngoại ngữ", "Điện tử"][
        Math.floor(Math.random() * 4)
      ],
      expertise,
      currentAssignments: Math.floor(Math.random() * 5),
    };
  });

// Mock data cho khóa học
const mockCourses: Course[] = [
  {
    id: 1,
    title: "Lập trình web với React",
    category: "Web Development",
    type: "online",
  },
  {
    id: 2,
    title: "Phát triển ứng dụng di động với Flutter",
    category: "Mobile Development",
    type: "online",
  },
  {
    id: 3,
    title: "Nhập môn trí tuệ nhân tạo",
    category: "AI/ML",
    type: "academic",
    department: "CNTT",
    class: "K20-CNTT01",
  },
  {
    id: 4,
    title: "Cơ sở dữ liệu nâng cao",
    category: "Database",
    type: "academic",
    department: "CNTT",
    class: "K19-CNTT02",
  },
  {
    id: 5,
    title: "Thiết kế UX/UI chuyên nghiệp",
    category: "UI/UX Design",
    type: "online",
  },
  {
    id: 6,
    title: "Mạng máy tính",
    category: "Network",
    type: "academic",
    department: "CNTT",
    class: "K21-CNTT03",
  },
  {
    id: 7,
    title: "DevOps với Docker và Kubernetes",
    category: "DevOps",
    type: "online",
  },
  {
    id: 8,
    title: "Blockchain và ứng dụng",
    category: "Blockchain",
    type: "academic",
    department: "CNTT",
    class: "K18-CNTT01",
  },
  {
    id: 9,
    title: "Khoa học dữ liệu ứng dụng",
    category: "Data Science",
    type: "online",
  },
  {
    id: 10,
    title: "Điện toán đám mây",
    category: "Cloud Computing",
    type: "academic",
    department: "CNTT",
    class: "K19-CNTT01",
  },
];

// Mock data cho phân công
const mockAssignments: InstructorAssignment[] = Array(20)
  .fill(null)
  .map((_, index) => {
    const instructor =
      mockInstructors[Math.floor(Math.random() * mockInstructors.length)];
    const course = mockCourses[Math.floor(Math.random() * mockCourses.length)];

    // Tạo ngày bắt đầu và kết thúc ngẫu nhiên trong phạm vi 6 tháng
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 60 + Math.floor(Math.random() * 60));

    const assignedDate = new Date(startDate);
    assignedDate.setDate(
      assignedDate.getDate() - Math.floor(Math.random() * 30)
    );

    return {
      id: index + 1,
      instructorId: instructor.id,
      instructorName: instructor.name,
      instructorAvatar: instructor.avatar,
      courseId: course.id,
      courseTitle: course.title,
      courseType: course.type,
      department: course.department,
      class: course.class,
      status: ["active", "completed", "cancelled"][
        Math.floor(Math.random() * 3)
      ] as "active" | "completed" | "cancelled",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      assignedBy: "Admin",
      assignedDate: assignedDate.toISOString(),
    };
  });

const AdminAssignments = () => {
  const [assignments, setAssignments] =
    useState<InstructorAssignment[]>(mockAssignments);
  const [filteredAssignments, setFilteredAssignments] =
    useState<InstructorAssignment[]>(assignments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<InstructorAssignment | null>(null);
  const [formData, setFormData] = useState({
    instructorId: 0,
    courseId: 0,
    startDate: "",
    endDate: "",
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Thêm state cho menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAssignment, setMenuAssignment] =
    useState<InstructorAssignment | null>(null);

  // Danh sách các khoa
  const departments = [
    ...new Set(
      mockInstructors
        .map((instructor) => instructor.department)
        .filter((dep) => dep)
    ),
  ];

  // Lọc phân công theo các bộ lọc hiện tại
  useEffect(() => {
    let result = assignments;

    // Lọc theo tab
    if (tabValue === 0) {
      // Tất cả phân công
    } else if (tabValue === 1) {
      // Phân công khóa học trực tuyến
      result = result.filter((a) => a.courseType === "online");
    } else if (tabValue === 2) {
      // Phân công lớp học sinh viên trường
      result = result.filter((a) => a.courseType === "academic");
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Lọc theo loại khóa học
    if (typeFilter !== "all") {
      result = result.filter((a) => a.courseType === typeFilter);
    }

    // Lọc theo khoa
    if (departmentFilter !== "all") {
      result = result.filter((a) => a.department === departmentFilter);
    }

    // Tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.instructorName.toLowerCase().includes(query) ||
          a.courseTitle.toLowerCase().includes(query) ||
          (a.class && a.class.toLowerCase().includes(query))
      );
    }

    setFilteredAssignments(result);
  }, [
    assignments,
    searchQuery,
    statusFilter,
    typeFilter,
    departmentFilter,
    tabValue,
  ]);

  // Tính toán phân trang
  const pageCount = Math.ceil(filteredAssignments.length / rowsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Mở dialog thêm mới
  const handleOpenAddDialog = () => {
    setSelectedAssignment(null);
    setFormData({
      instructorId: 0,
      courseId: 0,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
        .toISOString()
        .substring(0, 10),
    });
    setOpenAddEditDialog(true);
  };

  // Mở dialog sửa
  const handleOpenEditDialog = (assignment: InstructorAssignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      instructorId: assignment.instructorId,
      courseId: assignment.courseId,
      startDate: new Date(assignment.startDate).toISOString().substring(0, 10),
      endDate: new Date(assignment.endDate).toISOString().substring(0, 10),
    });
    setOpenAddEditDialog(true);
  };

  // Lưu phân công
  const handleSaveAssignment = () => {
    if (formData.instructorId === 0 || formData.courseId === 0) {
      alert("Vui lòng chọn giảng viên và khóa học!");
      return;
    }

    const instructor = mockInstructors.find(
      (i) => i.id === formData.instructorId
    );
    const course = mockCourses.find((c) => c.id === formData.courseId);

    if (!instructor || !course) {
      alert("Không tìm thấy thông tin giảng viên hoặc khóa học!");
      return;
    }

    if (selectedAssignment) {
      // Cập nhật phân công
      const updatedAssignments = assignments.map((a) =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              instructorId: formData.instructorId,
              instructorName: instructor.name,
              instructorAvatar: instructor.avatar,
              courseId: formData.courseId,
              courseTitle: course.title,
              courseType: course.type,
              department: course.department,
              class: course.class,
              startDate: new Date(formData.startDate).toISOString(),
              endDate: new Date(formData.endDate).toISOString(),
            }
          : a
      );
      setAssignments(updatedAssignments);
    } else {
      // Thêm phân công mới
      const newAssignment: InstructorAssignment = {
        id: Math.max(...assignments.map((a) => a.id)) + 1,
        instructorId: formData.instructorId,
        instructorName: instructor.name,
        instructorAvatar: instructor.avatar,
        courseId: formData.courseId,
        courseTitle: course.title,
        courseType: course.type,
        department: course.department,
        class: course.class,
        status: "active",
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        assignedBy: "Admin",
        assignedDate: new Date().toISOString(),
      };
      setAssignments([...assignments, newAssignment]);
    }

    setOpenAddEditDialog(false);
  };

  // Xử lý xóa phân công
  const handleDeleteAssignment = () => {
    if (selectedAssignment) {
      setAssignments(assignments.filter((a) => a.id !== selectedAssignment.id));
      setOpenDeleteDialog(false);
    }
  };

  // Xử lý thay đổi trạng thái phân công
  const handleStatusChange = (
    assignment: InstructorAssignment,
    newStatus: "active" | "completed" | "cancelled"
  ) => {
    const updatedAssignments = assignments.map((a) =>
      a.id === assignment.id ? { ...a, status: newStatus } : a
    );
    setAssignments(updatedAssignments);
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Lấy thông tin hiển thị trạng thái
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { text: "Đang diễn ra", color: "success" };
      case "completed":
        return { text: "Đã hoàn thành", color: "info" };
      case "cancelled":
        return { text: "Đã hủy", color: "error" };
      default:
        return { text: status, color: "default" };
    }
  };

  // Thêm các hàm xử lý menu
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    assignment: InstructorAssignment
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuAssignment(assignment);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuAssignment(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý phân công giảng viên
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => {
          setTabValue(newValue);
          setPage(1);
        }}
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<AssignmentInd />}
          label="Tất cả phân công"
          iconPosition="start"
        />
        <Tab
          icon={<Assignment />}
          label="Khóa học trực tuyến"
          iconPosition="start"
        />
        <Tab icon={<School />} label="Lớp học sinh viên" iconPosition="start" />
      </Tabs>

      {/* Bộ lọc và tìm kiếm */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang diễn ra</MenuItem>
                  <MenuItem value="completed">Đã hoàn thành</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại phân công</InputLabel>
                <Select
                  value={typeFilter}
                  label="Loại phân công"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="online">Khóa học trực tuyến</MenuItem>
                  <MenuItem value="academic">Lớp học sinh viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {typeFilter === "academic" && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Khoa"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {departments.map((dep) => (
                      <MenuItem key={dep} value={dep}>
                        {dep}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
              >
                Thêm phân công mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bảng phân công */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Giảng viên</TableCell>
              <TableCell>{tabValue === 2 ? "Lớp" : "Khóa học"}</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={assignment.instructorAvatar}
                      sx={{ mr: 2, width: 30, height: 30 }}
                    />
                    <Box>
                      <Typography variant="body2">
                        {assignment.instructorName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {assignment.courseTitle}
                  </Typography>
                  {assignment.courseType === "academic" && (
                    <Typography variant="caption" color="text.secondary">
                      {assignment.department} - {assignment.class}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(assignment.startDate)} -{" "}
                    {formatDate(assignment.endDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Phân công: {formatDate(assignment.assignedDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={
                      assignment.courseType === "online"
                        ? "Khóa học trực tuyến"
                        : "Lớp học sinh viên"
                    }
                    color={
                      assignment.courseType === "online"
                        ? "primary"
                        : "secondary"
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getStatusInfo(assignment.status).text}
                    color={getStatusInfo(assignment.status).color as any}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(event) => handleOpenMenu(event, assignment)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedAssignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không có phân công nào
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

      {/* Dialog thêm/sửa phân công */}
      <Dialog
        open={openAddEditDialog}
        onClose={() => setOpenAddEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAssignment ? "Chỉnh sửa phân công" : "Thêm phân công mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={formData.instructorId}
                  label="Giảng viên"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructorId: Number(e.target.value),
                    })
                  }
                >
                  <MenuItem value={0} disabled>
                    Chọn giảng viên
                  </MenuItem>
                  {mockInstructors.map((instructor) => (
                    <MenuItem key={instructor.id} value={instructor.id}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={instructor.avatar}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        {instructor.name} - {instructor.department}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.instructorId > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Thông tin giảng viên
                  </Typography>
                  {(() => {
                    const instructor = mockInstructors.find(
                      (i) => i.id === formData.instructorId
                    );
                    return instructor ? (
                      <>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Avatar
                            src={instructor.avatar}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="body1">
                              {instructor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {instructor.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" gutterBottom>
                          <strong>Khoa:</strong> {instructor.department}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Chuyên môn:</strong>{" "}
                          {instructor.expertise.join(", ")}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Số phân công hiện tại:</strong>{" "}
                          {instructor.currentAssignments}
                        </Typography>
                      </>
                    ) : null;
                  })()}
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Khóa học/Lớp học</InputLabel>
                <Select
                  value={formData.courseId}
                  label="Khóa học/Lớp học"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseId: Number(e.target.value),
                    })
                  }
                >
                  <MenuItem value={0} disabled>
                    Chọn khóa học hoặc lớp học
                  </MenuItem>
                  <MenuItem disabled>--- Khóa học trực tuyến ---</MenuItem>
                  {mockCourses
                    .filter((course) => course.type === "online")
                    .map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.title}
                      </MenuItem>
                    ))}
                  <MenuItem disabled>--- Lớp học sinh viên ---</MenuItem>
                  {mockCourses
                    .filter((course) => course.type === "academic")
                    .map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.title} ({course.department} - {course.class})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {formData.courseId > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Thông tin khóa học/lớp học
                  </Typography>
                  {(() => {
                    const course = mockCourses.find(
                      (c) => c.id === formData.courseId
                    );
                    return course ? (
                      <>
                        <Typography variant="body1" gutterBottom>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Loại:</strong>{" "}
                          {course.type === "online"
                            ? "Khóa học trực tuyến"
                            : "Lớp học sinh viên"}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Danh mục:</strong> {course.category}
                        </Typography>
                        {course.type === "academic" && (
                          <>
                            <Typography variant="body2" gutterBottom>
                              <strong>Khoa:</strong> {course.department}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              <strong>Lớp:</strong> {course.class}
                            </Typography>
                          </>
                        )}
                      </>
                    ) : null;
                  })()}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Thời gian phân công
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEditDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveAssignment}
            variant="contained"
            disabled={!formData.instructorId || !formData.courseId}
          >
            {selectedAssignment ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận hủy phân công</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn hủy phân công này? Hành động này sẽ đánh dấu
            phân công là "Đã hủy".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Không</Button>
          <Button color="error" onClick={handleDeleteAssignment}>
            Hủy phân công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu thao tác */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {menuAssignment?.status === "active" && (
          <MenuItem
            onClick={() => {
              handleStatusChange(menuAssignment, "completed");
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Đánh dấu hoàn thành</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            handleOpenEditDialog(menuAssignment!);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>

        {menuAssignment?.status !== "cancelled" && (
          <MenuItem
            onClick={() => {
              setSelectedAssignment(menuAssignment);
              setOpenDeleteDialog(true);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Cancel fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Hủy phân công</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default AdminAssignments;
