import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaUtensils, FaCamera, FaLeaf, FaDrumstickBite } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/owner_slice.js";

const serverUrl = "http://localhost:5000";

const categories = ["starter", "maincourse", "dessert", "beverage", "snack", "other"];

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myShopData } = useSelector((state) => state.owner);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [isSubscription, setIsSubscription] = useState(false);
  const [mealsPerWeek, setMealsPerWeek] = useState(0);
  const [mealsPerMonth, setMealsPerMonth] = useState(0);
  const [validityDays, setValidityDays] = useState(0);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontendImage(URL.createObjectURL(file));
      setBackendImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("isSubscription", isSubscription);
      formData.append("mealsPerWeek", mealsPerWeek);
      formData.append("mealsPerMonth", mealsPerMonth);
      formData.append("validityDays", validityDays);
      if (backendImage) formData.append("image", backendImage);

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      );

      console.log("Item saved successfully:", result.data);

      // ✅ Redux update — naya item myShopData.items mein push karo
      if (result.data.item && myShopData) {
        dispatch(setMyShopData({
          ...myShopData,
          items: [...myShopData.items, result.data.item]
        }));
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      console.error("Error submitting item data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all duration-200 bg-gray-50 focus:bg-white focus:border-orange-400 focus:shadow-sm placeholder-gray-400";

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 flex justify-center items-start"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fefce8 100%)",
        fontFamily: "Georgia, serif",
      }}
    >
      <div className="w-full max-w-2xl">

        {/* Back */}
        <button
          className="flex items-center gap-2 mb-8 font-bold text-sm hover:gap-3 transition-all duration-200"
          style={{ color: "#ea580c" }}
          onClick={() => navigate("/")}
        >
          <IoMdArrowRoundBack size={20} />
          Back to Dashboard
        </button>

        {/* Title */}
        <div className="mb-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #d97706, #ea580c)" }}
          >
            <FaUtensils className="text-white text-2xl" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-black"
            style={{
              background: "linear-gradient(90deg, #d97706, #ea580c, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Add Food Item
          </h1>
          <p className="text-gray-400 text-sm mt-2">Add a new dish or subscription meal plan</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #d97706, #ea580c, #dc2626)" }} />

          <form onSubmit={handleSubmit} className="p-6 md:p-10 flex flex-col gap-6">

            {/* Image Upload */}
            <div className="flex flex-col items-center gap-2">
              <label className="cursor-pointer group relative">
                <div
                  className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all duration-200 group-hover:border-orange-400"
                  style={{
                    borderColor: frontendImage ? "transparent" : "#fdba74",
                    background: frontendImage ? "transparent" : "#fff7ed",
                  }}
                >
                  {frontendImage ? (
                    <img src={frontendImage} alt="Item Preview" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="text-center px-2">
                      <FaCamera className="text-orange-400 text-2xl mx-auto mb-1" />
                      <span className="text-xs text-orange-400 font-semibold">Food Photo</span>
                    </div>
                  )}
                  {frontendImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 rounded-2xl flex items-center justify-center transition-all duration-200">
                      <FaCamera className="text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity" />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-xs text-gray-400">Click to upload item image</span>
            </div>

            {/* Name + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Butter Chicken"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  className={inputClass}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Food Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFoodType("veg")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200"
                  style={{
                    borderColor: foodType === "veg" ? "#16a34a" : "#e5e7eb",
                    background: foodType === "veg" ? "#f0fdf4" : "#f9fafb",
                    color: foodType === "veg" ? "#16a34a" : "#9ca3af",
                  }}
                >
                  <FaLeaf size={13} /> Veg
                </button>
                <button
                  type="button"
                  onClick={() => setFoodType("nonveg")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200"
                  style={{
                    borderColor: foodType === "nonveg" ? "#dc2626" : "#e5e7eb",
                    background: foodType === "nonveg" ? "#fff1f2" : "#f9fafb",
                    color: foodType === "nonveg" ? "#dc2626" : "#9ca3af",
                  }}
                >
                  <FaDrumstickBite size={13} /> Non-Veg
                </button>
              </div>
            </div>

            {/* Item Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Item Type</label>
              <select
                className={inputClass}
                value={isSubscription}
                onChange={(e) => setIsSubscription(e.target.value === "true")}
              >
                <option value="false">🍽️ Normal Item</option>
                <option value="true">♻️ Subscription Item</option>
              </select>
            </div>

            {/* Subscription Fields */}
            {isSubscription && (
              <div
                className="rounded-2xl p-5 border-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
                style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-orange-700 uppercase tracking-wider">Meals / Week</label>
                  <input type="number" placeholder="e.g. 5" className={inputClass} value={mealsPerWeek} onChange={(e) => setMealsPerWeek(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-orange-700 uppercase tracking-wider">Meals / Month</label>
                  <input type="number" placeholder="e.g. 20" className={inputClass} value={mealsPerMonth} onChange={(e) => setMealsPerMonth(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-orange-700 uppercase tracking-wider">Validity (Days)</label>
                  <input type="number" placeholder="e.g. 30" className={inputClass} value={validityDays} onChange={(e) => setValidityDays(e.target.value)} />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base tracking-wide shadow-lg hover:scale-[1.02] active:scale-95 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: success
                  ? "linear-gradient(135deg, #16a34a, #15803d)"
                  : "linear-gradient(135deg, #d97706, #ea580c)",
                boxShadow: "0 8px 24px rgba(234,88,12,0.3)",
              }}
            >
              {loading ? "Saving..." : success ? "✓ Saved! Redirecting..." : "Save Item"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddItem;