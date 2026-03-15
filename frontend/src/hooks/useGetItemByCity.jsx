import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { ItemByCity } from "../redux/user_slice.js";

const serverUrl = "http://localhost:5000";

function useGetItemByCity() {
    const dispatch = useDispatch();
    const { city: currentCity } = useSelector((state) => state.user);

    useEffect(() => {
        if (!currentCity) return;
        const fetchItem = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/item/get-item-by-city/${currentCity}`,
                    { withCredentials: true }
                );
                dispatch(ItemByCity(result?.data?.shops));
                console.log(result.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchItem();
    }, [currentCity]);
}

export default useGetItemByCity;