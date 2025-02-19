import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Button,
  Chip,
} from "@mui/material";

interface Instructor {
  id: number;
  name: string;
  title: string;
  avatar: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  specializations: string[];
}

const instructors: Instructor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Chuyên gia AI & Machine Learning",
    avatar: "/src/assets/instructors/sarah.png",
    coursesCount: 12,
    studentsCount: 15420,
    rating: 4.9,
    specializations: ["Artificial Intelligence", "Data Science", "Python"],
  },
  {
    id: 2,
    name: "John Doe",
    title: "Senior Software Engineer",
    avatar: "/src/assets/instructors/john.png",
    coursesCount: 8,
    studentsCount: 12350,
    rating: 4.8,
    specializations: ["Web Development", "React", "TypeScript"],
  },
  {
    id: 3,
    name: "Emma Wilson",
    title: "Digital Marketing Expert",
    avatar: "/src/assets/instructors/emma.png",
    coursesCount: 6,
    studentsCount: 8940,
    rating: 4.7,
    specializations: ["Digital Marketing", "SEO", "Social Media"],
  },
  {
    id: 4,
    name: "David Chen",
    title: "UI/UX Design Lead",
    avatar: "/src/assets/instructors/david.png",
    coursesCount: 5,
    studentsCount: 7820,
    rating: 4.8,
    specializations: ["UI Design", "UX Research", "Figma"],
  },
];

const FeaturedInstructors = () => {
  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Giảng viên tiêu biểu
        </Typography>
        <Button variant="outlined">Xem tất cả</Button>
      </Box>

      <Grid container spacing={3}>
        {instructors.map((instructor) => (
          <Grid item xs={12} sm={6} md={3} key={instructor.id}>
            <Card
              sx={{
                height: "100%",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  src={instructor.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    border: 3,
                    borderColor: "primary.main",
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {instructor.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  {instructor.title}
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  mb={2}
                >
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary.main">
                      {instructor.coursesCount}+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khóa học
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary.main">
                      {(instructor.studentsCount / 1000).toFixed(1)}K+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Học viên
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    justifyContent="center"
                  >
                    {instructor.specializations.map((spec) => (
                      <Chip
                        key={spec}
                        label={spec}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedInstructors;
