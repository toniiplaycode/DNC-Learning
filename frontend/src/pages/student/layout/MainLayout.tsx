import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatBox from "../../../components/student/chat/ChatBox";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import BlockIcon from "@mui/icons-material/Block";
import GavelIcon from "@mui/icons-material/Gavel";
import { logout } from "../../../features/auth/authApiSlice";
import ActiveClassDialog from "../teaching-schedules/ActiveClassDialog";

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();

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
      <ActiveClassDialog />
      {/* Dialog cảnh báo nếu tài khoản không active */}
      <Dialog
        open={!!currentUser && currentUser.status !== "active"}
        aria-labelledby="account-status-dialog-title"
        aria-describedby="account-status-dialog-description"
        disableEscapeKeyDown
        disableBackdropClick
      >
        <DialogTitle
          id="account-status-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color:
              currentUser?.status === "banned"
                ? "error.main"
                : currentUser?.status === "inactive"
                ? "warning.main"
                : "text.primary",
          }}
        >
          {currentUser?.status === "banned" ? (
            <GavelIcon color="error" />
          ) : (
            <BlockIcon color="warning" />
          )}
          {currentUser?.status === "banned"
            ? "Tài khoản của bạn đã bị cấm"
            : "Tài khoản của bạn không hoạt động"}
        </DialogTitle>
        <DialogContent>
          <Typography id="account-status-dialog-description" sx={{ mb: 1 }}>
            {currentUser?.status === "banned"
              ? "Tài khoản của bạn đã bị cấm vĩnh viễn do vi phạm quy định. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên."
              : "Tài khoản của bạn hiện không hoạt động. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              await dispatch(logout()).unwrap();
              navigate("/login");
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Đăng nhập tài khoản khác
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainLayout;
