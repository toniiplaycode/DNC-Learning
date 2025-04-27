import { RootState } from "../../store/store";
import {
  Forum,
  ForumReply,
  ForumStatus,
  UserLikeForum,
} from "./forumsApiSlice";

// Lấy tất cả forums
export const selectAllForums = (state: RootState): Forum[] =>
  state.forums.forums;

// Lấy forum hiện tại
export const selectCurrentForum = (state: RootState): Forum | null =>
  state.forums.currentForum;

// Lấy replies của một forum cụ thể
export const selectForumReplies = (
  state: RootState,
  forumId: number
): ForumReply[] => state.forums.replies[forumId] || [];

// Lấy trạng thái loading
export const selectForumsStatus = (
  state: RootState
): "idle" | "loading" | "succeeded" | "failed" => state.forums.status;

// Lấy thông báo lỗi
export const selectForumsError = (state: RootState): string | null =>
  state.forums.error;

// Lấy forums theo status
export const selectForumsByStatus = (
  state: RootState,
  status: ForumStatus
): Forum[] => state.forums.forums.filter((forum) => forum.status === status);

// Lấy forums theo courseId
export const selectForumsByCourse = (
  state: RootState,
  courseId: number
): Forum[] =>
  state.forums.forums.filter((forum) => forum.courseId === courseId);

// Lấy forum theo ID
export const selectForumById = (
  state: RootState,
  forumId: number
): Forum | undefined =>
  state.forums.forums.find((forum) => forum.id === forumId);

// Lấy tất cả forums đã được giải quyết
export const selectSolvedForums = (state: RootState): Forum[] =>
  state.forums.forums.filter((forum) => forum.isSolved);

// Lấy tất cả forums đã được like bởi user
export const selectLikedForums = (state: RootState): Forum[] =>
  state.forums.forums.filter((forum) => forum.isLiked);

// Lấy tất cả user đã like forum
export const selectUserLikeForum = (state: RootState): UserLikeForum[] =>
  state.forums.userLikeForum;

export const selectUserForums = (state: RootState): Forum[] =>
  state.forums.userForums;
