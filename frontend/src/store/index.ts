import { configureStore } from '@reduxjs/toolkit';
import facultyReducer from '../modules/faculty/slices/facultySlice';

export const store = configureStore({
  reducer: {
    faculty: facultyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
