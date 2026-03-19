import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaUtensils, FaMotorcycle } from "react-icons/fa";

const STATUS_CONFIG = {
  pending:          { label: "Pending",         color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: <FaClock size={11} /> },
  confirmed:        { label: "Confirmed",        color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  icon: <FaCheckCircle size={11} /> },
  preparing:        { label: "Preparing",        color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)",  icon: <FaUtensils size={11} /> },
  out_for_delivery: { label: "Out for Delivery", color: "#ff6b35", bg: "rgba(255,107,53,0.1)",  border: "rgba(255,107,53,0.25)",  icon: <FaMotorcycle size={11} /> },
  delivered:        { label: "Delivered",        color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   icon: <FaCheckCircle size={11} /> },
  cancelled:        { label: "Cancelled",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: <FaTimesCircle size={11} /> },
};

const STEPS       = ["pending","confirmed","preparing","out_for_delivery","delivered"];
const STEP_ICONS  = ["⏳","✓","👨‍🍳","🛵","✅"];
const STEP_LABELS = ["Placed","Confirmed","Preparing","On Way","Delivered"];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:cfg.bg, border:`1.5px solid ${cfg.border}`,
      color:cfg.color, borderRadius:99, padding:"4px 10px",
      fontSize:11, fontWeight:700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ✅ Per-shop progress tracker
function ShopTracker({ status }) {
  const currentStepIdx = STEPS.indexOf(status || "pending");
  const isCancelled    = status === "cancelled";

  if (isCancelled) {
    return (
      <div style={{ padding:"8px 0", fontSize:12, fontWeight:600, color:"#ef4444" }}>
        ❌ This order was cancelled
      </div>
    );
  }

  return (
    <div style={{ marginTop:10 }}>
      <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
        Progress
      </div>
      <div style={{ display:"flex", alignItems:"center" }}>
        {STEPS.map((step, idx) => {
          const isDone   = idx < currentStepIdx;
          const isActive = idx === currentStepIdx;
          return (
            <React.Fragment key={step}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11,
                  background: isDone ? "linear-gradient(135deg,#22c55e,#16a34a)"
                            : isActive ? "linear-gradient(135deg,#ff6b35,#ff3cac)"
                            : "white",
                  border: isDone || isActive ? "none" : "2px solid #e5e7eb",
                  color: isDone || isActive ? "white" : "#9ca3af",
                  boxShadow: isActive ? "0 4px 12px rgba(255,107,53,0.4)" : "none",
                }}>
                  {STEP_ICONS[idx]}
                </div>
                <div style={{
                  fontSize:9, fontWeight:600, marginTop:4, textAlign:"center",
                  color: isDone ? "#22c55e" : isActive ? "#ff6b35" : "#9ca3af",
                }}>
                  {STEP_LABELS[idx]}
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{
                  flex:1, height:2, margin:"0 2px", marginBottom:20,
                  background: isDone
                    ? "linear-gradient(90deg,#22c55e,#16a34a)"
                    : isActive
                    ? "linear-gradient(90deg,#ff6b35,#ff3cac)"
                    : "#e5e7eb",
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function UserOrderCart({ order, animDelay = 0 }) {
  if (!order) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .uoc-card {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: white; border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1.5px solid rgba(255,255,255,0.9);
          margin-bottom: 16px; animation: fadeUp 0.4s ease both;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .uoc-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(255,107,53,0.1); }

        .uoc-header {
          padding:14px 20px; display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:8px;
          border-bottom:1.5px solid #f9fafb;
          background:linear-gradient(135deg,#fffaf8,#fff8ff);
        }
        .uoc-order-id { font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; color:#1a1a2e; }
        .uoc-order-date { font-size:11px; color:#9ca3af; font-weight:500; margin-top:2px; }

        /* ✅ Each shop as separate section */
        .uoc-shop-section {
          padding:14px 20px; border-bottom:1.5px solid #f9fafb;
        }
        .uoc-shop-section:last-of-type { border-bottom:none; }

        .uoc-shop-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .uoc-shop-img {
          width:44px; height:44px; border-radius:12px; object-fit:cover; flex-shrink:0;
          background:linear-gradient(135deg,#fff5f0,#fff0f8);
          display:flex; align-items:center; justify-content:center; font-size:18px;
        }
        .uoc-shop-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; color:#1a1a2e; }
        .uoc-shop-city { font-size:11px; color:#9ca3af; font-weight:500; margin-top:2px; }

        .uoc-items { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
        .uoc-item-chip {
          display:flex; align-items:center; gap:6px; background:#f9fafb;
          border:1.5px solid #f3f4f6; border-radius:10px; padding:6px 10px;
          font-size:12px; font-weight:600; color:#374151;
        }
        .uoc-item-img { width:28px; height:28px; border-radius:7px; object-fit:cover; flex-shrink:0; }
        .uoc-item-qty {
          background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white;
          font-size:10px; font-weight:800; width:18px; height:18px; border-radius:99px;
          display:flex; align-items:center; justify-content:center;
        }

        .uoc-footer {
          padding:12px 20px; display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:8px;
          background:#fafafa; border-top:1.5px solid #f3f4f6;
        }
        .uoc-payment { font-size:11px; font-weight:600; color:#9ca3af; display:flex; align-items:center; gap:4px; }
        .uoc-total {
          font-family:'Nunito',sans-serif; font-weight:900; font-size:16px;
          background:linear-gradient(135deg,#ff6b35,#ff3cac);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
      `}</style>

      <div className="uoc-card" style={{ animationDelay:`${animDelay}s` }}>

        {/* ORDER HEADER */}
        <div className="uoc-header">
          <div>
            <div className="uoc-order-id">Order #{order._id?.slice(-6).toUpperCase()}</div>
            <div className="uoc-order-date">{formatDate(order.createdAt)}</div>
          </div>
        </div>

        {/* ✅ EACH SHOP SEPARATELY with its own tracker */}
        {order.shopOrders?.map((shopOrder, si) => (
          <div key={si} className="uoc-shop-section">

            {/* Shop info + status badge */}
            <div className="uoc-shop-row">
              {shopOrder.shop?.image
                ? <img src={shopOrder.shop.image} alt={shopOrder.shop?.name} className="uoc-shop-img" />
                : <div className="uoc-shop-img">🍽️</div>
              }
              <div style={{ flex:1 }}>
                <div className="uoc-shop-name">{shopOrder.shop?.name || "Restaurant"}</div>
                <div className="uoc-shop-city">📍 {shopOrder.shop?.city || ""}</div>
              </div>
              {/* ✅ Per-shop status badge */}
              <StatusBadge status={shopOrder.status} />
            </div>

            {/* Items */}
            <div className="uoc-items">
              {shopOrder.shopOrderItems?.map((item, idx) => (
                <div key={idx} className="uoc-item-chip">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="uoc-item-img" />
                    : <span style={{ fontSize:15 }}>🍽️</span>
                  }
                  <span>{item.name}</span>
                  <span className="uoc-item-qty">×{item.quantity}</span>
                  <span style={{ color:"#ff6b35", fontWeight:800, fontSize:11 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* ✅ Per-shop progress tracker */}
            <ShopTracker status={shopOrder.status} />

          </div>
        ))}

        {/* FOOTER */}
        <div className="uoc-footer">
          <div className="uoc-payment">
            {order.paymentMethod === "cod" ? "💵" : order.paymentMethod === "upi" ? "📲" : "💳"}
            {" "}{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "upi" ? "UPI" : "Card"}
          </div>
          <div className="uoc-total">₹{order.totalAmount}</div>
        </div>

      </div>
    </>
  );
}

export default UserOrderCart;