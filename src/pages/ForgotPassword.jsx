import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordDesign() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      toast.success("Check your email for the reset code");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !password || !passwordConfirm) { toast.error("Please fill in all fields"); return; }
    if (password !== passwordConfirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await api.post("/reset-password", {
        email, code, password, password_confirmation: passwordConfirm,
      });
      toast.success("Password reset successful ✅");
      setStep(1);
      setEmail(""); setCode(""); setPassword(""); setPasswordConfirm("");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputIconCls =
    "w-full pl-[36px] pr-[12px] py-[10px] bg-[#f8fafb] border-[1.5px] border-[#e2e8f0] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none transition-all duration-200 placeholder:text-[#94a3b8] focus:border-[#4d7b65] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,123,101,0.12)]";
  const labelCls = "text-[12.5px] font-semibold text-[#374151]";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-[16px]"
      style={{
        paddingTop: "calc(var(--header-h, 0px) + 32px)",
        paddingBottom: "48px",
        background: "linear-gradient(135deg, #f9fdf9 0%, #fff 50%, #edf4f0 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute pointer-events-none" style={{ top: "-160px", right: "-160px", width: "520px", height: "520px", background: "radial-gradient(circle, rgba(77,123,101,0.10) 0%, transparent 70%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-120px", left: "-120px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(77,123,101,0.07) 0%, transparent 70%)" }} />

      {/* Card */}
      <div
        className="relative z-[1] w-full bg-white rounded-[20px] border border-[#e2e8f0] shadow-[0_16px_48px_rgba(0,0,0,0.09)] overflow-hidden"
        style={{ maxWidth: "420px" }}
      >
        {/* Header block */}
        <div className="flex flex-col items-center pt-[32px] pb-[20px] px-[32px] border-b border-[#f1f5f9]">
          {/* Icon */}
          <div className="w-[56px] h-[56px] rounded-full bg-[#edf4f0] border-2 border-[#b8d9c8] flex items-center justify-center text-[26px] mb-[12px]">
            {step === 1 ? "🔑" : "🔒"}
          </div>
          <h1
            className="text-[20px] font-bold text-[#1e293b] mb-[3px] text-center"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p className="text-[13px] text-[#64748b] text-center">
            {step === 1
              ? "Enter your email to receive a 6-digit reset code."
              : "Enter the code you received and set your new password."}
          </p>
        </div>

        {/* Form block */}
        <div className="px-[32px] pt-[22px] pb-[0]">
          <div className="flex flex-col gap-[13px]">

            {/* ── STEP 1 — Email ── */}
            {step === 1 && (
              <div className="flex flex-col gap-[5px]">
                <label className={labelCls}>Email address</label>
                <div className="relative">
                  <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] pointer-events-none">✉️</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    className={inputIconCls}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2 — Code + Passwords ── */}
            {step === 2 && (
              <>
                {/* Reset Code */}
                <div className="flex flex-col gap-[5px]">
                  <label className={labelCls}>Reset Code</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] pointer-events-none">🔑</span>
                    <input
                      type="text"
                      placeholder="6-digit code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={`${inputIconCls} tracking-[6px] font-bold text-center`}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-[5px]">
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] pointer-events-none">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputIconCls} pr-[40px]`}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-[11px] top-1/2 -translate-y-1/2 cursor-pointer text-[15px] select-none text-[#94a3b8] hover:text-[#4d7b65] transition-colors duration-150"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-[5px]">
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] pointer-events-none">🔒</span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className={`${inputIconCls} pr-[40px]`}
                    />
                    <span
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-[11px] top-1/2 -translate-y-1/2 cursor-pointer text-[15px] select-none text-[#94a3b8] hover:text-[#4d7b65] transition-colors duration-150"
                    >
                      {showConfirm ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              onClick={step === 1 ? handleSendCode : handleResetPassword}
              disabled={loading}
              className="w-full py-[11px] bg-[#4d7b65] text-white rounded-[9px] font-bold text-[14px] border-none shadow-[0_4px_14px_rgba(77,123,101,0.35)] transition-all duration-200 hover:bg-[#3a5e4e] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(77,123,101,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-[8px]">
                  <svg className="animate-spin w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {step === 1 ? "Sending..." : "Resetting..."}
                </span>
              ) : (
                step === 1 ? "Send Reset Code" : "Reset Password"
              )}
            </button>

          </div>
        </div>

        {/* Bottom links */}
        <div className="px-[32px] pt-[16px] pb-[22px]">
          {step === 2 && (
            <p className="text-center text-[12.5px] text-[#64748b] mb-[10px]">
              Didn't receive a code?{" "}
              <span
                onClick={() => { setStep(1); setCode(""); setPassword(""); setPasswordConfirm(""); }}
                className="font-bold text-[#4d7b65] cursor-pointer hover:text-[#3a5e4e] hover:underline transition-colors duration-150"
              >
                Resend
              </span>
            </p>
          )}
          <p className="text-center text-[12.5px] text-[#64748b]">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="font-bold text-[#4d7b65] cursor-pointer hover:text-[#3a5e4e] hover:underline transition-colors duration-150"
            >
              Back to Login
            </span>
          </p>
        </div>

        {/* Brand footer */}
        <div className="px-[32px] py-[12px] bg-[#f8fafb] border-t border-[#e2e8f0] text-center">
          <p className="text-[11px] text-[#94a3b8]">
            © 2024{" "}
            <span className="font-semibold text-[#4d7b65]">JEM 8 Circle Trading Co.</span>
            {" "}· All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}