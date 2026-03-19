import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
        city: null,
        ShopByCity: null,
        ItemByCity: null,
        CartItem: [],
        orderPlacedAt: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        },
        currentCity: (state, action) => {
            state.city = action.payload;
        },
        currentState: (state, action) => {
            state.state = action.payload;
        },
        currentAddress: (state, action) => {
            state.address = action.payload;
        },
        ShopByCity: (state, action) => {
            state.ShopByCity = action.payload;
        },
        ItemByCity: (state, action) => {
            state.ItemByCity = action.payload;
        },

        addToCart: (state, action) => {
            const newItem = action.payload;
            // half/full alag cart entries — unique by id + plateType
            const existing = state.CartItem.find(
                i => i.id === newItem.id && i.plateType === newItem.plateType
            );
            if (existing) {
                existing.quantity += newItem.quantity;
            } else {
                state.CartItem.push(newItem);
            }
        },

        removeFromCart: (state, action) => {
            // payload: string id  OR  { id, plateType }
            const payload   = action.payload;
            const id        = typeof payload === "string" ? payload : payload.id;
            const plateType = typeof payload === "object"  ? payload.plateType : undefined;

            const existing = state.CartItem.find(
                i => i.id === id && (plateType === undefined || i.plateType === plateType)
            );
            if (existing) {
                if (existing.quantity > 1) {
                    existing.quantity -= 1;
                } else {
                    state.CartItem = state.CartItem.filter(
                        i => !(i.id === id && (plateType === undefined || i.plateType === plateType))
                    );
                }
            }
        },

        clearCart: (state) => {
            state.CartItem = [];
        },

        orderPlaced: (state) => {
            state.orderPlacedAt = Date.now();
        },
    }
});

export const {
    setUserData,
    clearUserData,
    currentCity,
    currentState,
    currentAddress,
    ShopByCity,
    ItemByCity,
    addToCart,
    removeFromCart,
    clearCart,
    orderPlaced,
} = userSlice.actions;

export default userSlice.reducer;