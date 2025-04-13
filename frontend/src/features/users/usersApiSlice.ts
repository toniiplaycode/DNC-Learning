import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { User } from "../../types/user.types";

export interface UsersState {
  users: User[];
  instructorStudents: User[];
  currentUser: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  instructorStudents: [],
  currentUser: null,
  status: "idle",
  error: null,
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

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async (
    { userId, userData }: { userId: number; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
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

        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetUsersState, clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
