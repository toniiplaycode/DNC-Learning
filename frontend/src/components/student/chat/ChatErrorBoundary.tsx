import React, { useEffect } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { fetchMessagesByUser } from "../../../features/messages/messagesSlice";
import { fetchUsers } from "../../../features/users/usersApiSlice";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  userId: string | null;
  isReloading: boolean;
}

class ChatErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    userId: null,
    isReloading: false,
  };

  static getDerivedStateFromError(_: Error): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State
  ): Partial<State> | null {
    const currentUser = (window as any).__CURRENT_USER__;

    if (currentUser?.id !== state.userId) {
      return {
        hasError: false,
        userId: currentUser?.id || null,
        isReloading: true,
      };
    }
    return null;
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const currentUser = (window as any).__CURRENT_USER__;
    const dispatch = (window as any).__DISPATCH__;

    // Only reload data when user changes and we're in loading state
    if (
      this.state.isReloading &&
      currentUser?.id &&
      prevState.userId !== currentUser.id
    ) {
      try {
        await Promise.all([
          dispatch(fetchUsers()),
          dispatch(fetchMessagesByUser(currentUser.id)),
        ]);

        // Update state after successful data load
        this.setState({
          isReloading: false,
          hasError: false,
        });
      } catch (error) {
        console.error("Failed to load chat data:", error);
        this.setState({
          isReloading: false,
          hasError: true,
        });
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat error:", error);
    console.error("Error info:", errorInfo);
  }

  handleRetry = async () => {
    const currentUser = (window as any).__CURRENT_USER__;
    const dispatch = (window as any).__DISPATCH__;

    this.setState({ isReloading: true });

    try {
      await Promise.all([
        dispatch(fetchUsers()),
        currentUser?.id && dispatch(fetchMessagesByUser(currentUser.id)),
      ]);

      this.setState({
        hasError: false,
        isReloading: false,
      });
    } catch (error) {
      console.error("Retry failed:", error);
      this.setState({
        hasError: true,
        isReloading: false,
      });
    }
  };

  render() {
    if (this.state.isReloading) {
      return (
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu chat...
          </Typography>
        </Box>
      );
    }

    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography color="error" gutterBottom>
            Đã xảy ra lỗi khi tải tin nhắn
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleRetry}
            disabled={this.state.isReloading}
          >
            Tải lại
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to get Redux state and dispatch
const ChatErrorBoundaryWithUser = (props: Props) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      (window as any).__RELOAD_COMPLETE__ = false;
    };
  }, []);

  // Inject dependencies into window for class component access
  (window as any).__CURRENT_USER__ = currentUser;
  (window as any).__DISPATCH__ = dispatch;

  return <ChatErrorBoundary {...props} />;
};

export default ChatErrorBoundaryWithUser;
