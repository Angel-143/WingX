import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user_slice.js";
import { signInWithGoogle } from "../../firebase.js";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ── Google Modal ──
function GoogleSignupModal({ onSubmit, onClose }) {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const getInputStyle = (name) => ({
    width: "100%",
    background: focusedField === name ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.88)",
    border: `2px solid ${focusedField === name ? "#ff6b35" : "rgba(255,107,53,0.2)"}`,
    borderRadius: 14, padding: "12px 14px 12px 42px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14, fontWeight: 500, color: "#1a1a2e", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    boxShadow: focusedField === name ? "0 0 0 4px rgba(255,107,53,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(255,245,240,0.7)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16,
    }}>
      <div style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px)",
        border: "2px solid rgba(255,255,255,0.95)",
        borderRadius: 24, padding: "32px 28px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 24px 64px rgba(255,107,53,0.15), 0 8px 32px rgba(0,0,0,0.1)",
        animation: "fadeUp 0.3s ease",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{
          fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 900,
          marginBottom: 6,
          background: "linear-gradient(135deg, #1a1a2e, #ff6b35)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Complete Your Profile 👋
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22, fontWeight: 500 }}>
          A few more details to finish setup.
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
            Phone Number
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.6, pointerEvents: "none" }}>
              <svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <input style={getInputStyle("phone")} type="tel" placeholder="9876543210"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)}
            />
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, fontWeight: 500 }}>Min. 10 digits required</div>
        </div>

        {/* Role */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
            I am a
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.6, pointerEvents: "none" }}>
              <svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <select style={{ ...getInputStyle("role"), WebkitAppearance: "none", cursor: "pointer" }}
              value={role} onChange={(e) => setRole(e.target.value)}
              onFocus={() => setFocusedField("role")} onBlur={() => setFocusedField(null)}
            >
              <option value="" disabled>Select your role</option>
              <option value="user">🛍️ Customer</option>
              <option value="owner">🍽️ Restaurant Owner</option>
              <option value="deliveryBoy">🛵 Delivery Partner</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onSubmit(phone, role)}
          disabled={!phone || phone.length < 10 || !role}
          style={{
            width: "100%", padding: "13px", border: "none", borderRadius: 14,
            background: "linear-gradient(135deg, #ff6b35, #ff3cac)",
            color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14, fontWeight: 800, cursor: (!phone || phone.length < 10 || !role) ? "not-allowed" : "pointer",
            opacity: (!phone || phone.length < 10 || !role) ? 0.5 : 1,
            boxShadow: "0 6px 20px rgba(255,107,53,0.35)",
            transition: "opacity 0.2s",
          }}
        >
          Complete Sign Up →
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 10, padding: "12px",
            background: "transparent", border: "2px solid rgba(255,107,53,0.15)",
            borderRadius: 14, color: "#9ca3af",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,53,0.35)"; e.currentTarget.style.color = "#ff6b35"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,53,0.15)"; e.currentTarget.style.color = "#9ca3af"; }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const getInputStyle = (name) => ({
    width: "100%",
    background: focusedField === name ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.88)",
    border: `2px solid ${focusedField === name ? "#ff6b35" : "rgba(255,107,53,0.15)"}`,
    borderRadius: 14, padding: "12px 14px 12px 42px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14, fontWeight: 500, color: "#1a1a2e", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box",
    boxShadow: focusedField === name ? "0 0 0 4px rgba(255,107,53,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
  });

  const passHint = () => {
    if (!form.password) return { text: "At least 6 characters", color: "#9ca3af" };
    if (form.password.length < 6) return { text: "⚠ Too short", color: "#ef4444" };
    return { text: "✓ Looks good", color: "#22c55e" };
  };

  const handleSubmit = async () => {
    const { fullName, email, phone, password, role } = form;
    if (!fullName || !email || !phone || !password || !role) return showToast("Please fill all fields", false);
    if (password.length < 6) return showToast("Password must be at least 6 characters", false);
    if (phone.length < 10) return showToast("Invalid phone number", false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ fullName, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Something went wrong", false); setLoading(false); return; }
      dispatch(setUserData(data.user));
      showToast("🚀 Account created!");
      setTimeout(() => navigate("/"), 1200);
    } catch { showToast("Network error", false); }
    finally { setLoading(false); }
  };

  const handleWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const checkRes = await fetch("/api/auth/google/check", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ email: googleUser.email }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        const res = await fetch("/api/auth/google", {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ name: googleUser.displayName, email: googleUser.email }),
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.message || "Google sign-in failed", false); setGoogleLoading(false); return; }
        dispatch(setUserData(data.user));
        showToast("✓ Welcome back!");
        setTimeout(() => navigate("/"), 1200);
      } else {
        setPendingGoogleUser(googleUser);
        setShowModal(true);
        setGoogleLoading(false);
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") showToast("Popup closed — try again", false);
      else showToast("Google sign-up failed", false);
      setGoogleLoading(false);
    }
  };

  const handleModalSubmit = async (phone, role) => {
    if (!phone || phone.length < 10) return showToast("Invalid phone number", false);
    if (!role) return showToast("Please select a role", false);
    setShowModal(false); setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ name: pendingGoogleUser.displayName, email: pendingGoogleUser.email, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Google sign-up failed", false); setGoogleLoading(false); return; }
      dispatch(setUserData(data.user));
      showToast("🚀 Account created!");
      setTimeout(() => navigate("/"), 1200);
    } catch { showToast("Network error", false); }
    finally { setGoogleLoading(false); setPendingGoogleUser(null); }
  };

  const iconWrap = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.6, pointerEvents: "none", display: "flex", alignItems: "center" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.07)} }
        @keyframes bounce   { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-6px) rotate(5deg)} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        .wx-su-select option { background: white; color: #1a1a2e; }
      `}</style>

      {showModal && (
        <GoogleSignupModal
          onSubmit={handleModalSubmit}
          onClose={() => { setShowModal(false); setPendingGoogleUser(null); }}
        />
      )}

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative", overflow: "hidden", padding: "24px 16px",
        background: "linear-gradient(145deg, #fff5f0 0%, #fdf8ff 40%, #f0fdf9 100%)",
      }}>
        {/* Blobs */}
        {[
          { w: 480, h: 480, bg: "rgba(255,107,53,0.18)", t: "-12%", l: "-8%", delay: "0s" },
          { w: 360, h: 360, bg: "rgba(255,60,172,0.14)", b: "-10%", r: "-6%", delay: "3s" },
          { w: 260, h: 260, bg: "rgba(168,85,247,0.1)", t: "30%", r: "8%", delay: "5s" },
          { w: 160, h: 160, bg: "rgba(20,184,166,0.1)", b: "15%", l: "4%", delay: "2s" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
            width: b.w, height: b.h, background: b.bg,
            top: b.t, left: b.l, bottom: b.b, right: b.r,
            animation: `floatOrb 8s ease-in-out infinite ${b.delay}`,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(255,107,53,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* CARD */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 480,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "2px solid rgba(255,255,255,0.9)",
          borderRadius: 28, padding: "36px 36px",
          boxShadow: "0 24px 64px rgba(255,107,53,0.12), 0 8px 32px rgba(0,0,0,0.08)",
          animation: "fadeUp 0.5s ease",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, fontSize: 20,
              background: "linear-gradient(135deg, #ff6b35, #ff3cac)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 18px rgba(255,107,53,0.4)",
              animation: "bounce 2s ease-in-out infinite",
            }}>🔥</div>
            <span style={{
              fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 900,
              background: "linear-gradient(135deg, #ff6b35, #ff3cac, #a855f7)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>WingX</span>
            <span style={{
              background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,60,172,0.12))",
              border: "1.5px solid rgba(255,107,53,0.25)",
              borderRadius: 8, padding: "3px 8px",
              fontSize: 10, fontWeight: 800, color: "#ff6b35",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>Food</span>
          </div>

          <div style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900,
            textAlign: "center", marginBottom: 5,
            background: "linear-gradient(135deg, #1a1a2e, #ff6b35)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Join WingX 🚀</div>
          <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 24, fontWeight: 500 }}>
            Create your account in seconds.
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
              <input style={getInputStyle("fullName")} type="text" placeholder="Rahul Sharma"
                value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                onFocus={() => setFocusedField("fullName")} onBlur={() => setFocusedField(null)} />
            </div>
          </div>

          {/* Email + Phone row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 13 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Email</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg></span>
                <input style={getInputStyle("email")} type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Phone</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                <input style={getInputStyle("phone")} type="tel" placeholder="9876543210"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input style={{ ...getInputStyle("password"), paddingRight: 44 }}
                type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: 4 }}>
                {showPass
                  ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                  : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <div style={{ fontSize: 11, marginTop: 5, fontWeight: 600, color: passHint().color }}>{passHint().text}</div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>I am a</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
              <select className="wx-su-select" style={{ ...getInputStyle("role"), WebkitAppearance: "none", cursor: "pointer" }}
                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                onFocus={() => setFocusedField("role")} onBlur={() => setFocusedField(null)}>
                <option value="" disabled>Select your role</option>
                <option value="user">🛍️ Customer — I want to order food</option>
                <option value="owner">🍽️ Restaurant Owner — I list my restaurant</option>
                <option value="deliveryBoy">🛵 Delivery Partner — I deliver orders</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", marginTop: 20, padding: "14px", border: "none", borderRadius: 14,
              background: "linear-gradient(135deg, #ff6b35, #ff3cac)",
              color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 8px 24px rgba(255,107,53,0.4)",
              transition: "transform 0.15s, box-shadow 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(255,107,53,0.5)"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,107,53,0.4)"; }}
          >
            {loading
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid white", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />Creating Account…</span>
              : "Create Account →"
            }
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>
            <div style={{ flex: 1, height: 1.5, background: "rgba(255,107,53,0.12)", borderRadius: 1 }} />
            or sign up with
            <div style={{ flex: 1, height: 1.5, background: "rgba(255,107,53,0.12)", borderRadius: 1 }} />
          </div>

          {/* Google */}
          <button
            onClick={handleWithGoogle} disabled={googleLoading}
            style={{
              width: "100%", padding: "13px",
              background: "white", border: "2px solid rgba(255,107,53,0.15)",
              borderRadius: 14, color: "#1a1a2e",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 14, fontWeight: 700,
              cursor: googleLoading ? "not-allowed" : "pointer",
              opacity: googleLoading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { if (!googleLoading) { e.currentTarget.style.borderColor = "rgba(255,107,53,0.4)"; e.currentTarget.style.background = "rgba(255,107,53,0.04)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,53,0.15)"; e.currentTarget.style.background = "white"; e.currentTarget.style.transform = ""; }}
          >
            {googleLoading
              ? <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #e5e7eb", borderTop: "2px solid #ff6b35", animation: "spin 0.7s linear infinite", flexShrink: 0 }} /> Processing…</>
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color: "#ff6b35", fontWeight: 800, textDecoration: "none" }}>Sign In</Link>
          </div>
        </div>

        {toast && (
          <div style={{
            position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
            padding: "12px 24px", borderRadius: 14,
            fontSize: 14, fontWeight: 700, zIndex: 999,
            boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
            color: "white", pointerEvents: "none", whiteSpace: "nowrap",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: toast.ok ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)",
            animation: "fadeUp 0.3s ease",
          }}>{toast.msg}</div>
        )}
      </div>
    </>
  );
}