import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
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
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  setMessages,
  addMessage,
  setSelectedReceiver,
  markMessageAsRead,
  fetchMessagesByUser,
} from "../../../features/messages/messagesSlice";

import { selectCurrentUser } from "../../../features/auth/authSelectors";
import {
  selectAllMessages,
  selectMessagesLoading,
} from "../../../features/messages/messagesSelector";

interface Message {
  id: number;
  messageText: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl: string;
    userStudent?: {
      id: string;
      fullName: string;
      gender: string;
      educationLevel: string;
      occupation: string;
      bio: string;
    };
    userStudentAcademic?: {
      id: string;
      studentCode: string;
      fullName: string;
      academicYear: string;
      status: string;
      academicClass: {
        id: string;
        classCode: string;
        className: string;
      };
    };
    userInstructor?: {
      id: string;
      fullName: string;
      professionalTitle: string;
      specialization?: string;
      bio?: string;
      verificationStatus?: string;
    };
  };
  receiver: {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl: string;
    userStudent?: {
      id: string;
      fullName: string;
    };
    userStudentAcademic?: {
      id: string;
      fullName: string;
      studentCode: string;
    };
    userInstructor?: {
      id: string;
      fullName: string;
      professionalTitle: string;
    };
  };
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
  instructor: {
    id: string;
    fullName: string;
    avatarUrl: string;
    role: string;
    online?: boolean; // This would need to come from socket status
  };
  messages: Message[];
  unread: number;
}

