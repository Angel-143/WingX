import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user_slice.js";
import { signInWithGoogle } from "../../firebase.js"; // ✅ Import from root


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
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "rgba(255,140,0,0.1)", filter: "blur(80px)",
    bottom: "-10%", right: "-5%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite 3s",
  },
  orb3: {
    position: "absolute", width: 200, height: 200, borderRadius: "50%",
    background: "rgba(255,204,0,0.07)", filter: "blur(60px)",
    top: "50%", right: "20%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite 5s",
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: 440,
    background: "rgba(18,18,26,0.88)",
    border: "1px solid #2a2a3d",
    borderRadius: 20,
    padding: "44px 40px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,77,0,0.06)",
  },
  logo: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 28,
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
  formSub: { fontSize: 13, color: "#7a7a9a", marginBottom: 28, textAlign: "center" },
  inputGroup: { marginBottom: 16 },
  label: {
    display: "block", fontSize: 11, fontWeight: 600,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "#7a7a9a", marginBottom: 7,
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%", background: "#1a1a27",
    border: "1px solid #2a2a3d", borderRadius: 10,
    padding: "12px 14px 12px 40px",
    fontFamily: "'Outfit', sans-serif", fontSize: 14,
    color: "#f0ede8", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
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
  forgotLink: {
    display: "block", textAlign: "right",
    fontSize: 12, color: "#ff8c00",
    textDecoration: "none", marginTop: 7, cursor: "pointer",
    fontWeight: 500,
  },
  btnFire: {
    width: "100%", marginTop: 22, padding: "13px",
    border: "none", borderRadius: 10,
    background: "linear-gradient(135deg, #ff4d00 0%, #ff6a00 50%, #ff8c00 100%)",
    color: "#fff", fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 700, letterSpacing: 1,
    cursor: "pointer", boxShadow: "0 6px 28px rgba(255,77,0,0.4)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "18px 0", fontSize: 12, color: "#7a7a9a",
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
  switchLink: { textAlign: "center", marginTop: 20, fontSize: 13, color: "#7a7a9a" },
  spinner: {
    width: 16, height: 16,
    border: "2px solid rgba(240,237,232,0.3)",
    borderTop: "2px solid #f0ede8",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
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

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);  // ✅ Added
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const getInputStyle = (name) => ({
    ...styles.input,
    borderColor: focusedField === name ? "#ff4d00" : "#2a2a3d",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(255,77,0,0.12)" : "none",
  });

  // ── Email / Password Sign In ──
  const handleSubmit = async () => {
    const { email, password } = form;
    if (!email || !password) return showToast("Please fill all fields", false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.message || "Something went wrong", false);
        setLoading(false);
        return;
      }
      
      console.log("🔥 Backend response:", data);
      dispatch(setUserData(data.user));
      console.log("🔥 Dispatched user:", data.user);
      
      showToast("✓ Welcome back!");
      setTimeout(() => {
        console.log("🔥 Navigating to /");
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error("❌ Error:", error);
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign In Handler
  const handleWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      // Step 1: Firebase Google popup
      const googleUser = await signInWithGoogle();
      console.log("🔥 Google user:", googleUser);

      // Step 2: Send to backend
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name:  googleUser.displayName,
          email: googleUser.email,
        }),
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
    } catch (err) {
      console.error("❌ Google error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        showToast("Popup closed — please try again", false);
      } else {
        showToast("Google sign-in failed", false);
      }
    } finally {
      setGoogleLoading(false);
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
      `}</style>

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

          <div style={styles.formTitle}>Welcome Back</div>
          <div style={styles.formSub}>Ready to order? Sign in to continue.</div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
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
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoComplete="email"
              />
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
                type={showPass ? "text" : "password"} placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoComplete="current-password"
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
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button
            style={{ ...styles.btnFire, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleSubmit} disabled={loading}
          >
            {loading ? "Signing In…" : "Sign In →"}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} /> or continue with <div style={styles.dividerLine} />
          </div>

          {/* ✅ Google Button with handler */}
          <button
            style={{ ...styles.btnGoogle, opacity: googleLoading ? 0.7 : 1, cursor: googleLoading ? "not-allowed" : "pointer" }}
            onClick={handleWithGoogle}
            disabled={googleLoading}
            onMouseEnter={(e) => { if (!googleLoading) { e.currentTarget.style.borderColor = "#ff4d00"; e.currentTarget.style.background = "rgba(255,77,0,0.05)"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3d"; e.currentTarget.style.background = "#1a1a27"; }}
          >
            {googleLoading
              ? <><span style={styles.spinner} /> Signing in with Google…</>
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>

          <div style={styles.switchLink}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#ff8c00", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
          </div>
        </div>

        {toast && (
          <div style={{ ...styles.toast, background: toast.ok ? "#22c55e" : "#ff3b5c" }}>{toast.msg}</div>
        )}
      </div>
    </>
  );
}