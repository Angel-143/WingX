import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { setMyShopData } from "../redux/owner_slice.js";

const serverUrl = "http://localhost:5000";

function DeleteItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { myShopData } = useSelector((state) => state.owner);

  const currentItem = myShopData?.items?.find((item) => item._id === id);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `${serverUrl}/api/item/delete/${id}`,
        { withCredentials: true }
      );

      console.log("Item deleted successfully");

      // ✅ Redux update — deleted item ko filter karke hata do
      if (myShopData) {
        dispatch(setMyShopData({
          ...myShopData,
          items: myShopData.items.filter((item) => item._id !== id),
        }));
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Item not found
  if (!currentItem) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fefce8 100%)" }}
      >
        <div className="text-center">
          <span className="text-5xl">🍽️</span>
          <p className="mt-4 font-bold text-gray-700">Item nahi mila</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-white font-bold px-6 py-2.5 rounded-xl"
            style={{ background: "linear-gradient(135deg, #ea580c, #dc2626)" }}
          >
            Dashboard pe wapas jao
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 flex justify-center items-start"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fefce8 100%)",
        fontFamily: "Georgia, serif",
      }}
    >
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          className="flex items-center gap-2 mb-8 font-bold text-sm hover:gap-3 transition-all duration-200"
          style={{ color: "#ea580c" }}
          onClick={() => navigate("/")}
        >
          <IoMdArrowRoundBack size={20} />
          Back to Dashboard
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #dc2626, #ea580c)" }} />

          <div className="p-8 md:p-10 flex flex-col items-center text-center gap-6">

            {/* Warning Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #fee2e2, #fecaca)" }}
            >
              <FaExclamationTriangle className="text-red-500 text-3xl" />
            </div>

            {/* Title */}
            <div>
              <h1
                className="text-2xl md:text-3xl font-black"
                style={{
                  background: "linear-gradient(90deg, #dc2626, #ea580c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Delete Item?
              </h1>
              <p className="text-gray-400 text-sm mt-2">Yeh action undo nahi ho sakta</p>
            </div>

            {/* Item Preview */}
            <div
              className="w-full rounded-2xl p-4 flex items-center gap-4 border"
              style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
            >
              <img
                src={currentItem.image}
                alt={currentItem.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                style={{ border: "2px solid #fdba74" }}
              />
              <div className="text-left">
                <h3 className="font-black text-gray-900">{currentItem.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{currentItem.category}</p>
                <p
                  className="text-base font-black mt-0.5"
                  style={{
                    background: "linear-gradient(90deg, #ea580c, #dc2626)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ₹{currentItem.price}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3">

              {/* Cancel */}
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 hover:scale-[1.02] active:scale-95 transition-transform duration-200"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={loading || success}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: success
                    ? "linear-gradient(135deg, #16a34a, #15803d)"
                    : "linear-gradient(135deg, #dc2626, #b91c1c)",
                  boxShadow: "0 8px 24px rgba(220,38,38,0.3)",
                }}
              >
                {loading ? (
                  "Deleting..."
                ) : success ? (
                  "✓ Deleted! Redirecting..."
                ) : (
                  <>
                    <FaTrash size={13} />
                    Delete Item
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteItem;