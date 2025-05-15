import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  Fab,
  Zoom,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Videocam as VideocamIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectActiveClass,
  selectIsClassActive,
  selectJoinTime,
  selectElapsedTime,
} from "../../../features/teaching-schedules/activeClassSelectors";
import {
  leaveClass,
  updateElapsedTime,
} from "../../../features/teaching-schedules/activeClassSlice";
import { parseISO, format } from "date-fns";
import { useNavigate } from "react-router-dom";

const ActiveClassDialog = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeClass = useAppSelector(selectActiveClass);
  const isActive = useAppSelector(selectIsClassActive);
  const joinTime = useAppSelector(selectJoinTime);
  const elapsedTime = useAppSelector(selectElapsedTime);

  const [expanded, setExpanded] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && joinTime) {
      timer = setInterval(() => {
        const joinTimeMs = new Date(joinTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - joinTimeMs) / 1000);
        dispatch(updateElapsedTime(elapsed));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, joinTime, dispatch]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${remainingSeconds}s`;
  };

  const handleLeaveClass = () => {
    dispatch(leaveClass());
    setConfirmDialogOpen(false);
  };

  const handleOpenMeeting = () => {
    if (activeClass?.meetingLink) {
      window.open(activeClass.meetingLink, "_blank");
    }
  };

  const handleCopyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleNavigateToClass = () => {
    if (activeClass) {
      navigate(`/join-class/${activeClass.id}`);
    }
  };

  if (!isActive || !activeClass) {
    return null;
  }

  return (
    <>
      <Zoom in={isActive}>
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 1000,
          }}
        >
          {expanded ? (
            <Paper
              elevation={4}
              sx={{
                width: 320,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccessTimeIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatDuration(elapsedTime)}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => setExpanded(false)}
                    sx={{ color: "white" }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setConfirmDialogOpen(true)}
                    sx={{ color: "white" }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {activeClass.title}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar
                    src={
                      activeClass.academicClassInstructor?.instructor?.user
                        ?.avatarUrl
                    }
                    alt={
                      activeClass.academicClassInstructor?.instructor?.fullName
                    }
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {activeClass.academicClassInstructor?.instructor?.fullName}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {activeClass.academicClass?.className}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(activeClass.startTime), "HH:mm")} -{" "}
                    {format(parseISO(activeClass.endTime), "HH:mm")}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 1,
                    p: 1.5,
                    mb: 2,
                  }}
                >
                  {activeClass.meetingLink && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {activeClass.meetingLink}
                      </Typography>
                      <Tooltip title="Mở liên kết">
                        <IconButton size="small" onClick={handleOpenMeeting}>
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {activeClass.meetingId && (
                      <Box sx={{ mr: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          ID
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2">
                            {activeClass.meetingId}
                          </Typography>
                          <Tooltip title="Sao chép ID">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCopyToClipboard(
                                  activeClass.meetingId || ""
                                )
                              }
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}

                    {activeClass.meetingPassword && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Mật khẩu
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2">
                            {activeClass.meetingPassword}
                          </Typography>
                          <Tooltip title="Sao chép mật khẩu">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCopyToClipboard(
                                  activeClass.meetingPassword || ""
                                )
                              }
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleNavigateToClass}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    Kết thúc
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={4}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 6,
                bgcolor: theme.palette.primary.main,
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => setExpanded(true)}
            >
              <AccessTimeIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {formatDuration(elapsedTime)}
              </Typography>
              <IconButton size="small" sx={{ color: "white", ml: 1 }}>
                <ExpandLessIcon />
              </IconButton>
            </Paper>
          )}
        </Box>
      </Zoom>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Xác nhận kết thúc buổi học
          </Typography>
          <Typography variant="body1">
            Bạn có chắc chắn muốn kết thúc buổi học? Thời gian tham gia của bạn
            sẽ được ghi nhận là {formatDuration(elapsedTime)}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Huỷ</Button>
          <Button onClick={handleLeaveClass} color="error" variant="contained">
            Kết thúc
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActiveClassDialog;
