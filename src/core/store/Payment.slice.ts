import { Payment, PaymentService } from "laerte_fernandes-sdk";
import {
  createAsyncThunk,
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from ".";
import { Key } from "rc-table/lib/interface";

interface PaymentState {
  paginated: Payment.Paginated;
  fetching: boolean;
  query: Payment.Query;
  selected: Key[];
}

const initialState: PaymentState = {
  fetching: false,
  selected: [],
  query: {
    sort: ["scheduledTo", "desc"],
    page: 0,
    size: 7,
  },
  paginated: {
    page: 0,
    size: 7,
    totalPages: 1,
    totalElements: 0,
    content: [],
  },
};

export const getAllPayments = createAsyncThunk(
  "payment/getAllPayments",
  async (_, { getState, dispatch }) => {
    // pega o reducer do Rootstate geral na memória e pega o atributo query dele
    const {
      payment: { query },
    } = getState() as RootState;
    const paymentPaginated = await PaymentService.getAllPayments(query);
    await dispatch(storeList(paymentPaginated));
  }
);

export const approvePaymentsInBatch = createAsyncThunk(
  "payment/approvePaymentsInBatch",
  async (paymentIds: number[], { dispatch }) => {
    await PaymentService.approvePaymentsBatch(paymentIds);
    await dispatch(getAllPayments());
    await dispatch(storeSelectedKeys([]));
  }
);

export const deleteExistingPayment = createAsyncThunk(
  "payment/deleteExistingPayment",
  async (paymentId: number, { dispatch }) => {
    await PaymentService.removeExistingPayment(paymentId);
    await dispatch(getAllPayments());
    await dispatch(storeSelectedKeys([]));
  }
);

export const setQuery = createAsyncThunk(
  "payment/setQuery",
  async (query: Payment.Query, { dispatch }) => {
    await dispatch(storeQuery(query));
    await dispatch(getAllPayments());
  }
);

const PaymentSlice = createSlice({
  initialState,
  name: "payment",
  reducers: {
    storeList(state, action: PayloadAction<Payment.Paginated>) {
      state.paginated = action.payload;
    },
    // altera a query para a query atual concatenada com a query recebida como parametro na action
    storeQuery(state, action: PayloadAction<Payment.Query>) {
      state.query = {
        ...state.query,
        ...action.payload,
      };
    },
    storeSelectedKeys(state, action: PayloadAction<Key[]>) {
      state.selected = action.payload;
    },
  },
  extraReducers(builder) {
    const success = isFulfilled(
      getAllPayments,
      approvePaymentsInBatch,
      deleteExistingPayment
    );
    const error = isRejected(
      getAllPayments,
      approvePaymentsInBatch,
      deleteExistingPayment
    );
    const loading = isPending(
      getAllPayments,
      approvePaymentsInBatch,
      deleteExistingPayment
    );

    builder
      .addMatcher(success, (state) => {
        state.fetching = false;
      })
      .addMatcher(error, (state, action) => {
        state.fetching = false;
      })
      .addMatcher(loading, (state) => {
        state.fetching = true;
      });
  },
});

export const { storeQuery, storeList, storeSelectedKeys } =
  PaymentSlice.actions;

const PaymentReducer = PaymentSlice.reducer;

export default PaymentReducer;
