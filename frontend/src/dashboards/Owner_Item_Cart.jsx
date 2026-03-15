import React from "react";
import { FaLeaf, FaDrumstickBite, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function OwnerItemCart({ data }) {
  const navigate = useNavigate();
  if (!data) return null;

  const isVeg = data.foodType === "veg";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .wx-oic {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: white;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          border: 1.5px solid rgba(255,255,255,0.9);
          transition: transform 0.25s, box-shadow 0.25s;
          display: flex; flex-direction: column;
          cursor: pointer;
        }
        .wx-oic:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(124,58,237,0.15);
        }

        .wx-oic-img-wrap {
          position: relative; width: 100%; height: 130px;
          background: linear-gradient(135deg, #fdf2f8, #f5f3ff);
          overflow: hidden;
        }
        .wx-oic-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s;
        }
        .wx-oic:hover .wx-oic-img-wrap img { transform: scale(1.07); }

        .wx-oic-type {
          position: absolute; top: 7px; left: 7px;
          display: flex; align-items: center; gap: 3px;
          padding: 3px 8px; border-radius: 99px;
          font-size: 10px; font-weight: 700;
        }
        .wx-oic-type.veg {
          background: rgba(34,197,94,0.12);
          border: 1.5px solid rgba(34,197,94,0.3);
          color: #16a34a;
        }
        .wx-oic-type.nonveg {
          background: rgba(239,68,68,0.1);
          border: 1.5px solid rgba(239,68,68,0.25);
          color: #dc2626;
        }

        .wx-oic-sub {
          position: absolute; top: 7px; right: 7px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          border-radius: 99px; padding: 3px 8px;
          font-size: 10px; font-weight: 700; color: white;
          box-shadow: 0 2px 8px rgba(255,107,53,0.4);
        }

        .wx-oic-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(124,58,237,0.12), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .wx-oic:hover .wx-oic-overlay { opacity: 1; }

        .wx-oic-body {
          padding: 12px 14px; flex: 1; display: flex; flex-direction: column; gap: 6px;
        }

        .wx-oic-name {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(12px,2vw,14px); color: #1a1a2e;
          line-height: 1.3;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }

        .wx-oic-cat {
          display: inline-block;
          background: linear-gradient(135deg, #fdf2f8, #f5f3ff);
          border: 1.5px solid rgba(168,85,247,0.2);
          border-radius: 99px; padding: 2px 10px;
          font-size: 10px; font-weight: 700; color: #a855f7;
          text-transform: capitalize; align-self: flex-start;
        }

        .wx-oic-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: auto; padding-top: 10px;
          border-top: 1.5px solid #f9fafb;
        }

        .wx-oic-price {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(14px,2.2vw,16px);
          background: linear-gradient(135deg, #7c3aed, #ff3cac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wx-oic-meals {
          font-size: 11px; font-weight: 600; color: #9ca3af;
        }

        .wx-oic-actions { display: flex; align-items: center; gap: 6px; }

        .wx-oic-edit-btn {
          display: flex; align-items: center; gap: 4px;
          background: linear-gradient(135deg, #f5f3ff, #fdf2f8);
          border: 1.5px solid rgba(168,85,247,0.2);
          color: #7c3aed; font-size: 11px; font-weight: 800;
          padding: 5px 10px; border-radius: 9px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .wx-oic-edit-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 4px 12px rgba(124,58,237,0.25);
          background: linear-gradient(135deg, #ede9fe, #fce7f3);
        }

        .wx-oic-del-btn {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #fff0f5, #fee2e2);
          border: 1.5px solid rgba(239,68,68,0.2);
          color: #ef4444;
          width: 30px; height: 30px; border-radius: 9px; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .wx-oic-del-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(239,68,68,0.25);
          background: linear-gradient(135deg, #fce7f3, #fee2e2);
        }
      `}</style>

      <div className="wx-oic">
        <div className="wx-oic-img-wrap">
          {data.image
            ? <img src={data.image} alt={data.name} loading="lazy" />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍽️</div>
          }

          <div className={`wx-oic-type ${isVeg ? "veg" : "nonveg"}`}>
            {isVeg ? <FaLeaf size={8} /> : <FaDrumstickBite size={8} />}
            {isVeg ? "Veg" : "Non-Veg"}
          </div>

          {data.isSubscription && <div className="wx-oic-sub">♻️ Sub</div>}
          <div className="wx-oic-overlay" />
        </div>

        <div className="wx-oic-body">
          <div className="wx-oic-name">{data.name}</div>
          <div className="wx-oic-cat">{data.category || "Other"}</div>

          <div className="wx-oic-footer">
            <span className="wx-oic-price">₹{data.price}</span>

            {data.isSubscription ? (
              <span className="wx-oic-meals">{data.mealsPerMonth} meals/mo</span>
            ) : (
              <div className="wx-oic-actions">
                <button
                  className="wx-oic-edit-btn"
                  onClick={() => navigate(`/edit-item/${data._id}`)}
                >
                  <FaEdit size={9} /> Edit
                </button>
                <button
                  className="wx-oic-del-btn"
                  onClick={() => navigate(`/delete-item/${data._id}`)}
                >
                  <FaTrash size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default OwnerItemCart;