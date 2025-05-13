import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { User, UserStatus } from "../../types/user.types";
import { AcademicClassCourse } from "../../types/academic-class-course.types";
import { UpdateInstructorProfileData } from "../../types/user-instructor.types";
import {
  UpdateStudentData,
  UpdateUserData as UpdateStudentUserData,
} from "../../types/user-student.types";

export interface UsersState {
  users: User[];
  instructorStudents: User[];
  currentUser: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  studentAcademicCourses: AcademicClassCourse[];
  instructorAcademicStudents: User[];
  academicClassStudents: User[];
  regularStudents: User[];
  academicStudents: User[];
  instructorUsers: User[];
}

const initialState: UsersState = {
  users: [],
  instructorStudents: [],
  currentUser: null,
  status: "idle",
  error: null,
  studentAcademicCourses: [],
  instructorAcademicStudents: [],
  academicClassStudents: [],
  regularStudents: [],
  academicStudents: [],
  instructorUsers: [],
};

// Create many students academic for a academic class
export const createManyStudentsAcademic = createAsyncThunk(
  "users/createManyStudentsAcademic",
  async (studentsData: any[], { rejectWithValue }) => {
    try {
      const response = await api.post("/users/student-academic", studentsData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create students"
      );
    }
  }
);

// Update student academic
export const updateStudentAcademic = createAsyncThunk(
  "users/updateStudentAcademic",
  async (updateData: any, { rejectWithValue }) => {
    try {
      const response = await api.patch("/users/student-academic", updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student"
      );
    }
  }
);

// Delete student academic
export const deleteStudentAcademic = createAsyncThunk(
  "users/deleteStudentAcademic",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/student-academic/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete student academic"
      );
    }
  }
);

// Fetch all users
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Fetch students by instructor ID
export const fetchStudentsByInstructor = createAsyncThunk(
  "users/fetchStudentsByInstructor",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/users/instructor/${instructorId}/students`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch instructor's students"
      );
    }
  }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// Add this interface for update user data
interface UpdateUserProfileData {
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  status?: UserStatus;
  password?: string;
  currentPassword?: string;
}

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async (
    { userId, userData }: { userId: number; userData: UpdateUserProfileData },
    { rejectWithValue }
  ) => {
    try {
      // Validate password update
      if (userData.password && !userData.currentPassword) {
        return rejectWithValue(
          "Current password is required to update password"
        );
      }

      // If updating password, validate new password
      if (userData.password) {
        if (userData.password.length < 6) {
          return rejectWithValue("Password must be at least 6 characters long");
        }
      }

      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.message) {
        if (
          error.response.data.message.includes("Current password is incorrect")
        ) {
          return rejectWithValue("Mật khẩu hiện tại không đúng");
        }
        if (error.response.data.message.includes("Email already exists")) {
          return rejectWithValue("Email đã tồn tại");
        }
        if (error.response.data.message.includes("Username already exists")) {
          return rejectWithValue("Tên người dùng đã tồn tại");
        }
        if (
          error.response.data.message.includes("Phone number already exists")
        ) {
          return rejectWithValue("Số điện thoại đã tồn tại");
        }
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Failed to update user");
    }
  }
);

// Fetch student academic courses
export const fetchStudentAcademicCourses = createAsyncThunk(
  "users/fetchStudentAcademicCourses",
  async (studentAcademicId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/users/students/${studentAcademicId}/academic-courses`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch student academic courses"
      );
    }
  }
);

// Fetch academic students by instructor ID
export const fetchAcademicStudentsByInstructor = createAsyncThunk(
  "users/fetchAcademicStudentsByInstructor",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/users/instructor/${instructorId}/studentsAcademic`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch instructor's academic students"
      );
    }
  }
);

// Add new thunk for fetching students by academic class
export const fetchStudentsByAcademicClass = createAsyncThunk(
  "users/fetchStudentsByAcademicClass",
  async (classId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/users/academic-class/${classId}/students`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải danh sách sinh viên của lớp"
      );
    }
  }
);

