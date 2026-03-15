import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    background: "rgba(255,77,0,0.13)", filter: "blur(90px)",
    top: "-10%", left: "-5%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite",
  },
  orb2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "rgba(255,140,0,0.09)", filter: "blur(80px)",
    bottom: "-10%", right: "-5%", zIndex: 0,
    animation: "floatOrb 7s ease-in-out infinite 3.5s",
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: 420,
    background: "rgba(18,18,26,0.90)",
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
    fontSize: 32, letterSpacing: 3,
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

  // Step indicator
  stepRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 0, marginBottom: 28,
  },
  stepDot: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, transition: "all 0.3s",
  },
  stepLine: { flex: 1, height: 2, maxWidth: 40, transition: "background 0.3s" },

  formTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32, letterSpacing: 1.5,
    marginBottom: 6, textAlign: "center",
    background: "linear-gradient(135deg, #fff 60%, #ff8c00)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  formSub: { fontSize: 13, color: "#7a7a9a", marginBottom: 28, textAlign: "center", lineHeight: 1.6 },
  formSubHighlight: { color: "#ff8c00", fontWeight: 600 },

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

  // OTP boxes
  otpRow: {
    display: "flex", gap: 10, justifyContent: "center",
    marginBottom: 8,
  },
  otpBox: {
    width: 52, height: 56,
    background: "#1a1a27",
    border: "1px solid #2a2a3d", borderRadius: 10,
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 24, textAlign: "center",
    color: "#f0ede8", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    caretColor: "#ff8c00",
  },

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
    transition: "opacity 0.2s",
  },
  btnOutline: {
    width: "100%", marginTop: 10, padding: "12px",
    border: "1px solid #2a2a3d", borderRadius: 10,
    background: "transparent",
    color: "#7a7a9a", fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 500,
    cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
  },

  successIcon: {
    width: 64, height: 64, borderRadius: "50%",
    background: "rgba(74,222,128,0.1)",
    border: "2px solid rgba(74,222,128,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: 28,
  },

  timer: { textAlign: "center", fontSize: 12, color: "#7a7a9a", marginTop: 12 },
  timerLink: { color: "#ff8c00", cursor: "pointer", fontWeight: 600, textDecoration: "none" },

  backLink: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 20, fontSize: 13, color: "#7a7a9a",
    textDecoration: "none", cursor: "pointer",
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

