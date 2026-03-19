import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

const GOAL_PRESETS = {
    weight_loss:  { label:"Weight Loss 🔥", cal:1500, protein:120, carbs:150, fat:50,  color:"#ef4444" },
    muscle_gain:  { label:"Muscle Gain 💪", cal:2500, protein:180, carbs:300, fat:70,  color:"#3b82f6" },
    balanced:     { label:"Balanced 🌿",    cal:2000, protein:80,  carbs:250, fat:65,  color:"#22c55e" },
    custom:       { label:"Custom 🎯",      cal:2000, protein:80,  carbs:250, fat:65,  color:"#a855f7" },
};

// ── Harris-Benedict BMR → TDEE → Macros ──
// FIX: returns { cal, protein, carbs, fat } — consistent with GOAL_PRESETS keys
function calculateNutrition({ age, weight, height, gender, activity, goal }) {
    let bmr = gender === "male"
        ? 88.36  + (13.4  * weight) + (4.8  * height) - (5.7  * age)
        : 447.6  + (9.25  * weight) + (3.1  * height) - (4.33 * age);

    const multipliers = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
    const tdee = bmr * (multipliers[activity] || 1.55);

    const cal = Math.round(
        goal === "weight_loss"  ? tdee - 500  :
        goal === "muscle_gain"  ? tdee + 300  :
        tdee
    );

    const protein = Math.round(weight * (goal === "muscle_gain" ? 2.2 : goal === "weight_loss" ? 2.0 : 1.6));
    const fat     = Math.round((cal * 0.25) / 9);
    const carbs   = Math.round((cal - protein * 4 - fat * 9) / 4);

    // ✅ Key is "cal" not "calories" — matches GOAL_PRESETS & handleSave logic
    return { cal, protein, carbs: Math.max(carbs, 50), fat };
}

