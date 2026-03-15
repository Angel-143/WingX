import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaSearch, FaCartPlus } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/user_slice.js";
import { FaPlusSquare } from "react-icons/fa";
import { MdOutlineCallReceived } from "react-icons/md";

const serverUrl = "http://localhost:5000";

function Navbar() {
  const { userData, city: currentCity } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = userData?.role || userData?.user?.role || "";

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true });
    } catch {}
    dispatch(setUserData(null));
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const initials =
    (userData?.fullname?.slice(0, 1) || userData?.user?.fullname?.slice(0, 1) || "U").toUpperCase();
  const fullname = userData?.fullname || userData?.user?.fullname || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .wx-nav-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        .wx-nav-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 68px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1.5px solid rgba(255,255,255,0.9);
          display: flex; align-items: center;
          padding: 0 20px;
          justify-content: space-between;
          box-shadow: 0 4px 24px rgba(255,100,50,0.08);
        }

        .wx-logo-wrap {
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .wx-logo-icon {
          width: 36px; height: 36px; border-radius: 12px;
          background: linear-gradient(135deg, #ff6b35, #f7c948, #ff3cac);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(255,107,53,0.4);
          flex-shrink: 0;
        }
        .wx-logo-text {
          font-family: 'Nunito', sans-serif;
          font-size: 22px; font-weight: 900;
          background: linear-gradient(135deg, #ff6b35, #f7c948, #ff3cac);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wx-city-pill {
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #fff5f0, #fff0f8);
          border: 1.5px solid rgba(255,107,53,0.2);
          border-radius: 20px; padding: 5px 12px;
          font-size: 12px; font-weight: 600; color: #ff6b35;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .wx-city-pill:hover { box-shadow: 0 4px 12px rgba(255,107,53,0.2); }

        .wx-search-bar-wrap {
          flex: 1; max-width: 380px; margin: 0 16px;
          position: relative;
        }
        .wx-search-input {
          width: 100%;
          background: #f8f5ff;
          border: 1.5px solid #ede8ff;
          border-radius: 16px;
          padding: 9px 16px 9px 40px;
          font-size: 13px; font-weight: 500; color: #333;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .wx-search-input::placeholder { color: #b0a8c8; }
        .wx-search-input:focus {
          border-color: #c084fc;
          box-shadow: 0 0 0 3px rgba(192,132,252,0.15);
        }
        .wx-search-icon-inner {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #c084fc; font-size: 13px;
        }

        .wx-nav-actions { display: flex; align-items: center; gap: 8px; }

        .wx-icon-btn {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.2s;
          border: none; background: transparent;
          position: relative;
        }
        .wx-icon-btn:hover { transform: translateY(-1px); }

        .wx-icon-btn.orange { background: linear-gradient(135deg, #ff6b35, #ff9a3c); box-shadow: 0 4px 12px rgba(255,107,53,0.35); }
        .wx-icon-btn.purple { background: linear-gradient(135deg, #a855f7, #c084fc); box-shadow: 0 4px 12px rgba(168,85,247,0.35); }
        .wx-icon-btn.pink   { background: linear-gradient(135deg, #ff3cac, #ff6b9d); box-shadow: 0 4px 12px rgba(255,60,172,0.35); }
        .wx-icon-btn.green  { background: linear-gradient(135deg, #22c55e, #4ade80); box-shadow: 0 4px 12px rgba(34,197,94,0.35); }
        .wx-icon-btn.ghost  {
          background: #f8f5ff; border: 1.5px solid #ede8ff; color: #888;
        }
        .wx-icon-btn.ghost:hover { background: #f0ebff; }

        .wx-badge {
          position: absolute; top: -4px; right: -4px;
          background: linear-gradient(135deg, #ff3cac, #ff6b35);
          color: white; font-size: 9px; font-weight: 800;
          min-width: 17px; height: 17px; border-radius: 99px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid white;
        }

        .wx-pill-btn {
          display: flex; align-items: center; gap: 6px;
          border-radius: 12px; padding: 0 14px; height: 38px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          border: none; transition: transform 0.15s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .wx-pill-btn:hover { transform: translateY(-1px); }
        .wx-pill-btn.orange {
          background: linear-gradient(135deg, #ff6b35, #ff9a3c);
          color: white; box-shadow: 0 4px 14px rgba(255,107,53,0.35);
        }
        .wx-pill-btn.teal {
          background: linear-gradient(135deg, #14b8a6, #2dd4bf);
          color: white; box-shadow: 0 4px 14px rgba(20,184,166,0.35);
        }

        .wx-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35, #f7c948, #ff3cac);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Nunito', sans-serif;
          font-weight: 900; font-size: 15px; color: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255,107,53,0.4);
          transition: transform 0.15s, box-shadow 0.2s;
          border: 2px solid white;
          flex-shrink: 0;
        }
        .wx-avatar:hover { transform: scale(1.08); box-shadow: 0 6px 18px rgba(255,107,53,0.5); }

        .wx-dropdown {
          position: absolute; right: 16px; top: 76px;
          background: white;
          border-radius: 20px;
          padding: 8px;
          width: 200px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1.5px rgba(255,107,53,0.1);
          z-index: 200;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wx-dropdown-header {
          padding: 10px 12px 8px;
          border-bottom: 1.5px solid #f3f4f6;
          margin-bottom: 6px;
        }
        .wx-dropdown-name { font-weight: 700; font-size: 14px; color: #1a1a2e; }
        .wx-dropdown-role {
          font-size: 11px; font-weight: 600; margin-top: 2px;
          display: inline-block; padding: 2px 8px; border-radius: 99px;
          background: linear-gradient(135deg, #fff0f5, #fff5f0);
          color: #ff6b35;
        }
        .wx-dropdown-item {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 12px;
          font-size: 13px; font-weight: 600; color: #555;
          cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .wx-dropdown-item:hover { background: #fff5f0; color: #ff6b35; }
        .wx-dropdown-item.danger { color: #ef4444; }
        .wx-dropdown-item.danger:hover { background: #fff5f5; color: #dc2626; }

        .wx-mobile-search {
          position: fixed; top: 68px; left: 0; right: 0; z-index: 99;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          padding: 10px 16px;
          border-bottom: 1.5px solid #f0e8ff;
          display: flex; gap: 10px; align-items: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="wx-nav-root">
        <div className="wx-nav-bar">

          {/* LEFT — Logo + City */}
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

          {/* CENTER — Search (desktop) */}
          <div className="wx-search-bar-wrap" style={{ display: "none" }}
            ref={el => { if (el) el.style.display = window.innerWidth >= 768 ? "block" : "none"; }}>
            <FaSearch className="wx-search-icon-inner" />
            <input className="wx-search-input" placeholder="Search food, restaurants..." />
          </div>

          {/* RIGHT — Actions */}
          <div className="wx-nav-actions">

            {/* OWNER */}
            {role?.toLowerCase() === "owner" && (
              <>
                {myShopData && (
                  <button className="wx-pill-btn orange">
                    <FaPlusSquare size={13} />
                    <span style={{ display: "none" }} className="sm-show">Add Item</span>
                  </button>
                )}
                <div className="wx-icon-btn teal" style={{ background: "linear-gradient(135deg,#14b8a6,#2dd4bf)", boxShadow: "0 4px 12px rgba(20,184,166,0.35)" }}>
                  <MdOutlineCallReceived size={16} color="white" />
                  <span className="wx-badge">0</span>
                </div>
              </>
            )}

            {/* USER */}
            {role?.toLowerCase() === "user" && (
              <>
                <button className="wx-icon-btn ghost" onClick={() => setShowSearch(true)}>
                  <FaSearch style={{ color: "#a78bfa", fontSize: 14 }} />
                </button>
                <div className="wx-icon-btn pink" style={{ cursor: "pointer" }}>
                  <FaCartPlus size={15} color="white" />
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
            {role?.toLowerCase() === "user" && (
              <div className="wx-dropdown-item" onClick={() => { navigate("/my-orders"); setShowInfo(false); }}>
                📦 My Orders
              </div>
            )}
            <div className="wx-dropdown-item danger" onClick={handleLogout}>
              🚪 Sign out
            </div>
          </div>
        )}

        {/* MOBILE SEARCH */}
        {showSearch && (
          <div className="wx-mobile-search">
            <div style={{ flex: 1, position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#c084fc", fontSize: 13 }} />
              <input
                autoFocus
                className="wx-search-input"
                style={{ width: "100%", paddingLeft: 38 }}
                placeholder="Search food, restaurants..."
              />
            </div>
            <button
              onClick={() => setShowSearch(false)}
              style={{ width: 36, height: 36, borderRadius: 10, background: "#fff0f5", border: "1.5px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <ImCross style={{ color: "#f43f5e", fontSize: 11 }} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;