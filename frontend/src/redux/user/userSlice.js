import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  errorDispatch: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },

    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.errorDispatch = null;
    },

    signInFailure: (state, action) => {
      state.errorDispatch = action.payload;
      state.loading = false;
    },

    // merges changed fields (e.g. a new username) into the logged-in user
    updateUserSuccess: (state, action) => {
      if (!state.currentUser) return;
      state.currentUser.rest = { ...state.currentUser.rest, ...action.payload };
    },

    signoutStart: (state) => {
      state.loading = true;
    },

    signoutSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.errorDispatch = null;
    },

    signoutFailure: (state, action) => {
      state.errorDispatch = action.payload;
      state.loading = false;
    },
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  signoutFailure,
  signoutStart,
  signoutSuccess,
  updateUserSuccess,
} = userSlice.actions;

export default userSlice.reducer;
