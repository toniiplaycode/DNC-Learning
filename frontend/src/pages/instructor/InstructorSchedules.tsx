import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Tabs,
  Tab,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add,
  ChevronLeft,
  ChevronRight,
  AccessTime,
  People,
  VideoCall,
  Edit,
  Delete,
  CalendarViewWeek,
  CalendarMonth,
  CalendarToday,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchTeachingSchedulesByInstructor,
  createTeachingSchedule,
  updateTeachingSchedule,
  deleteTeachingSchedule,
  updateScheduleStatus,
} from "../../features/teaching-schedules/teachingSchedulesSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  selectInstructorSchedules,
  selectTeachingSchedulesStatus,
  selectTeachingSchedulesError,
} from "../../features/teaching-schedules/teachingSchedulesSelectors";
import {
  TeachingSchedule,
  ScheduleStatus,
  CreateTeachingScheduleData,
  UpdateTeachingScheduleData,
} from "../../types/teaching-schedule.types";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { selectAllClassInstructors } from "../../features/academic-class-instructors/academicClassInstructorsSelectors";
import {
  fetchClassInstructorById,
  fetchClassInstructors,
} from "../../features/academic-class-instructors/academicClassInstructorsSlice";
import { selectCurrentClassInstructor } from "../../features/academic-class-instructors/academicClassInstructorsSelectors";
import { formatDateTime } from "../../utils/formatters";
import { createNotification } from "../../features/notifications/notificationsSlice";
import { selectAcademicClassStudents } from "../../features/users/usersSelectors";
import { fetchStudentsByAcademicClass } from "../../features/users/usersApiSlice";

