import { useEffect } from "react";

import axios from "axios";
import { useDispatch } from "react-redux";
import { currentCity, setUserData, currentState, currentAddress} from "../redux/user_slice.js";
import { useSelector } from "react-redux";
import { setLocation } from "../redux/map_slice.js";

function useGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector((state) => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                console.log(position)
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                dispatch(setLocation({lat:latitude,lon:longitude}))
                const result = await axios.get(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`

                )
                console.log(result)
                //console.log(result?.data?.results[0]?.city)
                
                 dispatch(currentCity(result?.data?.results[0].city))
                dispatch(currentState(result?.data?.results[0].state))
                dispatch(currentAddress(result?.data?.results[0].formatted))
                dispatch(currentAddress(result?.data?.results[0].address_line1))



                 console.log("🔥 City from Geoapify:", result?.data?.results[0].city); 
                console.log("🔥 State from Geoapify:", result?.data?.results[0].state);
                console.log("🔥 Address from Geoapify:", result?.data?.results[0].formatted);
                console.log("🔥 Address from Geoapify:", result?.data?.results[0].address_line1);
            })
        }, [userData])
            }
              
export default useGetCity;
