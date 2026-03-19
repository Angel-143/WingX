import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../dashboards/navbar.jsx";
import { FaArrowLeft, FaMapMarkerAlt, FaLeaf, FaDrumstickBite, FaShoppingCart, FaFire } from "react-icons/fa";
import { IoNutrition } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/user_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

const CATEGORIES = ["all","starter","maincourse","breakfast","lunch","dinner",
                    "biryani","pizza","burger","northindian","southindian",
                    "chinese","dessert","beverage","snack","salad","soup","other"];

function NutritionRow({ label, val, unit, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f9fafb" }}>
      <span style={{ fontSize:12, fontWeight:600, color:"#6b7280" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:800, color }}>{val}{unit}</span>
    </div>
  );
}

function ShopDetailPage() {
  const { shopId } = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { CartItem } = useSelector(s => s.user);

  const [shop, setShop]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedItem, setExpandedItem]     = useState(null); // nutrition expand

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/api/shop/${shopId}`, { withCredentials: true });
        setShop(res.data);
      } catch (err) {
        setError("Could not load restaurant");
      } finally { setLoading(false); }
    };
    fetchShop();
  }, [shopId]);

  const getQty = (itemId) => CartItem?.find(i => i.id === itemId)?.quantity || 0;

  const handleAdd = (item) => {
    dispatch(addToCart({
      id: item._id, name: item.name, price: item.price,
      image: item.image, shop: shopId, quantity: 1,
    }));
  };

  const totalCartItems = CartItem?.reduce((t, i) => t + i.quantity, 0) || 0;
  const totalCartPrice = CartItem?.reduce((t, i) => t + i.price * i.quantity, 0) || 0;

  // Unique categories from items
  const availableCategories = shop
    ? ["all", ...new Set(shop.items?.map(i => i.category).filter(Boolean))]
    : ["all"];

  const filteredItems = shop?.items?.filter(item =>
    activeCategory === "all" || item.category === activeCategory
  ) || [];

  const vegCount    = shop?.items?.filter(i => i.foodType === "veg").length    || 0;
  const nonvegCount = shop?.items?.filter(i => i.foodType === "nonveg").length || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn    { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }

        .sdp-root { font-family:'Plus Jakarta Sans',sans-serif; min-height:100vh; background:linear-gradient(145deg,#fff9f5 0%,#fdf8ff 40%,#f0fdf9 100%); }
        .sdp-container { max-width:900px; margin:0 auto; padding:clamp(84px,11vw,96px) 16px 120px; }

        /* ── BACK ── */
        .sdp-back { width:40px; height:40px; border-radius:12px; border:1.5px solid rgba(255,107,53,0.15); background:white; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#ff6b35; transition:transform 0.15s; margin-bottom:20px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
        .sdp-back:hover { transform:translateX(-2px); }

        /* ── HERO ── */
        .sdp-hero { border-radius:24px; overflow:hidden; position:relative; height:clamp(200px,35vw,280px); margin-bottom:20px; box-shadow:0 12px 40px rgba(0,0,0,0.15); animation:fadeUp 0.4s ease; }
        .sdp-hero-img { width:100%; height:100%; object-fit:cover; }
        .sdp-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.2) 50%,transparent 100%); }
        .sdp-hero-content { position:absolute; bottom:0; left:0; right:0; padding:24px 28px; }
        .sdp-shop-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:clamp(22px,4vw,34px); color:white; margin-bottom:8px; text-shadow:0 2px 12px rgba(0,0,0,0.4); }
        .sdp-meta-row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .sdp-meta-chip { display:flex; align-items:center; gap:5px; background:rgba(255,255,255,0.18); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.3); border-radius:99px; padding:4px 12px; font-size:12px; font-weight:600; color:white; }

        /* ── STATS ROW ── */
        .sdp-stats { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; animation:fadeUp 0.4s 0.1s ease both; }
        .sdp-stat { background:white; border-radius:16px; padding:14px 20px; flex:1; min-width:80px; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1.5px solid rgba(255,255,255,0.9); text-align:center; }
        .sdp-stat-num { font-family:'Nunito',sans-serif; font-weight:900; font-size:22px; }
        .sdp-stat-lbl { font-size:11px; color:#9ca3af; font-weight:600; margin-top:2px; }

        /* ── CATEGORY FILTER ── */
        .sdp-cats { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; margin-bottom:20px; animation:fadeUp 0.4s 0.15s ease both; }
        .sdp-cats::-webkit-scrollbar { display:none; }
        .sdp-cat { padding:8px 16px; border-radius:12px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #e5e7eb; background:white; color:#9ca3af; transition:all 0.2s; white-space:nowrap; font-family:'Plus Jakarta Sans',sans-serif; }
        .sdp-cat.active { background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; border-color:transparent; box-shadow:0 4px 14px rgba(255,107,53,0.35); }
        .sdp-cat:hover:not(.active) { border-color:rgba(255,107,53,0.3); color:#ff6b35; }

        /* ── SECTION TITLE ── */
        .sdp-section-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:18px; color:#1a1a2e; margin-bottom:14px; }

        /* ── ITEM CARD ── */
        .sdp-item { background:white; border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.06); border:1.5px solid rgba(255,255,255,0.9); margin-bottom:12px; animation:fadeUp 0.4s ease both; transition:transform 0.2s,box-shadow 0.2s; }
        .sdp-item:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(255,107,53,0.1); }

        .sdp-item-main { display:flex; align-items:center; gap:0; }
        .sdp-item-img { width:100px; height:100px; object-fit:cover; flex-shrink:0; background:linear-gradient(135deg,#fff5f0,#fff0f8); display:flex; align-items:center; justify-content:center; font-size:32px; }
        .sdp-item-body { flex:1; padding:14px 16px; min-width:0; }
        .sdp-item-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:15px; color:#1a1a2e; margin-bottom:4px; }
        .sdp-item-desc { font-size:12px; color:#9ca3af; font-weight:500; line-height:1.4; margin-bottom:8px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

        .sdp-item-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
        .sdp-veg-badge { display:flex; align-items:center; gap:3px; padding:3px 8px; border-radius:99px; font-size:10px; font-weight:700; }
        .sdp-veg-badge.veg    { background:rgba(34,197,94,0.1);  border:1.5px solid rgba(34,197,94,0.3);  color:#16a34a; }
        .sdp-veg-badge.nonveg { background:rgba(239,68,68,0.08); border:1.5px solid rgba(239,68,68,0.25); color:#dc2626; }
        .sdp-cal-badge { display:flex; align-items:center; gap:3px; font-size:10px; font-weight:700; color:#ff6b35; background:#fff5f0; padding:3px 8px; border-radius:99px; border:1.5px solid rgba(255,107,53,0.2); }
        .sdp-half-badge { font-size:10px; font-weight:700; color:#f59e0b; background:#fffbeb; border:1.5px solid rgba(245,158,11,0.25); padding:3px 8px; border-radius:99px; }
        .sdp-sub-badge  { font-size:10px; font-weight:700; color:#7c3aed; background:#faf5ff; border:1.5px solid rgba(124,58,237,0.2); padding:3px 8px; border-radius:99px; }

        .sdp-item-footer { display:flex; align-items:center; justify-content:space-between; }
        .sdp-item-price { font-family:'Nunito',sans-serif; font-weight:900; font-size:17px; background:linear-gradient(135deg,#ff6b35,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        .sdp-add-btn { display:flex; align-items:center; gap:5px; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-size:12px; font-weight:800; padding:8px 16px; border-radius:10px; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(255,107,53,0.35); font-family:'Plus Jakarta Sans',sans-serif; transition:transform 0.15s; }
        .sdp-add-btn:hover { transform:translateY(-1px); }
        .sdp-qty-ctrl { display:flex; align-items:center; gap:8px; }
        .sdp-qty-btn { width:30px; height:30px; border-radius:9px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-size:16px; font-weight:900; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 3px 10px rgba(255,107,53,0.35); transition:transform 0.15s; }
        .sdp-qty-btn:hover { transform:scale(1.1); }
        .sdp-qty-num { font-family:'Nunito',sans-serif; font-weight:900; font-size:15px; color:#ff6b35; min-width:20px; text-align:center; }

        /* ── NUTRITION EXPAND ── */
        .sdp-nutri-toggle { width:100%; padding:8px 16px; border:none; background:#fafafa; border-top:1.5px solid #f3f4f6; cursor:pointer; font-size:11px; font-weight:700; color:#9ca3af; font-family:'Plus Jakarta Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.15s; }
        .sdp-nutri-toggle:hover,.sdp-nutri-toggle.open { background:#fff5f0; color:#ff6b35; }

        .sdp-nutri-panel { padding:14px 16px; background:linear-gradient(135deg,#fffaf8,#fff8ff); border-top:1.5px solid #f3f4f6; animation:slideDown 0.2s ease; }
        .sdp-nutri-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .sdp-nutri-chip { background:white; border-radius:12px; padding:10px 8px; text-align:center; border:1.5px solid #f3f4f6; }
        .sdp-nutri-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; }
        .sdp-nutri-lbl { font-size:10px; font-weight:600; color:#9ca3af; margin-top:2px; }

        /* ── SKELETON ── */
        .sdp-skel { background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:400px 100%; animation:shimmer 1.2s infinite; border-radius:20px; }

        /* ── CART FAB ── */
        .sdp-cart-fab { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; border:none; border-radius:20px; padding:14px 32px; cursor:pointer; display:flex; align-items:center; gap:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:800; box-shadow:0 8px 28px rgba(255,107,53,0.5); transition:transform 0.2s; z-index:50; white-space:nowrap; animation:popIn 0.3s ease; }
        .sdp-cart-fab:hover { transform:translateX(-50%) translateY(-2px); }
        .sdp-cart-badge { background:white; color:#ff6b35; font-size:11px; font-weight:900; width:22px; height:22px; border-radius:99px; display:flex; align-items:center; justify-content:center; }

        /* ── EMPTY ── */
        .sdp-empty { background:white; border-radius:20px; padding:48px 24px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.05); border:2px dashed #fde8d8; }
      `}</style>

      <div className="sdp-root">
        <Navbar />
        <div className="sdp-container">

          <button className="sdp-back" onClick={() => navigate(-1)}>
            <FaArrowLeft size={13} />
          </button>

          {/* LOADING */}
          {loading && (
            <>
              <div className="sdp-skel" style={{ height:260, marginBottom:20 }} />
              <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                {[1,2,3].map(i => <div key={i} className="sdp-skel" style={{ flex:1, height:80 }} />)}
              </div>
              {[1,2,3,4].map(i => <div key={i} className="sdp-skel" style={{ height:100, marginBottom:12 }} />)}
            </>
          )}

          {error && (
            <div style={{ background:"#fff5f5", border:"1.5px solid rgba(239,68,68,0.2)", borderRadius:16, padding:"16px 20px", color:"#ef4444", fontSize:13, fontWeight:600 }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && shop && (
            <>
              {/* ── HERO ── */}
              <div className="sdp-hero">
                {shop.image
                  ? <img src={shop.image} alt={shop.name} className="sdp-hero-img" />
                  : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#ff6b35,#ff3cac)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:80 }}>🍽️</div>
                }
                <div className="sdp-hero-overlay" />
                <div className="sdp-hero-content">
                  <div className="sdp-shop-name">{shop.name}</div>
                  <div className="sdp-meta-row">
                    <div className="sdp-meta-chip">
                      <FaMapMarkerAlt size={10} />
                      {shop.city}{shop.state ? `, ${shop.state}` : ""}
                    </div>
                    <div className="sdp-meta-chip">🍽️ {shop.items?.length || 0} items</div>
                    {shop.address && <div className="sdp-meta-chip">📍 {shop.address}</div>}
                  </div>
                </div>
              </div>

              {/* ── STATS ── */}
              <div className="sdp-stats">
                <div className="sdp-stat">
                  <div className="sdp-stat-num" style={{ background:"linear-gradient(135deg,#ff6b35,#ff3cac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    {shop.items?.length || 0}
                  </div>
                  <div className="sdp-stat-lbl">Total Items</div>
                </div>
                <div className="sdp-stat">
                  <div className="sdp-stat-num" style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    {vegCount}
                  </div>
                  <div className="sdp-stat-lbl">🥗 Veg</div>
                </div>
                <div className="sdp-stat">
                  <div className="sdp-stat-num" style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    {nonvegCount}
                  </div>
                  <div className="sdp-stat-lbl">🍗 Non-Veg</div>
                </div>
                <div className="sdp-stat">
                  <div className="sdp-stat-num" style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    {shop.items?.filter(i => i.subscription?.available).length || 0}
                  </div>
                  <div className="sdp-stat-lbl">♻️ Subscribe</div>
                </div>
              </div>

              {/* ── CATEGORY FILTER ── */}
              <div className="sdp-cats">
                {availableCategories.map(cat => (
                  <button key={cat} className={`sdp-cat ${activeCategory===cat?"active":""}`}
                    onClick={() => setActiveCategory(cat)}>
                    {cat === "all" ? `All (${shop.items?.length || 0})` : cat.charAt(0).toUpperCase()+cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* ── MENU ── */}
              <div className="sdp-section-title">
                Menu {activeCategory !== "all" ? `— ${activeCategory.charAt(0).toUpperCase()+activeCategory.slice(1)}` : "🍛"} ({filteredItems.length})
              </div>

              {filteredItems.length === 0 ? (
                <div className="sdp-empty">
                  <div style={{ fontSize:48, marginBottom:12 }}>🍽️</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:"#1a1a2e", marginBottom:6 }}>No items in this category</div>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const qty        = getQty(item._id);
                  const isVeg      = item.foodType === "veg";
                  const n          = item.nutrition || {};
                  const hasNutri   = n.calories > 0;
                  const isExpanded = expandedItem === item._id;

                  return (
                    <div key={item._id} className="sdp-item" style={{ animationDelay:`${idx*0.05}s` }}>
                      <div className="sdp-item-main">

                        {/* IMAGE */}
                        {item.image
                          ? <img src={item.image} alt={item.name} className="sdp-item-img" style={{ display:"block" }} />
                          : <div className="sdp-item-img">🍽️</div>
                        }

                        {/* INFO */}
                        <div className="sdp-item-body">
                          <div className="sdp-item-name">{item.name}</div>
                          {item.description && (
                            <div className="sdp-item-desc">{item.description}</div>
                          )}
                          <div className="sdp-item-meta">
                            <div className={`sdp-veg-badge ${isVeg?"veg":"nonveg"}`}>
                              {isVeg ? <FaLeaf size={8}/> : <FaDrumstickBite size={8}/>}
                              {isVeg ? "Veg" : "Non-Veg"}
                            </div>
                            {hasNutri && (
                              <div className="sdp-cal-badge">
                                <FaFire size={9}/> {n.calories} kcal
                              </div>
                            )}
                            {item.plateOptions?.hasHalfPlate && (
                              <div className="sdp-half-badge">Half ₹{item.plateOptions.halfPrice}</div>
                            )}
                            {item.subscription?.available && (
                              <div className="sdp-sub-badge">♻️ Subscribe</div>
                            )}
                          </div>

                          <div className="sdp-item-footer">
                            <div className="sdp-item-price">₹{item.price}</div>
                            {qty === 0 ? (
                              <button className="sdp-add-btn" onClick={() => handleAdd(item)}>
                                <FaShoppingCart size={11}/> Add
                              </button>
                            ) : (
                              <div className="sdp-qty-ctrl">
                                <button className="sdp-qty-btn" onClick={() => dispatch(removeFromCart(item._id))}>−</button>
                                <span className="sdp-qty-num">{qty}</span>
                                <button className="sdp-qty-btn" onClick={() => handleAdd(item)}>+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* NUTRITION TOGGLE */}
                      {hasNutri && (
                        <>
                          <button
                            className={`sdp-nutri-toggle ${isExpanded?"open":""}`}
                            onClick={() => setExpandedItem(isExpanded ? null : item._id)}
                          >
                            <IoNutrition size={11}/>
                            {isExpanded ? "Hide Nutrition ▲" : "View Nutrition ▼"}
                          </button>
                          {isExpanded && (
                            <div className="sdp-nutri-panel">
                              <div className="sdp-nutri-grid">
                                {[
                                  { label:"Calories", val:`${n.calories}`, unit:"kcal", color:"#ff6b35" },
                                  { label:"Protein",  val:`${n.protein}`,  unit:"g",    color:"#3b82f6" },
                                  { label:"Carbs",    val:`${n.carbs}`,    unit:"g",    color:"#f59e0b" },
                                  { label:"Fat",      val:`${n.fat}`,      unit:"g",    color:"#ef4444" },
                                  { label:"Fiber",    val:`${n.fiber}`,    unit:"g",    color:"#22c55e" },
                                  { label:"Sugar",    val:`${n.sugar}`,    unit:"g",    color:"#a855f7" },
                                ].map(m => (
                                  <div key={m.label} className="sdp-nutri-chip">
                                    <div className="sdp-nutri-val" style={{ color:m.color }}>{m.val}<span style={{ fontSize:10, fontWeight:600 }}>{m.unit}</span></div>
                                    <div className="sdp-nutri-lbl">{m.label}</div>
                                  </div>
                                ))}
                              </div>
                              {n.isAIGenerated && (
                                <div style={{ fontSize:10, color:"#9ca3af", textAlign:"center", marginTop:8, fontWeight:600 }}>
                                  ✨ AI generated · owner se verify karein
                                </div>
                              )}
                              {item.subscription?.available && (
                                <div style={{ marginTop:12, padding:"10px 14px", background:"#faf5ff", borderRadius:12, border:"1.5px solid rgba(124,58,237,0.15)" }}>
                                  <div style={{ fontSize:12, fontWeight:700, color:"#7c3aed", marginBottom:4 }}>♻️ Subscription Plan</div>
                                  <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600 }}>
                                    Weekly ₹{item.subscription.weeklyPrice} · Monthly ₹{item.subscription.monthlyPrice} · {item.subscription.mealsPerWeek} meals/week
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* CART FAB */}
        {totalCartItems > 0 && (
          <button className="sdp-cart-fab" onClick={() => navigate("/cart-page")}>
            <FaShoppingCart size={16}/>
            View Cart · ₹{totalCartPrice}
            <div className="sdp-cart-badge">{totalCartItems}</div>
            <span style={{ opacity:0.8 }}>→</span>
          </button>
        )}
      </div>
    </>
  );
}

export default ShopDetailPage;