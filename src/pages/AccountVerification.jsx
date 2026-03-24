import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyAccount } from "../api/auth";

export default function AccountVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await verifyAccount({ email, code });
      console.log("Verification success:", response);
      navigate("/login");
    } catch (err) {
      console.log(err);
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
          <div className="w-[56px] h-[56px] rounded-full bg-[#edf4f0] border-2 border-[#b8d9c8] flex items-center justify-center text-[26px] mb-[12px]">
            ✅
          </div>
          <h1
            className="text-[20px] font-bold text-[#1e293b] mb-[3px] text-center"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Account Verification
          </h1>
          <p className="text-[13px] text-[#64748b] text-center">
            Enter the 6-digit code sent to{" "}
            {email && (
              <span className="font-semibold text-[#4d7b65]">{email}</span>
            )}
            {!email && "your email address"}.
          </p>
        </div>

        {/* Form block */}
        <div className="px-[32px] pt-[22px] pb-[0]">
          <div className="flex flex-col gap-[13px]">

            {/* Code input */}
            <div className="flex flex-col gap-[5px]">
              <label className={labelCls}>Verification Code</label>
              <div className="relative">
                <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] pointer-events-none">
                  🔑
                </span>
                <input
                  type="text"
                  placeholder="Enter the 6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className={`${inputIconCls} tracking-[6px] font-bold text-center`}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-[11px] bg-[#4d7b65] text-white rounded-[9px] font-bold text-[14px] border-none shadow-[0_4px_14px_rgba(77,123,101,0.35)] transition-all duration-200 hover:bg-[#3a5e4e] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(77,123,101,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-[8px]">
                  <svg className="animate-spin w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Account"
              )}
            </button>

          </div>
        </div>

        {/* Bottom links */}
        <div className="px-[32px] pt-[16px] pb-[22px]">
          <p className="text-center text-[12.5px] text-[#64748b]">
            Didn't receive a code?{" "}
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