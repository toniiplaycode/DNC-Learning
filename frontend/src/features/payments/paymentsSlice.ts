import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

export enum PaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  E_WALLET = "e_wallet",
  ZALOPAY = "zalopay",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// Payment interfaces
export interface Payment {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponse {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: number;
    title: string;
  };
}

// ZaloPay response interface
export interface ZaloPayResponse {
  return_code: number;
  return_message: string;
  sub_return_code?: number;
  sub_return_message?: string;
  order_url: string;
  app_trans_id: string;
  zp_trans_token?: string;
  order_token?: string;
}

export interface CreatePaymentDTO {
  userId: number;
  courseId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
}

// Thunks
export const fetchUserPayments = createAsyncThunk(
  "payments/fetchUserPayments",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy lịch sử thanh toán"
      );
    }
  }
);

export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (paymentData: CreatePaymentDTO, { rejectWithValue }) => {
    try {
      const response = await api.post("/payments", paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo thanh toán"
      );
    }
  }
);

export const createZaloPayOrder = createAsyncThunk(
  "payments/createZaloPayOrder",
  async (
    data: { courseId: number; amount: number; description: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/payments/zalopay", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo đơn hàng ZaloPay"
      );
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  "payments/getPaymentStatus",
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/status/${transactionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể kiểm tra trạng thái thanh toán"
      );
    }
  }
);

interface PaymentsState {
  payments: PaymentResponse[];
  userPayments: PaymentResponse[];
  currentPayment: PaymentResponse | null;
  zaloPayOrder: ZaloPayResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  userPayments: [],
  currentPayment: null,
  zaloPayOrder: null,
  status: "idle",
  error: null,
};

// Slice
const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.currentPayment = null;
      state.zaloPayOrder = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user payments
      .addCase(fetchUserPayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchUserPayments.fulfilled,
        (state, action: PayloadAction<PaymentResponse[]>) => {
          state.status = "succeeded";
          state.userPayments = action.payload;
        }
      )
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Không thể lấy lịch sử thanh toán";
      })

      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createPayment.fulfilled,
        (state, action: PayloadAction<PaymentResponse>) => {
          state.status = "succeeded";
          state.currentPayment = action.payload;
          state.userPayments.push(action.payload);
        }
      )
      .addCase(createPayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Không thể tạo thanh toán";
      })

      // Create ZaloPay order
      .addCase(createZaloPayOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createZaloPayOrder.fulfilled,
        (state, action: PayloadAction<ZaloPayResponse>) => {
          state.status = "succeeded";
          state.zaloPayOrder = action.payload;
        }
      )
      .addCase(createZaloPayOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Không thể tạo đơn hàng ZaloPay";
      })

      // Get payment status
      .addCase(getPaymentStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getPaymentStatus.fulfilled,
        (state, action: PayloadAction<PaymentResponse>) => {
          state.status = "succeeded";
          state.currentPayment = action.payload;

          // Update payment in userPayments list if it exists
          const index = state.userPayments.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.userPayments[index] = action.payload;
          } else {
            state.userPayments.push(action.payload);
          }
        }
      )
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          "Không thể kiểm tra trạng thái thanh toán";
      });
  },
});

export const { resetPaymentState } = paymentsSlice.actions;

export default paymentsSlice.reducer;
