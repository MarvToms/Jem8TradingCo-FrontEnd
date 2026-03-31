// ─── PasswordSecurity.jsx ────────────────────────────────────────────────────
import { useState } from "react";

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

const LockHeaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export default function PasswordSecurity() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [current, setCurrent]         = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirm, setConfirm]         = useState("");

  const checks = {
    length:  newPass.length >= 8,
    number:  /\d/.test(newPass),
    upper:   /[A-Z]/.test(newPass),
    special: /[^A-Za-z0-9]/.test(newPass),
  };

  const inputClass = (focused) =>
    `w-full h-[46px] border border-gray-200 rounded-lg pl-4 pr-11 text-sm text-gray-800 bg-[#f0f7f2] outline-none transition-all duration-200 placeholder:text-gray-300 placeholder:italic focus:border-[#4d7b65] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,123,101,0.12)]`;

  const ruleClass = (pass) =>
    `inline-flex items-center gap-1.5 text-xs transition-colors duration-200 ${
      pass ? "text-[#4d7b65] [&_svg]:stroke-[#4d7b65]" : "text-gray-400 [&_svg]:stroke-gray-300"
    }`;

  return (
    <div className="p-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <span className="w-2 h-2 rounded-full bg-[#4d7b65] inline-block" />
        <span>Password &amp; Security &nbsp;·&nbsp; Manage your password and account security settings</span>
      </div>

      {/* Card */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">

        {/* Card Header */}
        <div className="flex items-center gap-4 py-5 border-b border-gray-100 px-7">
          <div className="w-11 h-11 rounded-xl bg-[#f0f7f2] flex items-center justify-center text-[#4d7b65] flex-shrink-0">
            <LockHeaderIcon />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-gray-900">Change Password</div>
            <div className="text-[13px] text-gray-400 mt-0.5">Use a strong password you don't use elsewhere</div>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col px-7 py-7 gap-7">

          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-800">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={inputClass()}
                placeholder="Enter your current password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 flex items-center p-0 hover:text-[#4d7b65] transition-colors"
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-800">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className={inputClass()}
                placeholder="Enter a new password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 flex items-center p-0 hover:text-[#4d7b65] transition-colors"
              >
                <EyeIcon open={showNew} />
              </button>
            </div>

            {/* Password rules */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-1.5 mt-1">
              {[
                { key: "length",  label: "At least 8 characters"  },
                { key: "number",  label: "One number"              },
                { key: "upper",   label: "One uppercase letter"    },
                { key: "special", label: "One special character"   },
              ].map(({ key, label }) => (
                <div key={key} className={ruleClass(checks[key])}>
                  <CheckIcon />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-800">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className={inputClass()}
                placeholder="Re-enter your new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 flex items-center p-0 hover:text-[#4d7b65] transition-colors"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirm && newPass && confirm !== newPass && (
              <span className="text-xs text-red-500">Passwords do not match</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 border-t border-gray-100 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={() => { setCurrent(""); setNewPass(""); setConfirm(""); }}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-semibold cursor-pointer hover:bg-gray-50 transition-colors md:w-auto w-full"
            >
              <RefreshIcon /> Reset
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-[#2e6b45] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#245537] transition-colors shadow-sm md:w-auto w-full"
            >
              <CheckIcon /> Update Password
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}