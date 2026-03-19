import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import Navbar from "../dashboards/navbar.jsx";
import { FaArrowLeft, FaPause, FaPlay, FaTimes, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import { addToCart } from "../redux/user_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function MealsRing({ used, total, status }) {
    const remaining = Math.max(0, total - used);
    const pct   = total > 0 ? (remaining / total) : 0;
    const r     = 28, stroke = 5;
    const circ  = 2 * Math.PI * r;
    const color = status === "paused"    ? "#f59e0b"
                : status === "cancelled" ? "#ef4444"
                : status === "expired"   ? "#9ca3af"
                : remaining === 0        ? "#22c55e"
                : "#ff6b35";
    return (
        <div style={{ position:"relative", width:66, height:66, flexShrink:0 }}>
            <svg width={66} height={66} style={{ transform:"rotate(-90deg)" }}>
                <circle cx={33} cy={33} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke}/>
                <circle cx={33} cy={33} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeLinecap="round" strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct)}
                    style={{ transition:"stroke-dashoffset 0.6s ease" }}
                />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color, lineHeight:1 }}>{remaining}</div>
                <div style={{ fontSize:8, fontWeight:700, color:"#9ca3af" }}>left</div>
            </div>
        </div>
    );
}

function SubBadge({ status }) {
    const cfg = {
        active:    { color:"#16a34a", bg:"#f0fdf4", border:"rgba(34,197,94,0.25)",  label:"● Active"    },
        paused:    { color:"#d97706", bg:"#fffbeb", border:"rgba(245,158,11,0.25)", label:"⏸ Paused"    },
        cancelled: { color:"#dc2626", bg:"#fff1f2", border:"rgba(239,68,68,0.25)",  label:"✕ Cancelled" },
        expired:   { color:"#6b7280", bg:"#f9fafb", border:"rgba(107,114,128,0.2)", label:"✓ Expired"   },
    }[status] || { color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb", label:status };
    return (
        <span style={{ fontSize:10, fontWeight:800, color:cfg.color, background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:99, padding:"3px 10px" }}>
            {cfg.label}
        </span>
    );
}

function SubCard({ sub, onPause, onResume, onCancel, onReorder, animDelay }) {
    const [loading, setLoading]     = useState(null);
    const [reordered, setReordered] = useState(false);

    const remaining = Math.max(0, sub.totalMeals - sub.mealsUsed);
    const pct       = sub.totalMeals > 0 ? Math.round((remaining / sub.totalMeals) * 100) : 0;
    const endDate   = new Date(sub.endDate);
    const daysLeft  = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
    const isActive  = sub.status === "active";
    const isPaused  = sub.status === "paused";
    const isDone    = sub.status === "cancelled" || sub.status === "expired";
    const canReorder = (isActive || isPaused) && remaining > 0;

    const action = async (fn, key) => {
        setLoading(key);
        await fn(sub._id);
        setLoading(null);
    };

    const handleReorder = () => {
        onReorder(sub);
        setReordered(true);
        setTimeout(() => setReordered(false), 2000);
    };

    return (
        <div style={{
            background:"white", borderRadius:22, overflow:"hidden",
            boxShadow:"0 4px 24px rgba(0,0,0,0.07)", border:"1.5px solid rgba(255,255,255,0.9)",
            animation:`fadeUp 0.4s ease ${animDelay}s both`,
            opacity: isDone ? 0.65 : 1,
        }}>
            {/* color strip */}
            <div style={{ height:4, background:
                sub.status === "active" ? "linear-gradient(90deg,#ff6b35,#ff3cac)"
              : sub.status === "paused" ? "linear-gradient(90deg,#f59e0b,#fcd34d)"
              : "linear-gradient(90deg,#e5e7eb,#d1d5db)" }} />

            <div style={{ padding:"18px 20px" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
                    {sub.itemImage
                        ? <img src={sub.itemImage} alt={sub.itemName} style={{ width:56, height:56, borderRadius:14, objectFit:"cover", flexShrink:0 }}/>
                        : <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#fff5f0,#fff0f8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🍽️</div>
                    }
                    <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15, color:"#1a1a2e", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {sub.itemName}
                        </div>
                        <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600, marginTop:2 }}>🏪 {sub.shopName}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5, flexWrap:"wrap" }}>
                            <SubBadge status={sub.status}/>
                            <span style={{ fontSize:10, fontWeight:700, color:"#a855f7", background:"#f5f3ff", padding:"2px 8px", borderRadius:99 }}>
                                {sub.plan === "weekly" ? "📅 Weekly" : "🗓️ Monthly"} • ₹{sub.price}
                            </span>
                        </div>
                    </div>
                    <MealsRing used={sub.mealsUsed} total={sub.totalMeals} status={sub.status}/>
                </div>

                {/* Progress */}
                <div style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#374151" }}>🍽️ Meals Progress</span>
                        <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af" }}>{sub.mealsUsed} used · {remaining} left</span>
                    </div>
                    <div style={{ height:7, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                        <div style={{
                            height:"100%", borderRadius:99, width:`${100 - pct}%`,
                            background: sub.status === "paused" ? "#f59e0b"
                                      : sub.status === "active" ? "linear-gradient(90deg,#ff6b35,#ff3cac)"
                                      : "#d1d5db",
                            transition:"width 0.6s ease",
                        }}/>
                    </div>
                </div>

                {/* Info chips */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                    <div style={{ background:"#f9fafb", border:"1.5px solid #f3f4f6", borderRadius:9, padding:"5px 10px", fontSize:10, fontWeight:700, color:"#374151" }}>
                        📅 Ends {endDate.toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                    </div>
                    <div style={{ background:"#f9fafb", border:"1.5px solid #f3f4f6", borderRadius:9, padding:"5px 10px", fontSize:10, fontWeight:700, color: daysLeft <= 2 ? "#ef4444" : "#374151" }}>
                        ⏱️ {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                    </div>
                    <div style={{ background: remaining === 0 ? "#f0fdf4" : "#fff5f0", border:`1.5px solid ${remaining === 0 ? "rgba(34,197,94,0.2)" : "rgba(255,107,53,0.15)"}`, borderRadius:9, padding:"5px 10px", fontSize:10, fontWeight:700, color: remaining === 0 ? "#16a34a" : "#ff6b35" }}>
                        🍽️ {remaining === 0 ? "All used ✓" : `${remaining} meals left`}
                    </div>
                </div>

                {/* ✅ REORDER BUTTON — free kyunki already paid */}
                {canReorder && (
                    <button onClick={handleReorder} style={{
                        width:"100%", padding:"11px", borderRadius:13, border:"none", marginBottom:10,
                        background: reordered
                            ? "linear-gradient(135deg,#22c55e,#16a34a)"
                            : "linear-gradient(135deg,#1a1a2e,#2d2d4e)",
                        color:"white", fontFamily:"'Plus Jakarta Sans',sans-serif",
                        fontWeight:800, fontSize:13, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                        boxShadow: reordered
                            ? "0 4px 14px rgba(34,197,94,0.4)"
                            : "0 4px 14px rgba(26,26,46,0.3)",
                        transition:"all 0.3s",
                    }}>
                        {reordered
                            ? <><FaCheckCircle size={13}/> Added to Cart!</>
                            : <><FaShoppingCart size={13}/> Order Now · FREE <span style={{ fontSize:10, opacity:0.7, fontWeight:600 }}>(already paid)</span></>
                        }
                    </button>
                )}

                {/* Manage buttons */}
                {!isDone && (
                    <div style={{ display:"flex", gap:8 }}>
                        {isActive && (
                            <button onClick={()=>action(onPause,"pause")} disabled={!!loading} style={{
                                flex:1, padding:"9px", borderRadius:11, border:"1.5px solid rgba(245,158,11,0.3)",
                                background:"#fffbeb", color:"#d97706", fontFamily:"'Plus Jakarta Sans',sans-serif",
                                fontWeight:800, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center",
                                justifyContent:"center", gap:5, opacity:loading?0.6:1,
                            }}>
                                <FaPause size={10}/> {loading==="pause"?"Pausing…":"Pause"}
                            </button>
                        )}
                        {isPaused && (
                            <button onClick={()=>action(onResume,"resume")} disabled={!!loading} style={{
                                flex:1, padding:"9px", borderRadius:11, border:"none",
                                background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"white",
                                fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:12,
                                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                                gap:5, opacity:loading?0.6:1, boxShadow:"0 4px 14px rgba(34,197,94,0.4)",
                            }}>
                                <FaPlay size={10}/> {loading==="resume"?"Resuming…":"Resume"}
                            </button>
                        )}
                        <button onClick={()=>action(onCancel,"cancel")} disabled={!!loading} style={{
                            flex:1, padding:"9px", borderRadius:11, border:"1.5px solid rgba(239,68,68,0.25)",
                            background:"#fff5f5", color:"#dc2626", fontFamily:"'Plus Jakarta Sans',sans-serif",
                            fontWeight:800, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center",
                            justifyContent:"center", gap:5, opacity:loading?0.6:1,
                        }}>
                            <FaTimes size={10}/> {loading==="cancel"?"Cancelling…":"Cancel"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function MySubscriptions() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [subs, setSubs]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState("all");
    const [cartToast, setCartToast] = useState("");

    useEffect(() => { fetchSubs(); }, []);

    const fetchSubs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/subscription/my`, { withCredentials:true });
            setSubs(res.data || []);
        } catch(e){ console.error(e); }
        finally { setLoading(false); }
    };

    const handlePause  = async (id) => {
        await axios.patch(`${serverUrl}/api/subscription/${id}/pause`,  {}, { withCredentials:true });
        setSubs(p => p.map(s => s._id===id ? {...s, status:"paused"}  : s));
    };
    const handleResume = async (id) => {
        await axios.patch(`${serverUrl}/api/subscription/${id}/resume`, {}, { withCredentials:true });
        setSubs(p => p.map(s => s._id===id ? {...s, status:"active"}  : s));
    };
    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this subscription?")) return;
        await axios.patch(`${serverUrl}/api/subscription/${id}/cancel`, {}, { withCredentials:true });
        setSubs(p => p.map(s => s._id===id ? {...s, status:"cancelled"} : s));
    };

    // ✅ Reorder — add to cart with ₹0 price (already paid via subscription)
    const handleReorder = (sub) => {
        dispatch(addToCart({
            id:             sub.item,          // item ObjectId
            name:           sub.itemName,
            price:          0,                 // FREE — already paid
            image:          sub.itemImage,
            shop:           sub.shop,
            quantity:       1,
            plateType:      "subscription",
            isSubscription: true,
            subId:          sub._id,           // track which sub this came from
            subPlan:        sub.plan,
        }));

        // Also mark 1 meal as used on backend
        axios.patch(`${serverUrl}/api/subscription/${sub._id}/use-meal`, {}, { withCredentials:true })
            .catch(e => console.error("use-meal error:", e));

        setCartToast(`${sub.itemName} added to cart!`);
        setTimeout(() => setCartToast(""), 2500);
    };

    const activeSubs     = subs.filter(s => s.status === "active");
    const pausedSubs     = subs.filter(s => s.status === "paused");
    const doneSubs       = subs.filter(s => s.status === "cancelled" || s.status === "expired");
    const totalMealsLeft = activeSubs.reduce((t,s) => t + Math.max(0, s.totalMeals - s.mealsUsed), 0);

    const filteredSubs = filter==="all"    ? subs
                       : filter==="active" ? activeSubs
                       : filter==="paused" ? pausedSubs
                       : doneSubs;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin     { to{transform:rotate(360deg)} }
                @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

                .ms-root { font-family:'Plus Jakarta Sans',sans-serif; min-height:100vh; background:linear-gradient(145deg,#fff9f5 0%,#fdf8ff 40%,#f0fdf9 100%); }
                .ms-container { max-width:680px; margin:0 auto; padding:clamp(84px,11vw,96px) 16px 80px; }
                .ms-back { width:40px; height:40px; border-radius:12px; border:1.5px solid rgba(255,107,53,0.15); background:white; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#ff6b35; transition:transform 0.15s; margin-bottom:20px; }
                .ms-back:hover { transform:translateX(-2px); }
                .ms-summary { background:linear-gradient(120deg,#ff6b35,#ff3cac); border-radius:22px; padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 8px 32px rgba(255,107,53,0.35); animation:fadeUp 0.4s ease; }
                .ms-summary-stat { text-align:center; }
                .ms-summary-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:26px; color:white; line-height:1; }
                .ms-summary-lbl { font-size:10px; font-weight:700; color:rgba(255,255,255,0.75); margin-top:3px; }
                .ms-summary-divider { width:1px; height:36px; background:rgba(255,255,255,0.25); }
                .ms-filters { display:flex; gap:8px; margin-bottom:20px; overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }
                .ms-filters::-webkit-scrollbar { display:none; }
                .ms-filter-btn { padding:6px 14px; border-radius:99px; border:1.5px solid #e5e7eb; background:white; font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:700; color:#6b7280; cursor:pointer; white-space:nowrap; transition:all 0.2s; flex-shrink:0; }
                .ms-filter-btn.active { background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; border-color:transparent; box-shadow:0 4px 14px rgba(255,107,53,0.35); }
                .ms-empty { background:white; border-radius:22px; padding:48px 24px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.05); border:2px dashed #fde8d8; }
                .ms-spinner { width:30px; height:30px; border-radius:50%; border:3px solid rgba(255,107,53,0.15); border-top:3px solid #ff6b35; animation:spin 0.7s linear infinite; margin:60px auto; }
                .ms-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#1a1a2e,#2d2d4e); color:white; border-radius:18px; padding:12px 22px; font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; z-index:999; box-shadow:0 8px 28px rgba(0,0,0,0.25); display:flex; align-items:center; gap:8px; animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1); white-space:nowrap; }
            `}</style>

            <div className="ms-root">
                <Navbar/>

                {/* Cart toast */}
                {cartToast && (
                    <div className="ms-toast">
                        🛒 {cartToast}
                    </div>
                )}

                <div className="ms-container">
                    <button className="ms-back" onClick={()=>navigate(-1)}>
                        <FaArrowLeft size={13}/>
                    </button>

                    <div style={{ marginBottom:20 }}>
                        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:24, color:"#1a1a2e" }}>My Subscriptions ♻️</div>
                        <div style={{ fontSize:13, color:"#9ca3af", marginTop:4 }}>Manage your recurring meal plans</div>
                    </div>

                    {!loading && subs.length > 0 && (
                        <div className="ms-summary">
                            <div className="ms-summary-stat">
                                <div className="ms-summary-val">{activeSubs.length}</div>
                                <div className="ms-summary-lbl">Active</div>
                            </div>
                            <div className="ms-summary-divider"/>
                            <div className="ms-summary-stat">
                                <div className="ms-summary-val">{totalMealsLeft}</div>
                                <div className="ms-summary-lbl">Meals Left</div>
                            </div>
                            <div className="ms-summary-divider"/>
                            <div className="ms-summary-stat">
                                <div className="ms-summary-val">{pausedSubs.length}</div>
                                <div className="ms-summary-lbl">Paused</div>
                            </div>
                            <div className="ms-summary-divider"/>
                            <div className="ms-summary-stat">
                                <div className="ms-summary-val">{doneSubs.length}</div>
                                <div className="ms-summary-lbl">Ended</div>
                            </div>
                        </div>
                    )}

                    <div className="ms-filters">
                        {[
                            { key:"all",    label:`All (${subs.length})` },
                            { key:"active", label:`✅ Active (${activeSubs.length})` },
                            { key:"paused", label:`⏸ Paused (${pausedSubs.length})` },
                            { key:"done",   label:`✕ Ended (${doneSubs.length})` },
                        ].map(f=>(
                            <button key={f.key} className={`ms-filter-btn ${filter===f.key?"active":""}`} onClick={()=>setFilter(f.key)}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="ms-spinner"/>
                    ) : filteredSubs.length === 0 ? (
                        <div className="ms-empty">
                            <div style={{ fontSize:48, marginBottom:10 }}>{filter==="all"?"♻️":"🔍"}</div>
                            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, color:"#1a1a2e", marginBottom:6 }}>
                                {filter==="all" ? "No subscriptions yet!" : `No ${filter} subscriptions`}
                            </div>
                            <p style={{ color:"#9ca3af", fontSize:12, fontWeight:600, marginBottom:18 }}>
                                {filter==="all" ? "Subscribe to a meal plan from any restaurant" : "Try a different filter"}
                            </p>
                            {filter==="all" && (
                                <button onClick={()=>navigate("/")} style={{
                                    background:"linear-gradient(135deg,#ff6b35,#ff3cac)", color:"white",
                                    border:"none", borderRadius:13, padding:"11px 26px",
                                    fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:13,
                                    cursor:"pointer", boxShadow:"0 6px 20px rgba(255,107,53,0.4)",
                                }}>Browse Restaurants →</button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            {filteredSubs.map((sub, i) => (
                                <SubCard key={sub._id} sub={sub} animDelay={i*0.07}
                                    onPause={handlePause} onResume={handleResume}
                                    onCancel={handleCancel} onReorder={handleReorder}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default MySubscriptions;