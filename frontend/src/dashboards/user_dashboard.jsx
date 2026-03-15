import React, { useRef, useState } from "react";
import Navbar from "./navbar.jsx";
import categories from "./category.js";
import CategoryCart from "./categoryCart.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import useGetShopByCity from "../hooks/useGetShopByCity.jsx";
import useGetItemByCity from "../hooks/useGetItemByCity.jsx";
import FoodCart from "./Food_Cart.jsx";

function UserDashboard() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useGetShopByCity();
  useGetItemByCity();

  const { ShopByCity, ItemByCity, city: currentCity } = useSelector((state) => state.user);
  const { userData } = useSelector((state) => state.user);

  const totalDishes = ItemByCity?.reduce((t, s) => t + (s.items?.length || 0), 0) || 0;
  const firstName = (userData?.fullname || userData?.user?.fullname || "Foodie").split(" ")[0];

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.6 : el.clientWidth * 0.6, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const moods = [
    { emoji: "🔥", label: "Hungry!", sub: "Fast Food", bg: "linear-gradient(135deg,#ff6b35,#ff9a3c)", shadow: "rgba(255,107,53,0.4)" },
    { emoji: "🥗", label: "Healthy", sub: "Diet Fresh", bg: "linear-gradient(135deg,#22c55e,#4ade80)", shadow: "rgba(34,197,94,0.4)" },
    { emoji: "🍨", label: "Treats", sub: "Sweet Spot", bg: "linear-gradient(135deg,#a855f7,#c084fc)", shadow: "rgba(168,85,247,0.4)" },
    { emoji: "🌶️", label: "Spicy", sub: "Fusion", bg: "linear-gradient(135deg,#ef4444,#f97316)", shadow: "rgba(239,68,68,0.4)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .wx-dash-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(145deg, #fff9f5 0%, #fdf8ff 40%, #f0fdf9 100%);
        }

        /* ── HERO BANNER ── */
        .wx-hero-banner {
          border-radius: 24px;
          padding: 28px 32px;
          background: linear-gradient(120deg, #ff6b35 0%, #ff3cac 55%, #f7c948 100%);
          position: relative; overflow: hidden;
          box-shadow: 0 12px 40px rgba(255,107,53,0.35);
          display: flex; align-items: center; justify-content: space-between;
        }
        .wx-hero-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15), transparent 60%);
          pointer-events: none;
        }
        .wx-hero-eyebrow {
          font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.2); border-radius: 99px;
          padding: 4px 12px; display: inline-block; margin-bottom: 10px;
        }
        .wx-hero-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(22px, 4vw, 36px); font-weight: 900;
          color: white; line-height: 1.15; margin-bottom: 16px;
        }
        .wx-hero-btn {
          background: white; color: #ff6b35;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 13px;
          border: none; border-radius: 12px;
          padding: 10px 22px; cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .wx-hero-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .wx-hero-emoji { font-size: clamp(48px, 8vw, 80px); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2)); }

        /* ── STAT CHIPS ── */
        .wx-stat-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
        .wx-stat-chip {
          background: white; border-radius: 16px;
          padding: 14px 20px; flex: 1; min-width: 100px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.8);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .wx-stat-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
        .wx-stat-num {
          font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 900;
        }
        .wx-stat-lbl { font-size: 12px; font-weight: 600; color: #9ca3af; margin-top: 2px; }

        /* ── MOOD SLIDER ── */
        .wx-mood-card {
          background: white; border-radius: 20px;
          padding: 20px 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.9);
        }
        .wx-mood-btn {
          flex: 1; border-radius: 16px; padding: 14px 10px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          color: white;
        }
        .wx-mood-btn:hover { transform: translateY(-3px); }
        .wx-mood-emoji { font-size: 28px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2)); }
        .wx-mood-label { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 13px; }
        .wx-mood-sub { font-size: 10px; font-weight: 600; opacity: 0.85; }

        /* ── SECTION TITLE ── */
        .wx-section-hd {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(17px, 3vw, 22px); color: #1a1a2e;
        }
        .wx-section-sub { font-size: 12px; font-weight: 600; color: #9ca3af; margin-top: 2px; }

        /* ── CATEGORY PANEL ── */
        .wx-cat-panel {
          background: white; border-radius: 24px; padding: 22px 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.9);
        }
        .wx-scroll-btn {
          width: 34px; height: 34px; border-radius: 12px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.2s;
        }
        .wx-scroll-btn.on {
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; box-shadow: 0 4px 14px rgba(255,107,53,0.4);
        }
        .wx-scroll-btn.off { background: #f5f3ff; color: #c4b5fd; }
        .wx-scroll-btn.on:hover { transform: scale(1.08); }

        /* ── SHOP CARDS ── */
        .wx-shop-card {
          background: white; border-radius: 20px; overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(255,255,255,0.9);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .wx-shop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(255,107,53,0.15);
        }
        .wx-shop-img { width: 100%; height: 140px; object-fit: cover; transition: transform 0.5s; }
        .wx-shop-card:hover .wx-shop-img { transform: scale(1.05); }
        .wx-shop-body { padding: 14px 16px; }
        .wx-shop-name {
          font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px;
          color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .wx-shop-addr { font-size: 12px; color: #9ca3af; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wx-shop-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 12px; padding-top: 10px;
          border-top: 1.5px solid #f9fafb;
        }
        .wx-shop-count { font-size: 11px; font-weight: 600; color: #9ca3af; }
        .wx-shop-cta {
          font-size: 11px; font-weight: 800; color: white;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          padding: 4px 12px; border-radius: 8px;
          transition: box-shadow 0.2s;
        }
        .wx-shop-card:hover .wx-shop-cta { box-shadow: 0 4px 12px rgba(255,107,53,0.4); }

        .wx-city-tag {
          position: absolute; top: 8px; left: 8px;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
          border-radius: 99px; padding: 3px 10px;
          font-size: 10px; font-weight: 700; color: #ff6b35;
        }

        /* ── EMPTY STATE ── */
        .wx-empty {
          background: white; border-radius: 20px; padding: 48px 24px; text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 2px dashed #fde8d8;
        }

        /* ── SCROLL HIDE ── */
        .wx-hscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wx-hscroll::-webkit-scrollbar { display: none; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wx-fade-up { animation: fadeUp 0.5s ease both; }
        .wx-fade-up:nth-child(2) { animation-delay: 0.07s; }
        .wx-fade-up:nth-child(3) { animation-delay: 0.14s; }
        .wx-fade-up:nth-child(4) { animation-delay: 0.21s; }
      `}</style>

      <div className="wx-dash-root">
        <Navbar />

        <div
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 box-border"
          style={{ paddingTop: "clamp(84px,11vw,96px)", paddingBottom: 60 }}
        >
          {/* ── HERO ── */}
          <div className="wx-hero-banner wx-fade-up" style={{ marginBottom: 20 }}>
            <div>
              <div className="wx-hero-eyebrow">🔥 WingX Specials — Up to 30% OFF!</div>
              <div className="wx-hero-title">
                Hey {firstName}! 👋<br />
                Time for WingX?
              </div>
              <button className="wx-hero-btn">Order Now →</button>
            </div>
            <div className="wx-hero-emoji" style={{ marginLeft: 16 }}>🍔</div>
          </div>

          {/* ── STAT CHIPS ── */}
          <div className="wx-stat-row wx-fade-up" style={{ marginBottom: 24 }}>
            <div className="wx-stat-chip">
              <div className="wx-stat-num" style={{ background: "linear-gradient(135deg,#ff6b35,#ff3cac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {ShopByCity?.length || 0}
              </div>
              <div className="wx-stat-lbl">Restaurants</div>
            </div>
            <div className="wx-stat-chip">
              <div className="wx-stat-num" style={{ background: "linear-gradient(135deg,#a855f7,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {totalDishes}
              </div>
              <div className="wx-stat-lbl">Dishes</div>
            </div>
            <div className="wx-stat-chip">
              <div className="wx-stat-num" style={{ background: "linear-gradient(135deg,#14b8a6,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {categories.length}
              </div>
              <div className="wx-stat-lbl">Categories</div>
            </div>
          </div>

          {/* ── MOOD SLIDER ── */}
          <div className="wx-mood-card wx-fade-up" style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <div className="wx-section-hd">Mood Slider 🎯</div>
              <div className="wx-section-sub">What are you feeling right now?</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {moods.map((m) => (
                <button
                  key={m.label}
                  className="wx-mood-btn"
                  style={{ background: m.bg, boxShadow: `0 6px 20px ${m.shadow}` }}
                >
                  <span className="wx-mood-emoji">{m.emoji}</span>
                  <span className="wx-mood-label">{m.label}</span>
                  <span className="wx-mood-sub">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── CATEGORIES ── */}
          <div className="wx-cat-panel wx-fade-up" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div className="wx-section-hd">Browse Categories 🍽️</div>
                <div className="wx-section-sub">{categories.length} types available</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => scroll("left")} className={`wx-scroll-btn ${canScrollLeft ? "on" : "off"}`} disabled={!canScrollLeft}>
                  <FaChevronLeft size={10} />
                </button>
                <button onClick={() => scroll("right")} className={`wx-scroll-btn ${canScrollRight ? "on" : "off"}`} disabled={!canScrollRight}>
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <div
                ref={scrollRef} onScroll={handleScroll}
                className="wx-hscroll flex pb-2"
                style={{ gap: "clamp(10px,2.5vw,22px)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}
              >
                {categories.map((cate, i) => (
                  <CategoryCart data={cate} key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* ── RESTAURANTS ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div className="wx-section-hd">Top Restos in {currentCity || "your city"} 📍</div>
                <div className="wx-section-sub">
                  {ShopByCity?.length > 0 ? `${ShopByCity.length} restaurant${ShopByCity.length > 1 ? "s" : ""} found` : "Fetching..."}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6b35", cursor: "pointer" }}>View all →</span>
            </div>

            {ShopByCity?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ShopByCity.map((shop, i) => (
                  <div key={shop._id} className="wx-shop-card wx-fade-up">
                    <div style={{ position: "relative", height: 140, background: "#fff5f0", overflow: "hidden" }}>
                      {shop.image
                        ? <img src={shop.image} alt={shop.name} loading="lazy" className="wx-shop-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>🍽️</div>
                      }
                      <div className="wx-city-tag">📍 {shop.city}</div>
                    </div>
                    <div className="wx-shop-body">
                      <div className="wx-shop-name">{shop.name}</div>
                      <div className="wx-shop-addr">{shop.address || shop.city}</div>
                      <div className="wx-shop-footer">
                        <span className="wx-shop-count">{shop.items?.length || 0} items</span>
                        <span className="wx-shop-cta">View Menu</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="wx-empty">
                <span style={{ fontSize: 40 }}>🏙️</span>
                <p style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
                  No restaurants in {currentCity || "your city"} yet!
                </p>
              </div>
            )}
          </div>

          {/* ── DISHES ── */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <div className="wx-section-hd">Popular Dishes 🍛</div>
              <div className="wx-section-sub">
                {totalDishes > 0 ? `${totalDishes} dishes available` : "Fetching dishes..."}
              </div>
            </div>

            {ItemByCity?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {ItemByCity.map((shop) =>
                  shop.items?.map((item) => (
                    <FoodCart key={item._id} item={item} />
                  ))
                )}
              </div>
            ) : (
              <div className="wx-empty">
                <span style={{ fontSize: 40 }}>🍽️</span>
                <p style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
                  No dishes in {currentCity || "your city"} yet.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default UserDashboard;