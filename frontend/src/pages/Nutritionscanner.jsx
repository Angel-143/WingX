import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../dashboards/navbar.jsx";
import { FaArrowLeft, FaCamera, FaTrash, FaFire } from "react-icons/fa";
import { MdOutlineScanner } from "react-icons/md";
import DietSetupModal from "./DietSetupModal.jsx";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

const GOAL_PRESETS = {
    weight_loss: { label: "Weight Loss 🔥", cal: 1500, protein: 120, carbs: 150, fat: 50, color: "#ef4444" },
    muscle_gain: { label: "Muscle Gain 💪", cal: 2500, protein: 180, carbs: 300, fat: 70, color: "#3b82f6" },
    balanced:    { label: "Balanced 🌿",    cal: 2000, protein: 80,  carbs: 250, fat: 65, color: "#22c55e" },
    custom:      { label: "Custom 🎯",      cal: 2000, protein: 80,  carbs: 250, fat: 65, color: "#a855f7" },
};

// ── Animated Ring ──────────────────────────────────────────
function Ring({ value, max, color, size = 110, stroke = 10, label, unit = "g", animate = true }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(1, max > 0 ? value / max : 0);
    const over = value > max;
    const fillColor = over ? "#ef4444" : color;

    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={fillColor} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct)}
                    style={{ transition: animate ? "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s" : "none" }}
                />
            </svg>
            <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center"
            }}>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: size > 100 ? 22 : 15, color: fillColor, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: size > 100 ? 9 : 8, color: "#9ca3af", fontWeight: 700, marginTop: 1 }}>/ {max} {unit}</div>
                {label && <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", marginTop: 2 }}>{label}</div>}
                {over && <div style={{ fontSize: 8, fontWeight: 800, color: "#ef4444", marginTop: 1 }}>OVER</div>}
            </div>
        </div>
    );
}

