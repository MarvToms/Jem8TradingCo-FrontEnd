import api from "./axios";
import axios from "axios";
import { toast } from "react-toastify";

// Ensure CSRF cookie is present for Sanctum (calls host root `/sanctum/csrf-cookie`).
const ensureCsrf = async () => {
  try {
    const base = api.defaults?.baseURL
      ? api.defaults.baseURL.replace(/\/api\/?$/, "")
      : "";
    await axios.get(`${base}/sanctum/csrf-cookie`, { withCredentials: true });
  } catch (e) {
    // ignore - backend might not need CSRF (token flows)
  }
};

export const loginUser = async (data) => {
  try {
    await ensureCsrf();
    const response = await api.post("/login", data);
    toast.success("Login successful ✅");

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed ❌";
    toast.error(message);
    throw error.response?.data || { message };
  }
};

export const registerUser = async (data) => {
  try {
    await ensureCsrf();
    const response = await api.post("/register", data);
    toast.success("Registration successful 🎉");

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Registration failed ❌";
    toast.error(message);
    throw error.response?.data || { message };
  }
};

export const verifyAccount = async (data) => {
  try {
    const response = await api.post("/verify", data); // ← match Laravel
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Network error. Please try again." };
  }
};

export const sendResetLink = async (data) => {
  try {
    const response = await api.post("/forgot-password", data); // ← match Laravel
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Network error. Please try again." };
  }
};