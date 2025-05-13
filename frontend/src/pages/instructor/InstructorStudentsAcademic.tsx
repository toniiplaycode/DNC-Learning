import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Menu,
  MenuItem as MenuItemMUI,
  ListItemIcon,
  Button,
  DialogActions,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ClassIcon from "@mui/icons-material/Class";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AddStudentsDialog } from "./component/AddStudentsDialog";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { selectCurrentClassInstructor } from "../../features/academic-class-instructors/academicClassInstructorsSelectors";
import { fetchClassInstructorById } from "../../features/academic-class-instructors/academicClassInstructorsSlice";
import {
  createManyStudentsAcademic,
  updateStudentAcademic,
  deleteStudentAcademic,
} from "../../features/users/usersApiSlice";
import { toast } from "react-toastify";
import { EditStudentDialog } from "./component/EditStudentDialog";
import { Add, AddBox, School } from "@mui/icons-material";
import { AddClassCoursesDialog } from "./component/AddClassCoursesDialog";
import { fetchClassCourses } from "../../features/academic-class-courses/academicClassCoursesSlice";
import { selectAllClassCourses } from "../../features/academic-class-courses/academicClassCoursesSelectors";
import { AddEditClassAcademicDialog } from "./component/AddEditClassAcademicDialog";
import { AcademicClassStatus } from "../../types/academic-class.types";
import {
  createAcademicClass,
  deleteAcademicClass,
  updateAcademicClass,
} from "../../features/academic-classes/academicClassesSlice";
import * as XLSX from "xlsx";

// Thêm interface cho học kỳ
interface Semester {
  value: string; // Format: "YYYYT" (ví dụ: "20251" cho học kỳ 1 năm 2025)
  label: string; // Format: "Học kỳ T YYYY" (ví dụ: "Học kỳ 1 2025")
}

