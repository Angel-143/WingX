// hooks/useUpdateDeliveryLocation.js
import { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

// ✅ Delivery boy ki location backend mein save karte raho
function useUpdateDeliveryLocation() {
    const { userData } = useSelector((state) => state.user);
    const role = userData?.role || userData?.user?.role || "";

    useEffect(() => {
        if (role?.toLowerCase() !== "deliveryboy") return;
        if (!navigator.geolocation) return;

        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    await axios.put(
                        `${serverUrl}/api/user/update-location`,
                        {
                            latitude:  pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        },
                        { withCredentials: true }
                    );
                } catch (err) {
                    console.error("Location update failed:", err.message);
                }
            });
        };

        // Immediately update
        updateLocation();

        // Har 30 seconds pe update karo
        const interval = setInterval(updateLocation, 30000);

        return () => clearInterval(interval);
    }, [role]);
}

export default useUpdateDeliveryLocation;