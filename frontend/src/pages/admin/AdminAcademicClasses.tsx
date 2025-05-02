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
} from "@mui/material";
import {
  Add,
  Search,
  Clear,
  Edit,
  Delete,
  School,
  PersonAdd,
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

interface FormData {
  id?: number;
  classCode: string;
  className: string;
  semester: string;
  status: AcademicClassStatus;
  instructorId: number;
}

interface AssignInstructorFormData {
  instructorIds: number[];
}

const AdminAcademicClasses: React.FC = () => {
  const dispatch = useAppDispatch();
  const academicClasses = useAppSelector(selectAllAcademicClasses);
  const instructors = useAppSelector(selectAllInstructors);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [instructorFilter, setInstructorFilter] = useState<number | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AcademicClass | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    classCode: "",
    className: "",
    semester: "",
    status: AcademicClassStatus.ACTIVE,
    instructorId: 0,
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

  useEffect(() => {
    dispatch(fetchAcademicClasses());
    dispatch(fetchInstructors());
  }, [dispatch]);

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

  const filteredClasses = academicClasses.filter((academicClass) => {
    const matchesSearch =
      academicClass.className
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      academicClass.classCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || academicClass.status === statusFilter;

    const matchesInstructor =
      instructorFilter === "all" ||
      academicClass.instructors?.some(
        (instructorAssignment) =>
          instructorAssignment?.instructor?.id === instructorFilter
      );

    return matchesSearch && matchesStatus && matchesInstructor;
  });

  // Pagination calculation
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredClasses.length / rowsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
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
      });
    } else {
      setSelectedClass(null);
      setFormData({
        classCode: "",
        className: "",
        semester: "",
        status: AcademicClassStatus.ACTIVE,
        instructorId: 0,
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Trạng thái"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value={AcademicClassStatus.ACTIVE}>
                Đang hoạt động
              </MenuItem>
              <MenuItem value={AcademicClassStatus.COMPLETED}>
                Đã hoàn thành
              </MenuItem>
              <MenuItem value={AcademicClassStatus.CANCELLED}>Đã hủy</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Giảng viên"
              value={instructorFilter}
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
            </TextField>
          </Grid>
        </Grid>
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
                <TableCell>{academicClass.semester}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Tooltip title="Phân công giảng viên">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenAssignDialog(academicClass.id)}
                      >
                        <PersonAdd fontSize="small" />
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
            onChange={(e, newPage) => setPage(newPage)}
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
              <InputLabel>Học kỳ</InputLabel>
              <Select
                value={formData.semester}
                label="Học kỳ"
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
              >
                <MenuItem value="20251">Học kỳ 1 2025</MenuItem>
                <MenuItem value="20252">Học kỳ 2 2025</MenuItem>
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
                          label={instructor.fullName}
                          size="small"
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.fullName} - {instructor.professionalTitle}
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
    </Box>
  );
};

export default AdminAcademicClasses;
