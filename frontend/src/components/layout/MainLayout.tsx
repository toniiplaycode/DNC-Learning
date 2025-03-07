import { Box } from "@mui/material";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatBox from "../chat/ChatBox";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
        {children}
      </Box>
      <Footer />
      <ChatBox />
    </Box>
  );
};

export default MainLayout;
