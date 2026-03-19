import React, { useEffect, useState } from "react";
import Navbar from "./navbar.jsx";
import { useSelector } from "react-redux";
import { FaUtensils, FaStore, FaChartLine, FaEdit, FaPlusCircle, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCart from "./Owner_Item_Cart.jsx";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const firstName = (userData?.fullname || userData?.user?.fullname || "Partner").split(" ")[0];

  // ✅ Pending orders count
  const [pendingCount, setPendingCount]     = useState(0);
  const [todayOrders, setTodayOrders]       = useState(0);
  const [todayRevenue, setTodayRevenue]     = useState(0);

  useEffect(() => {
    axios.get(`${serverUrl}/api/order/owner-orders`, { withCredentials: true })
      .then(res => {
        const orders = res.data || [];
        const pending = orders.filter(o => o.status === "pending").length;
        const today = new Date().toDateString();
        const todayArr = orders.filter(o => new Date(o.createdAt).toDateString() === today);
        setPendingCount(pending);
        setTodayOrders(todayArr.length);
        setTodayRevenue(todayArr.filter(o => o.status !== "cancelled").reduce((t, o) => t + (o.totalAmount || 0), 0));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .wx-od-root { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; background: linear-gradient(145deg, #fff9f5 0%, #fdf8ff 40%, #f0fdf9 100%); }
        .wx-od-hero { border-radius: 24px; padding: 32px 36px; background: linear-gradient(120deg, #7c3aed 0%, #ff3cac 55%, #ff6b35 100%); position: relative; overflow: hidden; box-shadow: 0 12px 40px rgba(124,58,237,0.3); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .wx-od-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 80% 40%, rgba(255,255,255,0.15), transparent 55%); pointer-events: none; }
        .wx-od-eyebrow { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 99px; padding: 4px 14px; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin-bottom: 10px; }
        .wx-od-title { font-family: 'Nunito', sans-serif; font-size: clamp(22px, 3.5vw, 36px); font-weight: 900; color: white; line-height: 1.15; margin-bottom: 8px; }
        .wx-od-sub { font-size: 13px; color: rgba(255,255,255,0.75); max-width: 420px; line-height: 1.6; }
        .wx-od-hero-emoji { font-size: clamp(48px, 7vw, 72px); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25)); flex-shrink: 0; }
        .wx-od-stat-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
        .wx-od-stat { background: white; border-radius: 16px; padding: 14px 20px; flex: 1; min-width: 100px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1.5px solid rgba(255,255,255,0.9); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .wx-od-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
        .wx-od-stat-num { font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 900; }
        .wx-od-stat-lbl { font-size: 12px; font-weight: 600; color: #9ca3af; margin-top: 2px; }

        /* ✅ Pending badge animation */
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .wx-od-stat.pending-active { border-color: rgba(245,158,11,0.4); animation: pulse 2s ease-in-out infinite; }

        .wx-od-action-card { background: white; border-radius: 20px; padding: 22px 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1.5px solid rgba(255,255,255,0.9); cursor: pointer; transition: transform 0.25s, box-shadow 0.25s; position: relative; overflow: hidden; }
        .wx-od-action-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 20px 20px 0 0; }
        .wx-od-action-card.orange::before { background: linear-gradient(90deg,#ff6b35,#ff9a3c); }
        .wx-od-action-card.pink::before   { background: linear-gradient(90deg,#ff3cac,#a855f7); }
        .wx-od-action-card.teal::before   { background: linear-gradient(90deg,#14b8a6,#22c55e); }
        .wx-od-action-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .wx-od-action-icon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; font-size: 20px; }
        .wx-od-action-card.orange .wx-od-action-icon { background: linear-gradient(135deg,#fff5f0,#ffe8d6); }
        .wx-od-action-card.pink   .wx-od-action-icon { background: linear-gradient(135deg,#fdf2f8,#fce7f3); }
        .wx-od-action-card.teal   .wx-od-action-icon { background: linear-gradient(135deg,#f0fdfa,#dcfce7); }
        .wx-od-action-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #1a1a2e; margin-bottom: 6px; }
        .wx-od-action-desc { font-size: 12px; color: #9ca3af; line-height: 1.6; }
        .wx-od-action-cta { margin-top: 14px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 4px; }
        .wx-od-action-card.orange .wx-od-action-cta { color: #ff6b35; }
        .wx-od-action-card.pink   .wx-od-action-cta { color: #ff3cac; }
        .wx-od-action-card.teal   .wx-od-action-cta { color: #14b8a6; }

        .wx-od-create-wrap { border-radius: 24px; padding: 2px; background: linear-gradient(135deg, #ff6b35, #ff3cac, #7c3aed); box-shadow: 0 12px 40px rgba(255,60,172,0.25); }
        .wx-od-create-inner { background: white; border-radius: 22px; padding: 36px 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center; }
        @media(min-width:640px) { .wx-od-create-inner { flex-direction: row; text-align: left; } }
        .wx-od-create-icon { width: 72px; height: 72px; border-radius: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, #ff6b35, #ff3cac); box-shadow: 0 8px 24px rgba(255,107,53,0.4); }
        .wx-od-create-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: clamp(18px,3vw,24px); color: #1a1a2e; margin-bottom: 6px; }
        .wx-od-create-desc { font-size: 13px; color: #9ca3af; line-height: 1.6; max-width: 420px; }
        .wx-od-create-btn { flex-shrink: 0; background: linear-gradient(135deg, #ff6b35, #ff3cac); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 14px; border: none; border-radius: 14px; padding: 12px 28px; cursor: pointer; box-shadow: 0 6px 20px rgba(255,107,53,0.4); transition: transform 0.15s; }
        .wx-od-create-btn:hover { transform: translateY(-2px); }

        .wx-od-shop-banner { border-radius: 24px; overflow: hidden; background: linear-gradient(120deg, #7c3aed 0%, #ff3cac 55%, #ff6b35 100%); box-shadow: 0 12px 40px rgba(124,58,237,0.25); }
        .wx-od-shop-top { padding: 24px 28px 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
        .wx-od-shop-live { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.75); margin-bottom: 6px; }
        .wx-od-shop-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: clamp(20px,3.5vw,30px); color: white; }
        .wx-od-shop-loc { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 4px; display: flex; align-items: center; gap: 5px; }
        .wx-od-edit-btn { background: white; color: #7c3aed; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 13px; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); transition: transform 0.15s; }
        .wx-od-edit-btn:hover { transform: scale(1.04); }
        .wx-od-shop-card { margin: 0 16px 20px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 18px; padding: 16px 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 16px; backdrop-filter: blur(8px); }
        .wx-od-shop-img { width: 72px; height: 72px; border-radius: 16px; object-fit: cover; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.5); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
        .wx-od-shop-tag { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px; }
        .wx-od-section-hd { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: clamp(17px,3vw,22px); color: #1a1a2e; }
        .wx-od-section-sub { font-size: 12px; font-weight: 600; color: #9ca3af; margin-top: 2px; }
        .wx-od-add-btn { display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #ff6b35, #ff3cac); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 13px; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 16px rgba(255,107,53,0.4); transition: transform 0.15s; }
        .wx-od-add-btn:hover { transform: translateY(-2px); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .wx-fade-up   { animation: fadeUp 0.45s ease both; }
        .wx-fade-up-2 { animation: fadeUp 0.45s 0.08s ease both; }
        .wx-fade-up-3 { animation: fadeUp 0.45s 0.16s ease both; }

        /* ✅ Incoming orders alert strip */
        .wx-od-alert {
          background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.1));
          border: 1.5px solid rgba(245,158,11,0.3);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-bottom: 20px; cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s;
          animation: fadeUp 0.4s ease both;
        }
        .wx-od-alert:hover { box-shadow: 0 6px 20px rgba(245,158,11,0.2); transform: translateY(-1px); }
        .wx-od-alert-text { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 14px; color: #92400e; }
        .wx-od-alert-sub { font-size: 12px; color: #b45309; font-weight: 500; margin-top: 2px; }
        .wx-od-alert-btn { background: linear-gradient(135deg, #f59e0b, #f97316); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 12px rgba(245,158,11,0.4); transition: transform 0.15s; flex-shrink: 0; }
        .wx-od-alert-btn:hover { transform: scale(1.04); }
      `}</style>

      <div className="wx-od-root">
        <Navbar />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 box-border"
          style={{ paddingTop: "clamp(84px,11vw,96px)", paddingBottom: 60 }}>

          {/* ── HERO ── */}
          <div className="wx-od-hero wx-fade-up" style={{ marginBottom: 20 }}>
            <div>
              <div className="wx-od-eyebrow">🔥 WingX Partner Portal</div>
              <div className="wx-od-title">Welcome back,<br />{firstName}! 🚀</div>
              <div className="wx-od-sub">Manage your restaurant, track orders, and grow your business.</div>
            </div>
            <div className="wx-od-hero-emoji">🍽️</div>
          </div>

          {/* ✅ PENDING ORDERS ALERT — sirf tab dikhao jab pending > 0 */}
          {pendingCount > 0 && (
            <div className="wx-od-alert" onClick={() => navigate("/my-orders")}>
              <div>
                <div className="wx-od-alert-text">🔔 {pendingCount} new order{pendingCount > 1 ? "s" : ""} waiting!</div>
                <div className="wx-od-alert-sub">Customers are waiting — accept and start preparing</div>
              </div>
              <button className="wx-od-alert-btn">View Orders →</button>
            </div>
          )}

          {/* ── STAT CHIPS ── */}
          {myShopData && (
            <div className="wx-od-stat-row wx-fade-up-2" style={{ marginBottom: 24 }}>
              <div
                className={`wx-od-stat ${pendingCount > 0 ? "pending-active" : ""}`}
                onClick={() => navigate("/my-orders")}
              >
                <div className="wx-od-stat-num" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {pendingCount}
                </div>
                <div className="wx-od-stat-lbl">Pending 🔔</div>
              </div>
              <div className="wx-od-stat" onClick={() => navigate("/my-orders")}>
                <div className="wx-od-stat-num" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {todayOrders}
                </div>
                <div className="wx-od-stat-lbl">Today's Orders</div>
              </div>
              <div className="wx-od-stat">
                <div className="wx-od-stat-num" style={{ background: "linear-gradient(135deg,#ff6b35,#ff3cac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {myShopData.items?.length || 0}
                </div>
                <div className="wx-od-stat-lbl">Menu Items</div>
              </div>
              <div className="wx-od-stat">
                <div className="wx-od-stat-num" style={{ background: "linear-gradient(135deg,#22c55e,#14b8a6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ₹{todayRevenue}
                </div>
                <div className="wx-od-stat-lbl">Today's Revenue</div>
              </div>
            </div>
          )}

          {/* ── NO SHOP ── */}
          {!myShopData && (
            <div className="wx-od-create-wrap wx-fade-up-2" style={{ marginBottom: 28 }}>
              <div className="wx-od-create-inner">
                <div className="wx-od-create-icon">🍴</div>
                <div style={{ flex: 1 }}>
                  <div className="wx-od-create-title">Start Your Restaurant Journey 🍽️</div>
                  <div className="wx-od-create-desc">Add your restaurant to WingX and start receiving orders from customers near you.</div>
                </div>
                <button className="wx-od-create-btn" onClick={() => navigate("/create-edit-shop")}>+ Create Shop</button>
              </div>
            </div>
          )}

          {/* ── ACTION CARDS ── */}
          {myShopData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 wx-fade-up-3" style={{ marginBottom: 28 }}>
              <div className="wx-od-action-card orange" onClick={() => navigate("/add-item")}>
                <div className="wx-od-action-icon">🛒</div>
                <div className="wx-od-action-title">Manage Menu</div>
                <div className="wx-od-action-desc">Add items, edit prices, update images and manage subscription plans.</div>
                <div className="wx-od-action-cta">Open Menu <span>→</span></div>
              </div>
              {/* ✅ Track Orders card — navigate add kiya */}
              <div className="wx-od-action-card pink" onClick={() => navigate("/my-orders")}>
                <div className="wx-od-action-icon">📊</div>
                <div className="wx-od-action-title">
                  Track Orders
                  {pendingCount > 0 && (
                    <span style={{ marginLeft: 8, background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99, verticalAlign: "middle" }}>
                      {pendingCount} new
                    </span>
                  )}
                </div>
                <div className="wx-od-action-desc">View incoming orders, mark deliveries and monitor daily performance.</div>
                <div className="wx-od-action-cta">View Orders <span>→</span></div>
              </div>
              <div className="wx-od-action-card teal">
                <div className="wx-od-action-icon">🌱</div>
                <div className="wx-od-action-title">Grow Business</div>
                <div className="wx-od-action-desc">Offer weekly and monthly meal subscriptions to boost customer loyalty.</div>
                <div className="wx-od-action-cta">Explore Plans <span>→</span></div>
              </div>
            </div>
          )}

          {/* ── SHOP BANNER ── */}
          {myShopData && (
            <div className="wx-od-shop-banner" style={{ marginBottom: 32 }}>
              <div className="wx-od-shop-top">
                <div>
                  <div className="wx-od-shop-live">🟢 Live on WingX</div>
                  <div className="wx-od-shop-name">{myShopData.name}</div>
                  <div className="wx-od-shop-loc"><FaMapMarkerAlt size={11} />{myShopData.city}, {myShopData.state}</div>
                </div>
                <button className="wx-od-edit-btn" onClick={() => navigate("/create-edit-shop")}>
                  <FaEdit size={12} /> Edit Shop
                </button>
              </div>
              <div className="wx-od-shop-card">
                <img src={myShopData.image} alt={myShopData.name} className="wx-od-shop-img" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, color: "white", fontSize: 16 }}>{myShopData.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{myShopData.address}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    <span className="wx-od-shop-tag" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>{myShopData.items?.length || 0} Items</span>
                    <span className="wx-od-shop-tag" style={{ background: "rgba(74,222,128,0.25)", color: "#bbf7d0" }}>✓ Active</span>
                  </div>
                </div>
                {myShopData.items?.length === 0 && (
                  <button className="wx-od-add-btn" onClick={() => navigate("/add-item")}>
                    <FaPlusCircle size={13} /> Add First Item
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── ITEMS GRID ── */}
          {myShopData && myShopData.items?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div className="wx-od-section-hd">Your Menu 🍽️</div>
                  <div className="wx-od-section-sub">{myShopData.items.length} item{myShopData.items.length !== 1 ? "s" : ""} on WingX</div>
                </div>
                <button className="wx-od-add-btn" onClick={() => navigate("/add-item")}>
                  <FaPlusCircle size={13} /> Add Item
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {myShopData.items.map((item) => (
                  <OwnerItemCart key={item._id} data={item} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default OwnerDashboard;