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

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const getInputStyle = (name) => ({
    width: "100%",
    background: focusedField === name ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
    border: `2px solid ${focusedField === name ? "#ff6b35" : "rgba(255,255,255,0.6)"}`,
    borderRadius: 14,
    padding: "12px 14px 12px 42px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14, fontWeight: 500,
    color: "#1a1a2e", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box",
    boxShadow: focusedField === name ? "0 0 0 4px rgba(255,107,53,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
  });

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
      if (!res.ok) { showToast(data.message || "Something went wrong", false); setLoading(false); return; }
      dispatch(setUserData(data.user));
      showToast("✓ Welcome back!");
      setTimeout(() => navigate("/"), 1200);
    } catch { showToast("Network error", false); }
    finally { setLoading(false); }
  };

  const handleWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: googleUser.displayName, email: googleUser.email }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Google sign-in failed", false); setGoogleLoading(false); return; }
      dispatch(setUserData(data.user));
      showToast("✓ Welcome back!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") showToast("Popup closed — try again", false);
      else showToast("Google sign-in failed", false);
    } finally { setGoogleLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        @keyframes floatOrb  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.07)} }
        @keyframes bounce    { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-6px) rotate(5deg)} }
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

        * { box-sizing: border-box; }

        .wx-signin-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden; padding: 24px 16px;
          background: linear-gradient(145deg, #fff5f0 0%, #fdf8ff 40%, #f0fdf9 100%);
        }

        /* ── BG BLOBS ── */
        .wx-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .wx-blob-1 { width: 500px; height: 500px; background: rgba(255,107,53,0.18); top: -15%; left: -10%; animation: floatOrb 8s ease-in-out infinite; }
        .wx-blob-2 { width: 380px; height: 380px; background: rgba(255,60,172,0.13); bottom: -10%; right: -8%; animation: floatOrb 8s ease-in-out infinite 3s; }
        .wx-blob-3 { width: 240px; height: 240px; background: rgba(168,85,247,0.1); top: 35%; right: 10%; animation: floatOrb 8s ease-in-out infinite 5s; }
        .wx-blob-4 { width: 180px; height: 180px; background: rgba(20,184,166,0.1); bottom: 20%; left: 5%; animation: floatOrb 8s ease-in-out infinite 2s; }

        /* ── DOTS PATTERN ── */
        .wx-dots {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          backgroundImage: radial-gradient(rgba(255,107,53,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── CARD ── */
        .wx-signin-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 2px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          padding: 40px 40px;
          box-shadow: 0 24px 64px rgba(255,107,53,0.12), 0 8px 32px rgba(0,0,0,0.08);
          animation: fadeUp 0.5s ease;
        }

        /* ── LOGO ── */
        .wx-si-logo {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 24px;
        }
        .wx-si-logo-icon {
          width: 44px; height: 44px; border-radius: 14px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 6px 18px rgba(255,107,53,0.4);
          animation: bounce 2s ease-in-out infinite;
        }
        .wx-si-logo-text {
          font-family: 'Nunito', sans-serif; font-size: 28px; font-weight: 900;
          background: linear-gradient(135deg, #ff6b35, #ff3cac, #a855f7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          letter-spacing: -0.5px;
        }
        .wx-si-logo-badge {
          background: linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,60,172,0.12));
          border: 1.5px solid rgba(255,107,53,0.25);
          border-radius: 8px; padding: 3px 8px;
          font-size: 10px; font-weight: 800; color: #ff6b35;
          letter-spacing: 1.5px; text-transform: uppercase;
        }

        /* ── TITLES ── */
        .wx-si-title {
          font-family: 'Nunito', sans-serif; font-size: 28px; font-weight: 900;
          text-align: center; margin-bottom: 6px;
          background: linear-gradient(135deg, #1a1a2e, #ff6b35);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .wx-si-sub { font-size: 13px; color: #9ca3af; text-align: center; margin-bottom: 28px; font-weight: 500; }

        /* ── LABEL ── */
        .wx-si-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #6b7280; margin-bottom: 6px;
        }

        /* ── ICON WRAP ── */
        .wx-si-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          opacity: 0.6; pointer-events: none; display: flex; align-items: center;
        }

        /* ── EYE BTN ── */
        .wx-eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .wx-eye-btn:hover { color: #ff6b35; }

        /* ── FORGOT ── */
        .wx-forgot {
          display: block; text-align: right; font-size: 12px;
          color: #ff6b35; font-weight: 700; text-decoration: none;
          margin-top: 8px; transition: opacity 0.2s;
        }
        .wx-forgot:hover { opacity: 0.75; }

        /* ── SUBMIT BTN ── */
        .wx-si-btn {
          width: 100%; margin-top: 20px; padding: 14px;
          border: none; border-radius: 14px;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 800; letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(255,107,53,0.4);
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
        }
        .wx-si-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,107,53,0.5); }
        .wx-si-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── DIVIDER ── */
        .wx-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 18px 0; font-size: 12px; font-weight: 600; color: #9ca3af;
        }
        .wx-divider-line { flex: 1; height: 1.5px; background: rgba(255,107,53,0.12); border-radius: 1px; }

        /* ── GOOGLE BTN ── */
        .wx-google-btn {
          width: 100%; padding: 13px;
          background: white;
          border: 2px solid rgba(255,107,53,0.15);
          border-radius: 14px; color: #1a1a2e;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .wx-google-btn:hover:not(:disabled) {
          border-color: rgba(255,107,53,0.4);
          background: rgba(255,107,53,0.04);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,107,53,0.15);
        }
        .wx-google-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── SWITCH LINK ── */
        .wx-switch { text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af; font-weight: 500; }
        .wx-switch a { color: #ff6b35; font-weight: 800; text-decoration: none; }
        .wx-switch a:hover { text-decoration: underline; }

        /* ── SPINNER ── */
        .wx-spinner {
          width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
          border-top: 2px solid white;
          animation: spin 0.7s linear infinite;
        }

        /* ── TOAST ── */
        .wx-toast {
          position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
          padding: 12px 24px; border-radius: 14px;
          font-size: 14px; font-weight: 700; z-index: 999;
          box-shadow: 0 8px 28px rgba(0,0,0,0.2);
          color: white; pointer-events: none; white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
          animation: fadeUp 0.3s ease;
        }
      `}</style>

      <div className="wx-signin-page">
        <div className="wx-blob wx-blob-1" />
        <div className="wx-blob wx-blob-2" />
        <div className="wx-blob wx-blob-3" />
        <div className="wx-blob wx-blob-4" />
        <div className="wx-dots" style={{ backgroundImage: "radial-gradient(rgba(255,107,53,0.12) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="wx-signin-card">

          {/* Logo */}
          <div className="wx-si-logo">
            <div className="wx-si-logo-icon">🔥</div>
            <span className="wx-si-logo-text">WingX</span>
            <span className="wx-si-logo-badge">Food</span>
          </div>

          <div className="wx-si-title">Welcome Back 👋</div>
          <div className="wx-si-sub">Ready to order? Sign in to continue.</div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label className="wx-si-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <span className="wx-si-icon">
                <svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24">
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
          <div style={{ marginBottom: 4 }}>
            <label className="wx-si-label">Password</label>
            <div style={{ position: "relative" }}>
              <span className="wx-si-icon">
                <svg width="15" height="15" fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                style={{ ...getInputStyle("password"), paddingRight: 44 }}
                type={showPass ? "text" : "password"} placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoComplete="current-password"
              />
              <button className="wx-eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass
                  ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                  : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <Link to="/forgot-password" className="wx-forgot">Forgot password?</Link>
          </div>

          <button className="wx-si-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span className="wx-spinner" /> Signing In…</span> : "Sign In →"}
          </button>

          <div className="wx-divider">
            <div className="wx-divider-line" /> or continue with <div className="wx-divider-line" />
          </div>

          <button className="wx-google-btn" onClick={handleWithGoogle} disabled={googleLoading}>
            {googleLoading
              ? <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #e5e7eb", borderTop: "2px solid #ff6b35", animation: "spin 0.7s linear infinite", flexShrink: 0 }} /> Signing in…</>
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>

          <div className="wx-switch">
            Don't have an account?{" "}
            <Link to="/signup">Sign Up</Link>
          </div>
        </div>

        {toast && (
          <div className="wx-toast" style={{ background: toast.ok ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}