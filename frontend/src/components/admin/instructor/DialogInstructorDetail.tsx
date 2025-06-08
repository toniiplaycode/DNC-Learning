import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
  Tabs,
  Tab,
  Paper,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  Email,
  Phone,
  CalendarToday,
  School,
  Language,
  LocationOn,
  LinkedIn,
  Work,
  Assignment,
  VerifiedUser,
  Star,
  Close,
  Group,
  BarChart,
  Business,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectAllInstructors } from "../../../features/user_instructors/instructorsSelectors";
import { fetchInstructors } from "../../../features/user_instructors/instructorsApiSlice";

interface DialogInstructorDetailProps {
  open: boolean;
  onClose: () => void;
  instructorId: number | null;
}

const DialogInstructorDetail = ({
  open,
  onClose,
  instructorId,
}: DialogInstructorDetailProps) => {
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useAppDispatch();
  const instructors = useAppSelector(selectAllInstructors);

  // Fetch instructors when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchInstructors());
    }
  }, [dispatch, open]);

  // Get instructor data
  const instructor = instructors.find((i) => i.id === instructorId);

  // Xử lý chuyển tab
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!instructor) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="instructor-detail-dialog"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Thông tin chi tiết giảng viên</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Hồ sơ giảng viên */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
            }}
          >
            <Avatar
              src={instructor.user?.avatarUrl}
              sx={{ width: 120, height: 120 }}
            >
              {instructor.fullName?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Typography variant="h5">{instructor.fullName}</Typography>
                {instructor.verificationStatus === "verified" && (
                  <Tooltip title="Giảng viên đã được xác minh">
                    <VerifiedUser color="primary" />
                  </Tooltip>
                )}
                <Chip
                  label={instructor.professionalTitle}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {instructor.specialization}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Tooltip title="Email">
                  <IconButton size="small" color="primary">
                    <Email />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Điện thoại">
                  <IconButton size="small" color="primary">
                    <Phone />
                  </IconButton>
                </Tooltip>
                {instructor.website && (
                  <Tooltip title="Website">
                    <IconButton size="small" color="primary">
                      <Language />
                    </IconButton>
                  </Tooltip>
                )}
                {instructor.linkedinProfile && (
                  <Tooltip title="LinkedIn">
                    <IconButton size="small" color="primary">
                      <LinkedIn />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Tab navigation */}
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="Thông tin chung" />
          <Tab label="Thống kê" />
        </Tabs>

        {/* Tab thông tin chung */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin liên hệ
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={instructor.user?.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText
                        primary="Số điện thoại"
                        secondary={instructor.user?.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Business />
                      </ListItemIcon>
                      <ListItemText
                        primary="Khoa"
                        secondary={
                          instructor.faculty
                            ? instructor.faculty.facultyName
                            : "Giảng viên tự do"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngày tham gia"
                        secondary={new Date(
                          instructor.createdAt
                        ).toLocaleDateString("vi-VN")}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Giới thiệu
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {instructor.bio}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Chuyên môn
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {instructor.expertiseAreas
                        ?.split(", ")
                        .map((area, index) => (
                          <Chip
                            key={index}
                            label={area}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Học vấn & Kinh nghiệm
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <School />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trình độ học vấn"
                        secondary={instructor.educationBackground}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Work />
                      </ListItemIcon>
                      <ListItemText
                        primary="Kinh nghiệm giảng dạy"
                        secondary={instructor.teachingExperience}
                      />
                    </ListItem>
                    {instructor.certificates && (
                      <ListItem>
                        <ListItemIcon>
                          <Assignment />
                        </ListItemIcon>
                        <ListItemText
                          primary="Chứng chỉ"
                          secondary={instructor.certificates}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab thống kê */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tổng quan
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Group />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tổng số học viên"
                        secondary={instructor.totalStudents}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tổng số khóa học"
                        secondary={instructor.totalCourses}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Star />
                      </ListItemIcon>
                      <ListItemText
                        primary="Đánh giá trung bình"
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Rating
                              value={parseFloat(
                                instructor.averageRating || "0"
                              )}
                              precision={0.5}
                              size="small"
                              readOnly
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({instructor.totalReviews} đánh giá)
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Tab Panel component
function TabPanel(props: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instructor-tabpanel-${index}`}
      aria-labelledby={`instructor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default DialogInstructorDetail;
