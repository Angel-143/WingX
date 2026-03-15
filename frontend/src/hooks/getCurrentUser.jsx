import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user_slice.js";

function useCurrentUser() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true); // 👈 yeh add kiya

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const result = await axios.get(
                    "http://localhost:5000/api/user/current",
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