import { RootState } from "../../app/store";

export const selectAllPayments = (state: RootState) => state.payments.payments;
export const selectUserPayments = (state: RootState) =>
  state.payments.userPayments;
export const selectCurrentPayment = (state: RootState) =>
  state.payments.currentPayment;
export const selectZaloPayOrder = (state: RootState) =>
  state.payments.zaloPayOrder;
export const selectPaymentsStatus = (state: RootState) => state.payments.status;
export const selectPaymentsError = (state: RootState) => state.payments.error;
