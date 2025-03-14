import React, { useState } from "react";
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Card,
  InputAdornment,
  Badge,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Paper,
  Slide,
  Grow,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close,
  Send,
  Circle,
  ArrowBack,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  content: string;
  sender: "user" | "support";
  timestamp: string;
  avatar?: string;
  name?: string;
}

interface Instructor {
  id: number;
  name: string;
  avatar: string;
  role: string;
  online: boolean;
  lastSeen?: string;
}

interface ChatRoom {
  id: number;
  instructor: Instructor;
  messages: Message[];
  unread: number;
}

const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [showInstructors, setShowInstructors] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Mock data giảng viên
  const mockInstructors: Instructor[] = [
    {
      id: 1,
      name: "TS. Nguyễn Văn A",
      avatar: "/src/assets/avatar.png",
      role: "Giảng viên React",
      online: true,
    },
    {
      id: 2,
      name: "ThS. Trần Thị B",
      avatar: "/src/assets/avatar.png",
      role: "Giảng viên TypeScript",
      online: false,
      lastSeen: "2 giờ trước",
    },
    {
      id: 3,
      name: "Hỗ trợ viên",
      avatar: "/src/assets/avatar.png",
      role: "Tư vấn viên",
      online: true,
    },
  ];

  // Mock data chat rooms
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(
    mockInstructors.map((instructor) => ({
      id: instructor.id,
      instructor,
      messages: [],
      unread: 0,
    }))
  );

  const handleSend = () => {
    if (message.trim() && selectedRoom) {
      const newMessage: Message = {
        id: Date.now(),
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      setChatRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoom.id
            ? {
                ...room,
                messages: [...room.messages, newMessage],
              }
            : room
        )
      );
      setMessage("");

      // Giả lập phản hồi
      setTimeout(() => {
        const response: Message = {
          id: Date.now() + 1,
          content: `Cảm ơn bạn đã nhắn tin. Tôi là ${selectedRoom.instructor.name}, tôi có thể giúp gì cho bạn?`,
          sender: "support",
          timestamp: new Date().toISOString(),
          name: selectedRoom.instructor.name,
          avatar: selectedRoom.instructor.avatar,
        };

        setChatRooms((prev) =>
          prev.map((room) =>
            room.id === selectedRoom.id
              ? {
                  ...room,
                  messages: [...room.messages, response],
                }
              : room
          )
        );
      }, 1000);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowInstructors(false);
  };

  const handleClose = () => {
    setOpen(false);
    setShowInstructors(true);
  };

  return (
    <>
      {/* Chat Icon */}
      <Grow in={!open}>
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Badge color="error" variant="dot">
            <ChatIcon />
          </Badge>
        </Fab>
      </Grow>

      {/* Chat Box */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: "100%",
            maxWidth: 360,
            height: 480,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!showInstructors && (
                <IconButton
                  size="small"
                  sx={{ color: "white", mr: 1 }}
                  onClick={() => setShowInstructors(true)}
                >
                  <ArrowBack />
                </IconButton>
              )}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6">
                    {showInstructors
                      ? "Chọn người để chat"
                      : selectedRoom?.instructor.name}
                  </Typography>
                  {!showInstructors && selectedRoom?.instructor.online && (
                    <Circle sx={{ color: "#4caf50", fontSize: 12 }} />
                  )}
                </Box>
                {!showInstructors && selectedRoom?.instructor.role && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {selectedRoom.instructor.role}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!showInstructors && selectedRoom?.instructor.id && (
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    mr: 1,
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  onClick={() => {
                    handleClose();
                    navigate(`/instructor/${selectedRoom.instructor.id}`);
                  }}
                >
                  <Person />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{ color: "white" }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {showInstructors ? (
              // Danh sách giảng viên
              <List sx={{ flex: 1, overflowY: "auto" }}>
                {chatRooms.map((room) => (
                  <ListItemButton
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        variant="dot"
                        color={room.instructor.online ? "success" : "default"}
                      >
                        <Avatar src={room.instructor.avatar} />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={room.instructor.name}
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {room.instructor.role}
                          </Typography>
                          {!room.instructor.online && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {room.instructor.lastSeen}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {room.unread > 0 && (
                      <Badge
                        badgeContent={room.unread}
                        color="error"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </ListItemButton>
                ))}
              </List>
            ) : (
              // Chat room
              <>
                <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                  <Stack spacing={2}>
                    {selectedRoom?.messages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: "flex",
                          justifyContent:
                            msg.sender === "user" ? "flex-end" : "flex-start",
                        }}
                      >
                        <Card
                          sx={{
                            maxWidth: "80%",
                            bgcolor:
                              msg.sender === "user"
                                ? "primary.main"
                                : "grey.100",
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            {msg.sender === "support" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Avatar
                                  src={msg.avatar}
                                  sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="subtitle2">
                                  {msg.name}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              color={
                                msg.sender === "user" ? "white" : "text.primary"
                              }
                            >
                              {msg.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={
                                msg.sender === "user"
                                  ? "white"
                                  : "text.secondary"
                              }
                              sx={{
                                display: "block",
                                mt: 1,
                                textAlign: "right",
                              }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Card>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline={true}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleSend}
                            disabled={!message.trim()}
                          >
                            <Send
                              color={message.trim() ? "primary" : "disabled"}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ChatBox;
