import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Certificate,
  CertificateStatus,
  CreateCertificateData,
  UpdateCertificateData,
  VerifyCertificateData,
  VerifyCertificateResult,
  CreateMultipleCertificatesData,
} from "../../types/certificate.types";
import { api } from "../../services/api";

// Async actions
export const fetchCertificates = createAsyncThunk(
  "certificates/fetchAll",
  async (status?: CertificateStatus) => {
    try {
      const response = await api.get("/certificates", {
        params: status ? { status } : {},
      });
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "Failed to fetch certificates"
      );
    }
  }
);

export const fetchUserCertificates = createAsyncThunk(
  "certificates/fetchUserCertificates",
  async ({
    userId,
    status,
  }: {
    userId: number;
    status?: CertificateStatus;
  }) => {
    try {
      const response = await api.get(`/certificates/user/${userId}`, {
        params: status ? { status } : {},
      });
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message ||
        "iled to fetch user certificates"
      );
    }
  }
);

export const fetchCourseCertificates = createAsyncThunk(
  "certificates/fetchCourseCertificates",
  async ({
    courseId,
    status,
  }: {
    courseId: number;
    status?: CertificateStatus;
  }) => {
    try {
      const response = await api.get(`/certificates/course/${courseId}`, {
        params: status ? { status } : {},
      });
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message ||
        "iled to fetch course certificates"
      );
    }
  }
);

export const fetchCertificate = createAsyncThunk(
  "certificates/fetchCertificate",
  async (id: number) => {
    try {
      const response = await api.get(`/certificates/${id}`);
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "Failed to fetch certificate"
      );
    }
  }
);

export const verifyCertificate = createAsyncThunk(
  "certificates/verify",
  async (data: VerifyCertificateData) => {
    try {
      const response = await api.get("/certificates/verify", {
        params: data,
      });
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "Failed to verify certificate"
      );
    }
  }
);

export const createCertificate = createAsyncThunk(
  "certificates/create",
  async (data: CreateCertificateData) => {
    try {
      const response = await api.post("/certificates", data);
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "Failed to create certificate"
      );
    }
  }
);

export const generateCertificate = createAsyncThunk(
  "certificates/generate",
  async (enrollmentId: number) => {
    try {
      const response = await api.post(`/certificates/generate/${enrollmentId}`);
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "iled to generate certificate"
      );
    }
  }
);

export const updateCertificate = createAsyncThunk(
  "certificates/update",
  async ({ id, data }: { id: number; data: UpdateCertificateData }) => {
    try {
      const response = await api.patch(`/certificates/${id}`, data);
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "Failed to update certificate"
      );
    }
  }
);

export const deleteCertificate = createAsyncThunk(
  "certificates/delete",
  async (id: number) => {
    try {
      await api.delete(`/certificates/${id}`);
      return id;
    } catch (error) {
      return (
        (error as any).response?.data?.message || "Failed to delete certificate"
      );
    }
  }
);

export const createMultipleCertificates = createAsyncThunk(
  "certificates/createMultiple",
  async (data: CreateMultipleCertificatesData) => {
    try {
      const response = await api.post("/certificates/multiple", data);
      return response.data;
    } catch (error) {
      return (
        (error as any).response?.data?.message ||
        "Failed to create multiple certificates"
      );
    }
  }
);

// Slice state interface
interface CertificatesState {
  certificates: Certificate[];
  userCertificates: Certificate[];
  courseCertificates: Certificate[];
  currentCertificate: Certificate | null;
  verificationResult: VerifyCertificateResult | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: CertificatesState = {
  certificates: [],
  userCertificates: [],
  courseCertificates: [],
  currentCertificate: null,
  verificationResult: null,
  status: "idle",
  error: null,
};

// Create the slice
const certificatesSlice = createSlice({
  name: "certificates",
  initialState,
  reducers: {
    resetCertificatesState: (state) => {
      state.status = "idle";
      state.error = null;
    },
    clearVerificationResult: (state) => {
      state.verificationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all certificates
      .addCase(fetchCertificates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.certificates = action.payload;
        state.error = null;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch user certificates
      .addCase(fetchUserCertificates.pending, (state) => {
        state.status = "loading";
        console.log(1);
      })
      .addCase(fetchUserCertificates.fulfilled, (state, action) => {
        console.log(2);
        state.status = "succeeded";
        state.userCertificates = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCertificates.rejected, (state, action) => {
        console.log(3);
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch course certificates
      .addCase(fetchCourseCertificates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseCertificates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseCertificates = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseCertificates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch single certificate
      .addCase(fetchCertificate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCertificate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCertificate = action.payload;
        state.error = null;
      })
      .addCase(fetchCertificate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Verify certificate
      .addCase(verifyCertificate.pending, (state) => {
        state.status = "loading";
        state.verificationResult = null;
      })
      .addCase(verifyCertificate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.verificationResult = action.payload;
        state.error = null;
      })
      .addCase(verifyCertificate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create certificate
      .addCase(createCertificate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCertificate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.certificates.push(action.payload);
        state.error = null;
      })
      .addCase(createCertificate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Generate certificate
      .addCase(generateCertificate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateCertificate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userCertificates.push(action.payload);
        state.error = null;
      })
      .addCase(generateCertificate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update certificate
      .addCase(updateCertificate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCertificate.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Update in all certificate arrays
        const updatedCertificate = action.payload;

        state.certificates = state.certificates.map((certificate) =>
          certificate.id === updatedCertificate.id
            ? updatedCertificate
            : certificate
        );

        state.userCertificates = state.userCertificates.map((certificate) =>
          certificate.id === updatedCertificate.id
            ? updatedCertificate
            : certificate
        );

        state.courseCertificates = state.courseCertificates.map((certificate) =>
          certificate.id === updatedCertificate.id
            ? updatedCertificate
            : certificate
        );

        if (state.currentCertificate?.id === updatedCertificate.id) {
          state.currentCertificate = updatedCertificate;
        }

        state.error = null;
      })
      .addCase(updateCertificate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete certificate
      .addCase(deleteCertificate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;

        state.certificates = state.certificates.filter(
          (certificate) => certificate.id !== id
        );
        state.userCertificates = state.userCertificates.filter(
          (certificate) => certificate.id !== id
        );
        state.courseCertificates = state.courseCertificates.filter(
          (certificate) => certificate.id !== id
        );

        if (state.currentCertificate?.id === id) {
          state.currentCertificate = null;
        }

        state.error = null;
      })
      .addCase(deleteCertificate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create multiple certificates
      .addCase(createMultipleCertificates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createMultipleCertificates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.certificates.push(...action.payload);
        state.error = null;
      })
      .addCase(createMultipleCertificates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetCertificatesState, clearVerificationResult } =
  certificatesSlice.actions;

export default certificatesSlice.reducer;
