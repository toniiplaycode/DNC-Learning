import { Box, Container, Grid, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "white",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Về chúng tôi
            </Typography>
            <Typography variant="body2">
              Hệ thống E-learning cung cấp các khóa học chất lượng cao từ các
              giảng viên hàng đầu.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Liên kết
            </Typography>
            <Link href="#" color="inherit" display="block">
              Khóa học
            </Link>
            <Link href="#" color="inherit" display="block">
              Giảng viên
            </Link>
            <Link href="#" color="inherit" display="block">
              Blog
            </Link>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Liên hệ
            </Typography>
            <Typography variant="body2">
              Email: contact@elearning.com
              <br />
              Phone: (84) 123-456-789
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
