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
} from "@mui/icons-material";

// Mock data
const mockSchedules = [
  {
    id: 1,
    title: "Live Session: React Hooks",
    course: "React & TypeScript Masterclass",
    date: "2024-03-25",
    startTime: "19:00",
    endTime: "21:00",
    type: "online",
    students: 25,
    description: "Buổi học trực tuyến về React Hooks và các use cases",
  },
  {
    id: 2,
    title: "Q&A Session: Assignment 1",
    course: "Node.js Advanced Concepts",
    date: "2024-03-26",
    startTime: "20:00",
    endTime: "21:30",
    type: "online",
    students: 15,
    description: "Giải đáp thắc mắc về Assignment 1",
  },
  {
    id: 3,
    title: "Workshop: Docker Basics",
    course: "DevOps Fundamentals",
    date: "2024-03-28",
    startTime: "18:00",
    endTime: "20:00",
    type: "online",
    students: 20,
    description: "Workshop về Docker cơ bản",
  },
  {
    id: 4,
    title: "Final Project Review",
    course: "React & TypeScript Masterclass",
    date: "2024-03-29",
    startTime: "19:00",
    endTime: "21:00",
    type: "online",
    students: 25,
    description: "Buổi review dự án cuối khoá",
  },
];

// Định nghĩa enum cho view mode
enum ViewMode {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

const InstructorSchedules = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState(mockSchedules);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WEEK);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setOpenDialog(true);
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setOpenDialog(true);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const handleSaveSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement save logic
    setOpenDialog(false);
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(
      (schedule) => schedule.date === date.toISOString().split("T")[0]
    );
  };

  const getSchedulesForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    });
  };

  const getSchedulesForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
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
    if (viewMode === ViewMode.DAY) {
      return renderDayView();
    } else if (viewMode === ViewMode.WEEK) {
      return renderWeekView();
    } else {
      return renderMonthView();
    }
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
            <Stack spacing={2}>
              {daySchedules.map((schedule) => (
                <ScheduleItem
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={handleEditSchedule}
                  onDelete={handleDeleteSchedule}
                />
              ))}
            </Stack>
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
      <Card sx={{ mt: 2, overflow: "auto" }}>
        <Box sx={{ minWidth: 800 }}>
          <Grid container>
            {/* Header */}
            <Grid
              container
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
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
                  <Typography variant="subtitle2">
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
            <Grid container sx={{ height: "60vh" }}>
              {days.map((day, index) => {
                const daySchedules = getSchedulesForDate(day);

                return (
                  <Grid
                    item
                    xs
                    key={index}
                    sx={{
                      borderRight: index < 6 ? 1 : 0,
                      borderColor: "divider",
                      bgcolor:
                        day.toDateString() === new Date().toDateString()
                          ? "grey.50"
                          : "transparent",
                      p: 1,
                    }}
                  >
                    {daySchedules.map((schedule) => (
                      <Paper
                        key={schedule.id}
                        elevation={1}
                        sx={{
                          p: 1,
                          mb: 1,
                          bgcolor:
                            schedule.type === "online"
                              ? "info.50"
                              : "success.50",
                          borderLeft: 4,
                          borderColor:
                            schedule.type === "online"
                              ? "info.main"
                              : "success.main",
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor:
                              schedule.type === "online"
                                ? "info.100"
                                : "success.100",
                          },
                        }}
                        onClick={() => handleEditSchedule(schedule)}
                      >
                        <Typography variant="subtitle2" noWrap>
                          {schedule.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {schedule.startTime} - {schedule.endTime}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          noWrap
                        >
                          {schedule.course}
                        </Typography>
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
      <Card sx={{ mt: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid
            container
            sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}
          >
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
              <Grid item xs key={index} sx={{ p: 1, textAlign: "center" }}>
                <Typography variant="subtitle2">{day}</Typography>
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

                return (
                  <Grid
                    item
                    xs
                    key={dayIndex}
                    sx={{
                      height: "100px",
                      p: 1,
                      border: 1,
                      borderTop: 0,
                      borderLeft: dayIndex === 0 ? 1 : 0,
                      borderColor: "divider",
                      bgcolor: isToday ? "grey.100" : "transparent",
                      position: "relative",
                    }}
                  >
                    {day && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isToday
                              ? "bold"
                              : day?.getMonth() !== selectedDate.getMonth()
                              ? "light"
                              : "normal",
                            color: isToday
                              ? "primary.main"
                              : day?.getMonth() !== selectedDate.getMonth()
                              ? "text.disabled"
                              : "text.primary",
                            position: "absolute",
                            top: 5,
                            left: 8,
                          }}
                        >
                          {day.getDate()}
                        </Typography>

                        <Box sx={{ mt: 3, maxHeight: 60, overflow: "hidden" }}>
                          {daySchedules.slice(0, 2).map((schedule) => (
                            <Chip
                              key={schedule.id}
                              size="small"
                              label={schedule.title}
                              onClick={() => handleEditSchedule(schedule)}
                              sx={{
                                mb: 0.5,
                                fontSize: "0.7rem",
                                backgroundColor:
                                  schedule.type === "online"
                                    ? "info.50"
                                    : "success.50",
                                borderColor:
                                  schedule.type === "online"
                                    ? "info.main"
                                    : "success.main",
                                "&:hover": {
                                  backgroundColor:
                                    schedule.type === "online"
                                      ? "info.100"
                                      : "success.100",
                                },
                              }}
                            />
                          ))}
                          {daySchedules.length > 2 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
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
  const ScheduleItem = ({ schedule, onEdit, onDelete }: any) => {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderLeft: 4,
          borderColor:
            schedule.type === "online" ? "info.main" : "success.main",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {schedule.title}
          </Typography>
          <Box>
            <Chip
              size="small"
              label={schedule.type === "online" ? "Trực tuyến" : "Trực tiếp"}
              color={schedule.type === "online" ? "info" : "success"}
              sx={{ mr: 1 }}
            />
            <IconButton size="small" onClick={() => onEdit(schedule)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(schedule.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {schedule.course}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTime
              fontSize="small"
              sx={{ mr: 0.5, color: "text.secondary" }}
            />
            <Typography variant="body2">
              {schedule.startTime} - {schedule.endTime}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <People
              fontSize="small"
              sx={{ mr: 0.5, color: "text.secondary" }}
            />
            <Typography variant="body2">
              {schedule.students} học viên
            </Typography>
          </Box>
          {schedule.type === "online" && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VideoCall
                fontSize="small"
                sx={{ mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2">Google Meet</Typography>
            </Box>
          )}
        </Stack>

        {schedule.description && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {schedule.description}
          </Typography>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Lịch dạy</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSchedule}
        >
          Thêm lịch dạy
        </Button>
      </Box>

      {/* Date navigation */}
      <Card>
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handlePrevDate}>
                <ChevronLeft />
              </IconButton>
              <Button
                onClick={() => setSelectedDate(new Date())}
                variant="outlined"
                size="small"
              >
                Hôm nay
              </Button>
              <IconButton onClick={handleNextDate}>
                <ChevronRight />
              </IconButton>
            </Stack>

            <Typography variant="h6">{formatDateDisplay()}</Typography>

            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              aria-label="view mode tabs"
            >
              <Tab
                icon={<CalendarToday />}
                label="Ngày"
                value={ViewMode.DAY}
                sx={{ minWidth: 100 }}
              />
              <Tab
                icon={<CalendarViewWeek />}
                label="Tuần"
                value={ViewMode.WEEK}
                sx={{ minWidth: 100 }}
              />
              <Tab
                icon={<CalendarMonth />}
                label="Tháng"
                value={ViewMode.MONTH}
                sx={{ minWidth: 100 }}
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
      >
        <form onSubmit={handleSaveSchedule}>
          <DialogTitle>
            {editingSchedule ? "Chỉnh sửa lịch dạy" : "Thêm lịch dạy mới"}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Tiêu đề"
                fullWidth
                defaultValue={editingSchedule?.title}
                required
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                defaultValue={editingSchedule?.description}
              />
              <TextField
                label="Ngày"
                type="date"
                fullWidth
                defaultValue={
                  editingSchedule?.date ||
                  new Date().toISOString().split("T")[0]
                }
                required
                InputLabelProps={{ shrink: true }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Giờ bắt đầu"
                    type="time"
                    fullWidth
                    defaultValue={editingSchedule?.startTime}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Giờ kết thúc"
                    type="time"
                    fullWidth
                    defaultValue={editingSchedule?.endTime}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <InputLabel>Khóa học</InputLabel>
                <Select
                  label="Khóa học"
                  defaultValue={editingSchedule?.course || ""}
                  required
                >
                  <MenuItem value="React & TypeScript Masterclass">
                    React & TypeScript Masterclass
                  </MenuItem>
                  <MenuItem value="Node.js Advanced Concepts">
                    Node.js Advanced Concepts
                  </MenuItem>
                  <MenuItem value="DevOps Fundamentals">
                    DevOps Fundamentals
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Hình thức</InputLabel>
                <Select
                  label="Hình thức"
                  defaultValue={editingSchedule?.type || "online"}
                  required
                >
                  <MenuItem value="online">Trực tuyến</MenuItem>
                  <MenuItem value="offline">Trực tiếp</MenuItem>
                </Select>
              </FormControl>
              {/* Chỉ hiển thị khi chọn hình thức trực tuyến */}
              <TextField
                label="Link phòng học"
                fullWidth
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InstructorSchedules;
