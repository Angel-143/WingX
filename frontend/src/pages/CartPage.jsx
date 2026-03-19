import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart, clearCart } from "../redux/user_slice.js";
import Navbar from "../dashboards/navbar.jsx";
import { FaLeaf, FaDrumstickBite, FaTrash, FaArrowLeft } from "react-icons/fa";



function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const CartItem = useSelector((state) => state.user.CartItem) || [];

  const cartCount = CartItem.reduce((t, i) => t + (i.quantity || 0), 0);
  const subtotal  = CartItem.reduce((t, i) => t + ((i.price || 0) * (i.quantity || 0)), 0);
  const delivery  = subtotal > 0 ? 40 : 0;
  const taxes     = Math.round(subtotal * 0.05);
  const total     = subtotal + delivery + taxes;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .cp-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(145deg, #fff9f5 0%, #fdf8ff 40%, #f0fdf9 100%);
        }

        /* ── BLOBS ── */
        .cp-blob {
          position: fixed; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }

        /* ── LAYOUT ── */
        .cp-container {
          max-width: 1100px; margin: 0 auto;
          padding: clamp(84px,11vw,96px) 16px 60px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px; align-items: start;
          position: relative; z-index: 1;
        }
        @media(max-width: 768px) {
          .cp-container { grid-template-columns: 1fr; }
          .cp-summary-col { order: -1; }
        }

        /* ── PAGE HEADER ── */
        .cp-header {
          grid-column: 1 / -1;
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 4px;
        }
        .cp-back-btn {
          width: 40px; height: 40px; border-radius: 12px; border: none;
          background: white; display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1.5px solid rgba(255,107,53,0.15);
          transition: transform 0.15s, box-shadow 0.2s; color: #ff6b35;
          flex-shrink: 0;
        }
        .cp-back-btn:hover { transform: translateX(-2px); box-shadow: 0 4px 16px rgba(255,107,53,0.2); }
        .cp-page-title {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(22px, 4vw, 32px);
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .cp-page-sub { font-size: 13px; color: #9ca3af; font-weight: 500; margin-top: 2px; }

        /* ── ITEMS PANEL ── */
        .cp-items-panel {
          background: white; border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.9);
          overflow: hidden;
        }
        .cp-items-header {
          padding: 18px 20px;
          border-bottom: 1.5px solid #f9fafb;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cp-items-title {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 16px; color: #1a1a2e;
        }
        .cp-clear-btn {
          display: flex; align-items: center; gap: 5px;
          background: #fff5f5; border: 1.5px solid rgba(239,68,68,0.2);
          color: #ef4444; font-size: 11px; font-weight: 700;
          padding: 5px 12px; border-radius: 8px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.2s, transform 0.15s;
        }
        .cp-clear-btn:hover { background: #fee2e2; transform: scale(1.03); }

        /* ── CART ITEM ── */
        .cp-item {
          padding: 16px 20px;
          display: flex; align-items: center; gap: 14px;
          border-bottom: 1.5px solid #f9fafb;
          transition: background 0.2s;
          animation: fadeUp 0.35s ease both;
        }
        .cp-item:last-child { border-bottom: none; }
        .cp-item:hover { background: #fffaf8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .cp-item-img {
          width: 68px; height: 68px; border-radius: 16px;
          object-fit: cover; flex-shrink: 0;
          background: linear-gradient(135deg, #fff5f0, #fff0f8);
        }
        .cp-item-img-placeholder {
          width: 68px; height: 68px; border-radius: 16px; flex-shrink: 0;
          background: linear-gradient(135deg, #fff5f0, #fff0f8);
          display: flex; align-items: center; justify-content: center; font-size: 28px;
        }

        .cp-item-info { flex: 1; min-width: 0; }
        .cp-item-name {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 14px; color: #1a1a2e;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
        }
        .cp-item-type {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; margin-bottom: 6px;
        }
        .cp-item-type.veg { background: rgba(34,197,94,0.1); border: 1.5px solid rgba(34,197,94,0.25); color: #16a34a; }
        .cp-item-type.nonveg { background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.2); color: #dc2626; }

        .cp-item-price {
          font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 13px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .cp-item-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        .cp-qty-ctrl { display: flex; align-items: center; gap: 8px; }
        .cp-qty-btn {
          width: 30px; height: 30px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; font-size: 16px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 3px 10px rgba(255,107,53,0.35);
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .cp-qty-btn:hover { transform: scale(1.1); box-shadow: 0 5px 14px rgba(255,107,53,0.45); }
        .cp-qty-num {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 16px;
          color: #ff6b35; min-width: 20px; text-align: center;
        }

        .cp-item-total {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #1a1a2e;
          min-width: 64px; text-align: right;
        }

        .cp-del-btn {
          width: 30px; height: 30px; border-radius: 10px; border: none;
          background: #fff5f5; color: #ef4444;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          border: 1.5px solid rgba(239,68,68,0.15);
        }
        .cp-del-btn:hover { background: #fee2e2; transform: scale(1.08); }

        /* ── SUMMARY CARD ── */
        .cp-summary {
          background: white; border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.9);
          overflow: hidden;
          position: sticky; top: 88px;
        }
        .cp-summary-header {
          padding: 18px 20px 14px;
          border-bottom: 1.5px solid #f9fafb;
        }
        .cp-summary-title {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 16px; color: #1a1a2e;
        }
        .cp-summary-body { padding: 16px 20px; }

        .cp-summary-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px; font-size: 13px;
        }
        .cp-summary-lbl { color: #6b7280; font-weight: 500; }
        .cp-summary-val { font-weight: 700; color: #1a1a2e; }
        .cp-summary-val.free { color: #22c55e; }

        .cp-summary-divider { height: 1.5px; background: #f9fafb; margin: 14px 0; }

        .cp-summary-total-row {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
        }
        .cp-summary-total-lbl { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #1a1a2e; }
        .cp-summary-total-amt {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 22px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .cp-checkout-btn {
          width: 100%; padding: 14px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 800; cursor: pointer;
          box-shadow: 0 6px 20px rgba(255,107,53,0.4);
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .cp-checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,107,53,0.5); }

        /* promo input */
        .cp-promo-wrap {
          display: flex; gap: 8px; margin-top: 14px;
        }
        .cp-promo-input {
          flex: 1; background: #f8f5ff; border: 1.5px solid #ede8ff; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; font-weight: 500; color: #1a1a2e;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
          transition: border-color 0.2s;
        }
        .cp-promo-input::placeholder { color: #c4b5fd; }
        .cp-promo-input:focus { border-color: #a855f7; }
        .cp-promo-btn {
          padding: 10px 16px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #a855f7, #c084fc);
          color: white; font-size: 12px; font-weight: 800;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 3px 10px rgba(168,85,247,0.35);
          transition: transform 0.15s;
        }
        .cp-promo-btn:hover { transform: translateY(-1px); }

        /* ── EMPTY STATE ── */
        .cp-empty {
          grid-column: 1 / -1;
          background: white; border-radius: 24px;
          padding: 80px 24px; text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.9);
        }
        .cp-empty-emoji { font-size: 72px; margin-bottom: 20px; }
        .cp-empty-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 24px; color: #1a1a2e; margin-bottom: 8px; }
        .cp-empty-sub { font-size: 14px; color: #9ca3af; font-weight: 500; max-width: 280px; margin: 0 auto 24px; line-height: 1.6; }
        .cp-browse-btn {
          display: inline-block; padding: 13px 32px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 800; cursor: pointer;
          box-shadow: 0 6px 20px rgba(255,107,53,0.4);
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .cp-browse-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,107,53,0.5); }

        /* ── SAVINGS CHIP ── */
        .cp-savings-chip {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(20,184,166,0.1));
          border: 1.5px solid rgba(34,197,94,0.25);
          border-radius: 10px; padding: 8px 12px; margin-top: 12px;
          font-size: 12px; font-weight: 700; color: #16a34a;
        }
      `}</style>

      <div className="cp-root">
        {/* Background blobs */}
        <div className="cp-blob" style={{ width: 400, height: 400, background: "rgba(255,107,53,0.1)", top: "5%", left: "-5%" }} />
        <div className="cp-blob" style={{ width: 300, height: 300, background: "rgba(255,60,172,0.08)", bottom: "10%", right: "-5%" }} />

        <Navbar />

        <div className="cp-container">

          {/* ── PAGE HEADER ── */}
          <div className="cp-header">
            <button className="cp-back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft size={14} />
            </button>
            <div>
              <div className="cp-page-title">🛒 Your Cart</div>
              <div className="cp-page-sub">
                {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? "s" : ""} added` : "No items yet"}
              </div>
            </div>
          </div>

          {/* ── EMPTY STATE ── */}
          {CartItem.length === 0 && (
            <div className="cp-empty">
              <div className="cp-empty-emoji">🍽️</div>
              <div className="cp-empty-title">Your cart is empty!</div>
              <div className="cp-empty-sub">Looks like you haven't added anything yet. Explore restaurants and add your favourite dishes!</div>
              <button className="cp-browse-btn" onClick={() => navigate("/")}>
                Browse Food →
              </button>
            </div>
          )}

          {/* ── ITEMS LIST ── */}
          {CartItem.length > 0 && (
            <>
              <div className="cp-items-panel">
                <div className="cp-items-header">
                  <div className="cp-items-title">Order Items ({cartCount})</div>
                  <button className="cp-clear-btn" onClick={() => dispatch(clearCart())}>
                    <FaTrash size={9} /> Clear All
                  </button>
                </div>

                {CartItem.map((item, idx) => (
                  <div className="cp-item" key={item.id} style={{ animationDelay: `${idx * 0.06}s` }}>
                    {/* Image */}
                    {item.image
                      ? <img src={item.image} alt={item.name} className="cp-item-img" />
                      : <div className="cp-item-img-placeholder">🍽️</div>
                    }

                    {/* Info */}
                    <div className="cp-item-info">
                      <div className="cp-item-name">{item.name}</div>
                      <div className={`cp-item-type ${item.foodtype === "veg" ? "veg" : "nonveg"}`}>
                        {item.foodtype === "veg" ? <FaLeaf size={7} /> : <FaDrumstickBite size={7} />}
                        {item.foodtype === "veg" ? "Veg" : "Non-Veg"}
                      </div>
                      <div className="cp-item-price">₹{item.price} per item</div>
                    </div>

                    {/* Right side */}
                    <div className="cp-item-right">
                      {/* Qty controls */}
                      <div className="cp-qty-ctrl">
                        <button className="cp-qty-btn" onClick={() => dispatch(removeFromCart(item.id))}>−</button>
                        <span className="cp-qty-num">{item.quantity}</span>
                        <button className="cp-qty-btn" onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}>+</button>
                      </div>

                      {/* Item total */}
                      <div className="cp-item-total">₹{item.price * item.quantity}</div>

                      {/* Delete */}
                      <button
                        className="cp-del-btn"
                        onClick={() => {
                          // Ek ek karke remove karo jab tak quantity 0 na ho
                          for (let i = 0; i < item.quantity; i++) dispatch(removeFromCart(item.id));
                        }}
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── ORDER SUMMARY ── */}
              <div className="cp-summary cp-summary-col">
                <div className="cp-summary-header">
                  <div className="cp-summary-title">Order Summary</div>
                </div>
                <div className="cp-summary-body">

                  <div className="cp-summary-row">
                    <span className="cp-summary-lbl">Subtotal ({cartCount} items)</span>
                    <span className="cp-summary-val">₹{subtotal}</span>
                  </div>
                  <div className="cp-summary-row">
                    <span className="cp-summary-lbl">Delivery fee</span>
                    <span className="cp-summary-val">₹{delivery}</span>
                  </div>
                  <div className="cp-summary-row">
                    <span className="cp-summary-lbl">Taxes (5%)</span>
                    <span className="cp-summary-val">₹{taxes}</span>
                  </div>

                  <div className="cp-summary-divider" />

                  <div className="cp-summary-total-row">
                    <span className="cp-summary-total-lbl">Total</span>
                    <span className="cp-summary-total-amt">₹{total}</span>
                  </div>

                  <button className="cp-checkout-btn" onClick={() => navigate("/checkout-page")}>
                    Proceed to Checkout →
                  </button>

                  {/* Savings chip */}
                  <div className="cp-savings-chip">
                    🎉 You're saving ₹{Math.round(subtotal * 0.1)} on this order!
                  </div>

                  {/* Promo code */}
                  <div className="cp-promo-wrap">
                    <input className="cp-promo-input" placeholder="Promo code..." />
                    <button className="cp-promo-btn">Apply</button>
                  </div>

                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default CartPage;