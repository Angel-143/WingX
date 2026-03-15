import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user_slice.js";
import { signInWithGoogle } from "../../firebase.js";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0f",
    fontFamily: "'Outfit', sans-serif",
    color: "#f0ede8",
    position: "relative",
    overflow: "hidden",
    padding: "24px 16px",
  },
  bgGrid: {
    position: "absolute", inset: 0,
    backgroundImage:
      "linear-gradient(rgba(42,42,61,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,61,0.35) 1px, transparent 1px)",
    backgroundSize: "48px 48px", zIndex: 0,
  },
  orb1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "rgba(255,77,0,0.15)", filter: "blur(90px)",
    top: "-10%", left: "-5%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite",
  },
  orb2: {
    position: "absolute", width: 320, height: 320, borderRadius: "50%",
    background: "rgba(255,140,0,0.1)", filter: "blur(80px)",
    bottom: "-10%", right: "-5%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite 3s",
  },
  orb3: {
    position: "absolute", width: 200, height: 200, borderRadius: "50%",
    background: "rgba(255,204,0,0.07)", filter: "blur(60px)",
    top: "40%", right: "15%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite 5s",
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: 460,
    background: "rgba(18,18,26,0.88)",
    border: "1px solid #2a2a3d",
    borderRadius: 20,
    padding: "40px 40px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,77,0,0.06)",
  },
  logo: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 24,
  },
  logoText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 36, letterSpacing: 3,
    background: "linear-gradient(135deg, #ff4d00, #ff8c00, #ffcc00)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  logoBadge: {
    background: "rgba(255,77,0,0.15)",
    border: "1px solid rgba(255,77,0,0.3)",
    borderRadius: 8, padding: "3px 8px",
    fontSize: 10, fontWeight: 700,
    color: "#ff8c00", letterSpacing: 1.5, textTransform: "uppercase",
  },
  formTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 34, letterSpacing: 1.5,
    marginBottom: 5, textAlign: "center",
    background: "linear-gradient(135deg, #fff 60%, #ff8c00)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  formSub: { fontSize: 13, color: "#7a7a9a", marginBottom: 24, textAlign: "center" },
  inputGroup: { marginBottom: 14 },
  label: {
    display: "block", fontSize: 11, fontWeight: 600,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "#7a7a9a", marginBottom: 6,
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%", background: "#1a1a27",
    border: "1px solid #2a2a3d", borderRadius: 10,
    padding: "11px 14px 11px 40px",
    fontFamily: "'Outfit', sans-serif", fontSize: 14,
    color: "#f0ede8", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  select: {
    width: "100%", background: "#1a1a27",
    border: "1px solid #2a2a3d", borderRadius: 10,
    padding: "11px 14px 11px 40px",
    fontFamily: "'Outfit', sans-serif", fontSize: 14,
    color: "#f0ede8", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box", WebkitAppearance: "none", cursor: "pointer",
  },
  iconWrap: {
    position: "absolute", left: 13, top: "50%",
    transform: "translateY(-50%)", opacity: 0.5,
    pointerEvents: "none", display: "flex", alignItems: "center",
  },
  eyeBtn: {
    position: "absolute", right: 11, top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "#7a7a9a", display: "flex", alignItems: "center", padding: 4,
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  hint: { fontSize: 11, color: "#7a7a9a", marginTop: 4 },
  hintError: { fontSize: 11, color: "#ff3b5c", marginTop: 4 },
  hintOk: { fontSize: 11, color: "#4ade80", marginTop: 4 },
  btnFire: {
    width: "100%", marginTop: 20, padding: "13px",
    border: "none", borderRadius: 10,
    background: "linear-gradient(135deg, #ff4d00 0%, #ff6a00 50%, #ff8c00 100%)",
    color: "#fff", fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 700, letterSpacing: 1,
    cursor: "pointer", boxShadow: "0 6px 28px rgba(255,77,0,0.4)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "16px 0", fontSize: 12, color: "#7a7a9a",
  },
  dividerLine: { flex: 1, height: 1, background: "#2a2a3d" },
  btnGoogle: {
    width: "100%", padding: "12px",
    background: "#1a1a27", border: "1px solid #2a2a3d",
    borderRadius: 10, color: "#f0ede8",
    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 10,
    transition: "border-color 0.2s, background 0.2s",
  },
  switchLink: { textAlign: "center", marginTop: 18, fontSize: 13, color: "#7a7a9a" },
  spinner: {
    width: 16, height: 16,
    border: "2px solid rgba(240,237,232,0.3)",
    borderTop: "2px solid #f0ede8",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  },
  // Modal styles
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: 16,
  },
  modalCard: {
    background: "#12121a", border: "1px solid #2a2a3d",
    borderRadius: 16, padding: "32px 28px",
    width: "100%", maxWidth: 400,
    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
  },
  modalTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1.5,
    marginBottom: 6, background: "linear-gradient(135deg, #fff 60%, #ff8c00)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  modalSub: { fontSize: 13, color: "#7a7a9a", marginBottom: 20 },
  roleBtn: {
    width: "100%", padding: "12px 16px",
    background: "#1a1a27", border: "1px solid #2a2a3d",
    borderRadius: 10, color: "#f0ede8",
    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
    marginBottom: 10, transition: "border-color 0.2s, background 0.2s",
  },
  toast: {
    position: "fixed", bottom: 32, left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 24px", borderRadius: 10,
    fontSize: 14, fontWeight: 600, zIndex: 999,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    color: "#fff", pointerEvents: "none", whiteSpace: "nowrap",
  },
};

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

