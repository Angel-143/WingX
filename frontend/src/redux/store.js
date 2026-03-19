import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./user_slice.js";
import ownerReducer from "./owner_slice.js";

// ✅ user slice ke liye persist — CartItem save hoga, userData nahi
const userPersistConfig = {
  key: "wingx-user",
  storage,
  whitelist: ["CartItem"], // sirf CartItem localStorage mein
  
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  owner: ownerReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);