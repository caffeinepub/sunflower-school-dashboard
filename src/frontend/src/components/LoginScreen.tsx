import {
  BuildingIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const PASSWORD_KEY = "sunflower_password";

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export default function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const hasPassword = !!localStorage.getItem(PASSWORD_KEY);
  const [mode, setMode] = useState<"login" | "set" | "reset-confirm">(
    hasPassword ? "login" : "set",
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  });

  const triggerShake = useCallback((msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleLogin = useCallback(() => {
    const stored = localStorage.getItem(PASSWORD_KEY);
    if (password === stored) {
      sessionStorage.setItem("sunflower_authed", "true");
      onAuthenticated();
    } else {
      triggerShake("Incorrect password. Please try again.");
      setPassword("");
    }
  }, [password, onAuthenticated, triggerShake]);

  const handleSetPassword = useCallback(() => {
    if (password.length < 4) {
      triggerShake("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      triggerShake("Passwords do not match.");
      return;
    }
    localStorage.setItem(PASSWORD_KEY, password);
    sessionStorage.setItem("sunflower_authed", "true");
    onAuthenticated();
  }, [password, confirmPassword, onAuthenticated, triggerShake]);

  const handleReset = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    setMode("set");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, []);

  const handleSubmit = useCallback(() => {
    if (mode === "login") handleLogin();
    else if (mode === "set") handleSetPassword();
  }, [mode, handleLogin, handleSetPassword]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden font-hud scanline">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,102,255,0.05) 0%, transparent 70%)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,245,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* School branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 mb-4 mx-auto"
            style={{ boxShadow: "0 0 24px rgba(0,245,255,0.15)" }}
          >
            <BuildingIcon className="w-8 h-8 text-[#00f5ff]" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.25em] text-white cyan-glow uppercase">
            Sunflower Public School
          </h1>
          <p className="text-xs text-[#a0a0a0] font-mono tracking-[0.2em] mt-1 uppercase">
            Management System
          </p>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {mode === "reset-confirm" ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
              style={{
                boxShadow:
                  "0 0 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldIcon className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold tracking-wider text-red-400 uppercase">
                  Reset Warning
                </h2>
              </div>
              <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
                This will permanently delete your{" "}
                <span className="text-white font-medium">
                  password and all dashboard data
                </span>{" "}
                (staff, students, fees, misc charges). This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="login.reset_button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 text-sm font-medium tracking-wider rounded-sm bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 uppercase"
                >
                  Reset Everything
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex-1 py-2.5 text-sm font-medium tracking-wider rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-all duration-200 uppercase"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={
                shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { opacity: 1, x: 0 }
              }
              exit={{ opacity: 0, x: -20 }}
              transition={shake ? { duration: 0.4 } : { duration: 0.2 }}
              className="rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
              style={{
                boxShadow:
                  "0 0 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {/* Lock icon + title */}
              <div className="flex items-center gap-2 mb-6">
                <LockIcon className="w-4 h-4 text-[#00f5ff]" />
                <h2 className="text-sm font-bold tracking-[0.2em] text-[#00f5ff] uppercase">
                  {mode === "login"
                    ? "Authentication Required"
                    : "Create Password"}
                </h2>
              </div>

              <div className="space-y-4">
                {/* Password field */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-mono tracking-widest text-[#a0a0a0] uppercase mb-2"
                  >
                    {mode === "set" ? "New Password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      ref={inputRef}
                      type={showPassword ? "text" : "password"}
                      data-ocid="login.password_input"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder={
                        mode === "set"
                          ? "Min. 4 characters"
                          : "Enter your password"
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2.5 pr-10 text-sm text-white placeholder:text-[#555] font-mono tracking-widest focus:outline-none focus:border-[#00f5ff]/50 focus:ring-1 focus:ring-[#00f5ff]/20 transition-all"
                    />
                    <button
                      type="button"
                      data-ocid="login.show_password_toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#a0a0a0] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password (set mode only) */}
                {mode === "set" && (
                  <div>
                    <label
                      htmlFor="login-confirm"
                      className="block text-xs font-mono tracking-widest text-[#a0a0a0] uppercase mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="login-confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="Re-enter password"
                        className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2.5 pr-10 text-sm text-white placeholder:text-[#555] font-mono tracking-widest focus:outline-none focus:border-[#00f5ff]/50 focus:ring-1 focus:ring-[#00f5ff]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#a0a0a0] transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOffIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-400 font-mono"
                    >
                      ⚠ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  type="button"
                  data-ocid="login.submit_button"
                  onClick={handleSubmit}
                  className="w-full py-2.5 text-sm font-bold tracking-[0.2em] rounded-sm uppercase transition-all duration-200"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,102,255,0.15))",
                    border: "1px solid rgba(0,245,255,0.4)",
                    color: "#00f5ff",
                    boxShadow: "0 0 16px rgba(0,245,255,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 24px rgba(0,245,255,0.25)";
                    e.currentTarget.style.borderColor = "rgba(0,245,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 16px rgba(0,245,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(0,245,255,0.4)";
                  }}
                >
                  {mode === "login"
                    ? "Unlock Dashboard"
                    : "Set Password & Enter"}
                </button>

                {/* Forgot password */}
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset-confirm")}
                    className="w-full text-xs text-[#555] hover:text-red-400 font-mono tracking-wider transition-colors text-center pt-1"
                  >
                    Forgot password? Reset all data →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-[#333] font-mono tracking-wider mt-6">
          PRIVATE ACCESS ONLY · SUNFLOWER SCHOOL
        </p>
      </motion.div>
    </div>
  );
}
