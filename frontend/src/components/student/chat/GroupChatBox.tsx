import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Card,
  InputAdornment,
  Badge,
  Paper,
  Slide,
  Grow,
  CircularProgress,
  Button,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import {
  Send,
  Close,
  Search,
  Link as LinkIcon,
  OpenInNew,
  Article,
  School,
  Person,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { io, Socket } from "socket.io-client";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { User } from "../../../features/auth/authApiSlice";
import {
  fetchMessagesByClass,
  sendGroupMessage,
  addMessage,
  setError,
} from "../../../features/group-messages/groupMessagesSlice";
import {
  selectAcademicClass,
  selectGroupMessagesByClass,
} from "../../../features/group-messages/groupMessagesSelector";
import { GroupMessage } from "../../../types/groupMessage.types";
import parse, { domToReact } from "html-react-parser";
import { fetchAcademicClassById } from "../../../features/academic-classes/academicClassesSlice";

interface AcademicClass {
  id: string;
  classCode: string;
  className: string;
  semester: string;
  status: string;
}

const chatHtmlParserOptions = {
  replace: (domNode: any) => {
    if (domNode.type === "tag") {
      const { name, children } = domNode;
      if (name === "ol" || name === "ul") {
        return (
          <ol style={{ margin: "0 0 0 20px", paddingLeft: "20px" }}>
            {domToReact(children, chatHtmlParserOptions)}
          </ol>
        );
      }
      if (name === "li") {
        return (
          <li style={{ marginBottom: "4px", fontSize: 16 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </li>
        );
      }
      if (name === "p") {
        return (
          <p style={{ margin: "0 0 8px 0", fontSize: 16, lineHeight: 1.7 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </p>
        );
      }
      if (name === "strong" || name === "b") {
        return (
          <strong style={{ fontWeight: 600 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </strong>
        );
      }
    }
  },
};

const getPageNameFromUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string" || url.trim() === "") return "";

  try {
    if (url.includes("/course") || url.includes("/courses")) {
      return "Khóa học";
    } else if (url.includes("/lesson") || url.includes("/lessons")) {
      return "Bài học";
    } else if (url.includes("/article")) {
      return "Bài viết";
    } else if (url.includes("/document")) {
      return "Tài liệu";
    } else {
      return "Tham khảo";
    }
  } catch (e) {
    return "Tham khảo";
  }
};

const isValidUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== "string" || url.trim() === "") return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch (e) {
    return false;
  }
};

const shortenUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string" || url.trim() === "") return "";

  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname}${urlObj.pathname.substring(0, 20)}${
      urlObj.pathname.length > 20 ? "..." : ""
    }`;
  } catch (e) {
    return url.substring(0, 30) + (url.length > 30 ? "..." : "");
  }
};

interface GroupChatBoxProps {
  open: boolean;
  onClose: () => void;
}

const GroupChatBox: React.FC<GroupChatBoxProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser) as User | null;
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState<string[]>([]);

  // Update classId when currentUser changes
  useEffect(() => {
    const newClassId = currentUser?.userStudentAcademic?.academicClass?.id;
    console.log("Current User:", currentUser);
    console.log("Academic Class ID:", newClassId);
    setClassId(newClassId);
  }, [currentUser]);

  // Fetch academic class details when classId changes
  useEffect(() => {
    if (!classId) return;

    dispatch(fetchAcademicClassById(parseInt(classId)))
      .unwrap()
      .catch((error) => {
        console.error("Error fetching academic class:", error);
      });
  }, [classId, dispatch]);

  // Get academic class from store
  const academicClass = useAppSelector(
    (state) => state.academicClasses.currentClass
  );

  // Memoize the messages selector
  const messagesSelector = React.useMemo(
    () => (classId ? selectGroupMessagesByClass(classId) : undefined),
    [classId]
  );

  const messages = useAppSelector((state) =>
    messagesSelector ? messagesSelector(state) : []
  );

  // Fetch messages when classId changes
  useEffect(() => {
    if (!classId) return;

    setIsLoading(true);
    dispatch(fetchMessagesByClass(classId))
      .unwrap()
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching group messages:", error);
        dispatch(setError(error.message || "Failed to fetch messages"));
        setIsLoading(false);
      });
  }, [classId, dispatch]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket connection effect
  useEffect(() => {
    if (!currentUser?.id || !classId) return;

    console.log("Connecting to socket with:", {
      userId: currentUser.id,
      classId: classId,
    });

    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log("Disconnecting existing socket");
      socketRef.current.disconnect();
    }

    // Create new socket connection
    socketRef.current = io("http://localhost:3000", {
      auth: {
        userId: currentUser.id,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket connection events
    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
      setIsConnected(true);

      // Join class room after connection
      socketRef.current?.emit("joinClassRoom", { classId }, (response: any) => {
        if (response?.success) {
          console.log("Joined class room:", response);
        } else {
          console.error("Failed to join class room");
        }
      });
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketRef.current.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);

      // Rejoin class room after reconnection
      socketRef.current?.emit("joinClassRoom", { classId });
    });

    socketRef.current.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    socketRef.current.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
    });

    // Room events
    socketRef.current.on("userJoined", (data) => {
      console.log("User joined:", data);
      if (data.classId === classId) {
        setUsersInRoom((prev) => [...prev, data.userId]);
      }
    });

    socketRef.current.on("userLeft", (data) => {
      console.log("User left:", data);
      if (data.classId === classId) {
        setUsersInRoom((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    socketRef.current.on("roomUsers", (data) => {
      console.log("Room users:", data);
      if (data.classId === classId) {
        setUsersInRoom(data.users);
      }
    });

    // Message events
    socketRef.current.on("newGroupMessage", (newMessage: GroupMessage) => {
      console.log("Received new group message:", newMessage);
      if (newMessage.classId === classId) {
        dispatch(addMessage(newMessage));
        console.log("Added new message to store");
        scrollToBottom();
      } else {
        console.log("Message is for a different class:", newMessage.classId);
      }
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection");
      if (socketRef.current) {
        // Leave the class room
        socketRef.current.emit("leaveClassRoom", { classId });
        // Remove all listeners
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.off("reconnect");
        socketRef.current.off("reconnect_error");
        socketRef.current.off("reconnect_failed");
        socketRef.current.off("userJoined");
        socketRef.current.off("userLeft");
        socketRef.current.off("roomUsers");
        socketRef.current.off("newGroupMessage");
        socketRef.current.off("error");
        // Disconnect socket
        socketRef.current.disconnect();
      }
    };
  }, [currentUser, classId, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socketRef.current || !currentUser || !classId) {
      console.log("Cannot send message:", {
        hasMessage: !!message.trim(),
        hasSocket: !!socketRef.current,
        hasUser: !!currentUser,
        hasClassId: !!classId,
        isConnected,
      });
      return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex);
    const referenceLink = matches && matches.length > 0 ? matches[0] : null;
    const isOnlyUrl =
      matches && matches.length === 1 && matches[0].trim() === message.trim();
    const messageText = isOnlyUrl ? "" : message.trim();

    const messageData = {
      classId,
      messageText: messageText || " ",
      referenceLink,
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
        userStudentAcademic: currentUser.userStudentAcademic,
        userInstructor: currentUser.userInstructor,
      },
    };

    console.log("Sending message:", messageData);

    // Emit message to server
    socketRef.current.emit("sendGroupMessage", messageData, (response: any) => {
      if (response?.error) {
        console.error("Error sending message:", response.error);
      } else {
        console.log("Message sent successfully:", response);
        // Clear input after successful send
        setMessage("");
        scrollToBottom();
      }
    });
  };

  if (!academicClass) {
    return null;
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          bottom: 10,
          right: 10,
          width: "500px",
          height: "88%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 99999999,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Box>
            <Typography variant="h6">{academicClass?.className}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {academicClass?.classCode} - {academicClass?.semester}
              {!isConnected && " (Đang kết nối lại...)"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", opacity: 0.8 }}
            >
              {usersInRoom.length} người đang online
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            messages.map((msg: GroupMessage) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.senderId === currentUser?.id
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <Card
                  sx={{
                    maxWidth: "80%",
                    bgcolor:
                      msg.senderId === currentUser?.id
                        ? "primary.main"
                        : "grey.100",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    {msg.senderId !== currentUser?.id && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          src={msg.sender.avatarUrl}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Stack>
                          <Typography variant="subtitle2">
                            {msg.sender.userInstructor?.fullName ||
                              msg.sender.userStudentAcademic?.fullName ||
                              msg.sender.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {msg.sender.userInstructor?.professionalTitle ||
                              msg.sender.role}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    <div
                      style={{
                        color:
                          msg.senderId === currentUser?.id
                            ? "white"
                            : undefined,
                        wordBreak: "break-word",
                        fontSize: 16,
                        lineHeight: 1.7,
                      }}
                    >
                      {msg.messageText
                        ? parse(msg.messageText, chatHtmlParserOptions)
                        : null}
                    </div>
                    {isValidUrl(msg.referenceLink) && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mt: msg.messageText ? 1.5 : 0,
                          pt: msg.messageText ? 1 : 0,
                        }}
                      >
                        {msg.senderId !== currentUser?.id ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              mt: 0.5,
                              borderRadius: 2,
                              bgcolor: "rgba(25, 118, 210, 0.05)",
                              border: "1px solid rgba(25, 118, 210, 0.2)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              position: "relative",
                              overflow: "hidden",
                              "&:hover": {
                                bgcolor: "rgba(25, 118, 210, 0.1)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "4px",
                                height: "100%",
                                bgcolor: "primary.main",
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  bgcolor: "primary.main",
                                  color: "white",
                                  borderRadius: "50%",
                                  p: 0.7,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {getPageNameFromUrl(msg.referenceLink) ===
                                "Khóa học" ? (
                                  <School fontSize="small" />
                                ) : (
                                  <Article fontSize="small" />
                                )}
                              </Box>
                              <Typography
                                variant="subtitle2"
                                color="primary.main"
                              >
                                {getPageNameFromUrl(msg.referenceLink)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontSize: 13,
                                pl: 0.5,
                              }}
                            >
                              {shortenUrl(msg.referenceLink)}
                            </Typography>
                            {msg.referenceLink && (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  endIcon={<OpenInNew fontSize="small" />}
                                  href={msg.referenceLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  sx={{
                                    textTransform: "none",
                                    mt: 0.5,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    fontWeight: 500,
                                    borderRadius: "8px",
                                  }}
                                >
                                  Truy cập
                                </Button>
                              </Box>
                            )}
                          </Paper>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LinkIcon
                              fontSize="small"
                              color={
                                msg.senderId === currentUser?.id
                                  ? "inherit"
                                  : "primary"
                              }
                            />
                            <a
                              href={msg.referenceLink || "#"}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color:
                                  msg.senderId === currentUser?.id
                                    ? "white"
                                    : "#1976d2",
                                textDecoration: "none",
                                fontSize: "14px",
                                wordBreak: "break-all",
                              }}
                            >
                              {shortenUrl(msg.referenceLink)}
                            </a>
                          </Box>
                        )}
                      </Box>
                    )}
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
                          msg.senderId === currentUser?.id
                            ? "white"
                            : "text.secondary"
                        }
                      >
                        {new Date(msg.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <TextField
            fullWidth
            size="small"
            multiline
            placeholder="Nhập tin nhắn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleSend}
                    disabled={!message.trim()}
                  >
                    <Send color={message.trim() ? "primary" : "disabled"} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
    </Slide>
  );
};

export default GroupChatBox;
