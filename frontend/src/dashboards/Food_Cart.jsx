import React, { useState } from "react";
import { FaLeaf, FaDrumstickBite, FaStar, FaShoppingCart } from "react-icons/fa";
import { IoStarOutline } from "react-icons/io5";

function FoodCart({ item }) {
  if (!item) return null;
  const [quantity, setQuantity] = useState(0);
  const handleAdd = () => setQuantity((p) => p + 1);
  const handleRemove = () => setQuantity((p) => (p > 0 ? p - 1 : 0));

  const avgRating = item.rating?.average || 0;
  const ratingCount = item.rating?.count || 0;
  const isVeg = item.foodType === "veg";

  const renderStars = (r) =>
    Array.from({ length: 5 }, (_, i) =>
      i < r
        ? <FaStar key={i} style={{ color: "#f59e0b", fontSize: 10 }} />
        : <IoStarOutline key={i} style={{ color: "#e5e7eb", fontSize: 10 }} />
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .wx-fc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          border: 1.5px solid rgba(255,255,255,0.9);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .wx-fc:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(255,107,53,0.15);
        }

        .wx-fc-img-wrap {
          position: relative; width: 100%; height: 112px;
          background: linear-gradient(135deg, #fff5f0, #fff0f8);
          overflow: hidden;
        }
        .wx-fc-img-wrap img { transition: transform 0.5s; width: 100%; height: 100%; object-fit: cover; }
        .wx-fc:hover .wx-fc-img-wrap img { transform: scale(1.08); }

        .wx-fc-type {
          position: absolute; top: 7px; left: 7px;
          display: flex; align-items: center; gap: 3px;
          padding: 3px 8px; border-radius: 99px;
          font-size: 10px; font-weight: 700;
        }
        .wx-fc-type.veg {
          background: rgba(34,197,94,0.12);
          border: 1.5px solid rgba(34,197,94,0.3);
          color: #16a34a;
        }
        .wx-fc-type.nonveg {
          background: rgba(239,68,68,0.1);
          border: 1.5px solid rgba(239,68,68,0.25);
          color: #dc2626;
        }

        .wx-fc-sub {
          position: absolute; top: 7px; right: 7px;
          background: linear-gradient(135deg,#ff6b35,#ff3cac);
          border-radius: 99px; padding: 3px 8px;
          font-size: 10px; font-weight: 700; color: white;
          box-shadow: 0 2px 8px rgba(255,107,53,0.4);
        }

        .wx-fc-qty-bubble {
          position: absolute; bottom: 7px; right: 7px;
          width: 24px; height: 24px; border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; color: white;
          box-shadow: 0 3px 10px rgba(255,107,53,0.5);
          border: 2px solid white;
        }

        .wx-fc-body { padding: 10px 12px; }

        .wx-fc-name {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(12px, 2vw, 14px); color: #1a1a2e;
          line-height: 1.3; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
        }

        .wx-fc-cat {
          display: inline-block; margin-top: 5px;
          background: linear-gradient(135deg,#fff5f0,#fff0f8);
          border: 1.5px solid rgba(255,107,53,0.15);
          border-radius: 99px; padding: 2px 9px;
          font-size: 10px; font-weight: 700; color: #ff6b35;
          text-transform: capitalize;
        }

        .wx-fc-stars { display: flex; align-items: center; gap: 3px; margin-top: 6px; }
        .wx-fc-rating-txt { font-size: 10px; font-weight: 600; color: #9ca3af; margin-left: 2px; }

        .wx-fc-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 8px; padding-top: 8px;
          border-top: 1.5px solid #f9fafb;
        }

        .wx-fc-price {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(14px,2.2vw,16px);
          background: linear-gradient(135deg,#ff6b35,#ff3cac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wx-fc-add-btn {
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; font-size: 11px; font-weight: 800;
          padding: 6px 12px; border-radius: 10px; border: none; cursor: pointer;
          box-shadow: 0 4px 12px rgba(255,107,53,0.4);
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .wx-fc-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,107,53,0.5); }

        .wx-fc-qty-ctrl { display: flex; align-items: center; gap: 6px; }
        .wx-fc-qty-btn {
          width: 28px; height: 28px; border-radius: 9px; border: none;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; font-size: 16px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 3px 10px rgba(255,107,53,0.4);
          transition: transform 0.15s;
        }
        .wx-fc-qty-btn:hover { transform: scale(1.1); }
        .wx-fc-qty-num {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px;
          color: #ff6b35; min-width: 18px; text-align: center;
        }
      `}</style>

      <div className="wx-fc">
        <div className="wx-fc-img-wrap">
          {item.image
            ? <img src={item.image} alt={item.name} loading="lazy" />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🍽️</div>
          }

          <div className={`wx-fc-type ${isVeg ? "veg" : "nonveg"}`}>
            {isVeg ? <FaLeaf size={8} /> : <FaDrumstickBite size={8} />}
            {isVeg ? "Veg" : "Non-Veg"}
          </div>

          {item.isSubscription && <div className="wx-fc-sub">♻️ Sub</div>}
          {quantity > 0 && <div className="wx-fc-qty-bubble">{quantity}</div>}
        </div>

        <div className="wx-fc-body">
          <div className="wx-fc-name">{item.name}</div>
          <div className="wx-fc-cat">{item.category || "Other"}</div>

          <div className="wx-fc-stars">
            <div style={{ display: "flex", gap: 2 }}>{renderStars(Math.round(avgRating))}</div>
            <span className="wx-fc-rating-txt">
              {avgRating > 0 ? avgRating.toFixed(1) : "No ratings"}
              {ratingCount > 0 && ` (${ratingCount})`}
            </span>
          </div>

          <div className="wx-fc-footer">
            <span className="wx-fc-price">₹{item.price}</span>

            {quantity === 0 ? (
              <button className="wx-fc-add-btn" onClick={handleAdd}>
                <FaShoppingCart size={10} /> Add
              </button>
            ) : (
              <div className="wx-fc-qty-ctrl">
                <button className="wx-fc-qty-btn" onClick={handleRemove}>−</button>
                <span className="wx-fc-qty-num">{quantity}</span>
                <button className="wx-fc-qty-btn" onClick={handleAdd}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FoodCart;