function DietSetupModal({ onSave, onClose, initialPlan }) {
    const [activeTab, setActiveTab]   = useState("preset");
    const [saving, setSaving]         = useState(false);
    const [foodPref, setFoodPref]     = useState(initialPlan?.foodPreference || "mixed");

    // Preset tab
    const [selectedGoal, setSelectedGoal] = useState(initialPlan?.goal || "balanced");
    const [customGoals, setCustomGoals]   = useState({
        cal:     initialPlan?.calorieGoal  || 2000,
        protein: initialPlan?.proteinGoal  || 80,
        carbs:   initialPlan?.carbsGoal    || 250,
        fat:     initialPlan?.fatGoal      || 65,
    });

    // AI tab
    const [age, setAge]               = useState("");
    const [weight, setWeight]         = useState("");
    const [height, setHeight]         = useState("");
    const [gender, setGender]         = useState("male");
    const [activity, setActivity]     = useState("moderate");
    const [aiGoal, setAiGoal]         = useState("balanced");
    const [aiResult, setAiResult]     = useState(null);   // { cal, protein, carbs, fat }
    const [predicting, setPredicting] = useState(false);

    const handlePredict = () => {
        if (!age || !weight || !height) return;
        setPredicting(true);
        setTimeout(() => {
            const result = calculateNutrition({
                age: Number(age), weight: Number(weight),
                height: Number(height), gender, activity, goal: aiGoal,
            });
            setAiResult(result);   // { cal, protein, carbs, fat } ✅
            setPredicting(false);
        }, 800);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const preset = GOAL_PRESETS[selectedGoal];

            // ✅ All branches now produce { cal, protein, carbs, fat }
            const goals =
                activeTab === "ai" && aiResult
                    ? aiResult                                                                        // { cal, protein, carbs, fat }
                    : selectedGoal === "custom"
                        ? customGoals                                                                 // { cal, protein, carbs, fat }
                        : { cal: preset.cal, protein: preset.protein, carbs: preset.carbs, fat: preset.fat };

            const payload = {
                goal:           activeTab === "ai" ? aiGoal : selectedGoal,
                calorieGoal:    goals.cal,       // ✅ always defined now
                proteinGoal:    goals.protein,
                carbsGoal:      goals.carbs,
                fatGoal:        goals.fat,
                foodPreference: foodPref,
            };

            await axios.put(`${serverUrl}/api/diet/plan`, payload, { withCredentials: true });
            onSave(payload);
        } catch (err) {
            console.error("DietSetupModal save error:", err);
        } finally {
            setSaving(false);
        }
    };

    const inp = {
        border:"2px solid #f3f4f6", borderRadius:12, padding:"10px 14px",
        fontSize:14, fontWeight:600, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif",
        width:"100%", background:"#f9fafb", transition:"border-color 0.2s",
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes popIn  { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes spin   { to{transform:rotate(360deg)} }

                .dsm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:500; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.2s ease; }
                .dsm-card { background:white; border-radius:28px; width:100%; max-width:500px; max-height:90vh; overflow-y:auto; animation:popIn 0.3s ease; font-family:'Plus Jakarta Sans',sans-serif; }
                .dsm-card::-webkit-scrollbar { width:4px; }
                .dsm-card::-webkit-scrollbar-thumb { background:rgba(255,107,53,0.2); border-radius:4px; }

                .dsm-header { padding:28px 28px 0; }
                .dsm-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:22px; color:#1a1a2e; margin-bottom:6px; }
                .dsm-sub { font-size:13px; color:#9ca3af; margin-bottom:20px; }

                .dsm-tabs { display:flex; gap:0; background:#f3f4f6; border-radius:14px; padding:4px; margin-bottom:20px; }
                .dsm-tab { flex:1; padding:9px 8px; border-radius:10px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:700; transition:all 0.2s; background:transparent; color:#9ca3af; }
                .dsm-tab.active { background:white; color:#1a1a2e; box-shadow:0 2px 8px rgba(0,0,0,0.1); }

                .dsm-body { padding:0 28px 28px; }

                .dsm-goal-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
                .dsm-goal-btn { padding:14px 10px; border-radius:16px; border:2px solid #e5e7eb; background:#f9fafb; cursor:pointer; text-align:center; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
                .dsm-goal-btn.active { box-shadow:0 4px 14px rgba(0,0,0,0.1); }
                .dsm-goal-label { font-size:13px; font-weight:800; margin-bottom:4px; }
                .dsm-goal-cal { font-size:11px; color:#9ca3af; font-weight:600; }

                .dsm-custom-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }

                .dsm-ai-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
                .dsm-label { font-size:12px; font-weight:700; color:#374151; margin-bottom:5px; display:block; }
                .dsm-select { border:2px solid #f3f4f6; border-radius:12px; font-size:13px; font-weight:600; outline:none; font-family:'Plus Jakarta Sans',sans-serif; background:#f9fafb; width:100%; padding:10px 14px; cursor:pointer; }

                .dsm-gender-row { display:flex; gap:8px; }
                .dsm-gender-btn { flex:1; padding:10px; border-radius:12px; border:2px solid #e5e7eb; background:#f9fafb; cursor:pointer; font-size:13px; font-weight:700; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; color:#9ca3af; }
                .dsm-gender-btn.active { border-color:#ff6b35; background:#fff5f0; color:#ff6b35; }

                .dsm-ai-result { background:linear-gradient(135deg,#f0fdf4,#fff5f0); border:1.5px solid rgba(34,197,94,0.2); border-radius:18px; padding:16px 20px; margin-bottom:16px; animation:popIn 0.3s ease; }
                .dsm-ai-result-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:15px; color:#1a1a2e; margin-bottom:12px; }
                .dsm-macro-row { display:flex; gap:10px; }
                .dsm-macro-chip { flex:1; background:white; border-radius:12px; padding:10px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
                .dsm-macro-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:18px; }
                .dsm-macro-lbl { font-size:10px; font-weight:600; color:#9ca3af; margin-top:2px; }

                .dsm-pref-row { display:flex; gap:8px; margin-bottom:20px; }
                .dsm-pref-btn { flex:1; padding:10px; border-radius:12px; border:2px solid #e5e7eb; background:#f9fafb; cursor:pointer; font-size:12px; font-weight:700; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; color:#9ca3af; }

                .dsm-predict-btn { width:100%; padding:12px; border-radius:14px; border:none; background:linear-gradient(135deg,#7c3aed,#a855f7); color:white; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:14px; cursor:pointer; margin-bottom:12px; box-shadow:0 4px 14px rgba(124,58,237,0.35); transition:transform 0.15s; }
                .dsm-predict-btn:hover { transform:translateY(-1px); }
                .dsm-predict-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

                .dsm-save-btn { width:100%; padding:14px; border-radius:16px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:15px; cursor:pointer; box-shadow:0 6px 20px rgba(255,107,53,0.4); transition:transform 0.15s; }
                .dsm-save-btn:hover { transform:translateY(-1px); }
                .dsm-save-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

                .dsm-spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.4); border-top:2px solid white; animation:spin 0.7s linear infinite; display:inline-block; margin-right:6px; vertical-align:middle; }
            `}</style>

            <div className="dsm-overlay" onClick={onClose}>
                <div className="dsm-card" onClick={e => e.stopPropagation()}>

                    <div className="dsm-header">
                        <div className="dsm-title">🎯 Set Your Diet Goal</div>
                        <div className="dsm-sub">Apna goal choose karo ya AI se calculate karwao</div>

                        <div className="dsm-tabs">
                            <button className={`dsm-tab ${activeTab==="preset"?"active":""}`} onClick={() => setActiveTab("preset")}>
                                🎯 Choose Goal
                            </button>
                            <button className={`dsm-tab ${activeTab==="ai"?"active":""}`} onClick={() => setActiveTab("ai")}>
                                🤖 AI Predictor
                            </button>
                        </div>
                    </div>

                    <div className="dsm-body">

                        {/* ── PRESET TAB ── */}
                        {activeTab === "preset" && (
                            <>
                                <div className="dsm-goal-grid">
                                    {Object.entries(GOAL_PRESETS).map(([key, g]) => (
                                        <button key={key}
                                            className={`dsm-goal-btn ${selectedGoal===key?"active":""}`}
                                            style={{
                                                borderColor: selectedGoal===key ? g.color : "#e5e7eb",
                                                background:  selectedGoal===key ? g.color+"12" : "#f9fafb",
                                            }}
                                            onClick={() => setSelectedGoal(key)}>
                                            <div className="dsm-goal-label" style={{ color: selectedGoal===key ? g.color : "#374151" }}>{g.label}</div>
                                            <div className="dsm-goal-cal">{g.cal} kcal</div>
                                        </button>
                                    ))}
                                </div>

                                {selectedGoal === "custom" && (
                                    <div className="dsm-custom-grid">
                                        {[
                                            { key:"cal",     label:"Calories (kcal)", color:"#ff6b35" },
                                            { key:"protein", label:"Protein (g)",     color:"#3b82f6" },
                                            { key:"carbs",   label:"Carbs (g)",       color:"#f59e0b" },
                                            { key:"fat",     label:"Fat (g)",         color:"#ef4444" },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label className="dsm-label" style={{ color:f.color }}>{f.label}</label>
                                                <input
                                                    type="number"
                                                    style={{ ...inp, borderColor: customGoals[f.key] ? f.color+"40" : "#f3f4f6" }}
                                                    value={customGoals[f.key]}
                                                    onChange={e => setCustomGoals(p => ({...p, [f.key]: Number(e.target.value)}))}
                                                    onFocus={e => e.target.style.borderColor = f.color}
                                                    onBlur={e => e.target.style.borderColor = "#f3f4f6"}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── AI PREDICTOR TAB ── */}
                        {activeTab === "ai" && (
                            <>
                                <div style={{ background:"#faf5ff", border:"1.5px solid rgba(168,85,247,0.2)", borderRadius:14, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#7c3aed", fontWeight:600 }}>
                                    🤖 Apni details do — AI tumhara perfect diet plan calculate karega (Harris-Benedict formula)
                                </div>

                                <div style={{ marginBottom:14 }}>
                                    <label className="dsm-label">Gender</label>
                                    <div className="dsm-gender-row">
                                        <button className={`dsm-gender-btn ${gender==="male"?"active":""}`} onClick={() => setGender("male")}>👨 Male</button>
                                        <button className={`dsm-gender-btn ${gender==="female"?"active":""}`} onClick={() => setGender("female")}>👩 Female</button>
                                    </div>
                                </div>

                                <div className="dsm-ai-grid">
                                    <div>
                                        <label className="dsm-label">Age (years)</label>
                                        <input type="number" placeholder="25" style={inp} value={age} onChange={e => setAge(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="dsm-label">Weight (kg)</label>
                                        <input type="number" placeholder="70" style={inp} value={weight} onChange={e => setWeight(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="dsm-label">Height (cm)</label>
                                        <input type="number" placeholder="170" style={inp} value={height} onChange={e => setHeight(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="dsm-label">Goal</label>
                                        <select className="dsm-select" value={aiGoal} onChange={e => setAiGoal(e.target.value)}>
                                            <option value="weight_loss">Weight Loss 🔥</option>
                                            <option value="muscle_gain">Muscle Gain 💪</option>
                                            <option value="balanced">Balanced 🌿</option>
                                        </select>
                                    </div>
                                    <div style={{ gridColumn:"1/-1" }}>
                                        <label className="dsm-label">Activity Level</label>
                                        <select className="dsm-select" value={activity} onChange={e => setActivity(e.target.value)}>
                                            <option value="sedentary">🪑 Sedentary (office job, no exercise)</option>
                                            <option value="light">🚶 Light (1-2 days/week exercise)</option>
                                            <option value="moderate">🏃 Moderate (3-5 days/week)</option>
                                            <option value="active">💪 Active (6-7 days/week)</option>
                                            <option value="very_active">🔥 Very Active (2x training/day)</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="dsm-predict-btn" onClick={handlePredict}
                                    disabled={!age || !weight || !height || predicting}>
                                    {predicting
                                        ? <><span className="dsm-spinner" /> Calculating…</>
                                        : "🤖 Calculate My Goals"
                                    }
                                </button>

                                {/* ✅ aiResult.cal correctly shown (was aiResult.calories before — would show undefined) */}
                                {aiResult && (
                                    <div className="dsm-ai-result">
                                        <div className="dsm-ai-result-title">✅ Your Personalized Goals:</div>
                                        <div className="dsm-macro-row">
                                            {[
                                                { label:"Calories", val: aiResult.cal,     unit:"kcal", color:"#ff6b35" },
                                                { label:"Protein",  val: aiResult.protein, unit:"g",    color:"#3b82f6" },
                                                { label:"Carbs",    val: aiResult.carbs,   unit:"g",    color:"#f59e0b" },
                                                { label:"Fat",      val: aiResult.fat,     unit:"g",    color:"#ef4444" },
                                            ].map(m => (
                                                <div key={m.label} className="dsm-macro-chip">
                                                    <div className="dsm-macro-val" style={{ color:m.color }}>{m.val}</div>
                                                    <div className="dsm-macro-lbl">{m.label} {m.unit}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:10, fontWeight:600 }}>
                                            BMR calculated using Harris-Benedict equation
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── FOOD PREFERENCE ── */}
                        <div>
                            <label className="dsm-label">Food Preference</label>
                            <div className="dsm-pref-row">
                                {[
                                    ["veg",    "🥗 Veg",    "#16a34a", "#f0fdf4"],
                                    ["nonveg", "🍗 Non-Veg","#dc2626", "#fff1f2"],
                                    ["mixed",  "🍽️ Mixed",  "#ff6b35", "#fff5f0"],
                                ].map(([val, label, color, bg]) => (
                                    <button key={val} className="dsm-pref-btn"
                                        style={{
                                            borderColor: foodPref===val ? color : "#e5e7eb",
                                            background:  foodPref===val ? bg    : "#f9fafb",
                                            color:       foodPref===val ? color : "#9ca3af",
                                        }}
                                        onClick={() => setFoodPref(val)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SAVE */}
                        <button className="dsm-save-btn" onClick={handleSave}
                            disabled={saving || (activeTab==="ai" && !aiResult)}>
                            {saving
                                ? <><span className="dsm-spinner" /> Saving…</>
                                : "Save Diet Plan →"
                            }
                        </button>

                        {activeTab === "ai" && !aiResult && (
                            <p style={{ textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:10 }}>
                                Pehle "Calculate My Goals" click karo
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default DietSetupModal;