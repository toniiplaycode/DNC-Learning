import { RootState } from "../../app/store";

export const selectActiveClass = (state: RootState) =>
  state.activeClass.currentClass;
export const selectIsClassActive = (state: RootState) =>
  state.activeClass.isActive;
export const selectJoinTime = (state: RootState) => state.activeClass.joinTime;
export const selectElapsedTime = (state: RootState) =>
  state.activeClass.elapsedTime;
