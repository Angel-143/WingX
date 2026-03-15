import { use, useEffect } from "react";

import axios from "axios";
import { useDispatch } from "react-redux";
import { currentCity, setUserData } from "../redux/user_slice.js";
import { useSelector } from "react-redux";
import { setMyShopData } from "../redux/owner_slice.js";


const serverUrl = "http://localhost:5000";

function useGetShop() {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await    axios.get(`${serverUrl}/api/shop/all`, {
                    withCredentials:true,
                })
                dispatch(setMyShopData(result?.data?.user))
            } catch (error) {
                console.log(error)
            }
        }
        fetchShop()
    }, [])
}
export default useGetShop;