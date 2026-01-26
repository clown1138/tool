import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    count: 0,
    isDisabled: false,
  },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    clear: (state) => {
      state.count = 0;
    },
    toggleDisabled: (state) => {
      state.isDisabled = !state.isDisabled;
    },
  },
});

export const { increment, clear, toggleDisabled } = counterSlice.actions;
export default counterSlice.reducer;