// Or for a more detailed approach with login prompt:
const ChatBox = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Return early if no user with login prompt
  if (!currentUser) {
    return (
      <Grow in={true}>
        <Fab
          color="primary"
          onClick={() => navigate("/login")}
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
    );
  }

  const [showInstructors, setShowInstructors] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectAllMessages);
  const loading = useAppSelector(selectMessagesLoading);
  // const unreadCount = useAppSelector(selectUnreadMessagesCount);

  // Add null checks in useEffect
  useEffect(() => {
    if (!currentUser?.id) return;

    dispatch(fetchMessagesByUser(Number(currentUser.id)));
  }, [dispatch, currentUser?.id]);

  console.log(messages);

  const processMessages = (messages: Message[]) => {
    const instructorMessages = messages.reduce((acc, message) => {
      const otherUserId =
        message.sender.id === currentUser.id
          ? message.receiver.id
          : message.sender.id;

      if (!acc[otherUserId]) {
        const otherUser =
          message.sender.id === currentUser.id
            ? message.receiver
            : message.sender;

        acc[otherUserId] = {
          id: Number(otherUserId),
          instructor: {
            id: otherUser.id,
            fullName:
              otherUser.userInstructor?.fullName ||
              otherUser.userStudent?.fullName ||
              otherUser.userStudentAcademic?.fullName ||
              otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            role:
              otherUser.userInstructor?.professionalTitle ||
              otherUser.role.charAt(0).toUpperCase() + otherUser.role.slice(1),
            online: false,
          },
          messages: [],
          unread: 0,
        };
      }

      acc[otherUserId].messages.push({
        id: message.id,
        content: message.messageText,
        sender: message.sender.id === currentUser.id ? "user" : "support",
        timestamp: message.createdAt,
        avatar: message.sender.avatarUrl,
        name:
          message.sender.userInstructor?.fullName ||
          message.sender.userStudent?.fullName ||
          message.sender.userStudentAcademic?.fullName ||
          message.sender.username,
        isRead: message.isRead,
        senderId: message.sender.id,
        receiverId: message.receiver.id,
      });

      if (!message.isRead && message.sender.id !== currentUser.id) {
        acc[otherUserId].unread++;
      }

      return acc;
    }, {} as Record<string, ChatRoom>);

    return Object.values(instructorMessages);
  };

  // Update state initialization
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  // Update useEffect to process messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      const processedRooms = processMessages(messages);
      setChatRooms(processedRooms);
    }
  }, [messages, currentUser]);

  // Add null check in WebSocket connection
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("Attempting to connect to WebSocket...");
    socketRef.current = io("http://localhost:3000", {
      auth: {
        userId: currentUser.id,
        authorization: `Bearer ${localStorage.getItem("token")}`, // Add this line
      },
    });

    // Connection event handlers
    socketRef.current.on("connect", () => {
      console.log("WebSocket Connected!", socketRef.current?.id);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket Connection Error:", error.message);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("WebSocket Disconnected:", reason);
    });

    // Listen for new messages with logging
    socketRef.current.on("newMessage", (message: Message) => {
      console.log("New message received:", message);
      dispatch(addMessage(message));
    });

    // Listen for read receipts with logging
    socketRef.current.on("messageRead", (messageId: number) => {
      console.log("Message marked as read:", messageId);
      dispatch(markMessageAsRead(messageId));
    });

    // Add listener for messages response
    socketRef.current.on("messages", (messages) => {
      console.log("Received message history:", messages);
      dispatch(setMessages(messages));
    });

    return () => {
      console.log("Cleaning up WebSocket connection...");
      socketRef.current?.disconnect();
      socketRef.current?.off("messages");
    };
  }, [currentUser?.id, dispatch]);

  // Add null check in handleSend
  const handleSend = () => {
    if (
      !currentUser ||
      !message.trim() ||
      !selectedRoom ||
      !socketRef.current
    ) {
      return;
    }

    console.log("Sending message to:", selectedRoom.instructor.fullName);

    const newMessage: Message = {
      id: Date.now(),
      messageText: message,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser?.id.toString(),
        username: currentUser?.username,
        email: currentUser?.email,
        role: currentUser?.role,
        avatarUrl: currentUser?.avatarUrl,
      },
      receiver: {
        id: selectedRoom.instructor.id,
        username: selectedRoom.instructor.fullName,
        email: "",
        role: selectedRoom.instructor.role,
        avatarUrl: selectedRoom.instructor.avatarUrl,
      },
    };

    // Emit message through WebSocket
    socketRef.current.emit("sendMessage", {
      receiverId: selectedRoom.instructor.id,
      messageText: message,
    });
    console.log("Message sent:", newMessage);

    // Update local state
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
  };

  const handleMarkAsRead = (messageId: number) => {
    if (socketRef.current) {
      console.log("Marking message as read:", messageId);
      socketRef.current.emit("markAsRead", messageId);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    dispatch(setSelectedReceiver(room.instructor.id));
    setSelectedRoom(room);
    setShowInstructors(false);

    // Fetch message history when selecting a room
    if (socketRef.current) {
      console.log("Fetching messages for room:", room.id);
      socketRef.current.emit("getMessages", room.instructor.id);
    }

    // Mark unread messages as read
    if (room.unread > 0) {
      room.messages
        .filter((msg) => !msg.isRead && msg.sender.role === "support")
        .forEach((msg) => handleMarkAsRead(msg.id));

      setChatRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, unread: 0 } : r))
      );
    }
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
                      : selectedRoom?.instructor.fullName}
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
                        <Avatar src={room.instructor.avatarUrl} />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={room.instructor.fullName}
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
                                <Stack>
                                  <Typography variant="subtitle2">
                                    {msg.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {selectedRoom.instructor.role}
                                  </Typography>
                                </Stack>
                              </Box>
                            )}
                            <Typography
                              color={
                                msg.sender === "user" ? "white" : "text.primary"
                              }
                            >
                              {msg.content}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color={
                                  msg.sender === "user"
                                    ? "white"
                                    : "text.secondary"
                                }
                              >
                                {new Date(msg.timestamp).toLocaleString()}
                              </Typography>
                              {msg.sender === "user" && (
                                <Typography
                                  variant="caption"
                                  color={
                                    msg.sender === "user"
                                      ? "white"
                                      : "text.secondary"
                                  }
                                >
                                  {msg.isRead ? "Đã xem" : "Đã gửi"}
                                </Typography>
                              )}
                            </Box>
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
