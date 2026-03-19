// dashboards/DeliveryBoyOrderCart.jsx
import React from "react";
import {
  FaMotorcycle, FaMapMarkerAlt, FaStore,
  FaCheckCircle, FaTimesCircle, FaBell, FaRupeeSign,
} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";

const STATUS_CONFIG = {
  pending:    { label: "New Order!",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  icon: <FaBell size={11} /> },
  accepted:   { label: "Accepted",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)", icon: <FaCheckCircle size={11} /> },
  picked_up:  { label: "Picked Up",  color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)", icon: <FaMotorcycle size={11} /> },
  delivered:  { label: "Delivered",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",  icon: <FaCheckCircle size={11} /> },
  rejected:   { label: "Rejected",   color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",  icon: <FaTimesCircle size={11} /> },
  expired:    { label: "Taken",      color: "#6b7280", bg: "rgba(107,114,128,0.08)","border": "rgba(107,114,128,0.2)", icon: <FaTimesCircle size={11} /> },
  cancelled:  { label: "Cancelled",  color: "#6b7280", bg: "rgba(107,114,128,0.08)","border": "rgba(107,114,128,0.2)", icon: <FaTimesCircle size={11} /> },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:cfg.bg, border:`1.5px solid ${cfg.border}`, color:cfg.color, borderRadius:99, padding:"4px 10px", fontSize:11, fontWeight:700 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const STEPS       = ["pending","accepted","picked_up","delivered"];
const STEP_ICONS  = ["📋","✅","🛵","🎉"];
const STEP_LABELS = ["Assigned","Accepted","Picked Up","Delivered"];

function DeliveryBoyOrderCart({ assignment, onAccept, onReject, onStatusUpdate, updating, animDelay = 0 }) {
  if (!assignment) return null;

  const isUpdating = updating === assignment._id;
  const isPending  = assignment.status === "pending";
  const isAccepted = assignment.status === "accepted";
  const isPickedUp = assignment.status === "picked_up";
  const isDone     = ["delivered","rejected","expired","cancelled"].includes(assignment.status);
  const isExpired  = assignment.status === "expired";

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes glow   { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.4)} 50%{box-shadow:0 0 0 6px rgba(245,158,11,0)} }

        .dbc-card { font-family:'Plus Jakarta Sans',sans-serif; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.1); border-radius:20px; overflow:hidden; margin-bottom:14px; backdrop-filter:blur(12px); animation:fadeUp 0.4s ease both; transition:transform 0.2s,box-shadow 0.2s; }
        .dbc-card:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,0.4); }
        .dbc-card.new-card    { border-color:rgba(245,158,11,0.45); background:rgba(245,158,11,0.06); animation:fadeUp 0.4s ease both,glow 2s ease-in-out infinite; }
        .dbc-card.active-card { border-color:rgba(124,58,237,0.4); background:rgba(124,58,237,0.05); }
        .dbc-card.done-card   { border-color:rgba(255,255,255,0.07); opacity:0.65; }

        .dbc-header { padding:14px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; border-bottom:1.5px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.04); }
        .dbc-order-id { font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; color:#f8fafc; }
        .dbc-date     { font-size:11px; color:rgba(255,255,255,0.4); font-weight:500; margin-top:2px; }
        .dbc-new-badge { background:linear-gradient(135deg,#f59e0b,#f97316); color:white; font-size:10px; font-weight:800; padding:3px 8px; border-radius:99px; animation:pulse 1.5s ease-in-out infinite; box-shadow:0 3px 10px rgba(245,158,11,0.5); }

        .dbc-shop-row { padding:14px 20px; display:flex; align-items:center; gap:12px; border-bottom:1.5px solid rgba(255,255,255,0.07); }
        .dbc-shop-img { width:48px; height:48px; border-radius:13px; object-fit:cover; flex-shrink:0; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:20px; border:1.5px solid rgba(255,255,255,0.15); }
        .dbc-shop-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; color:#f8fafc; }
        .dbc-shop-sub  { font-size:11px; color:rgba(255,255,255,0.45); font-weight:500; margin-top:3px; }

        .dbc-address { padding:12px 20px; display:flex; align-items:flex-start; gap:10px; border-bottom:1.5px solid rgba(255,255,255,0.07); }
        .dbc-address-text { font-size:13px; color:rgba(255,255,255,0.7); font-weight:500; line-height:1.5; }

        .dbc-meta { padding:10px 20px; display:flex; gap:16px; flex-wrap:wrap; border-bottom:1.5px solid rgba(255,255,255,0.07); }
        .dbc-meta-chip { display:flex; align-items:center; gap:5px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.55); }

        .dbc-note { margin:0 20px 12px; padding:10px 14px; border-radius:10px; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.08); font-size:12px; color:rgba(255,255,255,0.5); font-style:italic; }

        .dbc-progress { padding:12px 20px 16px; border-top:1.5px solid rgba(255,255,255,0.07); }
        .dbc-progress-lbl { font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px; }
        .dbc-steps { display:flex; align-items:center; }
        .dbc-step  { display:flex; flex-direction:column; align-items:center; flex:1; }
        .dbc-step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; border:2px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.3); }
        .dbc-step-dot.done   { background:linear-gradient(135deg,#22c55e,#16a34a); border-color:transparent; color:white; box-shadow:0 3px 10px rgba(34,197,94,0.4); }
        .dbc-step-dot.active { background:linear-gradient(135deg,#7c3aed,#be185d); border-color:transparent; color:white; box-shadow:0 3px 10px rgba(124,58,237,0.5); }
        .dbc-step-lbl { font-size:9px; font-weight:600; margin-top:4px; text-align:center; color:rgba(255,255,255,0.3); }
        .dbc-step-lbl.done   { color:#22c55e; }
        .dbc-step-lbl.active { color:#c084fc; }
        .dbc-step-line { flex:1; height:2px; margin:0 2px; margin-bottom:20px; background:rgba(255,255,255,0.1); }
        .dbc-step-line.done { background:linear-gradient(90deg,#22c55e,#16a34a); }

        .dbc-actions { padding:14px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:rgba(255,255,255,0.03); }
        .dbc-amount { font-family:'Nunito',sans-serif; font-weight:900; font-size:18px; background:linear-gradient(135deg,#34d399,#22c55e); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .dbc-btns { display:flex; gap:8px; flex-wrap:wrap; }

        .dbc-btn { display:flex; align-items:center; gap:6px; font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:800; padding:10px 18px; border-radius:10px; border:none; cursor:pointer; transition:transform 0.15s,opacity 0.2s; }
        .dbc-btn:hover:not(:disabled) { transform:translateY(-1px); }
        .dbc-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .dbc-btn-accept  { background:linear-gradient(135deg,#22c55e,#16a34a); color:white; box-shadow:0 4px 14px rgba(34,197,94,0.4); }
        .dbc-btn-reject  { background:rgba(239,68,68,0.12); border:1.5px solid rgba(239,68,68,0.3); color:#f87171; }
        .dbc-btn-pickup  { background:linear-gradient(135deg,#7c3aed,#be185d); color:white; box-shadow:0 4px 14px rgba(124,58,237,0.4); }
        .dbc-btn-deliver { background:linear-gradient(135deg,#f59e0b,#f97316); color:white; box-shadow:0 4px 14px rgba(245,158,11,0.4); }
        .dbc-spinner { width:13px; height:13px; border-radius:50%; border:2px solid rgba(255,255,255,0.35); border-top:2px solid white; animation:spin 0.7s linear infinite; flex-shrink:0; }
      `}</style>

      <div className={`dbc-card ${isPending ? "new-card" : isAccepted || isPickedUp ? "active-card" : isDone ? "done-card" : ""}`} style={{ animationDelay:`${animDelay}s` }}>

        <div className="dbc-header">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="dbc-order-id">Order #{assignment.order?._id?.slice(-6).toUpperCase() || "------"}</div>
              {isPending && <span className="dbc-new-badge">NEW</span>}
              {isExpired && <span style={{ fontSize:10, color:"#9ca3af", fontWeight:700 }}>Someone else accepted</span>}
            </div>
            <div className="dbc-date">{formatDate(assignment.createdAt)}</div>
          </div>
          <StatusBadge status={assignment.status} />
        </div>

        <div className="dbc-shop-row">
          {assignment.shop?.image ? <img src={assignment.shop.image} alt={assignment.shop.name} className="dbc-shop-img" style={{ display:"block" }} /> : <div className="dbc-shop-img">🍽️</div>}
          <div style={{ flex:1 }}>
            <div className="dbc-shop-name"><FaStore size={10} style={{ color:"#c084fc", marginRight:5 }} />{assignment.shop?.name || "Restaurant"}</div>
            <div className="dbc-shop-sub">📍 {assignment.shop?.city || ""}{assignment.shop?.address ? ` · ${assignment.shop.address}` : ""}</div>
          </div>
        </div>

        {assignment.deliveryAddress?.text && (
          <div className="dbc-address">
            <FaMapMarkerAlt size={13} style={{ color:"#34d399", flexShrink:0, marginTop:2 }} />
            <div className="dbc-address-text">{assignment.deliveryAddress.text}</div>
          </div>
        )}

        <div className="dbc-meta">
          <div className="dbc-meta-chip"><FaRupeeSign size={10} style={{ color:"#34d399" }} />₹{assignment.order?.totalAmount || 0}</div>
          <div className="dbc-meta-chip">{assignment.order?.paymentMethod === "cod" ? "💵 COD" : assignment.order?.paymentMethod === "upi" ? "📲 UPI" : "💳 Card"}</div>
          {assignment.assignedBy?.fullname && <div className="dbc-meta-chip">👨‍🍳 {assignment.assignedBy.fullname}</div>}
        </div>

        {assignment.note && <div className="dbc-note">📝 {assignment.note}</div>}

        {!["rejected","expired","cancelled"].includes(assignment.status) && (() => {
          const currentIdx = STEPS.indexOf(assignment.status);
          return (
            <div className="dbc-progress">
              <div className="dbc-progress-lbl">Delivery Progress</div>
              <div className="dbc-steps">
                {STEPS.map((step, idx) => {
                  const d = idx < currentIdx, a = idx === currentIdx;
                  return (
                    <React.Fragment key={step}>
                      <div className="dbc-step">
                        <div className={`dbc-step-dot ${d?"done":a?"active":""}`}>{STEP_ICONS[idx]}</div>
                        <div className={`dbc-step-lbl ${d?"done":a?"active":""}`}>{STEP_LABELS[idx]}</div>
                      </div>
                      {idx < STEPS.length-1 && <div className={`dbc-step-line ${d?"done":""}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="dbc-actions">
          <div className="dbc-amount">₹{assignment.order?.totalAmount || 0}</div>
          {isDone ? (
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>
              {assignment.status === "delivered" ? "✅ Delivered" : isExpired ? "⏰ Taken by someone" : "❌ Rejected"}
            </span>
          ) : (
            <div className="dbc-btns">
              {isPending && <>
                <button className="dbc-btn dbc-btn-reject" onClick={() => onReject(assignment._id)} disabled={isUpdating}>✕ Reject</button>
                <button className="dbc-btn dbc-btn-accept" onClick={() => onAccept(assignment._id)} disabled={isUpdating}>
                  {isUpdating ? <><span className="dbc-spinner" />Wait…</> : "✅ Accept First!"}
                </button>
              </>}
              {isAccepted && <button className="dbc-btn dbc-btn-pickup" onClick={() => onStatusUpdate(assignment._id,"picked_up")} disabled={isUpdating}>{isUpdating?<><span className="dbc-spinner"/>Updating…</>:<><MdDeliveryDining size={14}/>Picked Up</>}</button>}
              {isPickedUp && <button className="dbc-btn dbc-btn-deliver" onClick={() => onStatusUpdate(assignment._id,"delivered")} disabled={isUpdating}>{isUpdating?<><span className="dbc-spinner"/>Updating…</>:"🎉 Mark Delivered"}</button>}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default DeliveryBoyOrderCart;