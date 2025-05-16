import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  YouTube,
  Instagram,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Group,
  Book,
  Help,
  Security,
  Payment,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { text: "Giới thiệu", href: "#" },
      { text: "Đội ngũ giảng viên", href: "#" },
      { text: "Cơ hội nghề nghiệp", href: "#" },
      { text: "Tin tức & Sự kiện", href: "#" },
      { text: "Chính sách bảo mật", href: "#" },
    ],
    courses: [
      { text: "Khóa học mới", href: "#" },
      { text: "Khóa học phổ biến", href: "#" },
      { text: "Khóa học miễn phí", href: "#" },
      { text: "Lộ trình học tập", href: "#" },
      { text: "Chứng chỉ", href: "#" },
    ],
    support: [
      { text: "Trung tâm trợ giúp", href: "#" },
      { text: "FAQ", href: "#" },
      { text: "Liên hệ hỗ trợ", href: "#" },
      { text: "Phản hồi", href: "#" },
      { text: "Báo lỗi", href: "#-issue" },
    ],
    resources: [
      { text: "Blog", href: "#" },
      { text: "Tài liệu học tập", href: "#" },
      { text: "Cộng đồng", href: "#" },
      { text: "Diễn đàn", href: "#" },
      { text: "Sự kiện", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, href: "#", label: "Facebook" },
    { icon: <Twitter />, href: "#", label: "Twitter" },
    { icon: <LinkedIn />, href: "#", label: "LinkedIn" },
    { icon: <YouTube />, href: "#", label: "YouTube" },
    { icon: <Instagram />, href: "#", label: "Instagram" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "white",
        pt: 6,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ mb: 2 }}>
                <School sx={{ fontSize: 40, color: "primary.light" }} />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                DNC Learning
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Nền tảng học tập trực tuyến hàng đầu, cung cấp các khóa học chất
                lượng cao từ đội ngũ giảng viên chuyên nghiệp.
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconButton
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "white" }}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </IconButton>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([section, links], index) => (
            <Grid item xs={12} sm={6} md={3} key={section}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Typography>
                <Stack spacing={1}>
                  {links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      color="inherit"
                      sx={{
                        textDecoration: "none",
                        "&:hover": {
                          color: "primary.light",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {link.text}
                    </Link>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Contact Information */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 4 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Email sx={{ color: "primary.light" }} />
                <Box>
                  <Typography variant="subtitle2" color="primary.light">
                    Email
                  </Typography>
                  <Typography variant="body2">
                    contact@dnclearning.com
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Phone sx={{ color: "primary.light" }} />
                <Box>
                  <Typography variant="subtitle2" color="primary.light">
                    Điện thoại
                  </Typography>
                  <Typography variant="body2">(84) 123-456-789</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <LocationOn sx={{ color: "primary.light" }} />
                <Box>
                  <Typography variant="subtitle2" color="primary.light">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body2">
                    123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Bottom Footer */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                © {currentYear} DNC Learning. Tất cả quyền được bảo lưu.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                <Link href="/terms" color="inherit" variant="body2">
                  Điều khoản sử dụng
                </Link>
                <Link href="/privacy" color="inherit" variant="body2">
                  Chính sách bảo mật
                </Link>
                <Link href="/cookies" color="inherit" variant="body2">
                  Chính sách cookie
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
