import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaUtensils, FaCamera, FaLeaf, FaDrumstickBite, FaBolt } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/owner_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;
const categories = ["starter","maincourse","dessert","beverage","snack","other","breakfast",
                    "lunch","dinner","soup","salad","biryani","pizza","burger","sandwich",
                    "noodles","pasta","northindian","southindian","chinese"];

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myShopData } = useSelector((state) => state.owner);

  const [name, setName]         = useState("");
  const [price, setPrice]       = useState("");
  const [desc, setDesc]         = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage]   = useState(null);

  const [hasHalfPlate, setHasHalfPlate] = useState(false);
  const [halfPrice, setHalfPrice]       = useState("");

  const [subAvailable, setSubAvailable]   = useState(false);
  const [weeklyPrice, setWeeklyPrice]     = useState("");
  const [monthlyPrice, setMonthlyPrice]   = useState("");
  const [mealsPerWeek, setMealsPerWeek]   = useState("");
  const [mealsPerMonth, setMealsPerMonth] = useState("");
  const [validityDays, setValidityDays]   = useState("30");

  const [nutrition, setNutrition] = useState({ calories:"", protein:"", carbs:"", fat:"", fiber:"", sugar:"" });
  const [nutritionSource, setNutritionSource] = useState(null);
  const [detectedFoods, setDetectedFoods]     = useState([]);
  const [scanning, setScanning]   = useState(false);
  const [scanError, setScanError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontendImage(URL.createObjectURL(file));
      setBackendImage(file);
      setScanError(null);
      setNutritionSource(null);
      setDetectedFoods([]);
    }
  };

  const handleScan = async () => {
    if (!backendImage) return setScanError("Pehle image upload karo");
    setScanning(true); setScanError(null);
    try {
      const fd = new FormData();
      fd.append("image", backendImage);
      const res = await axios.post(`${serverUrl}/api/nutrition/scan`, fd, { withCredentials: true });
      const n = res.data.nutrition;
      setNutrition({
        calories: n.calories || "", protein: n.protein || "",
        carbs:    n.carbs    || "", fat:     n.fat     || "",
        fiber:    n.fiber    || "", sugar:   n.sugar   || "",
      });
      setDetectedFoods(n.detectedFoods || []);
      if (!name && n.foodName) setName(n.foodName);
      setNutritionSource("ai");
    } catch (err) {
      setScanError(err.response?.data?.message || "Scan failed — check API key");
    } finally { setScanning(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("description", desc);
      fd.append("category", category);
      fd.append("foodType", foodType);
      fd.append("hasHalfPlate", hasHalfPlate);
      fd.append("halfPrice", halfPrice || 0);
      fd.append("subscriptionAvailable", subAvailable);
      fd.append("weeklyPrice", weeklyPrice || 0);
      fd.append("monthlyPrice", monthlyPrice || 0);
      fd.append("mealsPerWeek", mealsPerWeek || 0);
      fd.append("mealsPerMonth", mealsPerMonth || 0);
      fd.append("validityDays", validityDays || 30);
      fd.append("nutrition", JSON.stringify({ ...nutrition, isAIGenerated: nutritionSource === "ai", verifiedByOwner: true }));
      if (backendImage) fd.append("image", backendImage);

      const result = await axios.post(`${serverUrl}/api/item/add-item`, fd, { withCredentials: true });
      if (result.data.item && myShopData) {
        dispatch(setMyShopData({ ...myShopData, items: [...myShopData.items, result.data.item] }));
      }
      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    } finally { setLoading(false); }
  };

  const inp = "w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all bg-gray-50 focus:bg-white focus:border-orange-400 placeholder-gray-400";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex justify-center items-start"
      style={{ background:"linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fefce8 100%)", fontFamily:"Georgia,serif" }}>
      <div className="w-full max-w-2xl">

        <button className="flex items-center gap-2 mb-8 font-bold text-sm hover:gap-3 transition-all"
          style={{ color:"#ea580c" }} onClick={() => navigate("/")}>
          <IoMdArrowRoundBack size={20} /> Back to Dashboard
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background:"linear-gradient(135deg,#d97706,#ea580c)" }}>
            <FaUtensils className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-black"
            style={{ background:"linear-gradient(90deg,#d97706,#ea580c,#dc2626)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Add Food Item
          </h1>
          <p className="text-gray-400 text-sm mt-2">AI se nutrition scan karo — LogMeal powered</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="h-1.5" style={{ background:"linear-gradient(90deg,#d97706,#ea580c,#dc2626)" }} />

          <form onSubmit={handleSubmit} className="p-6 md:p-10 flex flex-col gap-6">

            {/* ── IMAGE + SCAN ── */}
            <div className="flex flex-col items-center gap-3">
              <label className="cursor-pointer group relative">
                <div className="w-36 h-36 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all group-hover:border-orange-400"
                  style={{ borderColor: frontendImage ? "transparent" : "#fdba74", background: frontendImage ? "transparent" : "#fff7ed" }}>
                  {frontendImage
                    ? <img src={frontendImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                    : <div className="text-center px-2">
                        <FaCamera className="text-orange-400 text-2xl mx-auto mb-1" />
                        <span className="text-xs text-orange-400 font-semibold">Food Photo</span>
                      </div>
                  }
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-xs text-gray-400">Image upload karo phir scan karo</span>

              <button type="button" onClick={handleScan} disabled={!backendImage || scanning}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background:"linear-gradient(135deg,#7c3aed,#ff3cac)", boxShadow:"0 4px 14px rgba(124,58,237,0.35)" }}>
                {scanning
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scanning…</>
                  : <><FaBolt size={12} /> 🤖 AI Scan Nutrition</>
                }
              </button>

              {scanError && (
                <div className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                  ❌ {scanError}
                </div>
              )}

              {/* Detected foods */}
              {detectedFoods.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {detectedFoods.map((f, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background:"linear-gradient(135deg,#ff6b35,#ff3cac)" }}>
                      🍽️ {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── NUTRITION PANEL ── */}
            <div className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: nutritionSource === "ai" ? "#7c3aed" : "#e5e7eb" }}>
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ background: nutritionSource === "ai" ? "linear-gradient(135deg,#faf5ff,#fdf2f8)" : "#f9fafb" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">🧬 Nutrition Info</span>
                  {nutritionSource === "ai" && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background:"linear-gradient(135deg,#7c3aed,#ff3cac)", fontSize:10 }}>
                      ✨ AI Scanned
                    </span>
                  )}
                  {nutritionSource === "manual" && (
                    <span className="text-xs font-bold text-gray-400">✏️ Manual</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">per serving</span>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { key:"calories", label:"Calories", unit:"kcal", color:"#ff6b35" },
                  { key:"protein",  label:"Protein",  unit:"g",    color:"#3b82f6" },
                  { key:"carbs",    label:"Carbs",    unit:"g",    color:"#f59e0b" },
                  { key:"fat",      label:"Fat",      unit:"g",    color:"#ef4444" },
                  { key:"fiber",    label:"Fiber",    unit:"g",    color:"#22c55e" },
                  { key:"sugar",    label:"Sugar",    unit:"g",    color:"#a855f7" },
                ].map(n => (
                  <div key={n.key} className="flex flex-col gap-1">
                    <label className="text-xs font-bold" style={{ color:n.color }}>{n.label} ({n.unit})</label>
                    <input type="number" min="0" placeholder="0"
                      className="border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold outline-none bg-gray-50 focus:bg-white transition-all"
                      value={nutrition[n.key]}
                      onChange={(e) => { setNutrition(p => ({...p,[n.key]:e.target.value})); setNutritionSource("manual"); }} />
                  </div>
                ))}
              </div>
              <p className="px-4 pb-3 text-xs text-gray-400">💡 Scan ke baad manually edit bhi kar sakte hain</p>
            </div>

            {/* ── NAME + PRICE ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Item Name</label>
                <input type="text" placeholder="e.g. Butter Chicken" className={inp}
                  value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Full Plate Price (₹)</label>
                <input type="number" placeholder="0" className={inp}
                  value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            </div>

            {/* ── DESCRIPTION ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea placeholder="Ingredients, taste, special notes…" rows={2}
                className={inp + " resize-none"} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>

            {/* ── HALF PLATE ── */}
            <div className="rounded-2xl border-2 p-4 flex flex-col gap-3"
              style={{ borderColor: hasHalfPlate ? "#f59e0b" : "#e5e7eb", background: hasHalfPlate ? "#fffbeb" : "#f9fafb" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-700">🍽️ Half Plate Option</div>
                  <div className="text-xs text-gray-400 mt-0.5">Smaller portion at lower price</div>
                </div>
                <button type="button" onClick={() => setHasHalfPlate(!hasHalfPlate)}
                  className="w-12 h-6 rounded-full relative transition-all"
                  style={{ background: hasHalfPlate ? "#f59e0b" : "#d1d5db" }}>
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
                    style={{ left: hasHalfPlate ? "26px" : "2px" }} />
                </button>
              </div>
              {hasHalfPlate && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-amber-700 uppercase tracking-wider">Half Plate Price (₹)</label>
                  <input type="number" placeholder="e.g. 80" className={inp}
                    value={halfPrice} onChange={(e) => setHalfPrice(e.target.value)} />
                </div>
              )}
            </div>

            {/* ── SUBSCRIPTION ── */}
            <div className="rounded-2xl border-2 p-4 flex flex-col gap-4"
              style={{ borderColor: subAvailable ? "#7c3aed" : "#e5e7eb", background: subAvailable ? "#faf5ff" : "#f9fafb" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-700">♻️ Subscription Available</div>
                  <div className="text-xs text-gray-400 mt-0.5">User is item ko subscribe kar sakta hai</div>
                </div>
                <button type="button" onClick={() => setSubAvailable(!subAvailable)}
                  className="w-12 h-6 rounded-full relative transition-all"
                  style={{ background: subAvailable ? "#7c3aed" : "#d1d5db" }}>
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
                    style={{ left: subAvailable ? "26px" : "2px" }} />
                </button>
              </div>
              {subAvailable && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Weekly Price (₹)",  val:weeklyPrice,   set:setWeeklyPrice,   ph:"e.g. 499" },
                    { label:"Monthly Price (₹)", val:monthlyPrice,  set:setMonthlyPrice,  ph:"e.g. 1499" },
                    { label:"Meals / Week",       val:mealsPerWeek,  set:setMealsPerWeek,  ph:"e.g. 5" },
                    { label:"Meals / Month",      val:mealsPerMonth, set:setMealsPerMonth, ph:"e.g. 20" },
                    { label:"Validity (Days)",    val:validityDays,  set:setValidityDays,  ph:"e.g. 30" },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-purple-700 uppercase tracking-wider">{s.label}</label>
                      <input type="number" placeholder={s.ph} className={inp}
                        value={s.val} onChange={(e) => s.set(e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── CATEGORY ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select className={inp} value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>

            {/* ── FOOD TYPE ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Food Type</label>
              <div className="flex gap-3">
                {[
                  { val:"veg",    label:"Veg",     icon:<FaLeaf size={13}/>,          color:"#16a34a", bg:"#f0fdf4" },
                  { val:"nonveg", label:"Non-Veg", icon:<FaDrumstickBite size={13}/>, color:"#dc2626", bg:"#fff1f2" },
                ].map(ft => (
                  <button key={ft.val} type="button" onClick={() => setFoodType(ft.val)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all"
                    style={{
                      borderColor: foodType===ft.val ? ft.color : "#e5e7eb",
                      background:  foodType===ft.val ? ft.bg    : "#f9fafb",
                      color:       foodType===ft.val ? ft.color : "#9ca3af",
                    }}>
                    {ft.icon} {ft.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SUBMIT ── */}
            <button type="submit" disabled={loading||success}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70"
              style={{ background: success ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#d97706,#ea580c)", boxShadow:"0 8px 24px rgba(234,88,12,0.3)" }}>
              {loading ? "Saving..." : success ? "✓ Saved! Redirecting..." : "Save Item"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddItem;