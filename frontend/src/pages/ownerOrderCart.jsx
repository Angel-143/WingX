import React from "react";
import {
  FaCheckCircle, FaTimesCircle, FaClock,
  FaUtensils, FaMotorcycle, FaPhone, FaUser, FaMapMarkerAlt,
} from "react-icons/fa";

const STATUS_CONFIG = {
  pending:          { label: "Pending",         color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: <FaClock size={11} /> },
  confirmed:        { label: "Confirmed",        color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  icon: <FaCheckCircle size={11} /> },
  preparing:        { label: "Preparing",        color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)",  icon: <FaUtensils size={11} /> },
  out_for_delivery: { label: "Out for Delivery", color: "#ff6b35", bg: "rgba(255,107,53,0.1)",  border: "rgba(255,107,53,0.25)",  icon: <FaMotorcycle size={11} /> },
  delivered:        { label: "Delivered",        color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   icon: <FaCheckCircle size={11} /> },
  cancelled:        { label: "Cancelled",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: <FaTimesCircle size={11} /> },
};

const NEXT_STATUS = {
  pending:          "confirmed",
  confirmed:        "preparing",
  preparing:        "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_LABEL = {
  pending:          "✅ Accept Order",
  confirmed:        "👨‍🍳 Start Preparing",
  preparing:        "🛵 Out for Delivery",
  out_for_delivery: "✅ Mark Delivered",
};

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

