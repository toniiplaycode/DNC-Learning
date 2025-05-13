import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Paper,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Avatar,
} from "@mui/material";
import {
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  Cancel as BannedIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateUser } from "../../../features/users/usersApiSlice";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import { UserStatus } from "../../../types/user.types";
import { toast } from "react-toastify";

interface EditStudentStatusDialogProps {
  open: boolean;
  onClose: () => void;
  student: any;
  onSuccess?: () => void;
}

const EditStudentStatusDialog: React.FC<EditStudentStatusDialogProps> = ({
  open,
  onClose,
  student,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [status, setStatus] = useState<UserStatus>(student.status);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do cập nhật trạng thái");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user status
      await dispatch(
        updateUser({
          userId: student.id,
          userData: {
            status: status,
          },
        })
      ).unwrap();

      // Create notification for the student
      const notificationData = {
        userIds: [student.id],
        title: "Cập nhật trạng thái tài khoản",
        content: `Tài khoản của bạn đã được cập nhật trạng thái thành "${getStatusLabel(
          status
        )}" với lý do: ${reason}`,
        type: "system",
      };

      await dispatch(createNotification(notificationData));

      toast.success("Cập nhật trạng thái thành công và đã gửi thông báo");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "Hoạt động";
      case UserStatus.INACTIVE:
        return "Không hoạt động";
      case UserStatus.BANNED:
        return "Bị cấm";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <ActiveIcon color="success" />;
      case UserStatus.INACTIVE:
        return <InactiveIcon color="warning" />;
      case UserStatus.BANNED:
        return <BannedIcon color="error" />;
      default:
        return <PersonIcon />;
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "success";
      case UserStatus.INACTIVE:
        return "warning";
      case UserStatus.BANNED:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {getStatusIcon(status)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Cập nhật trạng thái{" "}
              {student.userStudentAcademic ? "sinh viên" : "học viên"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thay đổi trạng thái và gửi thông báo qua email
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Avatar src={student.avatarUrl}>
              {student.username[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                {student.userStudentAcademic ? "Sinh viên" : "Học viên"}:{" "}
                {student.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student.userStudentAcademic
                  ? student.userStudentAcademic.fullName
                  : student.userStudent?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {student.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={status}
            label="Trạng thái"
            onChange={(e) => setStatus(e.target.value as UserStatus)}
          >
            <MenuItem value={UserStatus.ACTIVE}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ActiveIcon color="success" />
                {getStatusLabel(UserStatus.ACTIVE)}
              </Box>
            </MenuItem>
            <MenuItem value={UserStatus.INACTIVE}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <InactiveIcon color="warning" />
                {getStatusLabel(UserStatus.INACTIVE)}
              </Box>
            </MenuItem>
            <MenuItem value={UserStatus.BANNED}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BannedIcon color="error" />
                {getStatusLabel(UserStatus.BANNED)}
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Lý do cập nhật"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={!!error}
          helperText={error}
          placeholder="Nhập lý do cập nhật trạng thái..."
        />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mt: 2,
            bgcolor: "background.default",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EmailIcon sx={{ color: "#fb8c00" }} />
          <Typography variant="subtitle2" sx={{ color: "#fb8c00" }}>
            Email thông báo sẽ được gửi đến:
          </Typography>
          <Typography variant="body2" sx={{ ml: 1 }}>
            {student.email}
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !reason.trim()}
          startIcon={<EmailIcon />}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật và gửi thông báo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentStatusDialog;
