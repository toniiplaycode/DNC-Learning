import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatBox from "../../../components/student/chat/ChatBox";

const MainLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Box component="main" sx={{ pt: 8, flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ChatBox />
    </Box>
  );
};

export default MainLayout;