// Định nghĩa enum cho view mode
enum ViewMode {
  ALL = "all",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

const InstructorSchedules = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorSchedules = useAppSelector(selectInstructorSchedules);
  const academicClassStudents = useAppSelector(selectAcademicClassStudents);
  const classInstructors = useAppSelector(selectAllClassInstructors);
  const status = useAppSelector(selectTeachingSchedulesStatus);
  const error = useAppSelector(selectTeachingSchedulesError);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [editingSchedule, setEditingSchedule] =
    useState<TeachingSchedule | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ALL);
  const currentClassInstructor = useAppSelector(selectCurrentClassInstructor);
  const [formData, setFormData] = useState<Partial<CreateTeachingScheduleData>>(
    {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      meetingLink: "",
      status: ScheduleStatus.SCHEDULED,
    }
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [sortOption, setSortOption] = useState<string>("newest");
  const [timeError, setTimeError] = useState<string>("");

  useEffect(() => {
    if (currentUser?.userInstructor?.id) {
      dispatch(
        fetchTeachingSchedulesByInstructor(
          Number(currentUser.userInstructor.id)
        )
      );
      dispatch(
        fetchClassInstructors({
          instructorId: Number(currentUser?.userInstructor?.id),
        })
      );
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (formData.academicClassId)
      dispatch(fetchStudentsByAcademicClass(Number(formData.academicClassId)));
  }, [formData.academicClassId]);

  const handleAddSchedule = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 90 * 60000); // 90 phút sau

    setEditingSchedule(null);
    setFormData({
      title: "",
      description: "",
      startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      meetingLink: "",
      status: ScheduleStatus.SCHEDULED,
    });
    setOpenDialog(true);
  };

  const handleEditSchedule = (schedule: TeachingSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      startTime: format(parseISO(schedule.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(parseISO(schedule.endTime), "yyyy-MM-dd'T'HH:mm"),
      meetingLink: schedule.meetingLink || "",
      meetingId: schedule.meetingId || "",
      meetingPassword: schedule.meetingPassword || "",
      status: schedule.status,
    });
    setOpenDialog(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    setScheduleToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        await dispatch(deleteTeachingSchedule(scheduleToDelete)).unwrap();
        toast.success("Xóa lịch dạy thành công");
      } catch (error) {
        toast.error("Không thể xóa lịch dạy");
      }
    }
    setOpenDeleteDialog(false);
    setScheduleToDelete(null);
  };

  const handleSaveSchedule = async (event: React.FormEvent) => {
    event.preventDefault();

    // Kiểm tra thời gian
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (endTime <= startTime) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }
    }

    if (
      !currentUser?.userInstructor?.id ||
      !formData.title ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Kiểm tra thêm nếu đang tạo mới
    if (!editingSchedule && !formData.academicClassInstructorId) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    try {
      // Cập nhật schedule
      if (editingSchedule) {
        // Loại bỏ các trường không được phép cập nhật
        const { academicClassId, academicClassInstructorId, ...updateData } =
          formData;

        await dispatch(
          updateTeachingSchedule({
            id: editingSchedule.id,
            updateData: updateData as UpdateTeachingScheduleData,
          })
        ).unwrap();
        toast.success("Cập nhật lịch dạy thành công");
      }
      // Tạo schedule mới
      else {
        const newScheduleData: CreateTeachingScheduleData = {
          ...(formData as CreateTeachingScheduleData),
          academicClassId: Number(formData.academicClassId),
          academicClassInstructorId: Number(formData.academicClassInstructorId),
          title: formData.title!,
          startTime: formData.startTime!,
          endTime: formData.endTime!,
        };

        await dispatch(createTeachingSchedule(newScheduleData)).unwrap();

        const notificationData = {
          userIds: academicClassStudents.map((user) => user.userId),
          title: `Lịch dạy mới`,
          content: `Giảng viên vừa thêm lịch dạy mới "${newScheduleData.title}".`,
          type: "schedule",
        };

        await dispatch(createNotification(notificationData));

        toast.success("Tạo lịch dạy mới thành công");
      }

      setOpenDialog(false);
      // Refresh data
      if (currentUser?.userInstructor?.id) {
        dispatch(
          fetchTeachingSchedulesByInstructor(
            Number(currentUser.userInstructor.id)
          )
        );
      }
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error(
        typeof error === "object"
          ? JSON.stringify(error)
          : error.message || "Có lỗi xảy ra khi lưu lịch dạy"
      );
    }
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return instructorSchedules.filter(
      (schedule) => schedule.startTime.split("T")[0] === dateStr
    );
  };

  const getSchedulesForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return instructorSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    });
  };

  const getSchedulesForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return instructorSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startTime);
      return (
        scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month
      );
    });
  };

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === ViewMode.DAY) {
      newDate.setDate(selectedDate.getDate() - 1);
    } else if (viewMode === ViewMode.WEEK) {
      newDate.setDate(selectedDate.getDate() - 7);
    } else {
      newDate.setMonth(selectedDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === ViewMode.DAY) {
      newDate.setDate(selectedDate.getDate() + 1);
    } else if (viewMode === ViewMode.WEEK) {
      newDate.setDate(selectedDate.getDate() + 7);
    } else {
      newDate.setMonth(selectedDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const formatDateDisplay = () => {
    if (viewMode === ViewMode.DAY) {
      return selectedDate.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (viewMode === ViewMode.WEEK) {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
      })} - ${endOfWeek.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })}`;
    } else {
      return selectedDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Render calendar based on view mode
  const renderCalendar = () => {
    if (status === "loading") {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (status === "failed") {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || "Không thể tải lịch dạy. Vui lòng thử lại sau."}
        </Alert>
      );
    }

    if (viewMode === ViewMode.ALL) {
      return renderAllView();
    } else if (viewMode === ViewMode.DAY) {
      return renderDayView();
    } else if (viewMode === ViewMode.WEEK) {
      return renderWeekView();
    } else {
      return renderMonthView();
    }
  };

  // Render all schedules view
  const renderAllView = () => {
    const filteredSchedules = getFilteredSchedules
      ? getFilteredSchedules()
      : instructorSchedules;

    return (
      <Card sx={{ mt: 2, boxShadow: 2, borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Tất cả lịch dạy
          </Typography>

          {/* Bộ lọc */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "rgba(0, 0, 0, 0.02)",
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Tìm kiếm theo tiêu đề */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Tìm theo tiêu đề"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Box
                        component="span"
                        sx={{ color: "action.active", mr: 1 }}
                      >
                        <SearchIcon fontSize="small" />
                      </Box>
                    ),
                    sx: { borderRadius: 1.5 },
                  }}
                />
              </Grid>

              {/* Lọc theo trạng thái */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Trạng thái"
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value={ScheduleStatus.SCHEDULED}>
                      Đã lên lịch
                    </MenuItem>
                    <MenuItem value={ScheduleStatus.IN_PROGRESS}>
                      Đang diễn ra
                    </MenuItem>
                    <MenuItem value={ScheduleStatus.COMPLETED}>
                      Đã hoàn thành
                    </MenuItem>
                    <MenuItem value={ScheduleStatus.CANCELLED}>Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Lọc theo khoảng thời gian */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    type="date"
                    label="Từ ngày"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={
                      dateRange.start
                        ? format(dateRange.start, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setDateRange((prev) => ({ ...prev, start: date }));
                    }}
                    sx={{ flex: 1 }}
                    InputProps={{ sx: { borderRadius: 1.5 } }}
                  />
                  <TextField
                    type="date"
                    label="Đến ngày"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={
                      dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setDateRange((prev) => ({ ...prev, end: date }));
                    }}
                    sx={{ flex: 1 }}
                    InputProps={{ sx: { borderRadius: 1.5 } }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Nút đặt lại bộ lọc */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterStatus("all");
                  setSearchTitle("");
                  setDateRange({ start: null, end: null });
                }}
                sx={{ borderRadius: 1.5, textTransform: "none" }}
              >
                Đặt lại bộ lọc
              </Button>
            </Box>
          </Box>

          {/* Kết quả lọc và số lượng */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Hiển thị {filteredSchedules.length} / {instructorSchedules.length}{" "}
              lịch dạy
            </Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                label="Sắp xếp"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="newest">Mới nhất trước</MenuItem>
                <MenuItem value="oldest">Cũ nhất trước</MenuItem>
                <MenuItem value="az">A-Z theo tiêu đề</MenuItem>
                <MenuItem value="za">Z-A theo tiêu đề</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {filteredSchedules.length > 0 ? (
            <Grid container spacing={2}>
              {filteredSchedules.map((schedule) => (
                <Grid item xl={4} md={6} sm={12} xs={12} key={schedule.id}>
                  <ScheduleItem
                    schedule={schedule}
                    onEdit={handleEditSchedule}
                    onDelete={handleDeleteSchedule}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{ p: 4, textAlign: "center", bgcolor: "rgba(0, 0, 0, 0.02)" }}
            >
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                Không tìm thấy lịch dạy phù hợp
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy thử thay đổi bộ lọc hoặc xóa bộ lọc
              </Typography>
            </Paper>
          )}
        </Box>
      </Card>
    );
  };

  // Render day view
  const renderDayView = () => {
    const daySchedules = getSchedulesForDate(selectedDate);

    return (
      <Card sx={{ mt: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lịch dạy trong ngày
          </Typography>

          {daySchedules.length > 0 ? (
            <Grid container spacing={2}>
              {daySchedules.map((schedule) => (
                <Grid item xl={4} md={6} sm={12} xs={12} key={schedule.id}>
                  <ScheduleItem
                    schedule={schedule}
                    onEdit={handleEditSchedule}
                    onDelete={handleDeleteSchedule}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              Không có lịch dạy trong ngày này
            </Typography>
          )}
        </Box>
      </Card>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const days = getDaysInWeek(selectedDate);

    return (
      <Card sx={{ mt: 2, overflow: "auto", boxShadow: 2, borderRadius: 2 }}>
        <Box sx={{ minWidth: 800 }}>
          <Grid container>
            {/* Header */}
            <Grid
              container
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                background: "linear-gradient(to right, #f5f7fa, #e4e8f0)",
              }}
            >
              {days.map((day, index) => (
                <Grid
                  item
                  xs
                  key={index}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    borderRight: index < 6 ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 500, color: "text.secondary" }}
                  >
                    {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        day.toDateString() === new Date().toDateString()
                          ? "bold"
                          : "normal",
                      color:
                        day.toDateString() === new Date().toDateString()
                          ? "primary.main"
                          : "text.primary",
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar body */}
            <Grid container sx={{ height: "65vh" }}>
              {days.map((day, index) => {
                const daySchedules = getSchedulesForDate(day);
                const isToday =
                  day.toDateString() === new Date().toDateString();

                return (
                  <Grid
                    item
                    xs
                    key={index}
                    sx={{
                      borderRight: index < 6 ? 1 : 0,
                      borderColor: "divider",
                      bgcolor: isToday
                        ? "rgba(25, 118, 210, 0.04)"
                        : "transparent",
                      p: 1,
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  >
                    {daySchedules.map((schedule) => (
                      <Paper
                        key={schedule.id}
                        elevation={2}
                        sx={{
                          p: 1.5,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: "white",
                          boxShadow: "0 2px 14px 0 rgba(32, 40, 45, 0.08)",
                          borderLeft: 4,
                          borderColor: "primary.main",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            boxShadow: "0 4px 20px 0 rgba(32, 40, 45, 0.16)",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => handleEditSchedule(schedule)}
                      >
                        <Typography variant="subtitle2" noWrap fontWeight="500">
                          {schedule.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <AccessTime
                            fontSize="small"
                            sx={{
                              mr: 0.5,
                              color: "text.secondary",
                              fontSize: 16,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(schedule.startTime)} -{" "}
                            {formatTime(schedule.endTime)}
                          </Typography>
                        </Box>
                        {schedule.academicClass?.className && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 0.5, color: "text.secondary" }}
                            noWrap
                          >
                            {schedule.academicClass.className}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Box>
      </Card>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    const firstDayOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Create array with empty slots for days before the month starts
    const calendarDays = Array(startingDayOfWeek).fill(null);
    days.forEach((day) => calendarDays.push(day));

    // Split days into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <Card sx={{ mt: 2, boxShadow: 2, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 0 }}>
          <Grid
            container
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              background: "linear-gradient(to right, #f5f7fa, #e4e8f0)",
            }}
          >
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
              <Grid item xs key={index} sx={{ p: 1.5, textAlign: "center" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500, color: "text.secondary" }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {weeks.map((week, weekIndex) => (
            <Grid
              container
              key={weekIndex}
              sx={{
                borderBottom: weekIndex < weeks.length - 1 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              {week.map((day, dayIndex) => {
                const isToday =
                  day && day.toDateString() === new Date().toDateString();
                const daySchedules = day ? getSchedulesForDate(day) : [];
                const isCurrentMonth =
                  day && day.getMonth() === selectedDate.getMonth();

                return (
                  <Grid
                    item
                    xs
                    key={dayIndex}
                    sx={{
                      height: "110px",
                      p: 1,
                      border: 1,
                      borderTop: 0,
                      borderLeft: dayIndex === 0 ? 1 : 0,
                      borderColor: "divider",
                      bgcolor: isToday
                        ? "rgba(25, 118, 210, 0.04)"
                        : "transparent",
                      position: "relative",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        bgcolor: isCurrentMonth
                          ? "rgba(0, 0, 0, 0.02)"
                          : "transparent",
                      },
                    }}
                  >
                    {day && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isToday ? "bold" : "normal",
                            color: isToday
                              ? "primary.main"
                              : !isCurrentMonth
                              ? "text.disabled"
                              : "text.primary",
                            position: "absolute",
                            top: 5,
                            left: 8,
                          }}
                        >
                          {day.getDate()}
                        </Typography>

                        <Box sx={{ mt: 3, maxHeight: 70, overflow: "hidden" }}>
                          {daySchedules.slice(0, 2).map((schedule) => (
                            <Chip
                              key={schedule.id}
                              size="small"
                              label={schedule.title}
                              onClick={() => handleEditSchedule(schedule)}
                              sx={{
                                mb: 0.5,
                                fontSize: "0.7rem",
                                height: "22px",
                                borderRadius: "11px",
                                backgroundColor: "primary.main",
                                color: "white",
                                fontWeight: 500,
                                "&:hover": {
                                  backgroundColor: "primary.main",
                                  color: "white",
                                },
                                transition: "all 0.2s ease",
                              }}
                            />
                          ))}
                          {daySchedules.length > 2 && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "primary.main",
                                fontWeight: 500,
                              }}
                            >
                              +{daySchedules.length - 2} lịch dạy
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Box>
      </Card>
    );
  };

  // Schedule item component
  const ScheduleItem = ({
    schedule,
    onEdit,
    onDelete,
  }: {
    schedule: TeachingSchedule;
    onEdit: (schedule: TeachingSchedule) => void;
    onDelete: (id: number) => void;
  }) => {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2.5,
          borderRadius: 2,
          borderLeft: 4,
          borderColor: "primary.main",
          transition: "all 0.2s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            boxShadow: "0 8px 24px 0 rgba(32, 40, 45, 0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="600">
            {schedule.title}
          </Typography>
          <Box>
            <Chip
              size="small"
              label={
                schedule.status === ScheduleStatus.SCHEDULED
                  ? "Đã lên lịch"
                  : schedule.status === ScheduleStatus.IN_PROGRESS
                  ? "Đang diễn ra"
                  : schedule.status === ScheduleStatus.COMPLETED
                  ? "Đã hoàn thành"
                  : "Đã hủy"
              }
              color={
                schedule.status === ScheduleStatus.SCHEDULED
                  ? "primary"
                  : schedule.status === ScheduleStatus.IN_PROGRESS
                  ? "success"
                  : schedule.status === ScheduleStatus.COMPLETED
                  ? "info"
                  : "error"
              }
              sx={{ mr: 1, borderRadius: "12px", height: "24px" }}
            />
            <IconButton
              size="small"
              onClick={() => onEdit(schedule)}
              sx={{
                color: "primary.main",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.1)" },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(schedule.id)}
              sx={{
                color: "error.main",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Thông tin lớp học */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.primary" fontWeight="500">
            Lớp: {schedule.academicClass?.className || "Không xác định"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mã lớp: {schedule.academicClass?.classCode || "Không xác định"}
          </Typography>
          {schedule.academicClass?.semester && (
            <Typography variant="body2" color="text.secondary">
              Học kỳ: {schedule.academicClass.semester}
            </Typography>
          )}
        </Box>

        {/* Thông tin thời gian */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "rgba(25, 118, 210, 0.05)",
            borderRadius: 1,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <AccessTime
              fontSize="small"
              sx={{ mr: 0.5, color: "primary.main" }}
            />
            <Typography variant="body2" fontWeight="500">
              Thời gian:
            </Typography>
          </Box>

          <Grid container spacing={1} sx={{ pl: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <b>Bắt đầu:</b>{" "}
                {format(parseISO(schedule.startTime), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <b>Kết thúc:</b>{" "}
                {format(parseISO(schedule.endTime), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Thông tin phòng học */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: schedule.meetingLink
              ? "rgba(46, 125, 50, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
            borderRadius: 1,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <VideoCall
              fontSize="small"
              sx={{
                mr: 0.5,
                color: schedule.meetingLink ? "success.main" : "text.secondary",
              }}
            />
            <Typography variant="body2" fontWeight="500">
              Thông tin phòng học
            </Typography>
          </Box>

          {schedule.meetingLink ? (
            <Grid container spacing={1} sx={{ pl: 3 }}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <b>Link họp:</b>{" "}
                  <a
                    href={schedule.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1976d2", textDecoration: "none" }}
                  >
                    {schedule.meetingLink}
                  </a>
                </Typography>
              </Grid>
              {schedule.meetingId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <b>ID phòng:</b> {schedule.meetingId}
                  </Typography>
                </Grid>
              )}
              {schedule.meetingPassword && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <b>Mật khẩu:</b> {schedule.meetingPassword}
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ pl: 3 }}>
              Không có thông tin phòng học trực tuyến
            </Typography>
          )}
        </Box>

        {/* Mô tả */}
        {schedule.description && (
          <Box>
            <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
              Mô tả:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                p: 1.5,
                bgcolor: "rgba(0, 0, 0, 0.02)",
                borderRadius: 1,
                borderLeft: 2,
                borderColor: "primary.main",
              }}
            >
              {schedule.description}
            </Typography>
          </Box>
        )}

        {/* Thông tin thêm */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1.5,
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
            color: "text.secondary",
            fontSize: "0.75rem",
          }}
        >
          {schedule.updatedAt && (
            <Typography variant="caption">
              Cập nhật: {formatDateTime(schedule.updatedAt)}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Xử lý đặc biệt cho các trường thời gian
    if (name === "startTime" || name === "endTime") {
      const newFormData = {
        ...formData,
        [name]: value,
      };

      // Kiểm tra nếu cả hai trường thời gian đều có giá trị
      if (newFormData.startTime && newFormData.endTime) {
        const startTime = new Date(newFormData.startTime);
        const endTime = new Date(newFormData.endTime);

        if (endTime <= startTime) {
          setTimeError("Thời gian kết thúc phải sau thời gian bắt đầu");
        } else {
          setTimeError("");
        }
      } else {
        setTimeError("");
      }

      setFormData(newFormData);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatTime = (dateTimeString: string) => {
    return format(parseISO(dateTimeString), "HH:mm", { locale: vi });
  };

  // Thêm hàm lọc các lịch dạy
  const getFilteredSchedules = () => {
    let filtered = instructorSchedules.filter((schedule) => {
      // Lọc theo trạng thái
      if (filterStatus !== "all" && schedule.status !== filterStatus) {
        return false;
      }

      // Lọc theo tiêu đề
      if (
        searchTitle &&
        !schedule.title.toLowerCase().includes(searchTitle.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo khoảng thời gian
      if (dateRange.start && new Date(schedule.startTime) < dateRange.start) {
        return false;
      }
      if (dateRange.end) {
        // Cộng thêm 1 ngày vào dateRange.end để bao gồm cả ngày kết thúc
        const endDate = new Date(dateRange.end);
        endDate.setDate(endDate.getDate() + 1);
        if (new Date(schedule.startTime) > endDate) {
          return false;
        }
      }

      return true;
    });

    // Sắp xếp kết quả
    if (sortOption === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } else if (sortOption === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else if (sortOption === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "za") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    return filtered;
  };

  // Thêm hàm kiểm tra và cập nhật trạng thái
  const checkAndUpdateExpiredSchedules = async () => {
    const now = new Date();

    // Lọc các lịch dạy đã quá hạn và chưa hoàn thành
    const expiredSchedules = instructorSchedules.filter((schedule) => {
      const endTime = new Date(schedule.endTime);
      return (
        endTime < now &&
        schedule.status !== ScheduleStatus.COMPLETED &&
        schedule.status !== ScheduleStatus.CANCELLED
      );
    });

    // Cập nhật trạng thái cho từng lịch đã quá hạn
    for (const schedule of expiredSchedules) {
      try {
        await dispatch(
          updateScheduleStatus({
            id: schedule.id,
            status: ScheduleStatus.COMPLETED,
          })
        ).unwrap();
      } catch (error) {
        console.error(
          `Không thể cập nhật trạng thái lịch dạy ${schedule.id}:`,
          error
        );
      }
    }
  };

  // Thêm hàm kiểm tra và cập nhật trạng thái đang diễn ra
  const checkAndUpdateInProgressSchedules = async () => {
    const now = new Date();

    // Lọc các lịch dạy đang diễn ra (thời gian hiện tại nằm giữa startTime và endTime)
    const inProgressSchedules = instructorSchedules.filter((schedule) => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);
      return (
        now >= startTime &&
        now <= endTime &&
        schedule.status === ScheduleStatus.SCHEDULED
      );
    });

    // Cập nhật trạng thái cho từng lịch đang diễn ra
    for (const schedule of inProgressSchedules) {
      try {
        await dispatch(
          updateScheduleStatus({
            id: schedule.id,
            status: ScheduleStatus.IN_PROGRESS,
          })
        ).unwrap();
      } catch (error) {
        console.error(
          `Không thể cập nhật trạng thái lịch dạy ${schedule.id}:`,
          error
        );
      }
    }
  };

  // Thêm useEffect để kiểm tra định kỳ
  useEffect(() => {
    // Kiểm tra ngay khi component mount
    checkAndUpdateExpiredSchedules();

    // Thiết lập interval để kiểm tra mỗi phút
    const intervalId = setInterval(() => {
      checkAndUpdateExpiredSchedules();
    }, 60000); // 60000ms = 1 phút

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, [instructorSchedules]); // Chạy lại khi instructorSchedules thay đổi

  // Thêm useEffect để kiểm tra định kỳ trạng thái đang diễn ra
  useEffect(() => {
    // Kiểm tra ngay khi component mount
    checkAndUpdateInProgressSchedules();

    // Thiết lập interval để kiểm tra mỗi phút
    const intervalId = setInterval(() => {
      checkAndUpdateInProgressSchedules();
    }, 60000); // 60000ms = 1 phút

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, [instructorSchedules]); // Chạy lại khi instructorSchedules thay đổi

  // Thêm useEffect để refresh data sau khi cập nhật trạng thái
  useEffect(() => {
    if (currentUser?.userInstructor?.id) {
      const refreshData = async () => {
        try {
          await dispatch(
            fetchTeachingSchedulesByInstructor(
              Number(currentUser.userInstructor.id)
            )
          );
        } catch (error) {
          console.error("Không thể refresh dữ liệu:", error);
        }
      };

      // Refresh data mỗi 5 phút
      const refreshInterval = setInterval(refreshData, 300000); // 300000ms = 5 phút

      return () => clearInterval(refreshInterval);
    }
  }, [dispatch, currentUser]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Lịch dạy trực tuyến
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSchedule}
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          Thêm lịch dạy
        </Button>
      </Box>

      {/* Date navigation */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={handlePrevDate}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <Button
                onClick={() => setSelectedDate(new Date())}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Hôm nay
              </Button>
              <IconButton
                onClick={handleNextDate}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </Stack>

            <Typography
              variant="h6"
              sx={{
                fontWeight: "500",
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              {formatDateDisplay()}
            </Typography>

            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              aria-label="view mode tabs"
              sx={{
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 1.5,
                },
              }}
            >
              <Tab
                icon={<CalendarToday />}
                label="Tất cả"
                value={ViewMode.ALL}
                sx={{
                  minWidth: 80,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              />
              <Tab
                icon={<CalendarToday />}
                label="Ngày"
                value={ViewMode.DAY}
                sx={{
                  minWidth: 100,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              />
              <Tab
                icon={<CalendarViewWeek />}
                label="Tuần"
                value={ViewMode.WEEK}
                sx={{
                  minWidth: 100,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              />
              <Tab
                icon={<CalendarMonth />}
                label="Tháng"
                value={ViewMode.MONTH}
                sx={{
                  minWidth: 100,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              />
            </Tabs>
          </Stack>
        </Box>
      </Card>

      {/* Calendar view */}
      {renderCalendar()}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        <form onSubmit={handleSaveSchedule}>
          <DialogTitle
            sx={{
              pb: 1,
              borderBottom: 1,
              borderColor: "divider",
              fontWeight: 500,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            {editingSchedule ? "Chỉnh sửa lịch dạy" : "Thêm lịch dạy mới"}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {/* Select lớp học - chỉ hiển thị khi tạo mới */}
              {!editingSchedule ? (
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>Lớp học</InputLabel>
                  <Select
                    name="academicClassInstructorId"
                    label="Lớp học"
                    value={formData.academicClassInstructorId || ""}
                    onChange={handleSelectChange}
                    required
                    sx={{ borderRadius: 1.5 }}
                  >
                    {classInstructors.map((item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            academicClassId: Number(item.academicClass.id),
                          }));
                        }}
                      >
                        {item.academicClass.className} (
                        {item.academicClass.classCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                // Hiển thị thông tin lớp học ở dạng chỉ đọc khi chỉnh sửa
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Lớp học:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography>
                      {editingSchedule?.academicClass?.className ||
                        "Không xác định"}
                      {editingSchedule?.academicClass?.classCode &&
                        ` (${editingSchedule.academicClass.classCode})`}
                    </Typography>
                  </Paper>
                </Box>
              )}
              <TextField
                label="Tiêu đề"
                name="title"
                fullWidth
                value={formData.title || ""}
                onChange={handleFormChange}
                required
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
              <TextField
                label="Mô tả"
                name="description"
                fullWidth
                multiline
                rows={3}
                value={formData.description || ""}
                onChange={handleFormChange}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
              <TextField
                label="Ngày và giờ bắt đầu"
                name="startTime"
                type="datetime-local"
                fullWidth
                value={formData.startTime || ""}
                onChange={handleFormChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 phút
                }}
                helperText="Định dạng: HH:mm - dd/MM/yyyy"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
                FormHelperTextProps={{
                  sx: {
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    mt: 0.5,
                    ml: 0.5,
                  },
                }}
              />
              <TextField
                label="Ngày và giờ kết thúc"
                name="endTime"
                type="datetime-local"
                fullWidth
                value={formData.endTime || ""}
                onChange={handleFormChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 phút
                  min: formData.startTime || undefined, // Set min time to start time
                }}
                error={!!timeError}
                helperText={timeError || "Định dạng: HH:mm - dd/MM/yyyy"}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
                FormHelperTextProps={{
                  sx: {
                    fontSize: "0.75rem",
                    color: timeError ? "error.main" : "text.secondary",
                    mt: 0.5,
                    ml: 0.5,
                  },
                }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  label="Trạng thái"
                  value={formData.status || ScheduleStatus.SCHEDULED}
                  onChange={handleSelectChange}
                  required
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value={ScheduleStatus.SCHEDULED}>
                    Đã lên lịch
                  </MenuItem>
                  <MenuItem value={ScheduleStatus.IN_PROGRESS}>
                    Đang diễn ra
                  </MenuItem>
                  <MenuItem value={ScheduleStatus.COMPLETED}>
                    Đã hoàn thành
                  </MenuItem>
                  <MenuItem value={ScheduleStatus.CANCELLED}>Đã hủy</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Link phòng học"
                name="meetingLink"
                fullWidth
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={formData.meetingLink || ""}
                onChange={handleFormChange}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                  startAdornment: (
                    <VideoCall sx={{ mr: 1, color: "primary.main" }} />
                  ),
                }}
              />
              <TextField
                label="ID phòng học"
                name="meetingId"
                fullWidth
                placeholder="123-456-789"
                value={formData.meetingId || ""}
                onChange={handleFormChange}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
              <TextField
                label="Mật khẩu phòng học"
                name="meetingPassword"
                fullWidth
                placeholder="abcdef"
                value={formData.meetingPassword || ""}
                onChange={handleFormChange}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{
                borderRadius: 2,
                px: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 500,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: 1,
            borderColor: "divider",
            fontWeight: 500,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          Xác nhận xóa
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography>
            Bạn có chắc chắn muốn xóa lịch dạy này không? Hành động này không
            thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              borderRadius: 2,
              px: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorSchedules;
