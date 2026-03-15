import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/user_slice.js";
import { useNavigate } from "react-router-dom";
import OwnerDashboard from "../dashboards/owner_dashboard.jsx";
import UserDashboard from "../dashboards/user_dashboard.jsx";
import DeliveryBoyDashboard from "../dashboards/deliveryboy_dashboard.jsx";


function Home() {

  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setUserData(null));
    navigate("/signin");
  };

  

  return (
    <div className="w-screen min-h-screen pt-24 flex flex-col items-center bg-amber-100">

      
      {userData?.user?.role === "owner" && <OwnerDashboard />}
      {userData?.user?.role === "user" && <UserDashboard />}
      {userData?.user?.role === "deliveryboy" && <DeliveryBoyDashboard />}

      {/* Welcome Box */}
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Welcome {userData?.user?.fullname}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

    </div>
  );
}

export default Home;