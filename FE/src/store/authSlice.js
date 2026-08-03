import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../api/authApi";

// Thunks
export const login = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data);
      localStorage.setItem("token", res.data.accessToken);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Đăng nhập thất bại");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Đăng ký thất bại");
    }
  },
);

export const socialLogin = createAsyncThunk(
  "auth/socialLogin",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.socialLogin(data);
      localStorage.setItem("token", res.data.accessToken);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Đăng nhập xã hội thất bại");
    }
  },
);

// Đọc user từ localStorage khi khởi động
const getInitialUser = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getInitialUser(),
    token: localStorage.getItem("token"),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.accessToken;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(socialLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.accessToken;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
