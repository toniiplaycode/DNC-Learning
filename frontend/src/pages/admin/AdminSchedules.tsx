import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";

// Mock data types
interface Instructor {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
}

interface Schedule {
  id: string;
  instructorId: string;
  courseId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  status: "active" | "cancelled" | "completed";
}

// Mock data
const mockInstructors: Instructor[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    specialization: "Lập trình Web",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    specialization: "Cơ sở dữ liệu",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    specialization: "Mạng máy tính",
  },
];

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Lập trình Web với React",
    category: "Web Development",
    level: "Intermediate",
  },
  {
    id: "2",
    title: "SQL và Database Design",
    category: "Database",
    level: "Beginner",
  },
  {
    id: "3",
    title: "Network Security",
    category: "Networking",
    level: "Advanced",
  },
];

const mockSchedules: Schedule[] = [
  {
    id: "1",
    instructorId: "1",
    courseId: "1",
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "10:00",
    room: "Room 101",
    status: "active",
  },
  {
    id: "2",
    instructorId: "2",
    courseId: "2",
    dayOfWeek: "Wednesday",
    startTime: "13:00",
    endTime: "15:00",
    room: "Room 202",
    status: "active",
  },
  {
    id: "3",
    instructorId: "3",
    courseId: "3",
    dayOfWeek: "Friday",
    startTime: "15:30",
    endTime: "17:30",
    room: "Room 303",
    status: "cancelled",
  },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AdminSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Schedule>>({
    instructorId: "",
    courseId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    room: "",
    status: "active",
  });

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setFormData(schedule);
    } else {
      setSelectedSchedule(null);
      setFormData({
        instructorId: "",
        courseId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        room: "",
        status: "active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSchedule(null);
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (selectedSchedule) {
      // Update existing schedule
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === selectedSchedule.id
            ? { ...schedule, ...formData }
            : schedule
        )
      );
    } else {
      // Add new schedule
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        instructorId: formData.instructorId || "",
        courseId: formData.courseId || "",
        dayOfWeek: formData.dayOfWeek || "",
        startTime: formData.startTime || "",
        endTime: formData.endTime || "",
        room: formData.room || "",
        status: formData.status || "active",
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "cancelled":
        return "error";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const getInstructorName = (instructorId: string) => {
    return (
      mockInstructors.find((i) => i.id === instructorId)?.name || "Unknown"
    );
  };

  const getCourseTitle = (courseId: string) => {
    return mockCourses.find((c) => c.id === courseId)?.title || "Unknown";
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quản lý lịch dạy
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm lịch dạy
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Khóa học</TableCell>
              <TableCell>Thứ</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Phòng học</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>
                  {getInstructorName(schedule.instructorId)}
                </TableCell>
                <TableCell>{getCourseTitle(schedule.courseId)}</TableCell>
                <TableCell>{schedule.dayOfWeek}</TableCell>
                <TableCell>
                  {schedule.startTime} - {schedule.endTime}
                </TableCell>
                <TableCell>{schedule.room}</TableCell>
                <TableCell>
                  <Chip
                    label={schedule.status}
                    color={getStatusColor(schedule.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(schedule)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSchedule ? "Chỉnh sửa lịch dạy" : "Thêm lịch dạy mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Giảng viên"
                name="instructorId"
                value={formData.instructorId}
                onChange={handleInputChange}
              >
                {mockInstructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Khóa học"
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
              >
                {mockCourses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Thứ"
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleInputChange}
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giờ kết thúc"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phòng học"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Trạng thái"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
                <MenuItem value="completed">Đã hoàn thành</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedSchedule ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSchedules;
