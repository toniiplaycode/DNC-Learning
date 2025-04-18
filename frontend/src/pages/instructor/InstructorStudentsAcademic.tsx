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
import { Add, School } from "@mui/icons-material";

const InstructorStudentsAcademic = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const currentClassInstructor = useAppSelector(selectCurrentClassInstructor);
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

  useEffect(() => {
    dispatch(fetchClassInstructorById(Number(currentUser?.userInstructor?.id)));
  }, [dispatch, currentUser]);

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

  const filteredClasses = currentClassInstructor?.filter((classInstructor) => {
    const matchesSearch =
      classInstructor.academicClass.className
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      classInstructor.academicClass.classCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

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
      matchesSearch && matchesSemester && matchesStatus && matchesStudentCount
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản Lý Lớp Học
        </Typography>
      </Box>
      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
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

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Học Kỳ</InputLabel>
            <Select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              label="Học Kỳ"
            >
              <MenuItem value="all">Tất cả học kỳ</MenuItem>
              <MenuItem value="20251">Học kỳ 1 2025</MenuItem>
              <MenuItem value="20252">Học kỳ 2 2025</MenuItem>
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
              <MenuItem value="inactive">Không hoạt động</MenuItem>
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
          <Stack direction="row" spacing={1}>
            {searchTerm && (
              <Chip
                label={`Tìm kiếm: ${searchTerm}`}
                onDelete={() => setSearchTerm("")}
                size="small"
              />
            )}
            {semesterFilter !== "all" && (
              <Chip
                label={`Học kỳ: ${semesterFilter}`}
                onDelete={() => setSemesterFilter("all")}
                size="small"
              />
            )}
            {statusFilter !== "all" && (
              <Chip
                label={`Trạng thái: ${
                  statusFilter === "active"
                    ? "Đang hoạt động"
                    : "Không hoạt động"
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
                    <Chip
                      label={
                        classInstructor.academicClass.status === "active"
                          ? "Đang hoạt động"
                          : "Không hoạt động"
                      }
                      color={
                        classInstructor.academicClass.status === "active"
                          ? "success"
                          : "default"
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
        <MenuItemMUI>
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
                {selectedClass?.academicClass.studentsAcademic?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Chưa có sinh viên trong lớp này
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedClass?.academicClass.studentsAcademic
                    ?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    ?.map((student) => (
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
            count={selectedClass?.academicClass.studentsAcademic?.length || 0}
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
    </Box>
  );
};

export default InstructorStudentsAcademic;