function OwnerOrderCart({ order, onUpdateStatus, onCancel, updating, animDelay = 0 }) {
  if (!order) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"
  });

  const isUpdating = updating === order._id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }

        .ooc-card {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: white; border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1.5px solid rgba(255,255,255,0.9);
          margin-bottom: 16px; animation: fadeUp 0.4s ease both;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ooc-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(124,58,237,0.1); }

        .ooc-card-header {
          padding:14px 20px; display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:8px;
          border-bottom:1.5px solid #f9fafb;
          background:linear-gradient(135deg,#faf5ff,#fdf2f8);
        }
        .ooc-order-id { font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; color:#1a1a2e; }
        .ooc-order-date { font-size:11px; color:#9ca3af; font-weight:500; margin-top:2px; }
        .ooc-new-badge {
          background:linear-gradient(135deg,#f59e0b,#f97316); color:white;
          font-size:10px; font-weight:800; padding:3px 8px; border-radius:99px;
          animation:pulse 1.5s ease-in-out infinite; box-shadow:0 3px 10px rgba(245,158,11,0.4);
        }

        .ooc-customer {
          padding:12px 20px; border-bottom:1.5px solid #f9fafb;
          display:flex; align-items:center; gap:14px; flex-wrap:wrap; background:#fafafa;
        }
        .ooc-cust-item { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#374151; }

        /* ✅ Each shopOrder as separate section */
        .ooc-shop-section {
          border-bottom: 1.5px solid #f9fafb;
          padding: 14px 20px;
        }
        .ooc-shop-section:last-of-type { border-bottom: none; }

        .ooc-shop-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px; margin-bottom: 12px;
        }
        .ooc-shop-name {
          font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; color:#1a1a2e;
          display: flex; align-items: center; gap: 8px;
        }

        .ooc-items { display:flex; flex-wrap:wrap; gap:8px; margin-bottom: 12px; }
        .ooc-items-label { font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px; }
        .ooc-item-chip {
          display:flex; align-items:center; gap:6px; background:#f9fafb;
          border:1.5px solid #f3f4f6; border-radius:10px; padding:6px 10px;
          font-size:12px; font-weight:600; color:#374151;
        }
        .ooc-item-qty {
          background:linear-gradient(135deg,#7c3aed,#ff3cac); color:white;
          font-size:10px; font-weight:800; width:18px; height:18px; border-radius:99px;
          display:flex; align-items:center; justify-content:center;
        }

        /* ✅ Per-shop action row */
        .ooc-shop-actions {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:8px; padding-top: 10px;
          border-top: 1.5px solid #f9fafb;
        }
        .ooc-shop-subtotal {
          font-family:'Nunito',sans-serif; font-weight:900; font-size:16px;
          background:linear-gradient(135deg,#7c3aed,#ff3cac);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .ooc-btns { display:flex; gap:8px; flex-wrap:wrap; }

        .ooc-next-btn {
          display:flex; align-items:center; gap:6px;
          background:linear-gradient(135deg,#7c3aed,#ff3cac); color:white;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:800;
          padding:9px 16px; border-radius:10px; border:none; cursor:pointer;
          box-shadow:0 4px 14px rgba(124,58,237,0.35); transition:transform 0.15s,opacity 0.2s;
        }
        .ooc-next-btn:hover:not(:disabled) { transform:translateY(-1px); }
        .ooc-next-btn:disabled { opacity:0.6; cursor:not-allowed; }

        .ooc-cancel-btn {
          background:#fff5f5; border:1.5px solid rgba(239,68,68,0.2);
          color:#ef4444; font-size:12px; font-weight:700; padding:9px 14px;
          border-radius:10px; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
          transition:background 0.2s,transform 0.15s;
        }
        .ooc-cancel-btn:hover { background:#fee2e2; transform:translateY(-1px); }

        .ooc-spinner {
          width:14px; height:14px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.4); border-top:2px solid white;
          animation:spin 0.7s linear infinite; flex-shrink:0;
        }

        /* ✅ Order footer — total */
        .ooc-footer {
          padding:12px 20px; display:flex; align-items:center;
          justify-content:space-between; background: #fafafa;
          border-top: 1.5px solid #f3f4f6;
        }
        .ooc-total-label { font-size:12px; font-weight:600; color:#9ca3af; }
        .ooc-total {
          font-family:'Nunito',sans-serif; font-weight:900; font-size:18px;
          background:linear-gradient(135deg,#7c3aed,#ff3cac);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
      `}</style>

      <div className="ooc-card" style={{ animationDelay: `${animDelay}s` }}>

        {/* ORDER HEADER */}
        <div className="ooc-card-header">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="ooc-order-id">Order #{order._id?.slice(-6).toUpperCase()}</div>
              {order.shopOrders?.some(so => so.status === "pending") && (
                <span className="ooc-new-badge">NEW</span>
              )}
            </div>
            <div className="ooc-order-date">{formatDate(order.createdAt)}</div>
          </div>
          {/* Payment method */}
          <span style={{ fontSize:12, fontWeight:600, color:"#9ca3af" }}>
            {order.paymentMethod === "cod" ? "💵 COD" : order.paymentMethod === "upi" ? "📲 UPI" : "💳 Card"}
          </span>
        </div>

        {/* CUSTOMER INFO */}
        <div className="ooc-customer">
          <div className="ooc-cust-item">
            <FaUser size={11} style={{ color:"#7c3aed" }} />
            {order.user?.fullname || "Customer"}
          </div>
          {order.user?.phone && (
            <div className="ooc-cust-item">
              <FaPhone size={11} style={{ color:"#ff6b35" }} />
              {order.user.phone}
            </div>
          )}
          {order.deliveryAddress?.text && (
            <div className="ooc-cust-item" style={{ maxWidth:280, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              <FaMapMarkerAlt size={11} style={{ color:"#22c55e", flexShrink:0 }} />
              {order.deliveryAddress.text}
            </div>
          )}
        </div>

        {/* ✅ EACH SHOP ORDER SEPARATELY */}
        {order.shopOrders?.map((shopOrder, si) => {
          const isDone     = ["delivered","cancelled"].includes(shopOrder.status);
          const nextStatus = NEXT_STATUS[shopOrder.status];
          const shopId     = shopOrder.shop?._id || shopOrder.shop;

          return (
            <div key={si} className="ooc-shop-section">

              {/* Shop name + status */}
              <div className="ooc-shop-header">
                <div className="ooc-shop-name">
                  🍽️ {shopOrder.shop?.name || "Restaurant"}
                </div>
                <StatusBadge status={shopOrder.status} />
              </div>

              {/* Items */}
              <div className="ooc-items-label">
                {shopOrder.shopOrderItems?.length || 0} items
              </div>
              <div className="ooc-items">
                {shopOrder.shopOrderItems?.map((item, idx) => (
                  <div key={idx} className="ooc-item-chip">
                    <span style={{ fontSize:15 }}>🍽️</span>
                    <span>{item.name}</span>
                    <span className="ooc-item-qty">×{item.quantity}</span>
                    <span style={{ color:"#7c3aed", fontWeight:800, fontSize:11 }}>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* ✅ Per-shop action buttons */}
              <div className="ooc-shop-actions">
                <div className="ooc-shop-subtotal">₹{shopOrder.subtotal || 0}</div>

                {!isDone ? (
                  <div className="ooc-btns">
                    {["pending","confirmed"].includes(shopOrder.status) && (
                      <button
                        className="ooc-cancel-btn"
                        onClick={() => onCancel(order._id, shopId)}
                        disabled={isUpdating}
                      >
                        ✕ Cancel
                      </button>
                    )}
                    {nextStatus && (
                      <button
                        className="ooc-next-btn"
                        onClick={() =>{ 
                          console.log("🔴 Calling onUpdateStatus:", order._id, nextStatus, shopId);
                          onUpdateStatus(order._id, nextStatus, shopId)
                          
                        }}
                        disabled={isUpdating}
                      >
                        {isUpdating
                          ? <><span className="ooc-spinner" /> Updating…</>
                          : NEXT_LABEL[shopOrder.status]
                        }
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize:12, color:"#9ca3af", fontWeight:600 }}>
                    {shopOrder.status === "delivered" ? "✅ Completed" : "❌ Cancelled"}
                  </span>
                )}
              </div>

            </div>
          );
        })}

        {/* ORDER TOTAL FOOTER */}
        <div className="ooc-footer">
          <span className="ooc-total-label">Order Total</span>
          <span className="ooc-total">₹{order.totalAmount}</span>
        </div>

      </div>
    </>
  );
}

export default OwnerOrderCart;