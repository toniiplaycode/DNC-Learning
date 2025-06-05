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
  Tooltip,
  OutlinedInput,
  Avatar,
  TablePagination,
  Stack,
} from "@mui/material";
import {
  Add,
  Search,
  Clear,
  Edit,
  Delete,
  School,
  PersonAdd,
  People,
  Class as ClassIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  fetchAcademicClasses,
  deleteAcademicClass,
  updateAcademicClass,
  createAcademicClass,
} from "../../features/academic-classes/academicClassesSlice";
import { selectAllAcademicClasses } from "../../features/academic-classes/academicClassesSelectors";
import {
  AcademicClass,
  AcademicClassStatus,
} from "../../types/academic-class.types";
import { selectAllInstructors } from "../../features/user_instructors/instructorsSelectors";
import { fetchInstructors } from "../../features/user_instructors/instructorsApiSlice";
import { createClassInstructor } from "../../features/academic-class-instructors/academicClassInstructorsSlice";
import { toast } from "react-toastify";
import { AddStudentsDialog } from "../instructor/component/AddStudentsDialog";
import { EditStudentDialog } from "../instructor/component/EditStudentDialog";
import {
  createManyStudentsAcademic,
  updateStudentAcademic,
  deleteStudentAcademic,
} from "../../features/users/usersApiSlice";
import * as XLSX from "xlsx";
import { fetchMajors } from "../../features/majors/majorsSlice";
import { fetchPrograms } from "../../features/programs/programsSlice";
import { selectAllMajors } from "../../features/majors/majorsSelectors";
import { selectAllPrograms } from "../../features/programs/programsSelectors";

interface FormData {
  id?: number;
  classCode: string;
  className: string;
  semester: string;
  status: AcademicClassStatus;
  instructorId: number;
  majorId: string;
  programId: string;
}

interface AssignInstructorFormData {
  instructorIds: number[];
}
interface Semester {
  value: string; // Format: "YYYYT" (ví dụ: "20251" cho học kỳ 1 năm 2025)
  label: string; // Format: "Học kỳ T YYYY" (ví dụ: "Học kỳ 1 2025")
}

