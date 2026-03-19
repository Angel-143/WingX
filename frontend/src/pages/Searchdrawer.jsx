import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ImCross } from "react-icons/im";
import { FaSearch, FaBolt, FaFire } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/user_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

const CATEGORIES = ["all","biryani","pizza","burger","northindian","southindian",
                    "chinese","sandwich","dessert","beverage","breakfast","salad","starter","maincourse"];

// ── Nutrition remaining calc ────────────────────────────────
function getRemainingGoals(dietPlan, cartItems, menuNutritionMap) {
    if (!dietPlan) return null;
    const cartTotals = cartItems.reduce((acc, item) => {
        const n = menuNutritionMap[item.id] || {};
        const qty = item.quantity || 1;
        return {
            calories: acc.calories + (n.calories || 0) * qty,
            protein:  acc.protein  + (n.protein  || 0) * qty,
            carbs:    acc.carbs    + (n.carbs     || 0) * qty,
            fat:      acc.fat      + (n.fat       || 0) * qty,
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Assume ~30% of daily goals per meal
    const mealGoal = {
        calories: Math.round(dietPlan.calorieGoal * 0.33),
        protein:  Math.round(dietPlan.proteinGoal * 0.33),
        carbs:    Math.round(dietPlan.carbsGoal   * 0.33),
        fat:      Math.round(dietPlan.fatGoal     * 0.33),
    };

    return {
        calories: Math.max(0, mealGoal.calories - cartTotals.calories),
        protein:  Math.max(0, mealGoal.protein  - cartTotals.protein),
        carbs:    Math.max(0, mealGoal.carbs     - cartTotals.carbs),
        fat:      Math.max(0, mealGoal.fat       - cartTotals.fat),
    };
}

// ── Smart Suggestion Engine ─────────────────────────────────
function SuggestionsPanel({ dietPlan, remaining, city, onAddItem, cartItems, menuNutritionMap }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(false);
    const [expanded, setExpanded]       = useState(true);

    // Determine what nutrient is most lacking
    const mostNeeded = () => {
        if (!remaining) return null;
        const gaps = [
            { key: "protein",  gap: remaining.protein  / (dietPlan?.proteinGoal * 0.33 || 1),  label: "Protein",  icon: "💪" },
            { key: "calories", gap: remaining.calories / (dietPlan?.calorieGoal * 0.33 || 1), label: "Calories", icon: "🔥" },
            { key: "carbs",    gap: remaining.carbs    / (dietPlan?.carbsGoal   * 0.33 || 1),  label: "Carbs",    icon: "🍞" },
        ];
        return gaps.sort((a, b) => b.gap - a.gap)[0];
    };

    const needed = mostNeeded();

    useEffect(() => {
        if (!dietPlan || !remaining) return;
        fetchSuggestions();
    }, [dietPlan?.goal, dietPlan?.foodPreference]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (city) params.append("city", city);
            // filter by diet food preference
            if (dietPlan?.foodPreference && dietPlan.foodPreference !== "mixed") {
                params.append("foodType", dietPlan.foodPreference === "veg" ? "veg" : "nonveg");
            }
            // target high-protein if muscle gain, low-cal if weight loss
            if (dietPlan?.goal === "muscle_gain") {
                params.append("minProtein", 15);
            } else if (dietPlan?.goal === "weight_loss") {
                params.append("maxCal", Math.round(dietPlan.calorieGoal * 0.33));
            }
            const res = await axios.get(`${serverUrl}/api/item/search?${params}`, { withCredentials: true });
            // Sort by how well they match the most-needed nutrient
            const items = (res.data || []).slice(0, 20);
            const sorted = items
                .filter(item => !cartItems.find(c => c.id === item._id))
                .sort((a, b) => {
                    if (needed?.key === "protein") {
                        return (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0);
                    } else if (needed?.key === "calories") {
                        // closest to remaining calories wins
                        return Math.abs((a.nutrition?.calories || 0) - remaining.calories)
                             - Math.abs((b.nutrition?.calories || 0) - remaining.calories);
                    }
                    return 0;
                })
                .slice(0, 5);
            setSuggestions(sorted);
        } catch {}
        finally { setLoading(false); }
    };

    if (!dietPlan) return null;

    return (
        <div style={{
            background: "linear-gradient(135deg,#f5f3ff,#fff5f0)",
            border: "1.5px solid rgba(168,85,247,0.2)",
            borderRadius: 18, marginBottom: 16, overflow: "hidden",
            animation: "slideDown 0.3s ease",
        }}>
            <div
                onClick={() => setExpanded(p => !p)}
                style={{
                    padding: "14px 18px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaBolt size={14} style={{ color: "#a855f7" }} />
                    <div>
                        <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 14, color: "#1a1a2e" }}>
                            🎯 Goal ke liye Best Items
                        </div>
                        {needed && (
                            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
                                {needed.icon} Tumhe {needed.label} ki zaroorat hai — ye order karo
                            </div>
                        )}
                    </div>
                </div>
                <span style={{ fontSize: 11, color: "#a855f7", fontWeight: 800 }}>{expanded ? "▲" : "▼"}</span>
            </div>

            {expanded && (
                <div style={{ padding: "0 14px 14px" }}>
                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(168,85,247,0.2)", borderTop: "2px solid #a855f7", animation: "spin 0.7s linear infinite" }} />
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", padding: "12px 0" }}>
                            Koi suggestion nahi mila — search karo
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {suggestions.map((item, idx) => {
                                const qty = cartItems.find(c => c.id === item._id)?.quantity || 0;
                                const n = item.nutrition || {};
                                return (
                                    <div key={item._id} style={{
                                        background: "white", borderRadius: 14, padding: "10px 12px",
                                        display: "flex", alignItems: "center", gap: 10,
                                        border: "1.5px solid rgba(168,85,247,0.1)",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                        animation: `fadeUp 0.3s ease ${idx * 0.06}s both`,
                                    }}>
                                        {item.image
                                            ? <img src={item.image} alt={item.name} style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                                            : <div style={{ width: 46, height: 46, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🍽️</div>
                                        }
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 13, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {item.name}
                                            </div>
                                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 3 }}>
                                                {n.calories > 0 && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#ff6b35", background: "#fff5f0", padding: "1px 6px", borderRadius: 99 }}>
                                                        🔥 {n.calories}kcal
                                                    </span>
                                                )}
                                                {n.protein > 0 && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", padding: "1px 6px", borderRadius: 99 }}>
                                                        P: {n.protein}g
                                                    </span>
                                                )}
                                                <span style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", background: "#f5f3ff", padding: "1px 6px", borderRadius: 99 }}>
                                                    ₹{item.price}
                                                </span>
                                            </div>
                                        </div>
                                        {qty === 0 ? (
                                            <button onClick={() => onAddItem(item)} style={{
                                                background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "white",
                                                border: "none", borderRadius: 10, padding: "7px 12px",
                                                fontSize: 12, fontWeight: 800, cursor: "pointer",
                                                fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0,
                                            }}>+ Add</button>
                                        ) : (
                                            <span style={{ fontSize: 11, fontWeight: 800, color: "#22c55e" }}>✓ In cart</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main SearchDrawer ────────────────────────────────────────
function SearchDrawer({ onClose }) {
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const { CartItem, city } = useSelector(s => s.user);

    const [query, setQuery]         = useState("");
    const [results, setResults]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [searched, setSearched]   = useState(false);
    const [foodType, setFoodType]   = useState("all");
    const [category, setCategory]   = useState("all");
    const [maxCal, setMaxCal]       = useState("");
    const [maxPrice, setMaxPrice]   = useState("");
    const [dietMatch, setDietMatch] = useState(false);
    const [dietPlan, setDietPlan]   = useState(null);
    const [menuNutrition, setMenuNutrition] = useState({});

    useEffect(() => {
        inputRef.current?.focus();
        axios.get(`${serverUrl}/api/diet/plan`, { withCredentials: true })
            .then(res => setDietPlan(res.data?.dietPlan || null))
            .catch(() => {});
    }, []);

    // Fetch nutrition for cart items
    useEffect(() => {
        const unknownIds = (CartItem || []).map(i => i.id).filter(id => !menuNutrition[id]);
        if (unknownIds.length === 0) return;
        Promise.all(
            unknownIds.map(id =>
                axios.get(`${serverUrl}/api/item/${id}`, { withCredentials: true })
                    .then(res => ({ id, nutrition: res.data?.nutrition || {} }))
                    .catch(() => ({ id, nutrition: {} }))
            )
        ).then(results => {
            setMenuNutrition(prev => {
                const next = { ...prev };
                results.forEach(({ id, nutrition }) => { next[id] = nutrition; });
                return next;
            });
        });
    }, [CartItem]);

    const remaining = getRemainingGoals(dietPlan, CartItem || [], menuNutrition);

    const handleSearch = async (q = query) => {
        setLoading(true); setSearched(true);
        try {
            const params = new URLSearchParams();
            if (q.trim())           params.append("q",        q.trim());
            if (city)               params.append("city",      city);
            if (foodType !== "all") params.append("foodType",  foodType);
            if (category !== "all") params.append("category",  category);
            if (maxCal)             params.append("maxCal",    maxCal);
            if (maxPrice)           params.append("maxPrice",  maxPrice);
            if (dietMatch && dietPlan) {
                params.append("maxCal",     Math.round(dietPlan.calorieGoal / 3));
                params.append("minProtein", Math.round(dietPlan.proteinGoal  / 3));
            }
            const res = await axios.get(`${serverUrl}/api/item/search?${params}`, { withCredentials: true });
            setResults(res.data || []);
        } catch { setResults([]); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (searched) handleSearch();
    }, [foodType, category, maxCal, maxPrice, dietMatch]);

    const getQty = (id) => CartItem?.find(i => i.id === id)?.quantity || 0;

    const handleAdd = (item) => dispatch(addToCart({
        id: item._id, name: item.name, price: item.price,
        image: item.image, shop: item.shop?._id || item.shop, quantity: 1,
    }));

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes slideLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
                @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
                @keyframes fadeUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin       { to{transform:rotate(360deg)} }
                @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

                .sd-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); z-index:400; animation:fadeIn 0.2s ease; }
                .sd-drawer { position:fixed; top:0; left:0; bottom:0; width:min(480px,100vw); background:linear-gradient(160deg,#fff9f5 0%,#fdf8ff 100%); z-index:401; display:flex; flex-direction:column; box-shadow:8px 0 40px rgba(0,0,0,0.15); animation:slideLeft 0.3s cubic-bezier(0.34,1.06,0.64,1); font-family:'Plus Jakarta Sans',sans-serif; }

                .sd-header { padding:16px 20px 12px; border-bottom:1.5px solid rgba(255,107,53,0.1); background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); flex-shrink:0; }
                .sd-header-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
                .sd-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:18px; background:linear-gradient(135deg,#ff6b35,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; flex:1; }
                .sd-close { width:32px; height:32px; border-radius:10px; background:#fff0f5; border:1.5px solid #fecdd3; display:flex; align-items:center; justify-content:center; cursor:pointer; }

                .sd-search-wrap { display:flex; gap:8px; }
                .sd-input { flex:1; background:#f8f5ff; border:1.5px solid #ede8ff; border-radius:14px; padding:10px 16px 10px 38px; font-size:13px; font-weight:500; outline:none; font-family:'Plus Jakarta Sans',sans-serif; transition:border-color 0.2s; }
                .sd-input:focus { border-color:#c084fc; box-shadow:0 0 0 3px rgba(192,132,252,0.12); }
                .sd-search-btn { padding:0 16px; border-radius:14px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-weight:800; font-size:13px; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }

                .sd-filters { padding:12px 20px; border-bottom:1.5px solid #f9fafb; flex-shrink:0; display:flex; flex-direction:column; gap:10px; }
                .sd-filter-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
                .sd-filter-label { font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.06em; flex-shrink:0; }
                .sd-chip { padding:5px 12px; border-radius:99px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #e5e7eb; background:#f9fafb; color:#9ca3af; transition:all 0.15s; font-family:'Plus Jakarta Sans',sans-serif; }
                .sd-chip.veg.active    { background:#f0fdf4; border-color:#16a34a; color:#16a34a; }
                .sd-chip.nonveg.active { background:#fff1f2; border-color:#dc2626; color:#dc2626; }
                .sd-chip.allft.active  { background:#fff5f0; border-color:#ff6b35; color:#ff6b35; }
                .sd-cats-scroll { display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }
                .sd-cats-scroll::-webkit-scrollbar { display:none; }
                .sd-cat-chip { padding:5px 12px; border-radius:99px; font-size:11px; font-weight:700; cursor:pointer; border:1.5px solid #e5e7eb; background:#f9fafb; color:#6b7280; transition:all 0.15s; white-space:nowrap; font-family:'Plus Jakarta Sans',sans-serif; }
                .sd-cat-chip.active { background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; border-color:transparent; }
                .sd-num-input { width:72px; border:1.5px solid #e5e7eb; border-radius:10px; padding:5px 10px; font-size:12px; font-weight:600; outline:none; font-family:'Plus Jakarta Sans',sans-serif; }
                .sd-num-input:focus { border-color:#ff6b35; }

                /* GOAL REMAINING BAR */
                .sd-goal-bar { padding:10px 20px; background:white; border-bottom:1.5px solid #f9fafb; flex-shrink:0; }
                .sd-goal-minis { display:flex; gap:8px; }
                .sd-goal-mini { flex:1; background:#f9fafb; border-radius:10px; padding:6px 8px; text-align:center; border:1.5px solid #f3f4f6; }
                .sd-goal-mini-val { font-family:'Nunito',sans-serif; font-weight:900; font-size:13px; }
                .sd-goal-mini-lbl { font-size:9px; font-weight:700; color:#9ca3af; }

                .sd-body { flex:1; overflow-y:auto; padding:14px; }
                .sd-body::-webkit-scrollbar { width:4px; }
                .sd-body::-webkit-scrollbar-thumb { background:rgba(255,107,53,0.2); border-radius:4px; }

                .sd-item-card { background:white; border-radius:16px; display:flex; align-items:center; gap:12px; padding:12px 14px; margin-bottom:10px; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1.5px solid rgba(255,255,255,0.9); animation:fadeUp 0.3s ease both; transition:transform 0.2s; }
                .sd-item-card:hover { transform:translateY(-2px); }
                .sd-item-img { width:56px; height:56px; border-radius:12px; object-fit:cover; flex-shrink:0; background:linear-gradient(135deg,#fff5f0,#fff0f8); display:flex; align-items:center; justify-content:center; font-size:22px; }
                .sd-item-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; color:#1a1a2e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .sd-item-shop { font-size:11px; color:#9ca3af; font-weight:600; margin-top:2px; }
                .sd-item-meta { display:flex; align-items:center; gap:6px; margin-top:4px; flex-wrap:wrap; }
                .sd-item-price { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; background:linear-gradient(135deg,#ff6b35,#ff3cac); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .sd-veg-dot { width:10px; height:10px; border-radius:2px; border:1.5px solid; flex-shrink:0; }
                .sd-cal-badge { font-size:10px; font-weight:700; color:#ff6b35; background:#fff5f0; padding:2px 7px; border-radius:99px; }
                .sd-add-btn { background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; border:none; border-radius:10px; padding:8px 14px; font-size:12px; font-weight:800; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; box-shadow:0 3px 10px rgba(255,107,53,0.3); transition:transform 0.15s; flex-shrink:0; white-space:nowrap; }
                .sd-add-btn:hover { transform:scale(1.05); }
                .sd-qty { display:flex; align-items:center; gap:6px; flex-shrink:0; }
                .sd-qty-btn { width:26px; height:26px; border-radius:8px; border:none; background:linear-gradient(135deg,#ff6b35,#ff3cac); color:white; font-size:14px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; }
                .sd-qty-num { font-family:'Nunito',sans-serif; font-weight:900; font-size:14px; color:#ff6b35; min-width:18px; text-align:center; }
                .sd-spinner { width:24px; height:24px; border-radius:50%; border:3px solid rgba(255,107,53,0.15); border-top:3px solid #ff6b35; animation:spin 0.7s linear infinite; margin:40px auto; }
                .sd-empty { text-align:center; padding:48px 20px; color:#9ca3af; font-size:13px; font-weight:600; }

                /* FIT BADGE */
                .sd-fit-badge { font-size:9px; font-weight:800; color:#16a34a; background:#f0fdf4; padding:2px 7px; border-radius:99px; border:1.5px solid rgba(34,197,94,0.2); }
            `}</style>

            <div className="sd-overlay" onClick={onClose} />
            <div className="sd-drawer">

                {/* HEADER */}
                <div className="sd-header">
                    <div className="sd-header-row">
                        <FaSearch style={{ color: "#c084fc", fontSize: 16, flexShrink: 0 }} />
                        <div className="sd-title">Search Food</div>
                        <div className="sd-close" onClick={onClose}><ImCross style={{ color: "#f43f5e", fontSize: 10 }} /></div>
                    </div>
                    <div className="sd-search-wrap">
                        <div style={{ flex: 1, position: "relative" }}>
                            <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c084fc", fontSize: 12 }} />
                            <input ref={inputRef} className="sd-input" placeholder="Biryani, Pizza, Dal makhani..." value={query}
                                onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
                        </div>
                        <button className="sd-search-btn" onClick={() => handleSearch()}>Search</button>
                    </div>
                </div>

                {/* REMAINING GOAL MINI BAR */}
                {dietPlan && remaining && (
                    <div className="sd-goal-bar">
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#a855f7", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            🎯 Iss meal mein aur kitna chahiye
                        </div>
                        <div className="sd-goal-minis">
                            {[
                                { label: "Cal",     val: remaining.calories, unit: "kcal", color: "#ff6b35" },
                                { label: "Protein", val: remaining.protein,  unit: "g",    color: "#3b82f6" },
                                { label: "Carbs",   val: remaining.carbs,    unit: "g",    color: "#f59e0b" },
                                { label: "Fat",     val: remaining.fat,      unit: "g",    color: "#ef4444" },
                            ].map(m => (
                                <div key={m.label} className="sd-goal-mini">
                                    <div className="sd-goal-mini-val" style={{ color: m.val === 0 ? "#22c55e" : m.color }}>
                                        {m.val === 0 ? "✓" : `${m.val}`}
                                    </div>
                                    <div className="sd-goal-mini-lbl">{m.label} {m.val > 0 ? m.unit : "done"}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FILTERS */}
                <div className="sd-filters">
                    <div className="sd-filter-row">
                        <span className="sd-filter-label">Type</span>
                        {[["all", "allft", "🍽️ All"], ["veg", "veg", "🥗 Veg"], ["nonveg", "nonveg", "🍗 Non-Veg"]].map(([val, cls, label]) => (
                            <button key={val} className={`sd-chip ${cls} ${foodType === val ? "active" : ""}`} onClick={() => setFoodType(val)}>{label}</button>
                        ))}
                    </div>
                    <div>
                        <div className="sd-filter-label" style={{ marginBottom: 6 }}>Category</div>
                        <div className="sd-cats-scroll">
                            {CATEGORIES.map(c => (
                                <button key={c} className={`sd-cat-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
                                    {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="sd-filter-row">
                        <span className="sd-filter-label">Max ₹</span>
                        <input type="number" className="sd-num-input" placeholder="500" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        <span className="sd-filter-label" style={{ marginLeft: 4 }}>Max Cal</span>
                        <input type="number" className="sd-num-input" placeholder="600" value={maxCal} onChange={e => setMaxCal(e.target.value)} />
                    </div>
                    {dietPlan && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setDietMatch(!dietMatch)}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${dietMatch ? "#ff6b35" : "#e5e7eb"}`, background: dietMatch ? "linear-gradient(135deg,#ff6b35,#ff3cac)" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                                {dietMatch && <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: dietMatch ? "#ff6b35" : "#9ca3af" }}>
                                🎯 Match my diet goal ({dietPlan.goal?.replace("_", " ")})
                            </span>
                        </div>
                    )}
                </div>

                {/* RESULTS */}
                <div className="sd-body">

                    {/* SMART SUGGESTIONS — always show if dietPlan exists */}
                    {dietPlan && (
                        <SuggestionsPanel
                            dietPlan={dietPlan}
                            remaining={remaining}
                            city={city}
                            cartItems={CartItem || []}
                            menuNutritionMap={menuNutrition}
                            onAddItem={handleAdd}
                        />
                    )}

                    {loading && <div className="sd-spinner" />}

                    {!loading && searched && results.length === 0 && (
                        <div className="sd-empty"><div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>Koi item nahi mila — filters change karo</div>
                    )}
                    {!loading && !searched && (
                        <div className="sd-empty"><div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>Food naam type karo ya category select karo</div>
                    )}

                    {!loading && results.map((item, idx) => {
                        const qty = getQty(item._id);
                        // Check if item fits diet goal
                        const calPerMeal = dietPlan ? Math.round(dietPlan.calorieGoal / 3) : 9999;
                        const fits = item.nutrition?.calories > 0 && item.nutrition.calories <= calPerMeal;

                        return (
                            <div key={item._id} className="sd-item-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                                {item.image
                                    ? <img src={item.image} alt={item.name} className="sd-item-img" style={{ display: "block" }} />
                                    : <div className="sd-item-img">🍽️</div>
                                }
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="sd-item-name">{item.name}</div>
                                    <div className="sd-item-shop">🏪 {item.shop?.name || "Restaurant"}</div>
                                    <div className="sd-item-meta">
                                        <div className="sd-veg-dot" style={{ borderColor: item.foodType === "veg" ? "#16a34a" : "#dc2626", background: item.foodType === "veg" ? "#16a34a" : "#dc2626" }} />
                                        <span className="sd-item-price">₹{item.price}</span>
                                        {item.nutrition?.calories > 0 && <span className="sd-cal-badge">🔥 {item.nutrition.calories} kcal</span>}
                                        {dietPlan && fits && <span className="sd-fit-badge">✅ Goal fit</span>}
                                        {item.plateOptions?.hasHalfPlate && <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", background: "#fffbeb", padding: "2px 7px", borderRadius: 99 }}>Half ₹{item.plateOptions.halfPrice}</span>}
                                    </div>
                                </div>
                                {qty === 0
                                    ? <button className="sd-add-btn" onClick={() => handleAdd(item)}>+ Add</button>
                                    : <div className="sd-qty">
                                        <button className="sd-qty-btn" onClick={() => dispatch(removeFromCart(item._id))}>−</button>
                                        <span className="sd-qty-num">{qty}</span>
                                        <button className="sd-qty-btn" onClick={() => handleAdd(item)}>+</button>
                                    </div>
                                }
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default SearchDrawer;