// ── MacroBar ───────────────────────────────────────────────
function MacroBar({ label, current, cartAdd, goal, color }) {
    const totalWithCart = current + cartAdd;
    const pct = Math.min(100, goal > 0 ? Math.round((current / goal) * 100) : 0);
    const cartPct = Math.min(100 - pct, goal > 0 ? Math.round((cartAdd / goal) * 100) : 0);
    const over = totalWithCart > goal;

    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {cartAdd > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", background: "#fffbeb", padding: "1px 6px", borderRadius: 99 }}>
                            🛒 +{cartAdd}g
                        </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, color: over ? "#ef4444" : "#9ca3af" }}>
                        {totalWithCart}g / {goal}g {over && "⚠️"}
                    </span>
                </div>
            </div>
            <div style={{ height: 10, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", position: "relative" }}>
                {/* logged */}
                <div style={{
                    position: "absolute", left: 0, top: 0, height: "100%",
                    width: `${pct}%`, background: over ? "#ef4444" : color,
                    borderRadius: 99, transition: "width 0.5s ease",
                    boxShadow: `0 0 8px ${color}60`,
                }} />
                {/* cart pending */}
                {cartAdd > 0 && (
                    <div style={{
                        position: "absolute", left: `${pct}%`, top: 0, height: "100%",
                        width: `${cartPct}%`, background: "#f59e0b",
                        borderRadius: 99, opacity: 0.7,
                        transition: "all 0.5s ease",
                        animation: "cartPulse 1.5s ease-in-out infinite",
                    }} />
                )}
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────
function NutritionScanner() {
    const navigate = useNavigate();
    const fileRef  = useRef(null);

    const [dietPlan, setDietPlan]           = useState(null);
    const [foodLog, setFoodLog]             = useState([]);
    const [scanning, setScanning]           = useState(false);
    const [scanResult, setScanResult]       = useState(null);
    const [scanError, setScanError]         = useState(null);
    const [previewImg, setPreviewImg]       = useState(null);
    const [logging, setLogging]             = useState(false);
    const [logSuccess, setLogSuccess]       = useState(false);
    const [showSetup, setShowSetup]         = useState(false);
    const [orderLogged, setOrderLogged] = useState(false);

    useEffect(() => { fetchDietData(); }, []);

    // ── Watch Redux orderPlacedAt — fires when CheckOutPage dispatches orderPlaced() ──
    const orderPlacedAt = useSelector(s => s.user?.orderPlacedAt);
    useEffect(() => {
        if (!orderPlacedAt) return;
        // Wait 1.5s for CheckOutPage nutrition POST calls to finish
        const t = setTimeout(() => {
            fetchFoodLog();
            setOrderLogged(true);
            setTimeout(() => setOrderLogged(false), 3000);
        }, 1500);
        return () => clearTimeout(t);
    }, [orderPlacedAt]);

    const fetchFoodLog = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/diet/log/today`, { withCredentials: true });
            setFoodLog(res.data || []);
        } catch {}
    };

    const fetchDietData = async () => {
        try {
            const [planRes, logRes] = await Promise.all([
                axios.get(`${serverUrl}/api/diet/plan`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/diet/log/today`, { withCredentials: true }),
            ]);
            if (planRes.data?.dietPlan?.goal) {
                setDietPlan(planRes.data.dietPlan);
            } else {
                setShowSetup(true);
            }
            setFoodLog(logRes.data || []);
        } catch (err) { console.error(err); }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewImg(URL.createObjectURL(file));
        setScanResult(null); setScanError(null); setLogSuccess(false);
        setScanning(true);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const res = await axios.post(`${serverUrl}/api/nutrition/scan`, fd, { withCredentials: true });
            setScanResult(res.data.nutrition);
        } catch (err) {
            setScanError(err.response?.data?.message || "Scan failed");
        } finally { setScanning(false); }
    };

    const handleLogFood = async () => {
        if (!scanResult) return;
        setLogging(true);
        try {
            await axios.post(`${serverUrl}/api/diet/log`, { ...scanResult, source: "scan" }, { withCredentials: true });
            setFoodLog(prev => [{ ...scanResult, loggedAt: new Date() }, ...prev]);
            setLogSuccess(true);
            setScanResult(null); setPreviewImg(null);
            setTimeout(() => setLogSuccess(false), 2000);
        } catch {}
        finally { setLogging(false); }
    };

    const handleDeleteLog = async (logId) => {
        try {
            await axios.delete(`${serverUrl}/api/diet/log/${logId}`, { withCredentials: true });
            setFoodLog(prev => prev.filter(e => e._id !== logId));
        } catch {}
    };

    // ── Totals ─────────────────────────────────────────────
    const logged = foodLog.reduce((t, e) => ({
        calories: t.calories + (e.calories || 0),
        protein:  t.protein  + (e.protein  || 0),
        carbs:    t.carbs    + (e.carbs    || 0),
        fat:      t.fat      + (e.fat      || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const goals = dietPlan ? {
        cal:     dietPlan.calorieGoal,
        protein: dietPlan.proteinGoal,
        carbs:   dietPlan.carbsGoal,
        fat:     dietPlan.fatGoal,
    } : { cal: 2000, protein: 80, carbs: 250, fat: 65 };

    const remaining = {
        calories: Math.max(0, goals.cal     - logged.calories),
        protein:  Math.max(0, goals.protein - logged.protein),
        carbs:    Math.max(0, goals.carbs   - logged.carbs),
        fat:      Math.max(0, goals.fat     - logged.fat),
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin    { to{transform:rotate(360deg)} }
                @keyframes popIn   { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
                @keyframes cartPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
                @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0)} 50%{box-shadow:0 0 0 6px rgba(245,158,11,0.2)} }
                @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
                .ns-order-toast { position:fixed; bottom:32px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#1a1a2e,#16213e); color:white; border-radius:20px; padding:14px 24px; font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; z-index:999; box-shadow:0 8px 32px rgba(0,0,0,0.25); display:flex; align-items:center; gap:10px; animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1); white-space:nowrap; }

                .ns-root { font-family:'Plus Jakarta Sans',sans-serif; min-height:100vh; background:linear-gradient(145deg,#fff9f5 0%,#fdf8ff 40%,#f0fdf9 100%); }
                .ns-container { max-width:860px; margin:0 auto; padding:clamp(84px,11vw,96px) 16px 80px; }
                .ns-back { width:40px; height:40px; border-radius:12px; border:1.5px solid rgba(255,107,53,0.15); background:white; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#ff6b35; transition:transform 0.15s; margin-bottom:20px; }
                .ns-back:hover { transform:translateX(-2px); }

                /* PROGRESS CARD */
                .ns-progress-card { background:white; border-radius:24px; padding:24px; box-shadow:0 4px 24px rgba(0,0,0,0.07); border:1.5px solid rgba(255,255,255,0.9); margin-bottom:20px; animation:fadeUp 0.4s ease; }
                .ns-progress-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }

                /* RINGS ROW */
                .ns-rings-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:20px; flex-wrap:wrap; }

                /* CART IMPACT BANNER */
                .ns-cart-banner { background:linear-gradient(135deg,#fffbeb,#fff5f0); border:1.5px solid rgba(245,158,11,0.3); border-radius:16px; padding:14px 18px; margin-bottom:18px; animation:slideIn 0.3s ease; }
                .ns-cart-banner-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0; cursor:pointer; }
                .ns-cart-banner-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; color:#92400e; display:flex; align-items:center; gap:8px; }
                .ns-cart-chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
                .ns-cart-chip { background:white; border-radius:10px; padding:8px 12px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1.5px solid rgba(245,158,11,0.15); flex:1; min-width:60px; }
                .ns-cart-chip-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:16px; color:#f59e0b; }
                .ns-cart-chip-lbl { font-size:9px; font-weight:700; color:#9ca3af; }

                /* REMAINING */
                .ns-remaining { background:linear-gradient(135deg,#f0fdf4,#fff); border:1.5px solid rgba(34,197,94,0.2); border-radius:14px; padding:12px 16px; margin-top:16px; }
                .ns-remaining-title { font-size:11px; font-weight:800; color:#16a34a; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em; }
                .ns-remaining-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
                .ns-rem-item { text-align:center; }
                .ns-rem-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:15px; color:#1a1a2e; }
                .ns-rem-lbl { font-size:9px; font-weight:700; color:#9ca3af; }

                /* SCANNER */
                .ns-scanner-card { background:white; border-radius:24px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.07); border:1.5px solid rgba(255,255,255,0.9); margin-bottom:20px; animation:fadeUp 0.4s ease; }
                .ns-scan-area { padding:28px; display:flex; flex-direction:column; align-items:center; gap:16px; }
                .ns-scan-preview { width:160px; height:160px; border-radius:20px; object-fit:cover; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
                .ns-scan-placeholder { width:160px; height:160px; border-radius:20px; border:2px dashed #fdba74; background:#fff7ed; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; gap:8px; transition:all 0.2s; }
                .ns-scan-placeholder:hover { border-color:#ff6b35; background:#fff3e8; }
                .ns-scan-btn { display:flex; align-items:center; gap:8px; padding:12px 28px; border-radius:14px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:14px; color:white; background:linear-gradient(135deg,#ff6b35,#ff3cac); box-shadow:0 6px 20px rgba(255,107,53,0.4); transition:transform 0.15s; }
                .ns-scan-btn:hover { transform:translateY(-2px); }
                .ns-scan-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

                /* RESULT */
                .ns-result { padding:20px 24px; border-top:1.5px solid #f9fafb; animation:popIn 0.3s ease; }
                .ns-result-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:16px; color:#1a1a2e; margin-bottom:12px; }
                .ns-macro-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
                .ns-macro-chip { background:#f9fafb; border-radius:14px; padding:12px 10px; text-align:center; border:1.5px solid #f3f4f6; }
                .ns-macro-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:18px; }
                .ns-macro-lbl { font-size:10px; font-weight:600; color:#9ca3af; margin-top:2px; }
                .ns-log-btn { width:100%; padding:12px; border-radius:14px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:14px; color:white; background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 4px 16px rgba(34,197,94,0.4); transition:transform 0.15s; }
                .ns-log-btn:hover { transform:translateY(-1px); }
                .ns-log-btn:disabled { opacity:0.6; cursor:not-allowed; }

                /* LOG CARD */
                .ns-log-card { background:white; border-radius:24px; padding:24px; box-shadow:0 4px 24px rgba(0,0,0,0.07); border:1.5px solid rgba(255,255,255,0.9); animation:fadeUp 0.4s ease; }
                .ns-log-item { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1.5px solid #f9fafb; }
                .ns-log-item:last-child { border-bottom:none; }
                .ns-log-name { font-family:'Nunito',sans-serif; font-weight:800; font-size:13px; color:#1a1a2e; }
                .ns-log-macros { font-size:11px; color:#9ca3af; font-weight:600; margin-top:2px; }
                .ns-del-btn { width:30px; height:30px; border-radius:8px; border:none; background:#fff5f5; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.2s; }
                .ns-del-btn:hover { background:#fee2e2; }

                .ns-spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.4); border-top:2px solid white; animation:spin 0.7s linear infinite; }
            `}</style>

            <div className="ns-root">
                <Navbar />

                {/* ── ORDER SUCCESS TOAST ── */}
                {orderLogged && (
                    <div className="ns-order-toast">
                        🎉 Order ka nutrition track ho gaya! Progress update ho gaya ✅
                    </div>
                )}

                <div className="ns-container">
                    <button className="ns-back" onClick={() => navigate(-1)}><FaArrowLeft size={13} /></button>

                    {showSetup && (
                        <DietSetupModal
                            initialPlan={dietPlan}
                            onClose={() => setShowSetup(false)}
                            onSave={(plan) => {
                                setDietPlan({
                                    goal: plan.goal, calorieGoal: plan.calorieGoal,
                                    proteinGoal: plan.proteinGoal, carbsGoal: plan.carbsGoal,
                                    fatGoal: plan.fatGoal, foodPreference: plan.foodPreference,
                                });
                                setShowSetup(false);
                            }}
                        />
                    )}

                    {/* ── PROGRESS CARD ── */}
                    {dietPlan && (
                        <div className="ns-progress-card">
                            <div className="ns-progress-header">
                                <div>
                                    <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: "#1a1a2e" }}>
                                        Today's Progress 📊
                                    </div>
                                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                                        {GOAL_PRESETS[dietPlan.goal]?.label || "Custom"} • {dietPlan.foodPreference} preference
                                    </div>
                                </div>
                                <button onClick={() => setShowSetup(true)}
                                    style={{ fontSize: 11, fontWeight: 700, color: "#ff6b35", background: "#fff5f0", border: "1.5px solid rgba(255,107,53,0.2)", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                    Edit Goal
                                </button>
                            </div>

                            {/* ── 4 Rings ── */}
                            <div className="ns-rings-row">
                                <Ring value={logged.calories} max={goals.cal}     color="#ff6b35" size={120} stroke={11} label="Calories" unit="kcal" />
                                <Ring value={logged.protein}  max={goals.protein} color="#3b82f6" size={90}  stroke={9}  label="Protein"  unit="g" />
                                <Ring value={logged.carbs}    max={goals.carbs}   color="#f59e0b" size={90}  stroke={9}  label="Carbs"    unit="g" />
                                <Ring value={logged.fat}      max={goals.fat}     color="#ef4444" size={90}  stroke={9}  label="Fat"      unit="g" />
                            </div>

                            {/* ── Macro Bars ── */}
                            <MacroBar label="🍗 Protein" current={logged.protein} cartAdd={0} goal={goals.protein} color="#3b82f6" />
                            <MacroBar label="🍞 Carbs"   current={logged.carbs}   cartAdd={0} goal={goals.carbs}   color="#f59e0b" />
                            <MacroBar label="🧈 Fat"     current={logged.fat}     cartAdd={0} goal={goals.fat}     color="#ef4444" />


                            {/* ── Remaining Goals ── */}
                            <div className="ns-remaining">
                                <div className="ns-remaining-title">✅ Abhi bhi bacha hai (goal tak)</div>
                                <div className="ns-remaining-grid">
                                    {[
                                        { label: "Calories", val: remaining.calories, unit: "kcal", color: "#ff6b35" },
                                        { label: "Protein",  val: remaining.protein,  unit: "g",    color: "#3b82f6" },
                                        { label: "Carbs",    val: remaining.carbs,    unit: "g",    color: "#f59e0b" },
                                        { label: "Fat",      val: remaining.fat,      unit: "g",    color: "#ef4444" },
                                    ].map(m => (
                                        <div key={m.label} className="ns-rem-item">
                                            <div className="ns-rem-val" style={{ color: m.val === 0 ? "#22c55e" : m.color }}>
                                                {m.val === 0 ? "✓" : m.val}
                                            </div>
                                            <div className="ns-rem-lbl">{m.label} {m.val > 0 ? m.unit : ""}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SCANNER CARD ── */}
                    <div className="ns-scanner-card">
                        <div style={{ padding: "18px 24px 0", borderBottom: "1.5px solid #f9fafb" }}>
                            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: "#1a1a2e", marginBottom: 4 }}>
                                📸 Food Scanner
                            </div>
                            <div style={{ fontSize: 12, color: "#9ca3af", paddingBottom: 14 }}>
                                Khane ki photo lo — AI nutrition detect karega
                            </div>
                        </div>
                        <div className="ns-scan-area">
                            {previewImg
                                ? <img src={previewImg} className="ns-scan-preview" alt="food" />
                                : (
                                    <div className="ns-scan-placeholder" onClick={() => fileRef.current?.click()}>
                                        <MdOutlineScanner style={{ fontSize: 40, color: "#fdba74" }} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c" }}>Tap to scan food</span>
                                    </div>
                                )
                            }
                            <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleImageChange} />
                            <button className="ns-scan-btn" onClick={() => fileRef.current?.click()} disabled={scanning}>
                                {scanning
                                    ? <><span className="ns-spinner" /> Scanning…</>
                                    : <><FaCamera size={14} /> {previewImg ? "Scan Another" : "Scan Food"}</>
                                }
                            </button>
                            {scanError && (
                                <div style={{ background: "#fff5f5", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 16px", color: "#ef4444", fontSize: 12, fontWeight: 600 }}>
                                    ❌ {scanError}
                                </div>
                            )}
                            {logSuccess && (
                                <div style={{ background: "#f0fdf4", border: "1.5px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "10px 16px", color: "#16a34a", fontSize: 13, fontWeight: 700, animation: "popIn 0.2s ease" }}>
                                    ✅ Food logged successfully!
                                </div>
                            )}
                        </div>

                        {scanResult && (
                            <div className="ns-result">
                                <div className="ns-result-title">
                                    🍽️ {scanResult.foodName}
                                    {scanResult.detectedFoods?.length > 1 && (
                                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginLeft: 8 }}>
                                            (also: {scanResult.detectedFoods.slice(1).join(", ")})
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "10px 16px", background: "linear-gradient(135deg,#fff5f0,#fff0f8)", borderRadius: 14 }}>
                                    <FaFire style={{ color: "#ff6b35", fontSize: 20 }} />
                                    <div>
                                        <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 24, background: "linear-gradient(135deg,#ff6b35,#ff3cac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                            {scanResult.calories} kcal
                                        </div>
                                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Total Calories • {scanResult.servingSize}</div>
                                    </div>
                                    {dietPlan && (
                                        <div style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: (logged.calories + scanResult.calories) > goals.cal ? "#ef4444" : "#22c55e" }}>
                                            {(logged.calories + scanResult.calories) > goals.cal ? "⚠️ Over limit" : "✅ Within goal"}
                                        </div>
                                    )}
                                </div>
                                <div className="ns-macro-grid">
                                    {[
                                        { label: "Protein",    val: scanResult.protein,    unit: "g",  color: "#3b82f6" },
                                        { label: "Carbs",      val: scanResult.carbs,      unit: "g",  color: "#f59e0b" },
                                        { label: "Fat",        val: scanResult.fat,        unit: "g",  color: "#ef4444" },
                                        { label: "Fiber",      val: scanResult.fiber,      unit: "g",  color: "#22c55e" },
                                        { label: "Sugar",      val: scanResult.sugar,      unit: "g",  color: "#a855f7" },
                                        { label: "Confidence", val: scanResult.confidence, unit: "",   color: "#6b7280" },
                                    ].map(m => (
                                        <div key={m.label} className="ns-macro-chip">
                                            <div className="ns-macro-val" style={{ color: m.color }}>{m.val}{m.unit}</div>
                                            <div className="ns-macro-lbl">{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="ns-log-btn" onClick={handleLogFood} disabled={logging}>
                                    {logging ? "Logging…" : "✅ Add to Today's Log"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── TODAY'S LOG ── */}
                    <div className="ns-log-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: "#1a1a2e" }}>
                                📋 Today's Food Log
                            </div>
                            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{foodLog.length} items</span>
                        </div>
                        {foodLog.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
                                Abhi kuch scan nahi kiya — khana scan karo!
                            </div>
                        ) : (
                            foodLog.map((entry, i) => (
                                <div key={entry._id || i} className="ns-log-item">
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#fff5f0,#fff0f8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍽️</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="ns-log-name">{entry.foodName}</div>
                                        <div className="ns-log-macros">🔥 {entry.calories}kcal · P:{entry.protein}g · C:{entry.carbs}g · F:{entry.fat}g</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>
                                        {new Date(entry.loggedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    {entry._id && (
                                        <button className="ns-del-btn" onClick={() => handleDeleteLog(entry._id)}>
                                            <FaTrash size={11} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default NutritionScanner;