// ── Resend timer hook ──
import { useEffect, useRef } from "react";
function useResendTimer(initial = 60) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  const start = () => {
    setSeconds(initial);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      setSeconds((s) => { if (s <= 1) { clearInterval(ref.current); return 0; } return s - 1; });
    }, 1000);
  };
  useEffect(() => () => clearInterval(ref.current), []);
  return { seconds, start };
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpass, 4=success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const otpRefs = useRef([]);
  const { seconds, start: startTimer } = useResendTimer(60);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const getInputStyle = (name) => ({
    ...styles.input,
    borderColor: focusedField === name ? "#ff4d00" : "#2a2a3d",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(255,77,0,0.12)" : "none",
  });

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    if (!email) return showToast("Please enter your email", false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showToast("Invalid email address", false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.message || "Something went wrong", false);
      showToast("OTP sent to your email!");
      setStep(2);
      startTimer();
    } catch {
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handler ──
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
    if (e.key === "Enter" && otp.every((d) => d)) handleVerifyOtp();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return showToast("Enter all 6 digits", false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.message || "Invalid OTP", false);
      showToast("OTP verified!");
      setStep(3);
    } catch {
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (seconds > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  // ── Step 3: Reset Password ──
  const passHint = () => {
    if (!newPass) return { text: "At least 6 characters", style: styles.hint };
    if (newPass.length < 6) return { text: "⚠ Too short", style: styles.hintError };
    return { text: "✓ Looks good", style: styles.hintOk };
  };

  const confirmHint = () => {
    if (!confirmPass) return null;
    if (confirmPass !== newPass) return { text: "⚠ Passwords don't match", style: styles.hintError };
    return { text: "✓ Passwords match", style: styles.hintOk };
  };

  const handleResetPassword = async () => {
    if (!newPass || newPass.length < 6) return showToast("Password must be at least 6 characters", false);
    if (newPass !== confirmPass) return showToast("Passwords don't match", false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.message || "Something went wrong", false);
      setStep(4);
    } catch {
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  // ── Step labels ──
  const stepConfig = [
    { label: "Email" },
    { label: "OTP" },
    { label: "Reset" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-24px) scale(1.06)} }
        @keyframes bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input::placeholder { color: #3a3a55; }
      `}</style>

      <div style={styles.page}>
        <div style={styles.bgGrid} />
        <div style={styles.orb1} />
        <div style={styles.orb2} />

        <div style={{ ...styles.card, animation: "fadeIn 0.4s ease" }}>

          {/* Logo */}
          <div style={styles.logo}>
            <span style={{ fontSize: 24, display: "inline-block", animation: "bounce 1.8s ease-in-out infinite" }}>🔥</span>
            <span style={styles.logoText}>WingX</span>
            <span style={styles.logoBadge}>Food</span>
          </div>

          {/* Step indicator (only for steps 1-3) */}
          {step < 4 && (
            <div style={styles.stepRow}>
              {stepConfig.map((s, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      ...styles.stepDot,
                      background: isDone ? "rgba(74,222,128,0.15)" : isActive ? "rgba(255,77,0,0.2)" : "#1a1a27",
                      border: `2px solid ${isDone ? "#4ade80" : isActive ? "#ff4d00" : "#2a2a3d"}`,
                      color: isDone ? "#4ade80" : isActive ? "#ff8c00" : "#7a7a9a",
                    }}>
                      {isDone ? "✓" : stepNum}
                    </div>
                    {i < stepConfig.length - 1 && (
                      <div style={{ ...styles.stepLine, background: step > stepNum ? "#4ade80" : "#2a2a3d" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={styles.formTitle}>Forgot Password?</div>
              <div style={styles.formSub}>Enter your registered email — we'll send you a 6-digit OTP.</div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                style={{ ...styles.btnFire, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={handleSendOtp} disabled={loading}
              >
                {loading ? "Sending OTP…" : "Send OTP →"}
              </button>

              <Link to="/signin" style={styles.backLink}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Sign In
              </Link>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={styles.formTitle}>Enter OTP</div>
              <div style={styles.formSub}>
                6-digit code sent to{" "}
                <span style={styles.formSubHighlight}>{email}</span>
              </div>

              <div style={styles.otpRow} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    style={{
                      ...styles.otpBox,
                      borderColor: digit ? "#ff4d00" : focusedField === `otp${i}` ? "#ff4d00" : "#2a2a3d",
                      boxShadow: focusedField === `otp${i}` ? "0 0 0 3px rgba(255,77,0,0.12)" : digit ? "0 0 0 3px rgba(255,77,0,0.08)" : "none",
                      color: digit ? "#ff8c00" : "#f0ede8",
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={() => setFocusedField(`otp${i}`)}
                    onBlur={() => setFocusedField(null)}
                  />
                ))}
              </div>

              <div style={styles.timer}>
                {seconds > 0 ? (
                  <>Resend OTP in <span style={{ color: "#ff8c00", fontWeight: 600 }}>{seconds}s</span></>
                ) : (
                  <>Didn't receive it?{" "}
                    <span style={styles.timerLink} onClick={handleResend}>Resend OTP</span>
                  </>
                )}
              </div>

              <button
                style={{
                  ...styles.btnFire, marginTop: 20,
                  opacity: (loading || otp.some(d => !d)) ? 0.6 : 1,
                  cursor: (loading || otp.some(d => !d)) ? "not-allowed" : "pointer",
                }}
                onClick={handleVerifyOtp}
                disabled={loading || otp.some(d => !d)}
              >
                {loading ? "Verifying…" : "Verify OTP →"}
              </button>

              <button
                style={styles.btnOutline}
                onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff4d00"; e.currentTarget.style.color = "#ff8c00"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3d"; e.currentTarget.style.color = "#7a7a9a"; }}
              >
                ← Change Email
              </button>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={styles.formTitle}>New Password</div>
              <div style={styles.formSub}>Choose a strong password for your account.</div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrap}>
                  <span style={styles.iconWrap}>
                    <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    style={{ ...getInputStyle("newPass"), paddingRight: 42 }}
                    type={showNew ? "text" : "password"} placeholder="Min. 6 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    onFocus={() => setFocusedField("newPass")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button style={styles.eyeBtn} onClick={() => setShowNew(!showNew)}>
                    {showNew ? (
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrap}>
                  <span style={styles.iconWrap}>
                    <svg width="15" height="15" fill="none" stroke="#ff8c00" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </span>
                  <input
                    style={{ ...getInputStyle("confirmPass"), paddingRight: 42 }}
                    type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    onFocus={() => setFocusedField("confirmPass")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  />
                  <button style={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
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
                {confirmHint() && <div style={confirmHint().style}>{confirmHint().text}</div>}
              </div>

              <button
                style={{ ...styles.btnFire, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={handleResetPassword} disabled={loading}
              >
                {loading ? "Resetting…" : "Reset Password →"}
              </button>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <div style={{ animation: "fadeIn 0.4s ease", textAlign: "center" }}>
              <div style={styles.successIcon}>🎉</div>
              <div style={styles.formTitle}>Password Reset!</div>
              <div style={styles.formSub}>
                Your password has been successfully reset.<br />
                You can now sign in with your new password.
              </div>
              <button
                style={styles.btnFire}
                onClick={() => navigate("/signin")}
              >
                Go to Sign In →
              </button>
            </div>
          )}

        </div>

        {toast && (
          <div style={{ ...styles.toast, background: toast.ok ? "#22c55e" : "#ff3b5c" }}>{toast.msg}</div>
        )}
      </div>
    </>
  );
}