import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isLoading: false,
    modalOpen: false,
    modalContent: null,
    toast: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalContent = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalContent = null;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const { setLoading, openModal, closeModal, showToast, hideToast } =
  uiSlice.actions;
export default uiSlice.reducer;
