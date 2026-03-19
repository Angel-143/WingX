import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { ShopByCity } from "../redux/user_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function useGetShopByCity() {
    const dispatch = useDispatch();
    const {  city:currentCity } = useSelector((state) => state.user);

    useEffect(() => {
        if (!currentCity) return;
        const fetchShop = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/shop/get-shop-by-city/${currentCity}`,
                    { withCredentials: true }
                );
                dispatch(ShopByCity(result?.data?.shops));
                console.log(result.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchShop();
    }, [currentCity]);
}

export default useGetShopByCity;