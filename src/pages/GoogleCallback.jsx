import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { googleCallback } from "../api/auth";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const called = useRef(false); // ← prevent double call

  useEffect(() => {
    if (called.current) return; // ← kung na-call na, stop
    called.current = true;

    const code = searchParams.get("code");
    console.log("=== GOOGLE CALLBACK ===");
    console.log("Code:", code);

    if (!code) {
      console.log("No code found!");
      navigate("/login");
      return;
    }

    const handleCallback = async () => {
  try {
    const data = await googleCallback(code);
    console.log("Success:", data);
    if (data.token) {
  window.location.href = "/"; 
}
  } catch (error) {
    console.log("ERROR:", error);
    navigate("/login");
  }
};

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-[16px]">
        <svg
          className="animate-spin w-[40px] h-[40px] text-[#4d7b65]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <p className="text-[14px] text-[#64748b] font-medium">
          Signing you in with Google...
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;