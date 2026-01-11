import { backendUrl } from "@/config/backendUrl";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";
import axios from "axios";

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isResumeUploaded: boolean;
}

interface AuthResponse {
  accessToken: string;
  user: User;
  isResumeUploaded: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  accessToken: null,
  loading: true,
  isResumeUploaded: false,
};

export const silentRefresh = createAsyncThunk(
  "auth/silentRefresh",
  async (_, { dispatch }) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      dispatch(logout());
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.loading = false;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.accessToken = null;
      state.loading = false;
      state.isLoggedIn = false;
      state.user = null;
      state.isResumeUploaded = false;
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(silentRefresh.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      silentRefresh.fulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.isLoggedIn = true;
        state.accessToken = action.payload.accessToken;
        state.loading = false;
        state.user = action.payload.user;
        state.isResumeUploaded = action.payload.isResumeUploaded;
        // Save token to localStorage
        localStorage.setItem("accessToken", action.payload.accessToken);
      }
    );
    builder.addCase(silentRefresh.rejected, (state) => {
      state.loading = false;
      state.isLoggedIn = false;
    });
  },
});

export const { setAccessToken, logout } = authSlice.actions;

export default authSlice.reducer;
