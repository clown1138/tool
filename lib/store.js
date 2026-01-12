// import { configureStore } from '@reduxjs/toolkit';
// import counterReducer from './features/counterSlice';

// export const makeStore = () => {
//   return configureStore({
//     reducer: {
//       counter: counterReducer,
//     },
//   });
// };
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer, 
    },
  });
};