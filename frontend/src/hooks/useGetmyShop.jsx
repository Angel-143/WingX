import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/owner_slice";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

const useGetMyShop = () => {

const dispatch = useDispatch();

useEffect(() => {

const fetchShop = async () => {

try {

const res = await axios.get(
`${serverUrl}/api/shop/my-shop`,
{ withCredentials: true }
);

dispatch(setMyShopData(res.data.shop));

} catch (error) {

console.log("Shop fetch error:", error.response?.data || error.message);

}

};

fetchShop();

}, []);

};

export default useGetMyShop;