// ✅ Modal with Phone + Role inputs
function GoogleSignupModal({ onSubmit, onClose }) {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const roles = [
    { value: "user",        emoji: "🛍️", label: "Customer" },
    { value: "owner",       emoji: "🍽️", label: "Restaurant Owner" },
    { value: "deliveryBoy", emoji: "🛵", label: "Delivery Partner" },
  ];

  const getInputStyle = (name) => ({
    ...styles.input,
    borderColor: focusedField === name ? "#ff4d00" : "#2a2a3d",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(255,77,0,0.12)" : "none",
  });

  const getSelectStyle = (name) => ({
    ...styles.select,
    borderColor: focusedField === name ? "#ff4d00" : "#2a2a3d",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(255,77,0,0.12)" : "none",
  });

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCard}>
        <div style={styles.modalTitle}>Complete Your Profile 👋</div>
        <div style={styles.modalSub}>We need a few more details to create your account.</div>

        {/* Phone Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <div style={styles.inputWrap}>
            <span style={styles.iconWrap}>
              <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <input
              style={getInputStyle("phone")}
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div style={styles.hint}>Min. 10 digits required</div>
        </div>

        {/* Role Dropdown */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>I am a</label>
          <div style={styles.inputWrap}>
            <span style={styles.iconWrap}>
              <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <select
              style={getSelectStyle("role")}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onFocus={() => setFocusedField("role")}
              onBlur={() => setFocusedField(null)}
            >
              <option value="" disabled>Select your role</option>
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          style={{
            ...styles.btnFire,
            marginTop: 16,
            opacity: (!phone || phone.length < 10 || !role) ? 0.5 : 1,
            cursor: (!phone || phone.length < 10 || !role) ? "not-allowed" : "pointer",
          }}
          onClick={() => onSubmit(phone, role)}
          disabled={!phone || phone.length < 10 || !role}
        >
          Complete Sign Up →
        </button>

        <button
          style={{
            ...styles.btnGoogle,
            marginTop: 10,
            border: "1px solid #2a2a3d",
            background: "transparent",
          }}
          onClick={onClose}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff4d00"; e.currentTarget.style.background = "rgba(255,77,0,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3d"; e.currentTarget.style.background = "transparent"; }}
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
    ...styles.input,
    borderColor: focusedField === name ? "#ff4d00" : "#2a2a3d",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(255,77,0,0.12)" : "none",
  });

  const getSelectStyle = (name) => ({
    ...styles.select,
    borderColor: focusedField === name ? "#ff4d00" : "#2a2a3d",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(255,77,0,0.12)" : "none",
  });

  const passHint = () => {
    if (!form.password) return { text: "At least 6 characters", style: styles.hint };
    if (form.password.length < 6) return { text: "⚠ Too short", style: styles.hintError };
    return { text: "✓ Looks good", style: styles.hintOk };
  };

  // ── Email / Password Sign Up ──
  const handleSubmit = async () => {
    const { fullName, email, phone, password, role } = form;
    if (!fullName || !email || !phone || !password || !role)
      return showToast("Please fill all fields", false);
    if (password.length < 6) return showToast("Password must be at least 6 characters", false);
    if (phone.length < 10) return showToast("Invalid phone number", false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Something went wrong", false);
        setLoading(false);
        return;
      }
      dispatch(setUserData(data.user));
      showToast("🚀 Account created!");
      setTimeout(() => navigate("/"), 1200);
    } catch {
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign Up Handler
  const handleWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      console.log("🔥 Google user:", googleUser);

      // Check if user exists
      const checkRes = await fetch("/api/auth/google/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: googleUser.email }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        // Already registered → just login
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: googleUser.displayName, email: googleUser.email }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || "Google sign-in failed", false);
          setGoogleLoading(false);
          return;
        }
        dispatch(setUserData(data.user));
        showToast("✓ Welcome back!");
        setTimeout(() => navigate("/"), 1200);
      } else {
        // New user → show modal
        setPendingGoogleUser(googleUser);
        setShowModal(true);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("❌ Google error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        showToast("Popup closed — please try again", false);
      } else {
        showToast("Google sign-up failed", false);
      }
      setGoogleLoading(false);
    }
  };

  // ✅ Complete Google Signup
  const handleModalSubmit = async (phone, role) => {
    if (!phone || phone.length < 10) return showToast("Invalid phone number", false);
    if (!role) return showToast("Please select a role", false);

    setShowModal(false);
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name:  pendingGoogleUser.displayName,
          email: pendingGoogleUser.email,
          phone,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Google sign-up failed", false);
        setGoogleLoading(false);
        return;
      }
      dispatch(setUserData(data.user));
      showToast("🚀 Account created!");
      setTimeout(() => navigate("/"), 1200);
    } catch {
      showToast("Network error", false);
    } finally {
      setGoogleLoading(false);
      setPendingGoogleUser(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-24px) scale(1.06)} }
        @keyframes bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #3a3a55; }
        select option { background: #1a1a27; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 4px; }
      `}</style>

      {showModal && (
        <GoogleSignupModal
          onSubmit={handleModalSubmit}
          onClose={() => { setShowModal(false); setPendingGoogleUser(null); }}
        />
      )}

      <div style={styles.page}>
        <div style={styles.bgGrid} />
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.orb3} />

        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logo}>
            <span style={{ fontSize: 26, display: "inline-block", animation: "bounce 1.8s ease-in-out infinite" }}>🔥</span>
            <span style={styles.logoText}>WingX</span>
            <span style={styles.logoBadge}>Food</span>
          </div>

          <div style={styles.formTitle}>Join WingX 🚀</div>
          <div style={styles.formSub}>Create your account in seconds.</div>

          {/* Full Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}>
              <span style={styles.iconWrap}>
                <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                style={getInputStyle("fullName")}
                type="text" placeholder="Rahul Sharma"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <span style={styles.iconWrap}>
                  <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                </span>
                <input
                  style={getInputStyle("email")}
                  type="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <div style={styles.inputWrap}>
                <span style={styles.iconWrap}>
                  <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <input
                  style={getInputStyle("phone")}
                  type="tel" placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.iconWrap}>
                <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                style={{ ...getInputStyle("password"), paddingRight: 42 }}
                type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
              <button style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <div style={passHint().style}>{passHint().text}</div>
          </div>

          {/* Role */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>I am a</label>
            <div style={styles.inputWrap}>
              <span style={styles.iconWrap}>
                <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <select
                style={getSelectStyle("role")}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                onFocus={() => setFocusedField("role")}
                onBlur={() => setFocusedField(null)}
              >
                <option value="" disabled>Select your role</option>
                <option value="user">🛍️ Customer — I want to order food</option>
                <option value="owner">🍽️ Restaurant Owner — I list my restaurant</option>
                <option value="deliveryBoy">🛵 Delivery Partner — I deliver orders</option>
              </select>
            </div>
          </div>

          <button
            style={{ ...styles.btnFire, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleSubmit} disabled={loading}
          >
            {loading ? "Creating Account…" : "Create Account →"}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} /> or sign up with <div style={styles.dividerLine} />
          </div>

          {/* ✅ Google Button */}
          <button
            style={{ ...styles.btnGoogle, opacity: googleLoading ? 0.7 : 1, cursor: googleLoading ? "not-allowed" : "pointer" }}
            onClick={handleWithGoogle}
            disabled={googleLoading}
            onMouseEnter={(e) => { if (!googleLoading) { e.currentTarget.style.borderColor = "#ff4d00"; e.currentTarget.style.background = "rgba(255,77,0,0.05)"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3d"; e.currentTarget.style.background = "#1a1a27"; }}
          >
            {googleLoading
              ? <><span style={styles.spinner} /> Processing…</>
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>

          <div style={styles.switchLink}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color: "#ff8c00", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
          </div>
        </div>

        {toast && (
          <div style={{ ...styles.toast, background: toast.ok ? "#22c55e" : "#ff3b5c" }}>{toast.msg}</div>
        )}
      </div>
    </>
  );
}