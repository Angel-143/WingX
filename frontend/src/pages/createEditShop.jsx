import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaStore, FaCamera } from "react-icons/fa";
import useGetCity from "../hooks/useGetCity.jsx";
import axios from "axios";
import { setMyShopData } from "../redux/owner_slice.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl = API_BASE_URL;

function CreateEditShop() {
  useGetCity();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myShopData } = useSelector((state) => state.owner);
  const { city: currentCity, state: currentState, address: currentAddress } = useSelector((state) => state.user);

  const [name, setName] = useState(myShopData?.name || "");
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
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
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) formData.append("image", backendImage);

      let result;
      if (myShopData?._id) {
        result = await axios.put(`${serverUrl}/api/shop/edit/${myShopData._id}`, formData, { withCredentials: true });
      } else {
        result = await axios.post(`${serverUrl}/api/shop/create`, formData, { withCredentials: true });
      }
      dispatch(setMyShopData(result.data.shop));
      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all duration-200 bg-gray-50 focus:bg-white focus:border-orange-400 focus:shadow-sm placeholder-gray-400";

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 flex justify-center items-start"
      style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fefce8 100%)", fontFamily: "Georgia, serif" }}
    >
      <div className="w-full max-w-2xl">

        {/* Back */}
        <button
          className="flex items-center gap-2 mb-8 font-bold text-sm transition-all duration-200 hover:gap-3"
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
            style={{ background: "linear-gradient(135deg, #ea580c, #dc2626)" }}
          >
            <FaStore className="text-white text-2xl" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-black"
            style={{
              background: "linear-gradient(90deg, #ea580c, #dc2626, #d97706)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {myShopData ? "Edit Your Shop" : "Create Your Shop"}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {myShopData ? "Update your restaurant details below" : "Set up your restaurant on WingX in minutes"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">

          {/* Top gradient strip */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #ea580c, #dc2626, #d97706)" }} />

          <form onSubmit={handleSubmit} className="p-6 md:p-10 flex flex-col gap-6">

            {/* Image Upload */}
            <div className="flex flex-col items-center gap-3">
              <label className="cursor-pointer group relative">
                <div
                  className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all duration-200 group-hover:border-orange-400 group-hover:shadow-md"
                  style={{ borderColor: frontendImage ? "transparent" : "#fdba74", background: frontendImage ? "transparent" : "#fff7ed" }}
                >
                  {frontendImage ? (
                    <img src={frontendImage} alt="Shop Preview" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="text-center">
                      <FaCamera className="text-orange-400 text-2xl mx-auto mb-1" />
                      <span className="text-xs text-orange-400 font-semibold">Upload Photo</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  {frontendImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-2xl flex items-center justify-center transition-all duration-200">
                      <FaCamera className="text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity duration-200" />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-xs text-gray-400">Click to upload shop image</span>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Shop Name</label>
              <input
                type="text"
                placeholder="e.g. WingX Food Corner"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">City</label>
                <input
                  type="text"
                  placeholder="e.g. Kolkata"
                  className={inputClass}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700">State</label>
                <input
                  type="text"
                  placeholder="e.g. West Bengal"
                  className={inputClass}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Full Address</label>
              <textarea
                rows="3"
                placeholder="Street, area, landmark..."
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base tracking-wide shadow-lg hover:scale-[1.02] active:scale-95 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: success
                  ? "linear-gradient(135deg, #16a34a, #15803d)"
                  : "linear-gradient(135deg, #ea580c, #dc2626)",
                boxShadow: "0 8px 24px rgba(234,88,12,0.3)",
              }}
            >
              {loading ? "Saving..." : success ? "✓ Saved! Redirecting..." : myShopData ? "Update Shop" : "Create Shop"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEditShop;