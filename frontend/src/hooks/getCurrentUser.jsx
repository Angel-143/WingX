import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

function useCurrentUser() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true); // 👈 yeh add kiya

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const result = await axios.get(
                    `${API_BASE_URL}/api/user/current`,
                    { withCredentials: true }
                );
                dispatch(setUserData(result.data));
            } catch (error) {
                console.error("Error fetching current user:", error.response?.data || error.message);
                dispatch(setUserData(null));
            } finally {
                setLoading(false); // ✅ success ya error — dono case mein done
            }
        };

        fetchCurrentUser();
    }, []);

    return { loading }; // 👈 yeh return kiya
}

export default useCurrentUser;