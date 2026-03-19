// components/ScannerCard.jsx
// Dashboard pe dikhne wala scanner shortcut card
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFire } from "react-icons/fa";
import { MdOutlineScanner } from "react-icons/md";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function ScannerCard() {
    const navigate = useNavigate();
    const [todayStats, setTodayStats] = useState(null);
    const [dietPlan, setDietPlan]     = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [planRes, logRes] = await Promise.all([
                    axios.get(`${serverUrl}/api/diet/plan`, { withCredentials: true }),
                    axios.get(`${serverUrl}/api/diet/log/today`, { withCredentials: true }),
                ]);
                setDietPlan(planRes.data?.dietPlan || null);
                const log = logRes.data || [];
                setTodayStats({
                    calories: log.reduce((t, e) => t + (e.calories || 0), 0),
                    items:    log.length,
                });
            } catch {}
        };
        fetchData();
    }, []);

    const calGoal = dietPlan?.calorieGoal || 2000;
    const calPct  = todayStats ? Math.min(100, Math.round((todayStats.calories / calGoal) * 100)) : 0;

    return (
        <div
            onClick={() => navigate("/scanner")}
            style={{
                background:    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                borderRadius:  24,
                padding:       "22px 24px",
                cursor:        "pointer",
                boxShadow:     "0 8px 32px rgba(26,26,46,0.3)",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"space-between",
                gap:           16,
                marginBottom:  28,
                transition:    "transform 0.2s, box-shadow 0.2s",
                position:      "relative",
                overflow:      "hidden",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(26,26,46,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,26,46,0.3)"; }}
        >
            {/* Background glow */}
            <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,107,53,0.15)", filter:"blur(40px)", pointerEvents:"none" }} />

            <div style={{ flex: 1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <MdOutlineScanner style={{ color:"#ff6b35", fontSize:20 }} />
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:"white" }}>
                        Food Scanner & Diet
                    </span>
                </div>

                {todayStats ? (
                    <>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                            <FaFire style={{ color:"#ff6b35", fontSize:13 }} />
                            <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.8)" }}>
                                {todayStats.calories} / {calGoal} kcal today
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:99, overflow:"hidden", width:"100%", maxWidth:200 }}>
                            <div style={{
                                height:"100%", borderRadius:99,
                                width:`${calPct}%`,
                                background: calPct > 100 ? "#ef4444" : "linear-gradient(90deg,#ff6b35,#ff3cac)",
                                transition:"width 0.5s ease",
                            }} />
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:4 }}>
                            {todayStats.items} items logged · {calPct}% of goal
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>
                        Scan food to track nutrition & hit your goals
                    </div>
                )}
            </div>

            <div style={{
                width:52, height:52, borderRadius:16, flexShrink:0,
                background:"linear-gradient(135deg,#ff6b35,#ff3cac)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 16px rgba(255,107,53,0.5)",
            }}>
                <MdOutlineScanner style={{ fontSize:26, color:"white" }} />
            </div>
        </div>
    );
}

export default ScannerCard;