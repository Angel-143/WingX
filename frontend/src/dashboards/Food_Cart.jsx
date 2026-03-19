import React, { useState } from "react";
import axios from "axios";
import { FaLeaf, FaDrumstickBite, FaStar, FaShoppingCart, FaFire, FaChevronDown, FaTimes } from "react-icons/fa";
import { IoStarOutline, IoNutrition } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/user_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function FoodCart({ item }) {
    const dispatch  = useDispatch();
    const cartItems = useSelector((state) => state.user.CartItem);

    const [showNutrition, setShowNutrition] = useState(false);
    const [showPanel,     setShowPanel]     = useState(false);
    const [subscribing,   setSubscribing]   = useState(false);
    const [subDone,       setSubDone]       = useState(false);

    if (!item) return null;

    const hasHalf      = item.plateOptions?.hasHalfPlate && item.plateOptions?.halfPrice > 0;
    const hasSub       = item.subscription?.available;
    const needsPanel   = hasHalf || hasSub;
    const weeklyPrice  = item.subscription?.weeklyPrice  || 0;
    const monthlyPrice = item.subscription?.monthlyPrice || 0;
    const mealsPerWeek = item.subscription?.mealsPerWeek || 0;
    const mealsPerMonth= item.subscription?.mealsPerMonth|| 0;

    const cartEntries = cartItems.filter(i => i.id === item._id);
    const totalQty    = cartEntries.reduce((t, i) => t + i.quantity, 0);

    const doAdd = ({ plateType, price, isSubscription, subPlan, nameTag }) => {
        dispatch(addToCart({
            id:             item._id,
            name:           nameTag ? `${item.name} ${nameTag}` : plateType === "half" ? `${item.name} (Half)` : item.name,
            price,
            image:          item.image,
            shop:           item.shop?._id || item.shop,
            quantity:       1,
            foodtype:       item.foodType,
            plateType,
            isSubscription: !!isSubscription,
            subPlan:        subPlan || null,
        }));
    };

    const handleSimpleAdd = () => {
        if (needsPanel) { setShowPanel(s => !s); return; }
        doAdd({ plateType: "full", price: item.price });
    };

    const handleRemove = (plateType) =>
        dispatch(removeFromCart({ id: item._id, plateType: plateType || "full" }));

    const handleSubscribe = async (plan) => {
        setSubscribing(true);
        try {
            await axios.post(`${serverUrl}/api/subscription/subscribe`,
                { itemId: item._id, plan },
                { withCredentials: true }
            );
            doAdd({
                plateType: "subscription",
                isSubscription: true,
                subPlan: plan,
                price: plan === "weekly" ? weeklyPrice : monthlyPrice,
                nameTag: `(${plan === "weekly" ? "Weekly Sub" : "Monthly Sub"})`,
            });
            setSubDone(true);
            setTimeout(() => { setShowPanel(false); setSubDone(false); }, 1000);
        } catch (err) {
            console.error("Subscribe error:", err);
        } finally {
            setSubscribing(false);
        }
    };

    const avgRating    = item.rating?.average || 0;
    const ratingCount  = item.rating?.count   || 0;
    const isVeg        = item.foodType === "veg";
    const n            = item.nutrition || {};
    const hasNutrition = n.calories > 0;

    const renderStars = (r) => Array.from({ length: 5 }, (_, i) =>
        i < r
            ? <FaStar key={i} style={{ color:"#f59e0b", fontSize:9 }}/>
            : <IoStarOutline key={i} style={{ color:"#e5e7eb", fontSize:9 }}/>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes popIn     { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
                @keyframes panelDown { from{opacity:0;max-height:0} to{opacity:1;max-height:300px} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin      { to{transform:rotate(360deg)} }

                .fc { font-family:'Plus Jakarta Sans',sans-serif; background:white; border-radius:18px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.07); border:1.5px solid rgba(255,255,255,0.9); transition:transform 0.25s,box-shadow 0.25s; }
                .fc:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(255,107,53,0.13); }

                /* Image */
                .fc-img-wrap { position:relative; width:100%; height:108px; overflow:hidden; background:linear-gradient(135deg,#fff5f0,#fff0f8); }
                .fc-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
                .fc:hover .fc-img-wrap img { transform:scale(1.07); }
                .fc-veg  { position:absolute; top:6px; left:6px; display:flex; align-items:center; gap:3px; padding:2px 7px; border-radius:99px; font-size:9px; font-weight:700; }
                .fc-veg.v  { background:rgba(34,197,94,0.12); border:1.5px solid rgba(34,197,94,0.3); color:#16a34a; }
                .fc-veg.nv { background:rgba(239,68,68,0.1);  border:1.5px solid rgba(239,68,68,0.25); color:#dc2626; }
                .fc-badges { position:absolute; top:6px; right:6px; display:flex; flex-direction:column; gap:3px; align-items:flex-end; }
                .fc-badge-sub  { background:linear-gradient(135deg,#7c3aed,#a855f7); border-radius:99px; padding:2px 6px; font-size:9px; font-weight:700; color:white; }
                .fc-badge-half { background:linear-gradient(135deg,#f59e0b,#d97706); border-radius:99px; padding:2px 6px; font-size:9px; font-weight:700; color:white; }
                .fc-cal { position:absolute; bottom:6px; left:6px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); border-radius:99px; padding:2px 7px; display:flex; align-items:center; gap:2px; font-size:9px; font-weight:700; color:white; }
                .fc-qty-bubble { position:absolute; bottom:6px; right:6px; min-width:22px; height:22px; border-radius:11px; background:linear-gradient(135deg,#ff6b35,#ff3cac); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:white; border:2px solid white; padding:0 4px; animation:popIn 0.2s ease; }

                /* Body */
                .fc-body { padding:9px 11px 10px; }
                .fc-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; color:#1a1a2e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .fc-cat  { display:inline-block; margin-top:3px; background:#fff5f0; border:1.5px solid rgba(255,107,53,0.15); border-radius:99px; padding:1px 8px; font-size:9px; font-weight:700; color:#ff6b35; text-transform:capitalize; }
                .fc-stars { display:flex; align-items:center; gap:2px; margin-top:4px; }
                .fc-rtxt  { font-size:9px; font-weight:600; color:#9ca3af; }

                /* Footer */
                .fc-footer { display:flex; align-items:center; justify-content:space-between; margin-top:6px; padding-top:6px; border-top:1.5px solid #f9fafb; }
                .fc-price  { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; background:linear-gradient(135deg,#ff6b35,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

                /* Add btn */
                .fc-add { display:flex; align-items:center; gap:4px; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-size:11px; font-weight:800; padding:5px 10px; border-radius:9px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; box-shadow:0 3px 10px rgba(255,107,53,0.4); transition:transform 0.15s; }
                .fc-add:hover { transform:translateY(-1px); }
                .fc-chev { transition:transform 0.22s ease; }
                .fc-chev.open { transform:rotate(180deg); }

                /* Qty */
                .fc-qty { display:flex; align-items:center; gap:5px; }
                .fc-qbtn { width:25px; height:25px; border-radius:8px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(255,107,53,0.4); transition:transform 0.15s; }
                .fc-qbtn:hover { transform:scale(1.1); }
                .fc-qnum { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; color:#ff6b35; min-width:14px; text-align:center; }

                /* Multi-entry rows */
                .fc-multi { display:flex; flex-direction:column; gap:2px; flex:1; margin-left:6px; }
                .fc-erow  { display:flex; align-items:center; justify-content:space-between; background:#f9fafb; border-radius:7px; padding:2px 6px; }
                .fc-elbl  { font-size:9px; font-weight:700; color:#6b7280; }
                .fc-ectrl { display:flex; align-items:center; gap:2px; }
                .fc-ebtn  { width:17px; height:17px; border-radius:5px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; cursor:pointer; }
                .fc-enum  { font-family:'Nunito',sans-serif; font-weight:900; font-size:11px; color:#ff6b35; min-width:10px; text-align:center; }

                /* ── INLINE OPTION PANEL ── */
                .fc-panel { overflow:hidden; animation:panelDown 0.25s ease; border-top:1.5px solid #f3f4f6; }
                .fc-panel-inner { padding:8px 10px; display:flex; flex-direction:column; gap:5px; background:linear-gradient(135deg,#fffaf8,#fdf8ff); }
                .fc-panel-close { display:flex; align-items:center; justify-content:space-between; margin-bottom:2px; }
                .fc-panel-title { font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.06em; }

                .fc-opt { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:11px; border:1.5px solid #e5e7eb; background:white; cursor:pointer; transition:all 0.15s; }
                .fc-opt:hover { border-color:#ff6b35; background:#fff5f0; }
                .fc-opt:active { transform:scale(0.98); }
                .fc-opt-left { display:flex; align-items:center; gap:8px; }
                .fc-opt-icon { width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
                .fc-opt-label { font-family:'Nunito',sans-serif; font-weight:900; font-size:12px; color:#1a1a2e; }
                .fc-opt-sub   { font-size:9px; color:#9ca3af; font-weight:600; }
                .fc-opt-price { font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; background:linear-gradient(135deg,#ff6b35,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .fc-opt-price.purple { background:linear-gradient(135deg,#7c3aed,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

                .fc-sub-divider { font-size:9px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.08em; padding:2px 0 0; display:flex; align-items:center; gap:5px; }
                .fc-sub-divider::after { content:''; flex:1; height:1px; background:rgba(124,58,237,0.15); }

                .fc-save-pill { font-size:8px; font-weight:800; color:#16a34a; background:#f0fdf4; border-radius:99px; padding:1px 5px; }

                /* Nutrition */
                .fc-nutri-btn { display:flex; align-items:center; gap:3px; width:100%; padding:4px 10px; border:none; background:#f9fafb; border-top:1.5px solid #f3f4f6; cursor:pointer; font-size:9px; font-weight:700; color:#9ca3af; font-family:'Plus Jakarta Sans',sans-serif; justify-content:center; transition:background 0.15s; }
                .fc-nutri-btn:hover,.fc-nutri-btn.on { background:#fff5f0; color:#ff6b35; }
                .fc-nutri-panel { padding:8px 10px; background:linear-gradient(135deg,#fffaf8,#fff8ff); border-top:1.5px solid #f3f4f6; animation:slideDown 0.18s ease; }
                .fc-nutri-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:4px; }
                .fc-nutri-chip  { background:white; border-radius:8px; padding:5px 3px; text-align:center; border:1.5px solid #f3f4f6; }
                .fc-nval { font-family:'Nunito',sans-serif; font-weight:900; font-size:11px; }
                .fc-nlbl { font-size:7px; font-weight:600; color:#9ca3af; }
            `}</style>

            <div className="fc">
                {/* IMAGE */}
                <div className="fc-img-wrap">
                    {item.image
                        ? <img src={item.image} alt={item.name} loading="lazy"/>
                        : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32 }}>🍽️</div>
                    }
                    <div className={`fc-veg ${isVeg?"v":"nv"}`}>
                        {isVeg ? <FaLeaf size={7}/> : <FaDrumstickBite size={7}/>}
                        {isVeg?"Veg":"Non-Veg"}
                    </div>
                    <div className="fc-badges">
                        {hasSub  && <div className="fc-badge-sub">♻️ Sub</div>}
                        {hasHalf && <div className="fc-badge-half">½ ₹{item.plateOptions.halfPrice}</div>}
                    </div>
                    {hasNutrition && (
                        <div className="fc-cal">
                            <FaFire style={{ color:"#ff6b35", fontSize:7 }}/> {n.calories}
                        </div>
                    )}
                    {totalQty > 0 && <div className="fc-qty-bubble">{totalQty}</div>}
                </div>

                {/* BODY */}
                <div className="fc-body">
                    <div className="fc-name">{item.name}</div>
                    <div className="fc-cat">{item.category||"Other"}</div>
                    <div className="fc-stars">
                        <div style={{ display:"flex", gap:2 }}>{renderStars(Math.round(avgRating))}</div>
                        <span className="fc-rtxt" style={{ marginLeft:3 }}>
                            {avgRating>0?avgRating.toFixed(1):"–"}{ratingCount>0&&` (${ratingCount})`}
                        </span>
                    </div>

                    <div className="fc-footer">
                        <span className="fc-price">₹{item.price}</span>

                        {totalQty === 0 ? (
                            <button className="fc-add" onClick={handleSimpleAdd}>
                                <FaShoppingCart size={9}/> Add
                                {needsPanel && <FaChevronDown size={8} className={`fc-chev ${showPanel?"open":""}`}/>}
                            </button>

                        ) : cartEntries.length > 1 ? (
                            <div className="fc-multi">
                                {cartEntries.map(e => (
                                    <div key={e.plateType} className="fc-erow">
                                        <span className="fc-elbl">
                                            {e.plateType==="half"?"½ Half":e.plateType==="subscription"?"♻️ Sub":"Full"}
                                        </span>
                                        <div className="fc-ectrl">
                                            <button className="fc-ebtn" onClick={()=>handleRemove(e.plateType)}>−</button>
                                            <span className="fc-enum">{e.quantity}</span>
                                            <button className="fc-ebtn" onClick={()=>dispatch(addToCart({...e,quantity:1}))}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <button className="fc-add" style={{ width:"100%",justifyContent:"center",marginTop:2 }} onClick={handleSimpleAdd}>
                                    + More {needsPanel&&<FaChevronDown size={8} className={`fc-chev ${showPanel?"open":""}`}/>}
                                </button>
                            </div>

                        ) : (
                            <div className="fc-qty">
                                <button className="fc-qbtn" onClick={()=>handleRemove(cartEntries[0]?.plateType)}>−</button>
                                <span className="fc-qnum">{totalQty}</span>
                                <button className="fc-qbtn" onClick={handleSimpleAdd}>
                                    {needsPanel
                                        ? <FaChevronDown size={9} className={`fc-chev ${showPanel?"open":""}`}/>
                                        : "+"
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── INLINE OPTION PANEL (expands inside card, no overflow) ── */}
                {showPanel && needsPanel && (
                    <div className="fc-panel">
                        <div className="fc-panel-inner">
                            <div className="fc-panel-close">
                                <span className="fc-panel-title">Choose Option</span>
                                <button onClick={()=>setShowPanel(false)} style={{ background:"none",border:"none",cursor:"pointer",color:"#9ca3af",padding:2 }}>
                                    <FaTimes size={10}/>
                                </button>
                            </div>

                            {/* Full plate */}
                            <div className="fc-opt" onClick={()=>{ doAdd({plateType:"full",price:item.price}); setShowPanel(false); }}>
                                <div className="fc-opt-left">
                                    <div className="fc-opt-icon" style={{ background:"linear-gradient(135deg,#fff5f0,#ffe8d6)" }}>🍽️</div>
                                    <div>
                                        <div className="fc-opt-label">Full Plate</div>
                                        <div className="fc-opt-sub">Regular serving</div>
                                    </div>
                                </div>
                                <span className="fc-opt-price">₹{item.price}</span>
                            </div>

                            {/* Half plate */}
                            {hasHalf && (
                                <div className="fc-opt" onClick={()=>{ doAdd({plateType:"half",price:item.plateOptions.halfPrice}); setShowPanel(false); }}>
                                    <div className="fc-opt-left">
                                        <div className="fc-opt-icon" style={{ background:"linear-gradient(135deg,#fffbeb,#fef3c7)" }}>🥣</div>
                                        <div>
                                            <div className="fc-opt-label">Half Plate</div>
                                            <div className="fc-opt-sub">Smaller portion</div>
                                        </div>
                                    </div>
                                    <span className="fc-opt-price">₹{item.plateOptions.halfPrice}</span>
                                </div>
                            )}

                            {/* Subscription */}
                            {hasSub && (
                                <>
                                    <div className="fc-sub-divider">♻️ Subscribe & Save</div>

                                    {weeklyPrice > 0 && (
                                        <div className="fc-opt" onClick={()=>!subscribing && !subDone && handleSubscribe("weekly")}
                                            style={{ borderColor: subDone?"#22c55e":"#e5e7eb", background: subDone?"#f0fdf4":"white", opacity: subscribing?0.7:1 }}>
                                            <div className="fc-opt-left">
                                                <div className="fc-opt-icon" style={{ background:"linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>📅</div>
                                                <div>
                                                    <div className="fc-opt-label">Weekly Plan</div>
                                                    <div className="fc-opt-sub">{mealsPerWeek} meals · 7 days</div>
                                                </div>
                                            </div>
                                            <span className="fc-opt-price purple">
                                                {subDone ? "✅" : subscribing
                                                    ? <span style={{ width:12,height:12,borderRadius:"50%",border:"2px solid #c4b5fd",borderTop:"2px solid #7c3aed",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>
                                                    : `₹${weeklyPrice}`
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {monthlyPrice > 0 && (
                                        <div className="fc-opt" onClick={()=>!subscribing && !subDone && handleSubscribe("monthly")}
                                            style={{ borderColor: subDone?"#22c55e":"#e5e7eb", background: subDone?"#f0fdf4":"white", opacity: subscribing?0.7:1 }}>
                                            <div className="fc-opt-left">
                                                <div className="fc-opt-icon" style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>🗓️</div>
                                                <div>
                                                    <div className="fc-opt-label">Monthly Plan</div>
                                                    <div className="fc-opt-sub">
                                                        {mealsPerMonth} meals
                                                        {weeklyPrice > 0 && monthlyPrice < weeklyPrice * 4 && (
                                                            <span className="fc-save-pill" style={{ marginLeft:4 }}>
                                                                Save ₹{weeklyPrice*4-monthlyPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="fc-opt-price purple">
                                                {subDone ? "✅" : subscribing
                                                    ? <span style={{ width:12,height:12,borderRadius:"50%",border:"2px solid #c4b5fd",borderTop:"2px solid #7c3aed",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>
                                                    : `₹${monthlyPrice}`
                                                }
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* NUTRITION */}
                {hasNutrition && (
                    <>
                        <button className={`fc-nutri-btn ${showNutrition?"on":""}`} onClick={()=>setShowNutrition(!showNutrition)}>
                            <IoNutrition size={9}/> {showNutrition?"Hide ▲":"Nutrition ▼"}
                        </button>
                        {showNutrition && (
                            <div className="fc-nutri-panel">
                                <div className="fc-nutri-grid">
                                    {[
                                        {l:"Cal",   v:`${n.calories}`,  c:"#ff6b35"},
                                        {l:"Prot",  v:`${n.protein}g`,  c:"#3b82f6"},
                                        {l:"Carbs", v:`${n.carbs}g`,    c:"#f59e0b"},
                                        {l:"Fat",   v:`${n.fat}g`,      c:"#ef4444"},
                                        {l:"Fiber", v:`${n.fiber}g`,    c:"#22c55e"},
                                        {l:"Sugar", v:`${n.sugar}g`,    c:"#a855f7"},
                                    ].map(m=>(
                                        <div key={m.l} className="fc-nutri-chip">
                                            <div className="fc-nval" style={{color:m.c}}>{m.v}</div>
                                            <div className="fc-nlbl">{m.l}</div>
                                        </div>
                                    ))}
                                </div>
                                {n.isAIGenerated && <div style={{fontSize:8,color:"#9ca3af",textAlign:"center",marginTop:4,fontWeight:600}}>✨ AI generated</div>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default FoodCart;