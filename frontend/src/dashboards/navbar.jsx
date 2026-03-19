import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaSearch, FaCartPlus, FaTrash, FaBox } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUserData, addToCart, removeFromCart, clearCart } from "../redux/user_slice.js";
import { FaPlusSquare } from "react-icons/fa";
import { MdOutlineCallReceived } from "react-icons/md";
import { persistor } from "../redux/store.js";
import SearchDrawer from "../pages/Searchdrawer.jsx";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function Navbar() {
  const { userData, city: currentCity, CartItem } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart]   = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role      = userData?.role || userData?.user?.role || "";
  const cartCount = CartItem?.reduce((t, i) => t + (i.quantity || 0), 0) || 0;
  const cartTotal = CartItem?.reduce((t, i) => t + ((i.price || 0) * (i.quantity || 0)), 0) || 0;

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true });
    } catch {}
    dispatch(clearCart());
    dispatch(setUserData(null));
    persistor.purge().then(() => {
      localStorage.removeItem("token");
      navigate("/signin");
    });
  };

  const initials = (userData?.fullname?.slice(0, 1) || userData?.user?.fullname?.slice(0, 1) || "U").toUpperCase();
  const fullname  = userData?.fullname || userData?.user?.fullname || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .wx-nav-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .wx-nav-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 68px;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1.5px solid rgba(255,255,255,0.9); display: flex; align-items: center;
          padding: 0 20px; justify-content: space-between; box-shadow: 0 4px 24px rgba(255,100,50,0.08);
        }
        .wx-logo-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .wx-logo-icon { width: 36px; height: 36px; border-radius: 12px; background: linear-gradient(135deg, #ff6b35, #f7c948, #ff3cac); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(255,107,53,0.4); flex-shrink: 0; }
        .wx-logo-text { font-family: 'Nunito', sans-serif; font-size: 22px; font-weight: 900; background: linear-gradient(135deg, #ff6b35, #f7c948, #ff3cac); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .wx-city-pill { display: flex; align-items: center; gap: 5px; background: linear-gradient(135deg, #fff5f0, #fff0f8); border: 1.5px solid rgba(255,107,53,0.2); border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: #ff6b35; cursor: pointer; transition: box-shadow 0.2s; }
        .wx-city-pill:hover { box-shadow: 0 4px 12px rgba(255,107,53,0.2); }
        .wx-nav-actions { display: flex; align-items: center; gap: 8px; }
        .wx-icon-btn { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; border: none; background: transparent; position: relative; }
        .wx-icon-btn:hover { transform: translateY(-1px); }
        .wx-icon-btn.pink   { background: linear-gradient(135deg, #ff3cac, #ff6b9d); box-shadow: 0 4px 12px rgba(255,60,172,0.35); }
        .wx-icon-btn.orange { background: linear-gradient(135deg, #ff6b35, #ff9a3c); box-shadow: 0 4px 12px rgba(255,107,53,0.35); }
        .wx-icon-btn.ghost  { background: #f8f5ff; border: 1.5px solid #ede8ff; color: #888; }
        .wx-icon-btn.ghost:hover { background: #f0ebff; }
        .wx-badge { position: absolute; top: -4px; right: -4px; background: linear-gradient(135deg, #ff3cac, #ff6b35); color: white; font-size: 9px; font-weight: 800; min-width: 17px; height: 17px; border-radius: 99px; display: flex; align-items: center; justify-content: center; border: 2px solid white; animation: popIn 0.25s ease; }
        @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
        .wx-pill-btn { display: flex; align-items: center; gap: 6px; border-radius: 12px; padding: 0 14px; height: 38px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: transform 0.15s, box-shadow 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .wx-pill-btn:hover { transform: translateY(-1px); }
        .wx-pill-btn.orange { background: linear-gradient(135deg, #ff6b35, #ff9a3c); color: white; box-shadow: 0 4px 14px rgba(255,107,53,0.35); }
        .wx-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #ff6b35, #f7c948, #ff3cac); display: flex; align-items: center; justify-content: center; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(255,107,53,0.4); transition: transform 0.15s, box-shadow 0.2s; border: 2px solid white; flex-shrink: 0; }
        .wx-avatar:hover { transform: scale(1.08); box-shadow: 0 6px 18px rgba(255,107,53,0.5); }
        .wx-dropdown { position: absolute; right: 16px; top: 76px; background: white; border-radius: 20px; padding: 8px; width: 200px; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1.5px rgba(255,107,53,0.1); z-index: 200; animation: dropIn 0.18s ease; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .wx-dropdown-header { padding: 10px 12px 8px; border-bottom: 1.5px solid #f3f4f6; margin-bottom: 6px; }
        .wx-dropdown-name { font-weight: 700; font-size: 14px; color: #1a1a2e; }
        .wx-dropdown-role { font-size: 11px; font-weight: 600; margin-top: 2px; display: inline-block; padding: 2px 8px; border-radius: 99px; background: linear-gradient(135deg, #fff0f5, #fff5f0); color: #ff6b35; }
        .wx-dropdown-item { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: background 0.15s, color 0.15s; }
        .wx-dropdown-item:hover { background: #fff5f0; color: #ff6b35; }
        .wx-dropdown-item.danger { color: #ef4444; }
        .wx-dropdown-item.danger:hover { background: #fff5f5; color: #dc2626; }
        .wx-cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(4px); z-index: 300; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .wx-cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(400px, 100vw); background: linear-gradient(160deg, #fff9f5 0%, #fdf8ff 100%); z-index: 301; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.15); animation: slideIn 0.3s cubic-bezier(0.34,1.06,0.64,1); }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .wx-cart-header { padding: 20px 20px 16px; border-bottom: 1.5px solid rgba(255,107,53,0.1); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); flex-shrink: 0; }
        .wx-cart-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 20px; background: linear-gradient(135deg, #ff6b35, #ff3cac); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .wx-cart-close { width: 34px; height: 34px; border-radius: 10px; background: #fff0f5; border: 1.5px solid #fecdd3; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
        .wx-cart-close:hover { background: #fce7f3; }
        .wx-cart-body { flex: 1; overflow-y: auto; padding: 16px; }
        .wx-cart-body::-webkit-scrollbar { width: 4px; }
        .wx-cart-body::-webkit-scrollbar-thumb { background: rgba(255,107,53,0.2); border-radius: 4px; }
        .wx-cart-item { background: white; border-radius: 16px; padding: 12px 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1.5px solid rgba(255,255,255,0.9); transition: transform 0.2s; }
        .wx-cart-item:hover { transform: translateY(-1px); }
        .wx-cart-item-img { width: 54px; height: 54px; border-radius: 12px; object-fit: cover; flex-shrink: 0; background: linear-gradient(135deg, #fff5f0, #fff0f8); }
        .wx-cart-item-info { flex: 1; min-width: 0; }
        .wx-cart-item-name { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 13px; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wx-cart-item-price { font-size: 12px; font-weight: 700; margin-top: 2px; background: linear-gradient(135deg, #ff6b35, #ff3cac); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .wx-cart-qty { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .wx-cart-qty-btn { width: 26px; height: 26px; border-radius: 8px; border: none; background: linear-gradient(135deg, #ff6b35, #ff3cac); color: white; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(255,107,53,0.3); transition: transform 0.15s; }
        .wx-cart-qty-btn:hover { transform: scale(1.1); }
        .wx-cart-qty-num { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 14px; color: #ff6b35; min-width: 16px; text-align: center; }
        .wx-cart-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px 20px; text-align: center; }
        .wx-cart-empty-emoji { font-size: 56px; }
        .wx-cart-empty-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 18px; color: #1a1a2e; }
        .wx-cart-empty-sub { font-size: 13px; color: #9ca3af; font-weight: 500; max-width: 220px; }
        .wx-cart-footer { padding: 16px 20px; flex-shrink: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-top: 1.5px solid rgba(255,107,53,0.1); }
        .wx-cart-total-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .wx-cart-total-lbl { font-size: 13px; font-weight: 600; color: #6b7280; }
        .wx-cart-total-amt { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 20px; background: linear-gradient(135deg, #ff6b35, #ff3cac); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .wx-checkout-btn { width: 100%; padding: 14px; border: none; border-radius: 14px; background: linear-gradient(135deg, #ff6b35, #ff3cac); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 20px rgba(255,107,53,0.4); transition: transform 0.15s, box-shadow 0.2s; }
        .wx-checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,107,53,0.5); }
      `}</style>

      <div className="wx-nav-root">
        <div className="wx-nav-bar">

          {/* LEFT */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="wx-logo-wrap" onClick={() => navigate("/")}>
              <div className="wx-logo-icon">🔥</div>
              <span className="wx-logo-text">WingX</span>
            </div>
            <div className="wx-city-pill">
              <FaLocationDot style={{ fontSize: 11 }} />
              {currentCity || "Select City"}
            </div>
          </div>

          {/* RIGHT */}
          <div className="wx-nav-actions">

            {/* ── OWNER ── */}
            {role?.toLowerCase() === "owner" && (
              <>
                {myShopData && (
                  <button className="wx-pill-btn orange" onClick={() => navigate("/add-item")}>
                    <FaPlusSquare size={13} />
                    <span className="hidden sm:inline">Add Item</span>
                  </button>
                )}
                <div
                  className="wx-icon-btn"
                  style={{ background: "linear-gradient(135deg,#14b8a6,#2dd4bf)", boxShadow: "0 4px 12px rgba(20,184,166,0.35)", cursor: "pointer" }}
                  onClick={() => navigate("/my-orders")}
                  title="Incoming Orders"
                >
                  <MdOutlineCallReceived size={16} color="white" />
                </div>
              </>
            )}

            {/* ── USER ── */}
            {role?.toLowerCase() === "user" && (
              <>
                {/* ✅ Search button — SearchDrawer open karo */}
                <button
                  className="wx-icon-btn ghost"
                  onClick={() => setShowSearch(true)}
                  title="Search"
                >
                  <FaSearch style={{ color: "#a78bfa", fontSize: 14 }} />
                </button>

                <button
                  className="wx-icon-btn orange"
                  onClick={() => navigate("/my-orders")}
                  title="My Orders"
                >
                  <FaBox size={14} color="white" />
                </button>

                <div
                  className="wx-icon-btn pink"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowCart(true)}
                  title="Cart"
                >
                  <FaCartPlus size={15} color="white" />
                  {cartCount > 0 && (
                    <span className="wx-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                  )}
                </div>
              </>
            )}

            {/* AVATAR */}
            <div className="wx-avatar" onClick={() => setShowInfo(!showInfo)}>
              {initials}
            </div>
          </div>
        </div>

        {/* DROPDOWN */}
        {showInfo && (
          <div className="wx-dropdown">
            <div className="wx-dropdown-header">
              <div className="wx-dropdown-name">{fullname}</div>
              <div className="wx-dropdown-role">{role}</div>
            </div>
            <div className="wx-dropdown-item" onClick={() => { navigate("/my-orders"); setShowInfo(false); }}>
              {role?.toLowerCase() === "owner" ? "📬 Incoming Orders" : "📦 My Orders"}
            </div>
            {role?.toLowerCase() === "user" && (
              <div className="wx-dropdown-item" onClick={() => { navigate("/scanner"); setShowInfo(false); }}>
                📸 Food Scanner
              </div>
            )}
            <div className="wx-dropdown-item danger" onClick={handleLogout}>
              🚪 Sign out
            </div>
          </div>
        )}

        {/* ✅ SEARCH DRAWER */}
        {showSearch && (
          <SearchDrawer onClose={() => setShowSearch(false)} />
        )}

        {/* CART DRAWER */}
        {showCart && (
          <>
            <div className="wx-cart-overlay" onClick={() => setShowCart(false)} />
            <div className="wx-cart-drawer">
              <div className="wx-cart-header">
                <div>
                  <div className="wx-cart-title">🛒 Your Cart</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, marginTop: 2 }}>
                    {cartCount} item{cartCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="wx-cart-close" onClick={() => setShowCart(false)}>
                  <ImCross style={{ color: "#f43f5e", fontSize: 10 }} />
                </div>
              </div>

              {!CartItem || CartItem.length === 0 ? (
                <div className="wx-cart-empty">
                  <div className="wx-cart-empty-emoji">🍽️</div>
                  <div className="wx-cart-empty-title">Cart is empty!</div>
                  <div className="wx-cart-empty-sub">Add some delicious food to get started.</div>
                  <button onClick={() => setShowCart(false)} style={{ marginTop: 8, padding: "10px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #ff6b35, #ff3cac)", color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                    Browse Food →
                  </button>
                </div>
              ) : (
                <div className="wx-cart-body">
                  {CartItem.map((item) => (
                    <div key={item.id} className="wx-cart-item">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="wx-cart-item-img" />
                        : <div className="wx-cart-item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🍽️</div>
                      }
                      <div className="wx-cart-item-info">
                        <div className="wx-cart-item-name">{item.name}</div>
                        <div className="wx-cart-item-price">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</div>
                      </div>
                      <div className="wx-cart-qty">
                        <button className="wx-cart-qty-btn" onClick={() => dispatch(removeFromCart(item.id))}>−</button>
                        <span className="wx-cart-qty-num">{item.quantity}</span>
                        <button className="wx-cart-qty-btn" onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {CartItem && CartItem.length > 0 && (
                <div className="wx-cart-footer">
                  <div className="wx-cart-total-row">
                    <span className="wx-cart-total-lbl">Total ({cartCount} items)</span>
                    <span className="wx-cart-total-amt">₹{cartTotal}</span>
                  </div>
                  <button className="wx-checkout-btn" onClick={() => { setShowCart(false); navigate("/cart-page"); }}>
                    Proceed to Checkout →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Navbar;