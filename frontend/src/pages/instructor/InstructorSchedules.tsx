import { useState } from "react";
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
  TextFieldProps,
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
} from "@mui/icons-material";
import { DatePicker } from "@mui/lab";

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
];

const InstructorSchedules = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState(mockSchedules);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

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

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Lịch dạy
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSchedule}
        >
          Thêm lịch mới
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <DatePicker
              value={selectedDate}
              onChange={(newDate: Date | null) =>
                newDate && setSelectedDate(newDate)
              }
              renderInput={(params: TextFieldProps) => (
                <TextField {...params} />
              )}
              views={["day"]}
              sx={{
                width: "100%",
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: "primary.main",
                },
              }}
            />
          </Card>
        </Grid>

        {/* Schedule List */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Typography variant="h6">
                {selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              <IconButton size="small">
                <ChevronLeft />
              </IconButton>
              <IconButton size="small">
                <ChevronRight />
              </IconButton>
            </Stack>

            {getSchedulesForDate(selectedDate).length > 0 ? (
              <Stack spacing={2}>
                {getSchedulesForDate(selectedDate).map((schedule) => (
                  <Card
                    key={schedule.id}
                    variant="outlined"
                    sx={{ p: 2, position: "relative" }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {schedule.title}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {schedule.description}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={3}
                        flexWrap="wrap"
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTime color="action" fontSize="small" />
                          <Typography variant="body2">
                            {schedule.startTime} - {schedule.endTime}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <People color="action" fontSize="small" />
                          <Typography variant="body2">
                            {schedule.students} học viên
                          </Typography>
                        </Stack>
                        <Chip
                          icon={<VideoCall />}
                          label={
                            schedule.type === "online"
                              ? "Trực tuyến"
                              : "Trực tiếp"
                          }
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {schedule.course}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  py: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Không có lịch dạy nào trong ngày này
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

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
