import api from "./axios";
import { toast } from "react-toastify";
// ==============================
// GET USER ADDRESSES
// ==============================
export const getUserAddresses = async () => {
  try {
    const { data } = await api.get("/addresses");
    return data; // { status, data: [ ...addresses ] }
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch addresses ❌";
    toast.error(message);
    throw error.response?.data || { message };
  }
};

// ==============================
// ADD NEW ADDRESS
// ==============================
export const addAddress = async (address) => {
  try {
    const { data } = await api.post("/addresses", address);
    toast.success("Address added ✅");
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to add address ❌";
    toast.error(message);
    throw error.response?.data || { message };
  }
};

// ==============================
// UPDATE ADDRESS
// ==============================
export const updateAddress = async (id, address) => {
  try {
    const { data } = await api.put(`/addresses/${id}`, address);
    toast.success("Address updated ✅");
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update address ❌";
    toast.error(message);
    throw error.response?.data || { message };
  }
};

// ==============================
// DELETE ADDRESS
// ==============================
export const deleteAddress = async (id) => {
  try {
    const { data } = await api.delete(`/addresses/${id}`);
    toast.success("Address deleted ✅");
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete address ❌";
    toast.error(message);
    throw error.response?.data || { message };
  }
};