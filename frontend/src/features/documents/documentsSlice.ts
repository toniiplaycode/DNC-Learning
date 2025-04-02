import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Document,
  DocumentState,
  CreateDocumentData,
  UpdateDocumentData,
} from "../../types/document.types";
import { api } from "../../services/api";

// Async thunks
export const fetchAllDocuments = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/documents");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải tài liệu"
      );
    }
  }
);

export const fetchDocumentsByCourse = createAsyncThunk(
  "documents/fetchByCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/course/${courseId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể tải tài liệu cho khóa học này"
      );
    }
  }
);

export const fetchDocumentsBySection = createAsyncThunk(
  "documents/fetchBySection",
  async (sectionId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/section/${sectionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải tài liệu cho chương này"
      );
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải chi tiết tài liệu"
      );
    }
  }
);

export const createDocument = createAsyncThunk(
  "documents/create",
  async (documentData: CreateDocumentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/documents", documentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo tài liệu"
      );
    }
  }
);

export const updateDocument = createAsyncThunk(
  "documents/update",
  async (
    { id, updateData }: { id: number; updateData: UpdateDocumentData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/documents/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể cập nhật tài liệu"
      );
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${id}`);
      return id; // Trả về ID để xóa khỏi state
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể xóa tài liệu"
      );
    }
  }
);

// Initial state
const initialState: DocumentState = {
  documents: [],
  courseDocuments: [],
  sectionDocuments: [],
  currentDocument: null,
  status: "idle",
  error: null,
};

// Slice
const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    resetDocumentsState: (state) => {
      state.documents = [];
      state.courseDocuments = [];
      state.sectionDocuments = [];
      state.currentDocument = null;
      state.status = "idle";
      state.error = null;
    },
    clearDocumentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all documents
      .addCase(fetchAllDocuments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(fetchAllDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch documents by course
      .addCase(fetchDocumentsByCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDocumentsByCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseDocuments = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentsByCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch documents by section
      .addCase(fetchDocumentsBySection.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDocumentsBySection.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sectionDocuments = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentsBySection.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch document by id
      .addCase(fetchDocumentById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create document
      .addCase(createDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documents.push(action.payload);

        // Nếu document thuộc section đang xem, thêm vào sectionDocuments
        if (
          state.sectionDocuments.length > 0 &&
          action.payload.courseSectionId ===
            state.sectionDocuments[0]?.courseSectionId
        ) {
          state.sectionDocuments.push(action.payload);
        }

        state.error = null;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedDocument = action.payload;

        // Cập nhật trong tất cả các mảng
        state.documents = state.documents.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document
        );

        state.sectionDocuments = state.sectionDocuments.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document
        );

        state.courseDocuments = state.courseDocuments.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document
        );

        if (state.currentDocument?.id === updatedDocument.id) {
          state.currentDocument = updatedDocument;
        }

        state.error = null;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        // Xóa document khỏi tất cả các mảng
        state.documents = state.documents.filter(
          (document) => document.id !== id
        );
        state.sectionDocuments = state.sectionDocuments.filter(
          (document) => document.id !== id
        );
        state.courseDocuments = state.courseDocuments.filter(
          (document) => document.id !== id
        );

        if (state.currentDocument?.id === id) {
          state.currentDocument = null;
        }

        state.error = null;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetDocumentsState, clearDocumentsError } =
  documentsSlice.actions;

export default documentsSlice.reducer;