const AdminAcademicClasses: React.FC = () => {
  const dispatch = useAppDispatch();
  const academicClasses = useAppSelector(selectAllAcademicClasses);
  const instructors = useAppSelector(selectAllInstructors);
  const majors = useAppSelector(selectAllMajors);
  const programs = useAppSelector(selectAllPrograms);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [instructorFilter, setInstructorFilter] = useState<number | "all">(
    "all"
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AcademicClass | null>(
    null
  );
  const [filteredPrograms, setFilteredPrograms] = useState(programs);
  const [formData, setFormData] = useState<FormData>({
    classCode: "",
    className: "",
    semester: "",
    status: AcademicClassStatus.ACTIVE,
    instructorId: 0,
    majorId: "",
    programId: "",
  });

  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [assignFormData, setAssignFormData] =
    useState<AssignInstructorFormData>({
      instructorIds: [],
    });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<AcademicClass | null>(
    null
  );

  const [openStudentListDialog, setOpenStudentListDialog] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] =
    useState<AcademicClass | null>(null);

  const [openAddStudents, setOpenAddStudents] = useState(false);
  const [openEditStudent, setOpenEditStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [openDeleteStudentDialog, setOpenDeleteStudentDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  const [studentSort, setStudentSort] = useState<"az" | "za" | "none">("none");
  const [studentYearFilter, setStudentYearFilter] = useState<string>("all");

  // Thêm state mới cho năm học và học kỳ
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");

  // Thêm state cho danh sách học kỳ
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [majorFilter, setMajorFilter] = useState<string>("all");

  useEffect(() => {
    dispatch(fetchAcademicClasses());
    dispatch(fetchInstructors());
    dispatch(fetchMajors({}));
    dispatch(fetchPrograms({}));
  }, [dispatch]);

  // Hàm tạo danh sách học kỳ
  const generateSemesters = (startYear: number, endYear: number) => {
    const newSemesters: Semester[] = [];
    for (let year = startYear; year <= endYear; year++) {
      // Thêm học kỳ 1
      newSemesters.push({
        value: `${year}1`,
        label: `Học kỳ 1 ${year}`,
      });
      // Thêm học kỳ 2
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
      academicClasses?.map((ac) => ac.semester) || []
    );
    return Array.from(existingSemesters).map((semester) => ({
      value: semester,
      label: `Học kỳ ${semester.slice(-1)} ${semester.slice(0, 4)}`,
    }));
  };

  // Khởi tạo danh sách học kỳ khi component mount
  useEffect(() => {
    // Lấy học kỳ từ dữ liệu hiện có
    const existingSemesters = getExistingSemesters();

    // Tạo thêm học kỳ cho 2 năm tiếp theo
    const nextTwoYears = generateSemesters(currentYear, currentYear + 2);

    // Kết hợp và loại bỏ trùng lặp
    const allSemesters = [...existingSemesters, ...nextTwoYears];
    const uniqueSemesters = Array.from(
      new Map(allSemesters.map((item) => [item.value, item])).values()
    ).sort((a, b) => b.value.localeCompare(a.value)); // Sắp xếp giảm dần

    setSemesters(uniqueSemesters);
  }, [academicClasses, currentYear]);

  const handleEdit = (classId: number) => {
    const academicClass = academicClasses.find((c) => c.id === classId);
    if (academicClass) {
      handleOpenDialog(academicClass);
    }
  };

  const handleDelete = async (classId: number) => {
    const academicClass = academicClasses.find((c) => c.id === classId);
    if (!academicClass) return;

    // Kiểm tra điều kiện xóa
    const studentCount = academicClass.studentsAcademic?.length || 0;
    const courseCount = academicClass.classCourses?.length || 0;

    if (studentCount > 0) {
      toast.error("Không thể xóa lớp học vì vẫn còn sinh viên!");
      return;
    }

    if (courseCount > 0) {
      toast.error("Không thể xóa lớp học vì vẫn còn khóa học!");
      return;
    }

    setClassToDelete(academicClass);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    try {
      await dispatch(deleteAcademicClass(classToDelete.id)).unwrap();
      toast.success("Xóa lớp học thành công!");
      dispatch(fetchAcademicClasses());
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa lớp học!");
    } finally {
      setOpenDeleteDialog(false);
      setClassToDelete(null);
    }
  };

  const handleOpenAssignDialog = (classId: number) => {
    const academicClass = academicClasses.find((c) => c.id === classId);
    if (academicClass) {
      setSelectedClassId(classId);
      setAssignFormData({
        instructorIds:
          academicClass.instructors?.map((i) => i.instructorId) || [],
      });
      setOpenAssignDialog(true);
    }
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedClassId(null);
    setAssignFormData({ instructorIds: [] });
  };

  const handleAssignInstructors = async () => {
    if (selectedClassId) {
      try {
        await dispatch(
          createClassInstructor({
            classId: selectedClassId,
            instructorIds: assignFormData.instructorIds.map((id) => Number(id)),
          })
        ).unwrap();
        await dispatch(fetchAcademicClasses());
        handleCloseAssignDialog();
      } catch (err) {
        console.error("Error assigning instructors:", err);
      }
    }
  };

  const handleOpenStudentList = (academicClass: AcademicClass) => {
    setSelectedClassForStudents(academicClass);
    setOpenStudentListDialog(true);
  };

  const handleCloseStudentList = () => {
    setOpenStudentListDialog(false);
    setSelectedClassForStudents(null);
  };

  // Cập nhật hàm filter
  const filteredClasses = academicClasses.filter((academicClass) => {
    const matchesSearch =
      academicClass.className
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      academicClass.classCode.toLowerCase().includes(searchTerm.toLowerCase());

    const semester = academicClass.semester;
    const year = semester.substring(0, 4);
    const term = semester.substring(4);

    const matchesYear =
      academicYearFilter === "all" || year === academicYearFilter;
    const matchesTerm = termFilter === "all" || term === termFilter;

    const matchesStatus =
      statusFilter === "all" || academicClass.status === statusFilter;

    const matchesInstructor =
      instructorFilter === "all" ||
      academicClass.instructors?.some(
        (instructorAssignment) =>
          instructorAssignment?.instructor?.id === instructorFilter
      );

    const matchesMajor =
      majorFilter === "all" || String(academicClass.majorId) === majorFilter;

    return (
      matchesSearch &&
      matchesYear &&
      matchesTerm &&
      matchesStatus &&
      matchesInstructor &&
      matchesMajor
    );
  });

  // Pagination calculation
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredClasses.length / rowsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, instructorFilter]);

  const getStatusColor = (status: AcademicClassStatus) => {
    switch (status) {
      case AcademicClassStatus.ACTIVE:
        return "success";
      case AcademicClassStatus.COMPLETED:
        return "default";
      case AcademicClassStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: AcademicClassStatus) => {
    switch (status) {
      case AcademicClassStatus.ACTIVE:
        return "Đang hoạt động";
      case AcademicClassStatus.COMPLETED:
        return "Đã hoàn thành";
      case AcademicClassStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleOpenDialog = (cls?: AcademicClass) => {
    if (cls) {
      setSelectedClass(cls);
      setFormData({
        id: cls.id,
        classCode: cls.classCode,
        className: cls.className,
        semester: cls.semester,
        status: cls.status,
        instructorId: cls.instructors?.[0]?.instructorId || 0,
        majorId: String(cls.majorId),
        programId: String(cls.programId),
      });
    } else {
      setSelectedClass(null);
      setFormData({
        classCode: "",
        className: "",
        semester: "",
        status: AcademicClassStatus.ACTIVE,
        instructorId: 0,
        majorId: "",
        programId: "",
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (selectedClass) {
        // Update existing class
        await dispatch(
          updateAcademicClass({
            id: selectedClass.id,
            classCode: formData.classCode,
            className: formData.className,
            semester: formData.semester,
            status: formData.status,
            majorId: Number(formData.majorId),
            programId: Number(formData.programId),
          })
        ).unwrap();
        toast.success("Cập nhật lớp học thành công!");
      } else {
        // Create new class
        await dispatch(
          createAcademicClass({
            classCode: formData.classCode,
            className: formData.className,
            semester: formData.semester,
            status: formData.status,
            instructorId: formData.instructorId,
            majorId: Number(formData.majorId),
            programId: Number(formData.programId),
          })
        ).unwrap();
        toast.success("Thêm lớp học thành công!");
      }
      setOpenDialog(false);
      dispatch(fetchAcademicClasses());
    } catch (error: any) {
      console.error("Error saving class:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi lưu lớp học!");
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddStudents = async (students: any[]) => {
    try {
      const response = await dispatch(
        createManyStudentsAcademic(students)
      ).unwrap();
      if (response.error) {
        toast.error("Không đúng định dạng thêm hoặc sinh viên đã tồn tại !");
      } else {
        toast.success("Thêm sinh viên thành công!");
        // Refresh the class data to get updated student list
        const updatedClass = await dispatch(fetchAcademicClasses()).unwrap();
        const updatedSelectedClass = updatedClass.find(
          (c) => c.id === selectedClassForStudents?.id
        );
        if (updatedSelectedClass) {
          setSelectedClassForStudents(updatedSelectedClass);
        }
        setOpenAddStudents(false);
      }
    } catch (error) {
      console.error("Error adding students:", error);
      toast.error("Có lỗi xảy ra khi thêm sinh viên!");
    }
  };

  const handleEditStudent = (student: any) => {
    if (!student) return null;
    setSelectedStudent(student);
    setOpenEditStudent(true);
  };

  const handleUpdateStudent = async (updatedStudent: any) => {
    try {
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

      // Refresh the class data to get updated student list
      const updatedClass = await dispatch(fetchAcademicClasses()).unwrap();
      const updatedSelectedClass = updatedClass.find(
        (c) => c.id === selectedClassForStudents?.id
      );
      if (updatedSelectedClass) {
        setSelectedClassForStudents(updatedSelectedClass);
      }
      setOpenEditStudent(false);
      setSelectedStudent(null);
      toast.success("Cập nhật thông tin sinh viên thành công!");
    } catch (error: any) {
      toast.error(
        error.message || "Có lỗi xảy ra khi cập nhật thông tin sinh viên!"
      );
    }
  };

  const handleDeleteStudent = async (student: any) => {
    try {
      await dispatch(deleteStudentAcademic(student.user.id)).unwrap();
      // Refresh the class data to get updated student list
      const updatedClass = await dispatch(fetchAcademicClasses()).unwrap();
      const updatedSelectedClass = updatedClass.find(
        (c) => c.id === selectedClassForStudents?.id
      );
      if (updatedSelectedClass) {
        setSelectedClassForStudents(updatedSelectedClass);
      }
      toast.success("Xóa sinh viên thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sinh viên!");
    }
  };

  const handleOpenDeleteStudentDialog = (student: any) => {
    setStudentToDelete(student);
    setOpenDeleteStudentDialog(true);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    await handleDeleteStudent(studentToDelete);
    await dispatch(fetchAcademicClasses()).unwrap();
    setOpenDeleteStudentDialog(false);
    setStudentToDelete(null);
  };

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
      `DanhSachSinhVien_${selectedClassForStudents?.classCode || "Lop"}.xlsx`
    );
  };

  let studentsList = selectedClassForStudents?.studentsAcademic || [];

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

  // Add effect to filter programs when major changes
  useEffect(() => {
    if (formData.majorId) {
      const filtered = programs.filter(
        (p) => String(p.majorId) === formData.majorId
      );
      setFilteredPrograms(filtered);
      // Reset programId if current selection is not in filtered list
      if (!filtered.some((p) => String(p.id) === formData.programId)) {
        setFormData((prev) => ({ ...prev, programId: "" }));
      }
    } else {
      setFilteredPrograms([]);
      setFormData((prev) => ({ ...prev, programId: "" }));
    }
  }, [formData.majorId, programs]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight="bold" component="h1">
          Quản lý lớp học
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Thêm lớp học mới
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ngành</InputLabel>
              <Select
                value={majorFilter}
                label="Ngành"
                onChange={(e) => setMajorFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả ngành</MenuItem>
                {majors.map((major) => (
                  <MenuItem key={major.id} value={String(major.id)}>
                    {major.majorName} ({major.majorCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={termFilter}
                label="Học kỳ"
                onChange={(e) => setTermFilter(e.target.value)}
                disabled={academicYearFilter === "all"}
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value={AcademicClassStatus.ACTIVE}>
                  Đang hoạt động
                </MenuItem>
                <MenuItem value={AcademicClassStatus.COMPLETED}>
                  Đã hoàn thành
                </MenuItem>
                <MenuItem value={AcademicClassStatus.CANCELLED}>
                  Đã hủy
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={instructorFilter}
                label="Giảng viên"
                onChange={(e) =>
                  setInstructorFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
              >
                <MenuItem value="all">Tất cả giảng viên</MenuItem>
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.fullName} - {instructor.professionalTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Hiển thị các filter đang áp dụng */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Tìm thấy {filteredClasses.length} lớp học
          </Typography>

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
                  statusFilter === AcademicClassStatus.ACTIVE
                    ? "Đang hoạt động"
                    : statusFilter === AcademicClassStatus.COMPLETED
                    ? "Đã hoàn thành"
                    : "Đã hủy"
                }`}
                onDelete={() => setStatusFilter("all")}
                size="small"
              />
            )}
            {instructorFilter !== "all" && (
              <Chip
                label={`Giảng viên: ${
                  instructors.find((i) => i.id === instructorFilter)?.fullName
                }`}
                onDelete={() => setInstructorFilter("all")}
                size="small"
              />
            )}
            {majorFilter !== "all" && (
              <Chip
                label={`Ngành: ${
                  majors.find((m) => String(m.id) === majorFilter)?.majorName
                }`}
                onDelete={() => setMajorFilter("all")}
                size="small"
              />
            )}
          </Stack>
        </Box>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã lớp</TableCell>
              <TableCell>Tên lớp</TableCell>
              <TableCell>Ngành</TableCell>
              <TableCell>Chương trình</TableCell>
              <TableCell>Học kỳ</TableCell>
              <TableCell>Phân công giảng viên</TableCell>
              <TableCell>Số sinh viên</TableCell>
              <TableCell>Số khóa học</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClasses.map((academicClass) => (
              <TableRow key={academicClass.id}>
                <TableCell>{academicClass.classCode}</TableCell>
                <TableCell>{academicClass.className}</TableCell>
                <TableCell>
                  {academicClass.major?.majorName || "N/A"}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {academicClass.major?.majorCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  {academicClass.program?.programName || "N/A"}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {academicClass.program?.programCode}
                  </Typography>
                </TableCell>
                <TableCell>{academicClass.semester}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Tooltip title="Phân công giảng viên">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenAssignDialog(academicClass.id)}
                      >
                        <PersonAdd color="primary" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box>
                      {academicClass.instructors?.map((instructor) => (
                        <Box key={instructor.id} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {instructor?.instructor?.fullName || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {instructor?.instructor?.professionalTitle || "N/A"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {academicClass.studentsAcademic?.length || 0}
                </TableCell>
                <TableCell>{academicClass.classCourses?.length || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(academicClass.status)}
                    color={getStatusColor(academicClass.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(academicClass.createdAt), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Xem danh sách sinh viên">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStudentList(academicClass)}
                      >
                        <People />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(academicClass.id)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(academicClass.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedClasses.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy lớp học nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Hiển thị {startIndex + 1}-
            {Math.min(endIndex, filteredClasses.length)}
            trên tổng số {filteredClasses.length} lớp học
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.light" }}>
              <School />
            </Avatar>
            <Typography variant="h6">
              {selectedClass ? "Chỉnh Sửa Lớp Học" : "Thêm Lớp Học"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Mã lớp"
              fullWidth
              value={formData.classCode}
              onChange={(e) =>
                setFormData({ ...formData, classCode: e.target.value })
              }
              required
            />
            <TextField
              label="Tên lớp"
              fullWidth
              value={formData.className}
              onChange={(e) =>
                setFormData({ ...formData, className: e.target.value })
              }
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Ngành học</InputLabel>
              <Select
                value={formData.majorId}
                label="Ngành học"
                onChange={(e) =>
                  setFormData({ ...formData, majorId: e.target.value })
                }
              >
                {majors.map((major) => (
                  <MenuItem key={major.id} value={String(major.id)}>
                    {major.majorName} ({major.majorCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Chương trình đào tạo</InputLabel>
              <Select
                value={formData.programId}
                label="Chương trình đào tạo"
                onChange={(e) =>
                  setFormData({ ...formData, programId: e.target.value })
                }
                disabled={!formData.majorId}
              >
                {filteredPrograms.map((program) => (
                  <MenuItem key={program.id} value={String(program.id)}>
                    {program.programName} ({program.programCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={formData.semester}
                label="Học kỳ"
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
              >
                {semesters.map((semester) => (
                  <MenuItem key={semester.value} value={semester.value}>
                    {semester.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as AcademicClassStatus,
                  })
                }
              >
                <MenuItem value={AcademicClassStatus.ACTIVE}>
                  Đang hoạt động
                </MenuItem>
                <MenuItem value={AcademicClassStatus.COMPLETED}>
                  Đã hoàn thành
                </MenuItem>
                <MenuItem value={AcademicClassStatus.CANCELLED}>
                  Đã hủy
                </MenuItem>
              </Select>
            </FormControl>
            {!selectedClass && (
              <FormControl fullWidth required>
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={formData.instructorId}
                  label="Giảng viên"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructorId: e.target.value as number,
                    })
                  }
                >
                  {instructors?.map((instructor) => (
                    <MenuItem key={instructor.id} value={instructor.id}>
                      {instructor.fullName} - {instructor.professionalTitle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !formData.classCode ||
              !formData.className ||
              !formData.semester ||
              !formData.status ||
              !formData.majorId ||
              !formData.programId ||
              (!selectedClass && !formData.instructorId)
            }
          >
            {selectedClass ? "Cập nhật" : "Thêm lớp"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog phân công giảng viên */}
      <Dialog
        open={openAssignDialog}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Phân công giảng viên</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                multiple
                value={assignFormData.instructorIds}
                onChange={(e) =>
                  setAssignFormData({
                    ...assignFormData,
                    instructorIds: e.target.value as number[],
                  })
                }
                input={<OutlinedInput label="Giảng viên" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const instructor = instructors.find(
                        (i) => i.id === value
                      );
                      return instructor ? (
                        <Chip
                          key={value}
                          avatar={
                            <Avatar
                              src={instructor.user.avatarUrl}
                              alt={instructor.fullName}
                              sx={{ width: 24, height: 24 }}
                            >
                              {instructor.fullName[0]}
                            </Avatar>
                          }
                          label={instructor.fullName}
                          size="small"
                          sx={{
                            "& .MuiChip-avatar": {
                              width: 24,
                              height: 24,
                              fontSize: "0.75rem",
                            },
                          }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={instructor.user.avatarUrl}
                        alt={instructor.fullName}
                        sx={{ width: 32, height: 32 }}
                      >
                        {instructor.fullName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {instructor.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {instructor.professionalTitle}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Hủy</Button>
          <Button
            onClick={handleAssignInstructors}
            variant="contained"
            disabled={assignFormData.instructorIds.length === 0}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "error.light" }}>
              <Delete />
            </Avatar>
            <Typography variant="h6">Xác nhận xóa</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa lớp học{" "}
            <strong>{classToDelete?.className}</strong> (Mã:{" "}
            {classToDelete?.classCode})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog danh sách sinh viên */}
      <Dialog
        open={openStudentListDialog}
        onClose={handleCloseStudentList}
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
                  {selectedClassForStudents?.className}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã lớp: {selectedClassForStudents?.classCode}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddStudents(true)}
              >
                Thêm sinh viên
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={handleExportStudents}
              >
                Tải danh sách
              </Button>
            </Box>
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
                {Array.from(
                  new Set(
                    selectedClassForStudents?.studentsAcademic?.map(
                      (s) => s.academicYear
                    )
                  )
                )
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
                onChange={(e) => setStudentSort(e.target.value)}
              >
                <MenuItem value="none">Mặc định</MenuItem>
                <MenuItem value="az">Tên A-Z</MenuItem>
                <MenuItem value="za">Tên Z-A</MenuItem>
              </Select>
            </FormControl>
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
                              src={student.user?.avatarUrl}
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
                                {student.user?.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{student.studentCode}</TableCell>
                        <TableCell>{student.academicYear}</TableCell>
                        <TableCell>{student.user?.email}</TableCell>
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
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteStudentDialog(student);
                              }}
                            >
                              <Delete fontSize="small" color="error" />
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

      {/* Dialog thêm sinh viên */}
      <AddStudentsDialog
        open={openAddStudents}
        onClose={() => setOpenAddStudents(false)}
        classData={{
          id: selectedClassForStudents?.id,
          academicClass: {
            id: selectedClassForStudents?.id,
            className: selectedClassForStudents?.className,
            classCode: selectedClassForStudents?.classCode,
          },
        }}
        onSubmit={handleAddStudents}
      />

      {/* Dialog chỉnh sửa sinh viên */}
      <EditStudentDialog
        open={openEditStudent}
        onClose={() => {
          setOpenEditStudent(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSubmit={handleUpdateStudent}
      />

      {/* Dialog xác nhận xóa sinh viên */}
      <Dialog
        open={openDeleteStudentDialog}
        onClose={() => setOpenDeleteStudentDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "error.light" }}>
              <Delete />
            </Avatar>
            <Typography variant="h6">Xác nhận xóa sinh viên</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sinh viên{" "}
            <strong>{studentToDelete?.fullName}</strong> (MSSV:{" "}
            {studentToDelete?.studentCode})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteStudentDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDeleteStudent}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAcademicClasses;
