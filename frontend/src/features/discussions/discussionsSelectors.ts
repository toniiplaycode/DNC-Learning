import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { DiscussionStatus } from "../../types/discussion.types";

// Base selectors
export const selectDiscussionsState = (state: RootState) => state.discussions;
export const selectAllDiscussions = (state: RootState) =>
  state.discussions.discussions;
export const selectLessonDiscussions = (state: RootState) =>
  state.discussions.lessonDiscussions;
export const selectCurrentDiscussion = (state: RootState) =>
  state.discussions.currentDiscussion;
export const selectDiscussionsStatus = (state: RootState) =>
  state.discussions.status;
export const selectDiscussionsError = (state: RootState) =>
  state.discussions.error;

// Derived selectors
export const selectActiveDiscussions = createSelector(
  [selectAllDiscussions],
  (discussions) =>
    discussions.filter((d) => d.status === DiscussionStatus.ACTIVE)
);

export const selectHiddenDiscussions = createSelector(
  [selectAllDiscussions],
  (discussions) =>
    discussions.filter((d) => d.status === DiscussionStatus.HIDDEN)
);

export const selectLockedDiscussions = createSelector(
  [selectAllDiscussions],
  (discussions) =>
    discussions.filter((d) => d.status === DiscussionStatus.LOCKED)
);

// Lấy thảo luận gốc (không phải phản hồi)
export const selectRootDiscussions = createSelector(
  [selectAllDiscussions],
  (discussions) => discussions.filter((d) => d.parentId === null)
);

// Lấy thảo luận gốc của một bài học cụ thể
export const selectLessonRootDiscussions = createSelector(
  [selectLessonDiscussions],
  (discussions) => discussions.filter((d) => d.parentId === null)
);

// Lấy thảo luận theo ID của người dùng
export const selectUserDiscussions = (userId: number) =>
  createSelector([selectAllDiscussions], (discussions) =>
    discussions.filter((d) => d.userId === userId)
  );

// Lấy số lượng phản hồi của thảo luận
export const selectDiscussionReplyCount = (discussionId: number) =>
  createSelector([selectAllDiscussions], (discussions) => {
    const discussion = discussions.find((d) => d.id === discussionId);
    return discussion?.replies?.length || 0;
  });

// Lấy số lượng thảo luận của một bài học
export const selectLessonDiscussionCount = (lessonId: number) =>
  createSelector(
    [selectAllDiscussions],
    (discussions) =>
      discussions.filter((d) => d.lessonId === lessonId && d.parentId === null)
        .length
  );
