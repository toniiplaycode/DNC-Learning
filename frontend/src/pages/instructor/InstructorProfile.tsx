import React from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Divider,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  School,
  WorkOutline,
  Star,
  Person,
  Assignment,
  LinkedIn,
  AccountBalance,
  VerifiedUser,
  Email,
  Phone,
  Work,
} from "@mui/icons-material";
import CardCourse from "../../components/common/CardCourse";

// Mock data từ CSDL
const mockInstructor = {
  user_id: 1,
  full_name: "John Doe",
  professional_title: "Senior Software Engineer",
  specialization: "Web Development, React, TypeScript",
  education_background: "Master in Computer Science",
  teaching_experience: "5+ years teaching experience in web development",
  bio: "Passionate about teaching and helping others learn programming. Experienced in both industry and education.",
  expertise_areas: [
    "Frontend Development",
    "React & React Native",
    "TypeScript",
    "Web Architecture",
  ],
  certificates: [
    "AWS Certified Developer",
    "Google Certified Educator",
    "Microsoft Certified Trainer",
  ],
  linkedin_profile: "linkedin.com/in/johndoe",
  website: "johndoe.dev",
  rating_average: 4.8,
  total_students: 1500,
  total_courses: 12,
  total_reviews: 450,
  verification_status: "verified",
  verification_documents:
    "Verified teaching credentials and industry experience",
  bank_account_info: null, // Sensitive info, không hiển thị
  created_at: "2022-01-15",
  email: "john.doe@example.com",
  phone: "+84 123 456 789",
  position: "Lead Instructor",
  teaching_courses: [
    {
      id: 1,
      title: "React & TypeScript Masterclass",
      instructor: {
        name: "John Doe",
        avatar: "/src/assets/avatar.png",
      },
      rating: 4.8,
      totalRatings: 234,
      duration: "20 giờ",
      totalLessons: 32,
      price: 499000,
      image: "/src/assets/logo.png",
    },
    {
      id: 2,
      title: "Advanced Web Development",
      instructor: {
        name: "John Doe",
        avatar: "/src/assets/avatar.png",
      },
      rating: 4.9,
      totalRatings: 189,
      duration: "25 giờ",
      totalLessons: 40,
      price: 699000,
      image: "/src/assets/logo.png",
    },
    {
      id: 2,
      title: "Advanced Web Development",
      instructor: {
        name: "John Doe",
        avatar: "/src/assets/avatar.png",
      },
      rating: 4.9,
      totalRatings: 189,
      duration: "25 giờ",
      totalLessons: 40,
      price: 699000,
      image: "/src/assets/logo.png",
    },
    {
      id: 2,
      title: "Advanced Web Development",
      instructor: {
        name: "John Doe",
        avatar: "/src/assets/avatar.png",
      },
      rating: 4.9,
      totalRatings: 189,
      duration: "25 giờ",
      totalLessons: 40,
      price: 699000,
      image: "/src/assets/logo.png",
    },
  ],
};

const InstructorProfile = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" py={2}>
        Thông tin giảng viên
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Main Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  src="/src/assets/avatar.png"
                  sx={{ width: 120, height: 120, mr: 3 }}
                />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="h4" sx={{ mr: 1 }}>
                      {mockInstructor.full_name}
                    </Typography>
                    <VerifiedUser color="primary" />
                  </Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {mockInstructor.professional_title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating
                      value={mockInstructor.rating_average}
                      precision={0.1}
                      readOnly
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({mockInstructor.rating_average}/5.0)
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Giới thiệu
              </Typography>
              <Typography paragraph>{mockInstructor.bio}</Typography>

              <Typography variant="h6" gutterBottom>
                Chuyên môn
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {mockInstructor.expertise_areas.map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    sx={{ m: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>

              <Typography variant="h6" gutterBottom>
                Chứng chỉ
              </Typography>
              <List>
                {mockInstructor.certificates.map((cert) => (
                  <ListItem key={cert}>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={cert} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kinh nghiệm giảng dạy
              </Typography>
              <Typography paragraph>
                {mockInstructor.teaching_experience}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Học vấn
              </Typography>
              <Typography paragraph>
                {mockInstructor.education_background}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Stats & Additional Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${mockInstructor.total_students} học viên`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${mockInstructor.total_courses} khóa học`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${mockInstructor.total_reviews} đánh giá`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin liên hệ
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText primary={mockInstructor.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText primary={mockInstructor.phone} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText primary={mockInstructor.position} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LinkedIn />
                  </ListItemIcon>
                  <ListItemText primary={mockInstructor.linkedin_profile} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WorkOutline />
                  </ListItemIcon>
                  <ListItemText primary={mockInstructor.website} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" py={2}>
          Khóa học đang dạy
        </Typography>
        <Grid container spacing={3}>
          {mockInstructor.teaching_courses.map((course) => (
            <Grid item xs={12} sm={6} key={course.id}>
              <CardCourse {...course} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default InstructorProfile;