// Add to existing thunks
export const updateInstructorProfile = createAsyncThunk(
  "users/updateInstructorProfile",
  async (
    { userId, data }: { userId: number; data: UpdateInstructorProfileData },
    { rejectWithValue }
  ) => {
    try {
      // Send single request to combined endpoint
      const response = await api.patch(
        `/users/${userId}/instructor-profile`,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "users/changePassword",
  async (
    {
      userId,
      data,
    }: {
      userId: number;
      data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/users/${userId}/change-password`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// Add to existing thunks
export const updateStudentProfile = createAsyncThunk(
  "users/updateStudentProfile",
  async (
    {
      userId,
      data,
    }: {
      userId: number;
      data: {
        user: UpdateStudentUserData;
        student: UpdateStudentData;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/users/${userId}/student-profile`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Fetch all regular students
export const fetchRegularStudents = createAsyncThunk(
  "users/fetchRegularStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/students");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch regular students"
      );
    }
  }
);

// Fetch all academic students
export const fetchAcademicStudents = createAsyncThunk(
  "users/fetchAcademicStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/students-academic");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch academic students"
      );
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete user";
      if (errorMessage.includes("enrolled courses")) {
        return rejectWithValue("Không thể xóa sinh viên đã đăng ký khóa học");
      }
      if (errorMessage.includes("grades")) {
        return rejectWithValue("Không thể xóa sinh viên đã có điểm");
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Add this new thunk
export const fetchUsersByInstructorId = createAsyncThunk(
  "users/fetchByInstructorId",
  async (instructorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/instructor/${instructorId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch users by instructor ID"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUsersState: (state) => {
      state.users = [];
      state.instructorStudents = [];
      state.currentUser = null;
      state.status = "idle";
      state.error = null;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch students by instructor
      .addCase(fetchStudentsByInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentsByInstructor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorStudents = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentsByInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;

        // Update in users array if present
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }

        // Update in instructorStudents if present
        const studentIndex = state.instructorStudents.findIndex(
          (student) => student.id === action.payload.id
        );
        if (studentIndex !== -1) {
          state.instructorStudents[studentIndex] = action.payload;
        }

        // Update in regularStudents if present
        const regularStudentIndex = state.regularStudents.findIndex(
          (student) => student.id === action.payload.id
        );
        if (regularStudentIndex !== -1) {
          state.regularStudents[regularStudentIndex] = action.payload;
        }

        // Update in academicStudents if present
        const academicStudentIndex = state.academicStudents.findIndex(
          (student) => student.id === action.payload.id
        );
        if (academicStudentIndex !== -1) {
          state.academicStudents[academicStudentIndex] = action.payload;
        }

        // Update in academicClassStudents if present
        const academicClassStudentIndex = state.academicClassStudents.findIndex(
          (student) => student.id === action.payload.id
        );
        if (academicClassStudentIndex !== -1) {
          state.academicClassStudents[academicClassStudentIndex] =
            action.payload;
        }

        // Update in instructorAcademicStudents if present
        const instructorAcademicStudentIndex =
          state.instructorAcademicStudents.findIndex(
            (student) => student.id === action.payload.id
          );
        if (instructorAcademicStudentIndex !== -1) {
          state.instructorAcademicStudents[instructorAcademicStudentIndex] =
            action.payload;
        }

        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch student academic courses
      .addCase(fetchStudentAcademicCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentAcademicCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.studentAcademicCourses = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentAcademicCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch academic students by instructor
      .addCase(fetchAcademicStudentsByInstructor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAcademicStudentsByInstructor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorAcademicStudents = action.payload;
        state.error = null;
      })
      .addCase(fetchAcademicStudentsByInstructor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch students by academic class
      .addCase(fetchStudentsByAcademicClass.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentsByAcademicClass.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.academicClassStudents = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentsByAcademicClass.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update instructor profile
      .addCase(updateInstructorProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateInstructorProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload.user,
            userInstructor: {
              ...state.currentUser.userInstructor,
              ...action.payload.instructor,
            },
          };
        }
        state.error = null;
      })
      .addCase(updateInstructorProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update student profile
      .addCase(updateStudentProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload.user,
            userStudent: {
              ...state.currentUser.userStudent,
              ...action.payload.student,
            },
          };
        }
        state.error = null;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch regular students
      .addCase(fetchRegularStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRegularStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.regularStudents = action.payload;
        state.error = null;
      })
      .addCase(fetchRegularStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch academic students
      .addCase(fetchAcademicStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAcademicStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.academicStudents = action.payload;
        state.error = null;
      })
      .addCase(fetchAcademicStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove from regular students
        state.regularStudents = state.regularStudents.filter(
          (student) => student.id !== action.payload
        );
        // Remove from academic students
        state.academicStudents = state.academicStudents.filter(
          (student) => student.id !== action.payload
        );
        // Remove from instructor students
        state.instructorStudents = state.instructorStudents.filter(
          (student) => student.id !== action.payload
        );
        // Remove from academic class students
        state.academicClassStudents = state.academicClassStudents.filter(
          (student) => student.id !== action.payload
        );
        // Remove from instructor academic students
        state.instructorAcademicStudents =
          state.instructorAcademicStudents.filter(
            (student) => student.id !== action.payload
          );
        // Remove from all users
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Add this new case
      .addCase(fetchUsersByInstructorId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsersByInstructorId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructorUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchUsersByInstructorId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetUsersState, clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
