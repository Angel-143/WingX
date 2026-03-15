import { configureStore } from '@reduxjs/toolkit';
import userSlice from './user_slice.js';
import ownerSlice from './owner_slice.js';

export const store = configureStore({
    reducer: {
        // Add your reducers here
        user: userSlice,
        owner: ownerSlice

    },
});