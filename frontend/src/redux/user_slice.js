import { createSlice } from '@reduxjs/toolkit';


const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null, 
        city:null, // ✅ Fix: currentUser → userData
        ItemByCity: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;  // ✅ Fix: UserData → userData (lowercase u)
        },
        currentCity:(state, action) => {
            state.city = action.payload;
        },
        currentState:(state, action) => {
            state.state = action.payload;
        },
        currentAddress:(state, action) => {
            state.address = action.payload;
        },
         ShopByCity:(state, action) => {
            state.ShopByCity = action.payload;
        },
        ItemByCity:(state, action) => {
            state.ItemByCity = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        }
    }
});

export const { setUserData, clearUserData, currentCity, currentState, currentAddress,ShopByCity,ItemByCity } = userSlice.actions;
export default userSlice.reducer;