const InstructorStudentsAcademic = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const currentClassInstructor = useAppSelector(selectCurrentClassInstructor);
  const classCourses = useAppSelector(selectAllClassCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [studentCountFilter, setStudentCountFilter] = useState("all");
  const [openAddStudents, setOpenAddStudents] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddCourses, setOpenAddCourses] = useState(false);
  const [openAddClass, setOpenAddClass] = useState(false);
  const [openDeleteClassDialog, setOpenDeleteClassDialog] = useState(false);
  const [selectedEditClass, setSelectedEditClass] = useState(null);
  const [studentSort, setStudentSort] = useState<"az" | "za" | "none">("none");
  const [studentYearFilter, setStudentYearFilter] = useState<string>("all");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchClassInstructorById(Number(currentUser?.userInstructor?.id)));
    dispatch(fetchClassCourses());
  }, [dispatch, currentUser]);

  // Hàm tạo danh sách học kỳ
  const generateSemesters = (startYear: number, endYear: number) => {
    const newSemesters: Semester[] = [];
    for (let year = startYear; year <= endYear; year++) {
      newSemesters.push({
        value: `${year}1`,
        label: `Học kỳ 1 ${year}`,
      });
      newSemesters.push({
        value: `${year}2`,
        label: `Học kỳ 2 ${year}`,
      });
    }
    return newSemesters;
  };

  // Hàm lấy học kỳ từ dữ liệu hiện có
  const getExistingSemesters = () => {
    const existingSemesters = new Set(
      currentClassInstructor?.map((ci) => ci.academicClass.semester) || []
    );
    return Array.from(existingSemesters).map((semester) => ({
      value: semester,
      label: `Học kỳ ${semester.slice(-1)} ${semester.slice(0, 4)}`,
    }));
  };

  // Khởi tạo danh sách học kỳ
  useEffect(() => {
    const existingSemesters = getExistingSemesters();
    const nextTwoYears = generateSemesters(currentYear, currentYear + 2);

    const allSemesters = [...existingSemesters, ...nextTwoYears];
    const uniqueSemesters = Array.from(
      new Map(allSemesters.map((item) => [item.value, item])).values()
    ).sort((a, b) => b.value.localeCompare(a.value));

    setSemesters(uniqueSemesters);
  }, [currentClassInstructor, currentYear]);

  const handleOpenMenu = (event, classData) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(classData);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleViewStudents = () => {
    setOpenDialog(true);
    setPage(0); // Reset to first page
    handleCloseMenu();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
    setPage(0); // Reset pagination
  };

  const handleAddStudents = async (students) => {
    try {
      await dispatch(createManyStudentsAcademic(students)).then((response) => {
        if (response.error) {
          toast.error("Không đúng định dạng thêm hoặc sinh viên đã tồn tại !");
        } else {
          toast.success("Thêm sinh viên thành công!");
        }
      });

      await dispatch(
        fetchClassInstructorById(Number(currentUser?.userInstructor?.id))
      )
        .unwrap()
        .then((updatedClasses) => {
          // Find and update the selected class with new data
          const updatedClass = updatedClasses.find(
            (cls) => cls.id === selectedClass.id
          );
          setSelectedClass(updatedClass);
        });

      setOpenAddStudents(false);
    } catch (error) {
      console.error("Error adding students:", error);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setOpenEditDialog(true);
  };

  // Add handler for edit submission
  const handleEditSubmit = async (updatedStudent) => {
    try {
      // Add your updateStudent API call
      await dispatch(
        updateStudentAcademic({
          user: {
            id: updatedStudent.userId,
            username: updatedStudent.username,
            email: updatedStudent.email,
            phone: updatedStudent.phone,
          },
          userStudentAcademic: {
            id: updatedStudent.id,
            fullName: updatedStudent.fullName,
            studentCode: updatedStudent.studentCode,
            academicYear: updatedStudent.academicYear,
            status: updatedStudent.status,
          },
        })
      ).unwrap();

      // Refresh the class data
      await dispatch(
        fetchClassInstructorById(Number(currentUser?.userInstructor?.id))
      )
        .unwrap()
        .then((updatedClasses) => {
          const updatedClass = updatedClasses.find(
            (cls) => cls.id === selectedClass.id
          );
          setSelectedClass(updatedClass);
        });

      setOpenEditDialog(false);
      toast.success("Cập nhật thông tin sinh viên thành công!");
    } catch (error) {
      toast.error(
        error.message || "Có lỗi xảy ra khi cập nhật thông tin sinh viên!"
      );
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteStudentAcademic(studentToDelete.user.id)).unwrap();
      // Refresh the class data
      await dispatch(
        fetchClassInstructorById(Number(currentUser?.userInstructor?.id))
      )
        .unwrap()
        .then((updatedClasses) => {
          const updatedClass = updatedClasses.find(
            (cls) => cls.id === selectedClass.id
          );
          setSelectedClass(updatedClass);
        });
      setOpenDeleteDialog(false);
      setStudentToDelete(null);
      toast.success("Xóa sinh viên thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sinh viên!");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddClass = async (classData: {
    classCode: string;
    className: string;
    semester: string;
    status: AcademicClassStatus;
  }) => {
    const newClassData = {
      ...classData,
      instructorId: currentUser?.userInstructor?.id,
    };
    try {
      await dispatch(createAcademicClass(newClassData)).unwrap();
      toast.success("Thêm lớp học thành công!");
      setOpenAddClass(false);
      dispatch(
        fetchClassInstructorById(Number(currentUser?.userInstructor?.id))
      );
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi thêm lớp học!");
    }
  };

  const handleEditClass = async (classData: {
    id: number;
    classCode: string;
    className: string;
    semester: string;
    status: AcademicClassStatus;
  }) => {
    try {
      await dispatch(updateAcademicClass(classData)).unwrap();
      toast.success("Cập nhật lớp học thành công!");
      setOpenAddClass(false);
      dispatch(
        fetchClassInstructorById(Number(currentUser?.userInstructor?.id))
      );
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật lớp học!");
    }
  };

  const handleDeleteClass = async () => {
    try {
      await dispatch(
        deleteAcademicClass(selectedClass.academicClass.id)
      ).unwrap();
      toast.success("Xóa lớp học thành công!");
      setOpenDeleteClassDialog(false);
      handleCloseMenu();
      dispatch(
        fetchClassInstructorById(Number(currentUser?.userInstructor?.id))
      );
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa lớp học!");
    }
  };

  // Cập nhật hàm filter
  const filteredClasses = currentClassInstructor?.filter((classInstructor) => {
    const matchesSearch =
      classInstructor.academicClass.className
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      classInstructor.academicClass.classCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const semester = classInstructor.academicClass.semester;
    const year = semester.substring(0, 4);
    const term = semester.substring(4);

    const matchesYear =
      academicYearFilter === "all" || year === academicYearFilter;
    const matchesTerm = termFilter === "all" || term === termFilter;

    const matchesSemester =
      semesterFilter === "all" ||
      classInstructor.academicClass.semester === semesterFilter;

    const matchesStatus =
      statusFilter === "all" ||
      classInstructor.academicClass.status === statusFilter;

    const studentCount =
      classInstructor.academicClass.studentsAcademic?.length || 0;
    const matchesStudentCount =
      studentCountFilter === "all" ||
      (studentCountFilter === "0" && studentCount === 0) ||
      (studentCountFilter === "1-10" &&
        studentCount > 0 &&
        studentCount <= 10) ||
      (studentCountFilter === "11-20" &&
        studentCount > 10 &&
        studentCount <= 20) ||
      (studentCountFilter === "20+" && studentCount > 20);

    return (
      matchesSearch &&
      matchesYear &&
      matchesTerm &&
      matchesSemester &&
      matchesStatus &&
      matchesStudentCount
    );
  });

  let studentsList = selectedClass?.academicClass?.studentsAcademic || [];

  if (studentYearFilter !== "all") {
    studentsList = studentsList.filter(
      (s) => s.academicYear === studentYearFilter
    );
  }

  if (studentSort === "az") {
    studentsList = [...studentsList].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "vi", { sensitivity: "base" })
    );
  } else if (studentSort === "za") {
    studentsList = [...studentsList].sort((a, b) =>
      b.fullName.localeCompare(a.fullName, "vi", { sensitivity: "base" })
    );
  }

  const handleExportStudents = () => {
    if (!studentsList.length) {
      toast.info("Không có sinh viên để xuất file!");
      return;
    }
    const data = studentsList.map((student, idx) => ({
      STT: idx + 1,
      "Mã sinh viên": student.studentCode,
      "Họ và tên": student.fullName,
      Khóa: student.academicYear,
      Email: student.user?.email || "",
      "Số điện thoại": student.user?.phone || "",
      "Trạng thái": student.status === "studying" ? "Đang học" : "Nghỉ học",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachSinhVien");
    XLSX.writeFile(
      wb,
      `DanhSachSinhVien_${
        selectedClass?.academicClass?.classCode || "Lop"
      }.xlsx`
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Quản Lý Lớp Học
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddClass(true)}
        >
          Thêm Lớp Học
        </Button>
      </Box>
      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <TextField
            placeholder="Tìm kiếm theo tên lớp, mã lớp..."
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Năm học</InputLabel>
            <Select
              value={academicYearFilter}
              label="Năm học"
              onChange={(e) => {
                setAcademicYearFilter(e.target.value);
                setTermFilter("all");
              }}
            >
              <MenuItem value="all">Tất cả năm học</MenuItem>
              {Array.from(new Set(semesters.map((s) => s.value.slice(0, 4))))
                .sort((a, b) => b.localeCompare(a))
                .map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 150 }}
            disabled={academicYearFilter === "all"}
          >
            <InputLabel>Học kỳ</InputLabel>
            <Select
              value={termFilter}
              label="Học kỳ"
              onChange={(e) => setTermFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả học kỳ</MenuItem>
              {semesters
                .filter((s) => s.value.startsWith(academicYearFilter))
                .map((semester) => (
                  <MenuItem
                    key={semester.value}
                    value={semester.value.slice(-1)}
                  >
                    {semester.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Trạng Thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng Thái"
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="completed">Đã hoàn thành</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Số Lượng Sinh Viên</InputLabel>
            <Select
              value={studentCountFilter}
              onChange={(e) => setStudentCountFilter(e.target.value)}
              label="Số Lượng Sinh Viên"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="0">Chưa có sinh viên</MenuItem>
              <MenuItem value="1-10">1-10 sinh viên</MenuItem>
              <MenuItem value="11-20">11-20 sinh viên</MenuItem>
              <MenuItem value="20+">Trên 20 sinh viên</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Hiển thị số kết quả tìm thấy */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Tìm thấy {filteredClasses?.length || 0} lớp học
          </Typography>

          {/* Hiển thị các filter đang áp dụng */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {searchTerm && (
              <Chip
                label={`Tìm kiếm: ${searchTerm}`}
                onDelete={() => setSearchTerm("")}
                size="small"
              />
            )}
            {academicYearFilter !== "all" && (
              <Chip
                label={`Năm học: ${academicYearFilter}`}
                onDelete={() => {
                  setAcademicYearFilter("all");
                  setTermFilter("all");
                }}
                size="small"
              />
            )}
            {termFilter !== "all" && (
              <Chip
                label={`Học kỳ: ${
                  termFilter === "1" ? "Học kỳ 1" : "Học kỳ 2"
                }`}
                onDelete={() => setTermFilter("all")}
                size="small"
              />
            )}
            {statusFilter !== "all" && (
              <Chip
                label={`Trạng thái: ${
                  statusFilter === "active"
                    ? "Đang hoạt động"
                    : statusFilter === "completed"
                    ? "Đã hoàn thành"
                    : "Đã hủy"
                }`}
                onDelete={() => setStatusFilter("all")}
                size="small"
              />
            )}
            {studentCountFilter !== "all" && (
              <Chip
                label={`Số SV: ${studentCountFilter}`}
                onDelete={() => setStudentCountFilter("all")}
                size="small"
              />
            )}
          </Stack>
        </Box>
      </Paper>
      {/* Classes List */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>Tên Lớp</TableCell>
              <TableCell>Mã Lớp</TableCell>
              <TableCell>Học Kỳ</TableCell>
              <TableCell>Số Sinh Viên</TableCell>
              <TableCell>Số Khóa học</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClasses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không tìm thấy lớp học nào phù hợp với điều kiện tìm kiếm
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses?.map((classInstructor) => (
                <TableRow key={classInstructor.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.light" }}>
                        <School />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {classInstructor.academicClass.className}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {classInstructor.academicClass.classCode}
                  </TableCell>
                  <TableCell>
                    {classInstructor.academicClass.semester}
                  </TableCell>
                  <TableCell>
                    {classInstructor.academicClass.studentsAcademic?.length ||
                      0}
                  </TableCell>
                  <TableCell>
                    {
                      classCourses.filter(
                        (cc) => cc.classId === classInstructor.academicClass.id
                      ).length
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        classInstructor.academicClass.status === "active"
                          ? "Đang hoạt động"
                          : classInstructor.academicClass.status === "completed"
                          ? "Đã hoàn thành"
                          : "Đã hủy"
                      }
                      color={
                        classInstructor.academicClass.status === "active"
                          ? "success"
                          : classInstructor.academicClass.status === "completed"
                          ? "info"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, classInstructor)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItemMUI onClick={() => setOpenAddCourses(true)}>
          <ListItemIcon>
            <AddBox fontSize="small" />
          </ListItemIcon>
          Thêm khóa học cho lớp
        </MenuItemMUI>
        <MenuItemMUI onClick={handleViewStudents}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          Xem danh sách sinh viên
        </MenuItemMUI>
        <MenuItemMUI onClick={() => setOpenAddStudents(true)}>
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          Thêm sinh viên
        </MenuItemMUI>
        <MenuItemMUI
          onClick={() => {
            setSelectedEditClass(selectedClass.academicClass);
            setOpenAddClass(true);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Chỉnh sửa
        </MenuItemMUI>
        <MenuItemMUI onClick={() => setOpenDeleteClassDialog(true)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Xóa
        </MenuItemMUI>
      </Menu>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "primary.light" }}>
                <ClassIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedClass?.academicClass.className}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã lớp: {selectedClass?.academicClass.classCode}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddStudents(true)}
            >
              Thêm sinh viên
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Lọc theo khóa</InputLabel>
              <Select
                value={studentYearFilter}
                label="Lọc theo khóa"
                onChange={(e) => setStudentYearFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {Array.from(new Set(studentsList.map((s) => s.academicYear)))
                  .sort()
                  .map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={studentSort}
                label="Sắp xếp"
                onChange={(e) =>
                  setStudentSort(e.target.value as "az" | "za" | "none")
                }
              >
                <MenuItem value="none">Mặc định</MenuItem>
                <MenuItem value="az">Tên A-Z</MenuItem>
                <MenuItem value="za">Tên Z-A</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="success"
              onClick={handleExportStudents}
            >
              Tải danh sách
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sinh viên</TableCell>
                  <TableCell>MSSV</TableCell>
                  <TableCell>Khóa</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Chưa có sinh viên trong lớp này
                    </TableCell>
                  </TableRow>
                ) : (
                  studentsList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              src={student.user.avatarUrl}
                              alt={student.fullName}
                            >
                              {student.fullName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">
                                {student.fullName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {student.user.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{student.studentCode}</TableCell>
                        <TableCell>{student.academicYear}</TableCell>
                        <TableCell>{student.user.email}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={
                                student.status === "studying"
                                  ? "Đang học"
                                  : "Nghỉ học"
                              }
                              color={
                                student.status === "studying"
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStudent(student);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStudentToDelete(student);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={studentsList.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count}`
            }
          />
        </DialogContent>
      </Dialog>
      {/* Add the dialog component to your JSX */}
      <AddStudentsDialog
        open={openAddStudents}
        onClose={() => setOpenAddStudents(false)}
        classData={selectedClass}
        onSubmit={handleAddStudents}
      />
      {/* Edit the dialog component to your JSX */}
      <EditStudentDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        student={selectedStudent}
        onSubmit={handleEditSubmit}
      />
      {/* Delete the dialog component to your JSX */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa sinh viên</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sinh viên {studentToDelete?.fullName}?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <AddClassCoursesDialog
        studentAcademic={selectedClass?.academicClass?.studentsAcademic || []}
        open={openAddCourses}
        onClose={() => setOpenAddCourses(false)}
        classData={selectedClass}
      />
      <AddEditClassAcademicDialog
        open={openAddClass}
        onClose={() => {
          setOpenAddClass(false);
          setSelectedEditClass(null);
        }}
        initialData={selectedEditClass}
        existingSemesters={
          currentClassInstructor?.map((ci) => ci.academicClass.semester) || []
        }
        onSubmit={(classData) => {
          if (selectedEditClass) {
            handleEditClass(classData);
          } else {
            handleAddClass(classData);
          }
        }}
      />
      <Dialog
        open={openDeleteClassDialog}
        onClose={() => setOpenDeleteClassDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Xóa lớp học</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedClass?.academicClass.studentsAcademic?.length > 0 ||
          classCourses.filter(
            (cc) => cc.classId === selectedClass?.academicClass.id
          ).length > 0 ? (
            <>
              <Typography color="error" gutterBottom>
                Không thể xóa lớp học này!
              </Typography>
              <Typography variant="body2" gutterBottom>
                Lớp học "{selectedClass?.academicClass.className}" (
                {selectedClass?.academicClass.classCode}) hiện đang có:
              </Typography>
              <Stack spacing={1} sx={{ mt: 1, mb: 2 }}>
                {selectedClass?.academicClass.studentsAcademic?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      bgcolor: "error.lighter",
                      borderRadius: 1,
                    }}
                  >
                    <PeopleIcon color="error" fontSize="small" />
                    <Typography variant="body2">
                      {selectedClass.academicClass.studentsAcademic.length} sinh
                      viên đang theo học
                    </Typography>
                  </Box>
                )}
                {classCourses.filter(
                  (cc) => cc.classId === selectedClass?.academicClass.id
                ).length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      bgcolor: "error.lighter",
                      borderRadius: 1,
                    }}
                  >
                    <School color="error" fontSize="small" />
                    <Typography variant="body2">
                      {
                        classCourses.filter(
                          (cc) => cc.classId === selectedClass?.academicClass.id
                        ).length
                      }{" "}
                      khóa học được gán
                    </Typography>
                  </Box>
                )}
              </Stack>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Vui lòng xóa tất cả sinh viên và khóa học trước khi xóa lớp học.
              </Typography>
            </>
          ) : (
            <>
              <Typography>
                Bạn có chắc chắn muốn xóa lớp học "
                {selectedClass?.academicClass.className}" (
                {selectedClass?.academicClass.classCode})?
              </Typography>
              <Typography color="error" sx={{ mt: 2 }}>
                Lưu ý: Hành động này không thể hoàn tác sau khi xóa!
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteClassDialog(false)}>
            {selectedClass?.academicClass.studentsAcademic?.length > 0 ||
            classCourses.filter(
              (cc) => cc.classId === selectedClass?.academicClass.id
            ).length > 0
              ? "Đóng"
              : "Hủy"}
          </Button>
          {selectedClass?.academicClass.studentsAcademic?.length === 0 &&
            classCourses.filter(
              (cc) => cc.classId === selectedClass?.academicClass.id
            ).length === 0 && (
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteClass}
              >
                Xác nhận xóa
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorStudentsAcademic;
