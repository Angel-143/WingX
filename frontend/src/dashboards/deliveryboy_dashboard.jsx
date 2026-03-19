// dashboards/deliveryboy_dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "./navbar.jsx";
import { FaBell } from "react-icons/fa";
import DeliveryBoyOrderCart from "../pages/deliveryBoy_order_cart.jsx";
import useUpdateDeliveryLocation from "../hooks/useUpdateDeliveryLocation.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function DeliveryBoyDashboard() {
  const { userData } = useSelector((state) => state.user);
  const firstName = (userData?.fullname || userData?.user?.fullname || "Rider").split(" ")[0];

  // ✅ Location har 30s mein update karo
  useUpdateDeliveryLocation();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState(null);
  const [activeTab, setActiveTab]     = useState("all");

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/delivery/my-assignments`, { withCredentials: true });
      setAssignments(res.data);
      res.data.forEach(a => {
        if (!a.notification?.read) {
          axios.put(`${serverUrl}/api/delivery/read/${a._id}`, {}, { withCredentials: true }).catch(() => {});
        }
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ✅ Accept — first wins
const handleAccept = async (assignmentId) => {
  setUpdating(assignmentId);
  try {
    await axios.put(
      `${serverUrl}/api/delivery/accept/${assignmentId}`,
      {},
      { withCredentials: true }
    );
    setActiveTab("active"); // ← pehle tab switch
    await fetchAssignments(); // ← phir refresh
  } catch (err) {
    alert(err.response?.data?.message || "Failed to accept");
    await fetchAssignments();
  } finally {
    setUpdating(null);
  }
};
  // ✅ Reject
  const handleReject = async (assignmentId) => {
    setUpdating(assignmentId);
    try {
      await axios.put(`${serverUrl}/api/delivery/reject/${assignmentId}`, {}, { withCredentials: true });
      setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, status: "rejected" } : a));
    } catch { alert("Failed to reject"); }
    finally { setUpdating(null); }
  };

  // ✅ picked_up / delivered
  const handleStatusUpdate = async (assignmentId, status) => {
    setUpdating(assignmentId);
    try {
      await axios.put(`${serverUrl}/api/delivery/status/${assignmentId}`, { status }, { withCredentials: true });
      setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, status } : a));
    } catch { alert("Failed to update"); }
    finally { setUpdating(null); }
  };

  const stats = {
    new:       assignments.filter(a => a.status === "pending").length,
    active:    assignments.filter(a => ["accepted","picked_up"].includes(a.status)).length,
    delivered: assignments.filter(a => a.status === "delivered").length,
    earnings:  assignments.filter(a => a.status === "delivered").reduce((t, a) => t + (a.order?.totalAmount || 0), 0),
  };

  const TABS = [
    { key:"new",       label:"New 🔔" },
    { key:"active",    label:"Active 🛵" },
    { key:"delivered", label:"Done ✅" },
    { key:"all",       label:"All" },
  ];

  const filtered = assignments.filter(a => {
    if (activeTab === "new")       return a.status === "pending";
    if (activeTab === "active")    return ["accepted","picked_up"].includes(a.status);
    if (activeTab === "delivered") return ["delivered","rejected","expired","cancelled"].includes(a.status);
    return true;
    
  });

  console.log("🔍 activeTab:", activeTab, "| filtered:", filtered.length, "| total:", assignments.length);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes ride    { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

        .db-root { font-family:'Plus Jakarta Sans',sans-serif; min-height:100vh; background:linear-gradient(145deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%); }
        .db-blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
        .db-container { max-width:800px; margin:0 auto; padding:clamp(84px,11vw,96px) 16px 60px; position:relative; z-index:1; }

        .db-hero { border-radius:24px; padding:28px 32px; margin-bottom:20px; background:linear-gradient(120deg,#1e40af 0%,#7c3aed 55%,#be185d 100%); position:relative; overflow:hidden; box-shadow:0 12px 40px rgba(124,58,237,0.4); display:flex; align-items:center; justify-content:space-between; gap:16px; animation:fadeUp 0.4s ease; }
        .db-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 80% 40%,rgba(255,255,255,0.1),transparent 55%); pointer-events:none; }
        .db-hero-eyebrow { display:inline-block; background:rgba(255,255,255,0.15); border-radius:99px; padding:4px 14px; font-size:11px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.8); margin-bottom:10px; }
        .db-hero-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:clamp(20px,3.5vw,30px); color:white; line-height:1.2; margin-bottom:6px; }
        .db-hero-sub { font-size:13px; color:rgba(255,255,255,0.7); }
        .db-hero-icon { font-size:clamp(44px,7vw,64px); filter:drop-shadow(0 6px 14px rgba(0,0,0,0.3)); animation:ride 2s ease-in-out infinite; flex-shrink:0; }

        .db-stats { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
        .db-stat { background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.1); border-radius:16px; padding:14px 18px; flex:1; min-width:80px; backdrop-filter:blur(12px); animation:fadeUp 0.4s ease both; }
        .db-stat-num { font-family:'Nunito',sans-serif; font-weight:900; font-size:22px; }
        .db-stat-lbl { font-size:11px; color:rgba(255,255,255,0.5); font-weight:600; margin-top:2px; }

        .db-alert { background:rgba(245,158,11,0.12); border:1.5px solid rgba(245,158,11,0.35); border-radius:16px; padding:14px 20px; margin-bottom:18px; display:flex; align-items:center; gap:12px; cursor:pointer; animation:pulse 2s ease-in-out infinite; }
        .db-alert-text { font-family:'Nunito',sans-serif; font-weight:800; font-size:14px; color:#fbbf24; }
        .db-alert-sub  { font-size:12px; color:rgba(251,191,36,0.7); font-weight:500; margin-top:2px; }

        .db-tabs { display:flex; gap:8px; flex-wrap:wrap; }
        .db-tab { padding:8px 16px; border-radius:12px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.5); transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .db-tab.active { background:linear-gradient(135deg,#7c3aed,#be185d); color:white; border-color:transparent; box-shadow:0 4px 14px rgba(124,58,237,0.4); }
        .db-tab:hover:not(.active) { border-color:rgba(124,58,237,0.4); color:#c084fc; }

        .db-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%); background-size:400px 100%; animation:shimmer 1.2s infinite; border-radius:20px; height:180px; margin-bottom:14px; }

        .db-refresh { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.7); font-size:12px; font-weight:700; padding:8px 14px; border-radius:10px; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
        .db-refresh:hover { background:rgba(255,255,255,0.12); }

        .db-empty { background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:20px; padding:60px 24px; text-align:center; backdrop-filter:blur(12px); }
      `}</style>

      <div className="db-root">
        <div className="db-blob" style={{ width:500,height:500,background:"rgba(124,58,237,0.2)",top:"-10%",left:"-10%" }} />
        <div className="db-blob" style={{ width:350,height:350,background:"rgba(190,24,93,0.15)",bottom:"5%",right:"-5%" }} />

        <Navbar />
        <div className="db-container">

          <div className="db-hero">
            <div>
              <div className="db-hero-eyebrow">🛵 WingX Delivery Partner</div>
              <div className="db-hero-title">Hey {firstName}!<br />Ready to ride? 🔥</div>
              <div className="db-hero-sub">Check your assignments and start delivering.</div>
            </div>
            <div className="db-hero-icon">🛵</div>
          </div>

          <div className="db-stats">
            {[
              { num:stats.new,       lbl:"New 🔔",       grad:"#f59e0b,#f97316", d:"0s" },
              { num:stats.active,    lbl:"Active 🛵",    grad:"#7c3aed,#be185d", d:"0.06s" },
              { num:stats.delivered, lbl:"Delivered ✅",  grad:"#22c55e,#16a34a", d:"0.12s" },
              { num:`₹${stats.earnings}`, lbl:"Earnings 💰", grad:"#34d399,#22c55e", d:"0.18s" },
            ].map((s,i) => (
              <div key={i} className="db-stat" style={{ animationDelay:s.d }}>
                <div className="db-stat-num" style={{ background:`linear-gradient(135deg,${s.grad})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{s.num}</div>
                <div className="db-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {stats.new > 0 && (
            <div className="db-alert" onClick={() => setActiveTab("new")}>
              <FaBell style={{ color:"#fbbf24", fontSize:20, flexShrink:0 }} />
              <div>
                <div className="db-alert-text">🔔 {stats.new} new order{stats.new > 1 ? "s" : ""} assigned!</div>
                <div className="db-alert-sub">Be the first to accept!</div>
              </div>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <div className="db-tabs" style={{ flex:1 }}>
              {TABS.map(t => (
                <button key={t.key} className={`db-tab ${activeTab===t.key?"active":""}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  {t.key==="new" && stats.new > 0 && <span style={{ marginLeft:6, background:"rgba(255,255,255,0.25)", borderRadius:99, padding:"1px 6px", fontSize:10 }}>{stats.new}</span>}
                </button>
              ))}
            </div>
            <button className="db-refresh" onClick={fetchAssignments}>🔄</button>
          </div>

          {loading && [1,2].map(i => <div key={i} className="db-skeleton" style={{ animationDelay:`${i*0.1}s` }} />)}

          {!loading && filtered.length === 0 && (
            <div className="db-empty">
              <div style={{ fontSize:52, marginBottom:14 }}>{activeTab==="new"?"📭":activeTab==="active"?"🛵":"✅"}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:"rgba(255,255,255,0.8)", marginBottom:8 }}>
                {activeTab==="new"?"No new assignments":activeTab==="active"?"No active deliveries":"No completed deliveries"}
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>
                {activeTab==="new"?"New orders will appear here.":"Check back soon!"}
              </div>
            </div>
          )}

          {!loading && filtered.map((assignment, idx) => (
            <DeliveryBoyOrderCart
              key={assignment._id}
              assignment={assignment}
              onAccept={handleAccept}
              onReject={handleReject}
              onStatusUpdate={handleStatusUpdate}
              updating={updating}
              animDelay={idx * 0.07}
            />
          ))}

        </div>
      </div>
    </>
  );
}

export default DeliveryBoyDashboard;