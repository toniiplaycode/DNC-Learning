import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 100,
              color: "error.main",
              mb: 2,
            }}
          />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: "6rem",
              fontWeight: "bold",
              color: "text.primary",
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "medium",
              color: "text.secondary",
              mb: 2,
            }}
          >
            Trang không tồn tại
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
            }}
          >
            Trang bạn đang tìm kiếm không tồn tại.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            Trở lại trang chủ
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
