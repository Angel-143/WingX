import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../dashboards/navbar.jsx";
import { FaArrowLeft } from "react-icons/fa";
import UserOrderCart from "./UserOrderCart.jsx";
import OwnerOrderCart from "./OwnerOrderCart.jsx";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function MyOrders() {
  const navigate  = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const role    = userData?.role || userData?.user?.role || "";
  const isOwner = role?.toLowerCase() === "owner";

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [updating, setUpdating]   = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const url = isOwner
        ? `${serverUrl}/api/order/owner-orders`
        : `${serverUrl}/api/order/my-orders`;
      const res = await axios.get(url, { withCredentials: true });
      setOrders(res.data);
    } catch (err) {
      setError("Could not fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ shopId bhi pass karo — sirf us shop ka status update
  const handleUpdateStatus = async (orderId, newStatus, shopId) => {
    setUpdating(orderId);
    try {
      await axios.put(
        `${serverUrl}/api/order/status/${orderId}`,
        { status: newStatus, shopId }, // ✅ shopId bhejo
        { withCredentials: true }
      );
      // Local state update — sirf us shopOrder ka status change karo
      setOrders(prev => prev.map(o => {
        if (o._id !== orderId) return o;
        return {
          ...o,
          shopOrders: o.shopOrders.map(so => {
            const soShopId = so.shop?._id || so.shop;
            if (soShopId?.toString() !== shopId?.toString()) return so;
            return { ...so, status: newStatus };
          })
        };
      }));
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  // ✅ Cancel bhi shopId ke saath
  const handleCancel = async (orderId, shopId) => {
    if (!window.confirm("Cancel this order?")) return;
    await handleUpdateStatus(orderId, "cancelled", shopId);
  };

  // ── Owner tabs ──
  const OWNER_TABS = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "New 🔔" },
    { key: "active",    label: "Active 🍳" },
    { key: "delivered", label: "Done ✅" },
  ];

  // ✅ Tab filter — shopOrder level status check karo
  const filteredOrders = isOwner ? orders.filter(o => {
    if (activeTab === "all") return true;
    const statuses = o.shopOrders?.map(so => so.status) || [];
    if (activeTab === "pending")   return statuses.includes("pending");
    if (activeTab === "active")    return statuses.some(s => ["confirmed","preparing","out_for_delivery"].includes(s));
    if (activeTab === "delivered") return statuses.every(s => ["delivered","cancelled"].includes(s));
    return true;
  }) : orders;

  // ✅ Stats — shopOrder level
  const stats = isOwner ? {
    new:     orders.filter(o => o.shopOrders?.some(so => so.status === "pending")).length,
    active:  orders.filter(o => o.shopOrders?.some(so => ["confirmed","preparing","out_for_delivery"].includes(so.status))).length,
    done:    orders.filter(o => o.shopOrders?.every(so => ["delivered","cancelled"].includes(so.status))).length,
    revenue: orders.reduce((t, o) => t + (o.totalAmount || 0), 0),
  } : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

        .mo-root { font-family:'Plus Jakarta Sans',sans-serif; min-height:100vh; background:linear-gradient(145deg,#fff9f5 0%,#fdf8ff 40%,#f0fdf9 100%); }
        .mo-container { max-width:820px; margin:0 auto; padding:clamp(84px,11vw,96px) 16px 60px; }

        .mo-header { display:flex; align-items:center; gap:14px; margin-bottom:24px; }
        .mo-back-btn { width:40px; height:40px; border-radius:12px; border:none; background:white; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 12px rgba(0,0,0,0.08); border:1.5px solid rgba(255,107,53,0.15); color:#ff6b35; flex-shrink:0; transition:transform 0.15s; }
        .mo-back-btn:hover { transform:translateX(-2px); }
        .mo-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:clamp(20px,4vw,28px); }
        .mo-user-title  { background:linear-gradient(135deg,#ff6b35,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .mo-owner-title { background:linear-gradient(135deg,#7c3aed,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .mo-sub { font-size:12px; color:#9ca3af; font-weight:500; margin-top:2px; }

        .mo-stats { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
        .mo-stat { background:white; border-radius:16px; padding:12px 18px; flex:1; min-width:80px; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1.5px solid rgba(255,255,255,0.9); animation:fadeUp 0.4s ease both; }
        .mo-stat-num { font-family:'Nunito',sans-serif; font-weight:900; font-size:22px; }
        .mo-stat-lbl { font-size:11px; color:#9ca3af; font-weight:600; margin-top:2px; }

        .mo-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .mo-tab { padding:8px 16px; border-radius:12px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid rgba(124,58,237,0.15); background:white; color:#9ca3af; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .mo-tab.active { background:linear-gradient(135deg,#7c3aed,#ff3cac); color:white; border-color:transparent; box-shadow:0 4px 14px rgba(124,58,237,0.35); }
        .mo-tab:hover:not(.active) { border-color:rgba(124,58,237,0.3); color:#7c3aed; }

        .mo-skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:400px 100%; animation:shimmer 1.2s infinite; border-radius:20px; height:150px; margin-bottom:14px; }

        .mo-refresh { display:flex; align-items:center; gap:6px; background:white; border:1.5px solid rgba(255,107,53,0.2); color:#ff6b35; font-size:12px; font-weight:700; padding:8px 14px; border-radius:10px; cursor:pointer; transition:background 0.2s; margin-left:auto; font-family:'Plus Jakarta Sans',sans-serif; }
        .mo-refresh:hover { background:#fff5f0; }

        .mo-empty { background:white; border-radius:24px; padding:64px 24px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06); border:1.5px solid rgba(255,255,255,0.9); }
        .mo-browse-btn { display:inline-block; padding:12px 28px; border-radius:14px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 6px 20px rgba(255,107,53,0.4); transition:transform 0.15s; }
        .mo-browse-btn:hover { transform:translateY(-2px); }
      `}</style>

      <div className="mo-root">
        <Navbar />
        <div className="mo-container">

          {/* HEADER */}
          <div className="mo-header">
            <button className="mo-back-btn" onClick={() => navigate(-1)}><FaArrowLeft size={13} /></button>
            <div style={{ flex:1 }}>
              <div className={`mo-title ${isOwner ? "mo-owner-title" : "mo-user-title"}`}>
                {isOwner ? "📬 Incoming Orders" : "📦 My Orders"}
              </div>
              <div className="mo-sub">{!loading && `${orders.length} order${orders.length !== 1 ? "s" : ""}`}</div>
            </div>
            <button className="mo-refresh" onClick={fetchOrders}>🔄 Refresh</button>
          </div>

          {/* OWNER STATS */}
          {isOwner && !loading && stats && (
            <div className="mo-stats">
              <div className="mo-stat">
                <div className="mo-stat-num" style={{ background:"linear-gradient(135deg,#f59e0b,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{stats.new}</div>
                <div className="mo-stat-lbl">New 🔔</div>
              </div>
              <div className="mo-stat" style={{ animationDelay:"0.06s" }}>
                <div className="mo-stat-num" style={{ background:"linear-gradient(135deg,#7c3aed,#ff3cac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{stats.active}</div>
                <div className="mo-stat-lbl">Active 🍳</div>
              </div>
              <div className="mo-stat" style={{ animationDelay:"0.12s" }}>
                <div className="mo-stat-num" style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{stats.done}</div>
                <div className="mo-stat-lbl">Delivered ✅</div>
              </div>
              <div className="mo-stat" style={{ animationDelay:"0.18s" }}>
                <div className="mo-stat-num" style={{ background:"linear-gradient(135deg,#ff6b35,#ff3cac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>₹{stats.revenue}</div>
                <div className="mo-stat-lbl">Revenue 💰</div>
              </div>
            </div>
          )}

          {/* OWNER TABS */}
          {isOwner && (
            <div className="mo-tabs">
              {OWNER_TABS.map(t => (
                <button key={t.key} className={`mo-tab ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  {t.key === "pending" && stats?.new > 0 && (
                    <span style={{ marginLeft:6, background:"rgba(255,255,255,0.3)", borderRadius:99, padding:"1px 6px", fontSize:10 }}>{stats.new}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* LOADING */}
          {loading && [1,2,3].map(i => <div key={i} className="mo-skeleton" style={{ animationDelay:`${i*0.1}s` }} />)}

          {/* ERROR */}
          {error && (
            <div style={{ background:"#fff5f5", border:"1.5px solid rgba(239,68,68,0.2)", borderRadius:16, padding:"16px 20px", color:"#ef4444", fontSize:13, fontWeight:600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filteredOrders.length === 0 && (
            <div className="mo-empty">
              <div style={{ fontSize:56, marginBottom:16 }}>{isOwner ? "📭" : "🍽️"}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:"#1a1a2e", marginBottom:8 }}>
                {isOwner ? "No orders yet!" : "No orders placed yet!"}
              </div>
              <div style={{ fontSize:13, color:"#9ca3af", fontWeight:500, marginBottom:24 }}>
                {isOwner ? "Orders will appear here when customers place them." : "Explore restaurants and place your first order!"}
              </div>
              {!isOwner && <button className="mo-browse-btn" onClick={() => navigate("/")}>Browse Food →</button>}
            </div>
          )}

          {/* RENDER CARDS */}
          {!loading && filteredOrders.map((order, idx) =>
            isOwner ? (
              <OwnerOrderCart
                key={order._id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onCancel={handleCancel}
                updating={updating}
                animDelay={idx * 0.06}
              />
            ) : (
              <UserOrderCart
                key={order._id}
                order={order}
                animDelay={idx * 0.07}
              />
            )
          )}

        </div>
      </div>
    </>
  );
}

export default MyOrders;