import React, { useEffect, useState } from "react";
import axios from "axios";
import FoodCart from "../dashboards/Food_Cart.jsx";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

const GOAL_COLORS = {
    weight_loss: { color:"#ef4444", bg:"#fff5f5", border:"rgba(239,68,68,0.2)", label:"Weight Loss 🔥" },
    muscle_gain: { color:"#3b82f6", bg:"#eff6ff", border:"rgba(59,130,246,0.2)", label:"Muscle Gain 💪" },
    balanced:    { color:"#22c55e", bg:"#f0fdf4", border:"rgba(34,197,94,0.2)",  label:"Balanced 🌿" },
    custom:      { color:"#a855f7", bg:"#faf5ff", border:"rgba(168,85,247,0.2)", label:"Custom 🎯" },
};

function MacroRemaining({ label, remaining, goal, color }) {
    const pct = goal > 0 ? Math.min(100, Math.round((remaining / goal) * 100)) : 0;
    return (
        <div style={{ textAlign:"center", flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color }}>
                {remaining}g
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:"#9ca3af", marginTop:2 }}>{label} left</div>
            <div style={{ height:4, background:"#f3f4f6", borderRadius:99, marginTop:4, overflow:"hidden" }}>
                <div style={{ height:"100%", background:color, borderRadius:99, width:`${pct}%`, transition:"width 0.5s" }} />
            </div>
        </div>
    );
}

function MealSuggestions() {
    const navigate = useNavigate();
    const [data, setData]         = useState(null);
    const [loading, setLoading]   = useState(true);
    const [noPlan, setNoPlan]     = useState(false);

    useEffect(() => { fetchSuggestions(); }, []);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/diet/suggestions`, { withCredentials: true });
            if (!res.data || res.data.length === 0 && !res.data.suggestions) {
                setNoPlan(true);
            } else {
                setData(res.data);
            }
        } catch (err) {
            if (err.response?.status === 404) setNoPlan(true);
        } finally { setLoading(false); }
    };

    // No plan set yet
    if (noPlan) return (
        <div style={{ background:"white", borderRadius:20, padding:"24px", marginBottom:28, boxShadow:"0 4px 20px rgba(0,0,0,0.06)", border:"1.5px dashed #fde8d8", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🎯</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:"#1a1a2e", marginBottom:6 }}>Set Your Diet Goal</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginBottom:14 }}>Diet plan set karo — tumhare goals ke hisaab se meals suggest honge</div>
            <button onClick={() => navigate("/scanner")}
                style={{ padding:"10px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#ff6b35,#ff3cac)", color:"white", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:13, cursor:"pointer", boxShadow:"0 4px 14px rgba(255,107,53,0.35)" }}>
                Set Diet Plan →
            </button>
        </div>
    );

    if (loading) return (
        <div style={{ marginBottom:28 }}>
            <div style={{ height:24, width:200, background:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize:"400px 100%", borderRadius:12, marginBottom:16, animation:"shimmer 1.2s infinite" }} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} style={{ height:180, background:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize:"400px 100%", borderRadius:20, animation:"shimmer 1.2s infinite" }} />
                ))}
            </div>
            <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>
        </div>
    );

    if (!data) return null;

    const { suggestions = [], remaining = {}, consumed = {} } = data;
    const goalKey  = data.goal || "balanced";
    const theme    = GOAL_COLORS[goalKey] || GOAL_COLORS.balanced;

    if (suggestions.length === 0) return (
        <div style={{ background:"white", borderRadius:20, padding:"24px", marginBottom:28, boxShadow:"0 4px 20px rgba(0,0,0,0.06)", border:"1.5px solid rgba(255,255,255,0.9)", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:"#1a1a2e", marginBottom:4 }}>Daily Goals Complete!</div>
            <div style={{ fontSize:12, color:"#9ca3af" }}>Aaj ka nutrition target poora ho gaya 🎉</div>
        </div>
    );

    return (
        <div style={{ marginBottom:28 }}>
            <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

            {/* ── HEADER ── */}
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:14 }}>
                <div>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"clamp(17px,3vw,22px)", color:"#1a1a2e" }}>
                        Suggested for You 🎯
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#9ca3af", marginTop:2 }}>
                        Based on your {theme.label} goal
                    </div>
                </div>
                <span onClick={() => navigate("/scanner")}
                    style={{ fontSize:12, fontWeight:700, color:"#ff6b35", cursor:"pointer" }}>
                    Edit Goal →
                </span>
            </div>

            {/* ── REMAINING MACROS STRIP ── */}
            <div style={{
                background: theme.bg, border:`1.5px solid ${theme.border}`,
                borderRadius:16, padding:"14px 20px", marginBottom:16,
                display:"flex", gap:16, alignItems:"center",
                animation:"fadeUp 0.4s ease",
            }}>
                <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:theme.color, marginBottom:8 }}>
                        Today's Remaining
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                        <MacroRemaining label="Calories" remaining={remaining.calories || 0} goal={remaining.calories + (consumed.calories || 0)} color={theme.color} />
                        <MacroRemaining label="Protein"  remaining={remaining.protein  || 0} goal={remaining.protein  + (consumed.protein  || 0)} color="#3b82f6" />
                        <MacroRemaining label="Carbs"    remaining={remaining.carbs    || 0} goal={remaining.carbs    + (consumed.carbs    || 0)} color="#f59e0b" />
                        <MacroRemaining label="Fat"      remaining={remaining.fat      || 0} goal={remaining.fat      + (consumed.fat      || 0)} color="#ef4444" />
                    </div>
                </div>
            </div>

            {/* ── SUGGESTION CARDS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {suggestions.map((item, idx) => (
                    <div key={item._id} style={{ animation:`fadeUp 0.4s ${idx*0.06}s ease both` }}>
                        <FoodCart item={item} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MealSuggestions;