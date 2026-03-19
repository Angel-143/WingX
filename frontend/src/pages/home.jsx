import React from "react";
import { useSelector } from "react-redux";
import OwnerDashboard from "../dashboards/owner_dashboard.jsx";
import UserDashboard from "../dashboards/user_dashboard.jsx";
import DeliveryBoyDashboard from "../dashboards/deliveryboy_dashboard.jsx";

function Home() {
  const { userData } = useSelector((state) => state.user);

  // ✅ Dono jagah se role lo — direct ya nested user object
  const role = (userData?.role || userData?.user?.role || "").toLowerCase();

  if (role === "owner")       return <OwnerDashboard />;
  if (role === "deliveryboy") return <DeliveryBoyDashboard />;
  if (role === "user")        return <UserDashboard />;

  // Fallback
  return <UserDashboard />;
}

export default Home;