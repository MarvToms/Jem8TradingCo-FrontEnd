import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function PasswordReset() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail]                   = useState("");
  const [token, setToken]                   = useState("");
  const [password, setPassword]             = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setToken(params.get("token") || "");
    setEmail(params.get("email") || "");
  }, [location.search]);

  const handleReset = async () => {
    if (!password || !passwordConfirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirm,
      });
      toast.success(response.message || "Password reset successful ✅");
      navigate("/login");
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f2f2f2]">
      <div className="w-[400px] bg-[#eaeaea] px-9 py-10 rounded-[35px] border-2 border-black">

        <a href="/login" className="text-[13px] no-underline text-black inline-block mb-4 hover:opacity-70 transition-opacity">
          ← Back to Login
        </a>

        <h2 className="mb-6 text-xl font-bold">Reset Password</h2>

        <p className="text-[13px] text-[#555] mb-5 leading-[1.4]">
          Enter your new password below to reset your account password.
        </p>

        {/* New Password */}
        <div className="mb-[18px]">
          <label className="block text-[13px] mb-1.5">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-[11px] rounded-lg border border-[#ccc] outline-none text-sm focus:border-black transition-colors"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-[18px]">
          <label className="block text-[13px] mb-1.5">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-3 py-[11px] rounded-lg border border-[#ccc] outline-none text-sm focus:border-black transition-colors"
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 mb-4 font-bold text-white transition-opacity bg-black border-none rounded-lg cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}