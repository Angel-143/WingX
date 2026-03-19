import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart, orderPlaced } from "../redux/user_slice.js";
import Navbar from "../dashboards/navbar.jsx";
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaUser, FaWallet, FaCrosshairs, FaCheck, FaLock } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig.js";

const serverUrl    = API_BASE_URL;
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
// 👇 .env mein daalo: VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
const RZP_KEY_ID   = import.meta.env.VITE_RAZORPAY_KEY_ID;

async function reverseGeocode(lat, lon) {
  try {
    const res = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPIFY_KEY}`);
    const r = res?.data?.results?.[0];
    return { address: r?.address_line1 || r?.formatted || "", city: r?.city || r?.town || "", pincode: r?.postcode || "" };
  } catch { return { address: "", city: "", pincode: "" }; }
}

async function logOrderNutrition(cartItems) {
  try {
    await axios.post(`${serverUrl}/api/diet/log/order`,
      { cartItems: cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity || 1 })) },
      { withCredentials: true }
    );
  } catch (e) { console.error("Nutrition log:", e); }
}

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function CheckOutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const CartItem  = useSelector(s => s.user.CartItem) || [];
  const { userData } = useSelector(s => s.user);
  const mapLocation  = useSelector(s => s.map?.location);

  const fullname = userData?.fullname || userData?.user?.fullname || "";
  const phone    = userData?.phone    || userData?.user?.phone    || "";
  const email    = userData?.email    || userData?.user?.email    || "";

  const [form, setForm]             = useState({ name:fullname, phone, address:"", city:"", pincode:"", note:"" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading]       = useState(false);
  const [placed, setPlaced]         = useState(false);
  const [paidVia, setPaidVia]       = useState("cod");
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors]         = useState({});
  const [markerPos, setMarkerPos]   = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const mapRef       = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef    = useRef(null);

  const subtotal = CartItem.reduce((t, i) => t + (i.price * i.quantity), 0);
  const delivery = subtotal > 0 ? 40 : 0;
  const taxes    = Math.round(subtotal * 0.05);
  const total    = subtotal + delivery + taxes;

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const dLat = mapLocation?.lat || 20.5937;
    const dLon = mapLocation?.lon || 78.9629;
    import("leaflet").then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current, { center:[dLat,dLon], zoom:mapLocation?.lat?15:5 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(map);
      const icon = L.divIcon({ html:`<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#ff6b35,#ff3cac);transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(255,107,53,0.5);"></div>`, iconSize:[36,36], iconAnchor:[18,36], className:"" });
      const addM = (lat, lng) => {
        if (markerRef.current) { markerRef.current.setLatLng([lat,lng]); return; }
        const m = L.marker([lat,lng], { icon, draggable:true }).addTo(map);
        markerRef.current = m;
        m.on("dragend", async e => {
          const p = e.target.getLatLng();
          setMarkerPos({ lat:p.lat, lon:p.lng });
          setAddrLoading(true);
          const geo = await reverseGeocode(p.lat, p.lng);
          setForm(prev => ({ ...prev, ...geo }));
          setAddrLoading(false);
        });
      };
      if (mapLocation?.lat) { addM(mapLocation.lat, mapLocation.lon); setMarkerPos({ lat:mapLocation.lat, lon:mapLocation.lon }); }
      map.on("click", async e => {
        const { lat, lng } = e.latlng;
        setMarkerPos({ lat, lon:lng }); addM(lat, lng);
        setAddrLoading(true);
        const geo = await reverseGeocode(lat, lng);
        setForm(prev => ({ ...prev, ...geo }));
        setAddrLoading(false);
      });
      leafletMapRef.current = map;
    });
    return () => { if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; } };
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude:lat, longitude:lon } = pos.coords;
      import("leaflet").then(async L => {
        const map = leafletMapRef.current; if (!map) return;
        map.setView([lat,lon], 16);
        const icon = L.divIcon({ html:`<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#ff6b35,#ff3cac);transform:rotate(-45deg);border:3px solid white;"></div>`, iconSize:[36,36], iconAnchor:[18,36], className:"" });
        if (markerRef.current) { markerRef.current.setLatLng([lat,lon]); }
        else {
          const m = L.marker([lat,lon], { icon, draggable:true }).addTo(map);
          markerRef.current = m;
          m.on("dragend", async e => {
            const p = e.target.getLatLng(); setMarkerPos({ lat:p.lat, lon:p.lng });
            setAddrLoading(true); const geo = await reverseGeocode(p.lat, p.lng);
            setForm(prev => ({ ...prev, ...geo })); setAddrLoading(false);
          });
        }
        setMarkerPos({ lat, lon }); setAddrLoading(true);
        const geo = await reverseGeocode(lat, lon);
        setForm(prev => ({ ...prev, ...geo })); setAddrLoading(false); setMapLoading(false);
      });
    }, () => { setMapLoading(false); alert("Could not get location"); });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name    = "Name required";
    if (!form.phone.trim() || form.phone.length < 10) e.phone = "Valid phone required";
    if (!form.address.trim()) e.address = "Address required";
    if (!form.city.trim())   e.city    = "City required";
    if (!form.pincode.trim() || form.pincode.length < 6) e.pincode = "Valid pincode required";
    if (!markerPos)          e.map     = "Please select delivery location on map";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrderOnBackend = async ({ cartSnapshot, method, razorpayPaymentId = null }) => {
    await axios.post(`${serverUrl}/api/order/place-order`, {
      cartItems: cartSnapshot,
      paymentMethod: method,
      razorpayPaymentId,
      deliveryAddress: { text: form.address + ", " + form.city, latitude: markerPos?.lat, longitude: markerPos?.lon },
      totalAmount: total,
    }, { withCredentials: true });
  };

  const handleCOD = async cartSnapshot => {
    await placeOrderOnBackend({ cartSnapshot, method:"cod" });
    dispatch(clearCart()); dispatch(orderPlaced());
    logOrderNutrition(cartSnapshot);
    setPaidVia("cod"); setPlaced(true);
  };

  const handleRazorpay = async cartSnapshot => {
    // Step 1: Load script
    const loaded = await loadRazorpay();
    console.log("RZP loaded:", loaded, "| window.Razorpay:", typeof window.Razorpay);
    if (!loaded || !window.Razorpay) {
      alert("Razorpay load nahi hua. Internet check karo ya page reload karo.");
      setLoading(false); return;
    }

    // Step 2: Create order on backend
    let data;
    try {
      const res = await axios.post(`${serverUrl}/api/payment/create-order`,
        { amount: total, receipt: `rcpt_${Date.now()}` },
        { withCredentials: true }
      );
      data = res.data;
      console.log("Order created:", data);
    } catch (err) {
      console.error("create-order failed:", err.response?.data || err.message);
      alert(`Payment order nahi bana: ${err.response?.data?.message || err.message}`);
      setLoading(false); return;
    }

    const keyToUse = data.keyId || RZP_KEY_ID;
    console.log("Key:", keyToUse, "| orderId:", data.orderId, "| amount:", data.amount);
    if (!keyToUse) {
      alert("Razorpay Key ID missing! .env mein VITE_RAZORPAY_KEY_ID daalo.");
      setLoading(false); return;
    }

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key:         keyToUse,
        amount:      data.amount,
        currency:    data.currency,
        name:        "WingX Food",
        description: "Food Order Payment",
        order_id:    data.orderId,
        prefill:     { name: form.name, email, contact: form.phone },
        theme:       { color: "#ff6b35" },

        handler: async response => {
          try {
            const verify = await axios.post(`${serverUrl}/api/payment/verify`, {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }, { withCredentials: true });

            if (!verify.data.success) throw new Error("Verification failed");

            await placeOrderOnBackend({ cartSnapshot, method: paymentMethod, razorpayPaymentId: response.razorpay_payment_id });
            dispatch(clearCart()); dispatch(orderPlaced());
            logOrderNutrition(cartSnapshot);
            setPaidVia(paymentMethod); setPlaced(true);
            resolve();
          } catch (err) {
            alert("Payment hua but order place nahi hua. Support se contact karo.");
            reject(err);
          }
        },

        modal: { ondismiss: () => { setLoading(false); reject(new Error("cancelled")); } },
      });

      rzp.on("payment.failed", res => {
        alert(`Payment failed: ${res.error.description}`);
        setLoading(false); reject(new Error("failed"));
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    const cartSnapshot = [...CartItem];
    try {
      if (paymentMethod === "cod") await handleCOD(cartSnapshot);
      else await handleRazorpay(cartSnapshot);
    } catch (err) {
      if (err?.message !== "cancelled") alert("Kuch galat hua. Dobara try karo.");
    } finally { setLoading(false); }
  };

  const inp = name => ({
    width:"100%", background: focusedField===name?"rgba(255,255,255,0.98)":"rgba(255,255,255,0.88)",
    border:`2px solid ${errors[name]?"#ef4444":focusedField===name?"#ff6b35":"rgba(255,107,53,0.18)"}`,
    borderRadius:12, padding:"11px 14px 11px 40px", fontFamily:"'Plus Jakarta Sans',sans-serif",
    fontSize:13, fontWeight:500, color:"#1a1a2e", outline:"none", boxSizing:"border-box",
    boxShadow: focusedField===name?"0 0 0 4px rgba(255,107,53,0.1)":"none",
  });
  const ico = { position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", opacity:0.5, pointerEvents:"none" };

  if (placed) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes popIn { 0%{transform:scale(0) rotate(-10deg)} 70%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(145deg,#fff9f5 0%,#fdf8ff 40%,#f0fdf9 100%)", padding:24 }}>
        <div style={{ background:"white", borderRadius:28, padding:"52px 36px", textAlign:"center", maxWidth:440, width:"100%", boxShadow:"0 24px 64px rgba(255,107,53,0.12)" }}>
          <div style={{ fontSize:76, animation:"popIn 0.6s ease, float 3s ease-in-out 0.6s infinite", marginBottom:20 }}>🎉</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:26, marginBottom:8, background:"linear-gradient(135deg,#ff6b35,#ff3cac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"fadeUp 0.5s 0.2s ease both" }}>Order Placed! 🚀</div>
          <p style={{ color:"#9ca3af", fontSize:13, fontWeight:500, lineHeight:1.7, marginBottom:20, animation:"fadeUp 0.5s 0.3s ease both" }}>
            Your order has been placed successfully.<br/>Food is on its way! 🍔
          </p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(255,107,53,0.07)", border:"1.5px solid rgba(255,107,53,0.2)", borderRadius:14, padding:"10px 20px", marginBottom:24, animation:"fadeUp 0.5s 0.4s ease both" }}>
            <div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:"#ff6b35" }}>₹{total}</div>
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600 }}>
                {paidVia==="cod" ? "💵 Cash on Delivery" : paidVia==="upi" ? "✅ Paid via UPI" : "✅ Paid via Card"}
              </div>
            </div>
            {paidVia !== "cod" && (
              <div style={{ background:"#f0fdf4", border:"1.5px solid rgba(34,197,94,0.25)", borderRadius:10, padding:"5px 10px", fontSize:11, fontWeight:700, color:"#16a34a" }}>
                🔒 Verified
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, animation:"fadeUp 0.5s 0.5s ease both" }}>
            <button onClick={()=>navigate("/my-orders")} style={{ width:"100%", padding:13, border:"none", borderRadius:13, background:"linear-gradient(135deg,#ff6b35,#ff3cac)", color:"white", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 6px 20px rgba(255,107,53,0.4)" }}>Track My Order →</button>
            <button onClick={()=>navigate("/")} style={{ width:"100%", padding:13, border:"2px solid rgba(255,107,53,0.18)", borderRadius:13, background:"transparent", color:"#ff6b35", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer" }}>Order More Food 🍕</button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        *{box-sizing:border-box;}
        .co-root{font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;background:linear-gradient(145deg,#fff9f5 0%,#fdf8ff 40%,#f0fdf9 100%);}
        .co-cont{max-width:1060px;margin:0 auto;padding:clamp(84px,11vw,96px) 16px 60px;display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start;}
        @media(max-width:768px){.co-cont{grid-template-columns:1fr;}.co-sc{order:-1;}}
        .co-hd{grid-column:1/-1;display:flex;align-items:center;gap:14px;margin-bottom:4px;}
        .co-back{width:40px;height:40px;border-radius:12px;border:1.5px solid rgba(255,107,53,0.15);background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ff6b35;transition:transform 0.15s;}
        .co-back:hover{transform:translateX(-2px);}
        .co-title{font-family:'Nunito',sans-serif;font-weight:900;font-size:clamp(22px,4vw,30px);background:linear-gradient(135deg,#ff6b35,#ff3cac);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .co-card{background:white;border-radius:22px;padding:22px 24px;margin-bottom:16px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1.5px solid rgba(255,255,255,0.9);animation:fadeUp 0.4s ease both;}
        .co-ctitle{font-family:'Nunito',sans-serif;font-weight:900;font-size:15px;color:#1a1a2e;margin-bottom:18px;display:flex;align-items:center;gap:8px;}
        .co-cicon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;}
        .co-r2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:480px){.co-r2{grid-template-columns:1fr;}}
        .co-f{margin-bottom:14px;}
        .co-lbl{display:block;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#6b7280;margin-bottom:6px;}
        .co-err{font-size:11px;color:#ef4444;font-weight:600;margin-top:4px;}
        .co-mapw{border-radius:16px;overflow:hidden;position:relative;border:2px solid rgba(255,107,53,0.15);}
        .co-mapc{width:100%;height:280px;}
        .co-mapbtn{position:absolute;top:10px;right:10px;z-index:1000;display:flex;align-items:center;gap:6px;background:white;border:2px solid rgba(255,107,53,0.3);border-radius:10px;padding:8px 14px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:#ff6b35;box-shadow:0 4px 14px rgba(255,107,53,0.2);}
        .co-maphint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);z-index:1000;background:rgba(26,26,46,0.85);color:white;border-radius:99px;padding:6px 16px;font-size:11px;font-weight:600;backdrop-filter:blur(8px);white-space:nowrap;pointer-events:none;}
        .co-mapok{background:linear-gradient(135deg,rgba(34,197,94,0.1),rgba(20,184,166,0.1));border:1.5px solid rgba(34,197,94,0.25);border-radius:10px;padding:8px 14px;margin-top:10px;font-size:12px;font-weight:600;color:#16a34a;display:flex;align-items:center;gap:6px;}
        .co-po{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;cursor:pointer;border:2px solid rgba(255,107,53,0.12);background:rgba(255,255,255,0.6);margin-bottom:10px;transition:all 0.2s;}
        .co-po:hover{transform:translateY(-1px);}
        .co-po.sel{border-color:#ff6b35;background:linear-gradient(135deg,rgba(255,107,53,0.06),rgba(255,60,172,0.06));box-shadow:0 4px 16px rgba(255,107,53,0.15);}
        .co-pico{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .co-pname{font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;color:#1a1a2e;}
        .co-psub{font-size:11px;color:#9ca3af;font-weight:500;margin-top:1px;}
        .co-rzp{font-size:9px;font-weight:800;color:#072654;background:#e8f0fe;border-radius:99px;padding:2px 7px;margin-top:3px;display:inline-block;}
        .co-radio{margin-left:auto;width:18px;height:18px;border-radius:50%;flex-shrink:0;border:2px solid rgba(255,107,53,0.3);display:flex;align-items:center;justify-content:center;}
        .co-radio.on{border-color:#ff6b35;}
        .co-rdot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#ff6b35,#ff3cac);}
        .co-sum{background:white;border-radius:22px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1.5px solid rgba(255,255,255,0.9);position:sticky;top:88px;animation:fadeUp 0.4s 0.1s ease both;}
        .co-sumh{padding:18px 20px 14px;border-bottom:1.5px solid #f9fafb;}
        .co-sumt{font-family:'Nunito',sans-serif;font-weight:900;font-size:15px;color:#1a1a2e;}
        .co-sumb{padding:16px 20px;}
        .co-oi{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
        .co-oimg{width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;background:linear-gradient(135deg,#fff5f0,#fff0f8);}
        .co-oname{font-weight:700;font-size:12px;color:#1a1a2e;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .co-oqty{font-size:11px;color:#9ca3af;font-weight:600;margin-top:2px;}
        .co-oprc{font-family:'Nunito',sans-serif;font-weight:900;font-size:13px;color:#ff6b35;flex-shrink:0;}
        .co-div{height:1.5px;background:#f9fafb;margin:14px 0;}
        .co-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;}
        .co-rl{color:#6b7280;font-weight:500;}
        .co-rv{font-weight:700;color:#1a1a2e;}
        .co-tr{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
        .co-tl{font-family:'Nunito',sans-serif;font-weight:900;font-size:15px;color:#1a1a2e;}
        .co-ta{font-family:'Nunito',sans-serif;font-weight:900;font-size:22px;background:linear-gradient(135deg,#ff6b35,#ff3cac);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .co-btn{width:100%;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#ff6b35,#ff3cac);color:white;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(255,107,53,0.4);transition:transform 0.15s,box-shadow 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .co-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(255,107,53,0.5);}
        .co-btn:disabled{opacity:0.65;cursor:not-allowed;}
        .co-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);border-top:2px solid white;animation:spin 0.7s linear infinite;flex-shrink:0;}
        .co-sec{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;color:#9ca3af;font-weight:600;margin-top:10px;}
        textarea{width:100%;background:rgba(255,255,255,0.88);border:2px solid rgba(255,107,53,0.15);border-radius:12px;padding:11px 14px;font-size:13px;font-weight:500;color:#1a1a2e;font-family:'Plus Jakarta Sans',sans-serif;outline:none;resize:none;box-sizing:border-box;}
        textarea:focus{border-color:#ff6b35;box-shadow:0 0 0 4px rgba(255,107,53,0.1);}
      `}</style>

      <div className="co-root">
        <Navbar/>
        <div className="co-cont">
          <div className="co-hd">
            <button className="co-back" onClick={()=>navigate("/cart-page")}><FaArrowLeft size={13}/></button>
            <div><div className="co-title">Checkout 🛵</div><div style={{fontSize:12,color:"#9ca3af",fontWeight:500,marginTop:2}}>Fill details to place your order</div></div>
          </div>

          <div>
            {/* MAP CARD */}
            <div className="co-card" style={{animationDelay:"0s"}}>
              <div className="co-ctitle"><div className="co-cicon" style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)"}}><FaMapMarkerAlt style={{color:"#3b82f6"}}/></div>Select Delivery Location</div>
              <div className="co-mapw">
                <div ref={mapRef} className="co-mapc"/>
                <button className="co-mapbtn" onClick={handleUseMyLocation} disabled={mapLoading}>
                  {mapLoading?<span style={{width:12,height:12,borderRadius:"50%",border:"2px solid #ff6b35",borderTop:"2px solid transparent",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>:<FaCrosshairs size={12}/>} Use My Location
                </button>
                {!markerPos&&<div className="co-maphint">📍 Tap on map to set delivery location</div>}
              </div>
              {addrLoading&&<div style={{animation:"pulse 1s infinite",color:"#9ca3af",fontSize:12,marginTop:8}}>🔍 Fetching address...</div>}
              {markerPos&&!addrLoading&&<div className="co-mapok"><FaCheck size={11}/> Location selected</div>}
              {errors.map&&<div className="co-err" style={{marginTop:8}}>{errors.map}</div>}
            </div>

            {/* ADDRESS CARD */}
            <div className="co-card" style={{animationDelay:"0.06s"}}>
              <div className="co-ctitle"><div className="co-cicon" style={{background:"linear-gradient(135deg,#fff5f0,#ffe8d6)"}}><FaMapMarkerAlt style={{color:"#ff6b35"}}/></div>Delivery Address</div>
              <div className="co-r2">
                <div className="co-f">
                  <label className="co-lbl">Full Name</label>
                  <div style={{position:"relative"}}><span style={ico}><FaUser size={12} color="#ff6b35"/></span>
                    <input style={inp("name")} type="text" placeholder="Rahul Sharma" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onFocus={()=>setFocusedField("name")} onBlur={()=>setFocusedField(null)}/>
                  </div>{errors.name&&<div className="co-err">{errors.name}</div>}
                </div>
                <div className="co-f">
                  <label className="co-lbl">Phone</label>
                  <div style={{position:"relative"}}><span style={ico}><FaPhone size={12} color="#ff6b35"/></span>
                    <input style={inp("phone")} type="tel" placeholder="9876543210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} onFocus={()=>setFocusedField("phone")} onBlur={()=>setFocusedField(null)}/>
                  </div>{errors.phone&&<div className="co-err">{errors.phone}</div>}
                </div>
              </div>
              <div className="co-f">
                <label className="co-lbl">Full Address</label>
                <div style={{position:"relative"}}><span style={{...ico,top:18,transform:"none"}}><FaMapMarkerAlt size={12} color="#ff6b35"/></span>
                  <input style={{...inp("address"),paddingLeft:40}} type="text" placeholder="House no, Street, Landmark..." value={form.address} onChange={e=>setForm({...form,address:e.target.value})} onFocus={()=>setFocusedField("address")} onBlur={()=>setFocusedField(null)}/>
                </div>{errors.address&&<div className="co-err">{errors.address}</div>}
              </div>
              <div className="co-r2">
                <div className="co-f">
                  <label className="co-lbl">City</label>
                  <div style={{position:"relative"}}><span style={ico}><MdDeliveryDining size={14} color="#ff6b35"/></span>
                    <input style={inp("city")} type="text" placeholder="Mumbai" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} onFocus={()=>setFocusedField("city")} onBlur={()=>setFocusedField(null)}/>
                  </div>{errors.city&&<div className="co-err">{errors.city}</div>}
                </div>
                <div className="co-f">
                  <label className="co-lbl">Pincode</label>
                  <div style={{position:"relative"}}><span style={ico}><FaMapMarkerAlt size={12} color="#ff6b35"/></span>
                    <input style={inp("pincode")} type="text" placeholder="400001" value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})} onFocus={()=>setFocusedField("pincode")} onBlur={()=>setFocusedField(null)}/>
                  </div>{errors.pincode&&<div className="co-err">{errors.pincode}</div>}
                </div>
              </div>
              <div className="co-f" style={{marginBottom:0}}>
                <label className="co-lbl">Delivery Note (Optional)</label>
                <textarea rows={2} placeholder="e.g. Ring the bell twice..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
              </div>
            </div>

            {/* PAYMENT CARD */}
            <div className="co-card" style={{animationDelay:"0.12s"}}>
              <div className="co-ctitle"><div className="co-cicon" style={{background:"linear-gradient(135deg,#fdf2f8,#f5f3ff)"}}><FaWallet style={{color:"#a855f7"}}/></div>Payment Method</div>
              {[
                {id:"cod",  icon:"💵", label:"Cash on Delivery",     sub:"Pay when food arrives",   rzp:false, bg:"linear-gradient(135deg,#f0fdf4,#dcfce7)"},
                {id:"upi",  icon:"📲", label:"UPI / GPay / PhonePe", sub:"Instant · secured by Razorpay", rzp:true, bg:"linear-gradient(135deg,#eff6ff,#dbeafe)"},
                {id:"card", icon:"💳", label:"Credit / Debit Card",  sub:"Visa, Mastercard, RuPay",  rzp:true, bg:"linear-gradient(135deg,#fdf2f8,#fce7f3)"},
              ].map(p=>(
                <div key={p.id} className={`co-po ${paymentMethod===p.id?"sel":""}`} onClick={()=>setPaymentMethod(p.id)}>
                  <div className="co-pico" style={{background:p.bg}}>{p.icon}</div>
                  <div><div className="co-pname">{p.label}</div><div className="co-psub">{p.sub}</div>{p.rzp&&<div className="co-rzp">🔒 Powered by Razorpay</div>}</div>
                  <div className={`co-radio ${paymentMethod===p.id?"on":""}`}>{paymentMethod===p.id&&<div className="co-rdot"/>}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="co-sum co-sc">
            <div className="co-sumh"><div className="co-sumt">Order Summary</div></div>
            <div className="co-sumb">
              {CartItem.map(item=>(
                <div className="co-oi" key={item.id+(item.plateType||"")}>
                  {item.image?<img src={item.image} alt={item.name} className="co-oimg"/>:<div className="co-oimg" style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🍽️</div>}
                  <div style={{flex:1,minWidth:0}}><div className="co-oname">{item.name}</div><div className="co-oqty">× {item.quantity}</div></div>
                  <div className="co-oprc">{item.price===0?<span style={{color:"#22c55e",fontSize:11,fontWeight:800}}>FREE</span>:`₹${item.price*item.quantity}`}</div>
                </div>
              ))}
              <div className="co-div"/>
              <div className="co-row"><span className="co-rl">Subtotal</span><span className="co-rv">₹{subtotal}</span></div>
              <div className="co-row"><span className="co-rl">Delivery</span><span className="co-rv">₹{delivery}</span></div>
              <div className="co-row"><span className="co-rl">Taxes (5%)</span><span className="co-rv">₹{taxes}</span></div>
              <div className="co-div"/>
              <div className="co-tr"><span className="co-tl">Total</span><span className="co-ta">₹{total}</span></div>
              <button className="co-btn" onClick={handlePlaceOrder} disabled={loading||CartItem.length===0}>
                {loading
                  ?<><span className="co-spin"/>{paymentMethod==="cod"?"Placing Order…":"Opening Payment…"}</>
                  :paymentMethod==="cod"
                    ?<>Place Order • ₹{total}</>
                    :<><FaLock size={12}/> Pay ₹{total} via {paymentMethod==="upi"?"UPI":"Card"}</>
                }
              </button>
              <div className="co-sec"><FaLock size={9}/>{paymentMethod==="cod"?"Safe & encrypted checkout":"Payment secured by Razorpay"}</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default CheckOutPage;