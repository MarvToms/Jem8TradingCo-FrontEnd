import api from "./axios";

const handle = (fn) => async (...args) => {
  try {
    const res = await fn(...args);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || "API error" };
  }
};

export const getCart = handle(() => api.get("/cart"));
export const addToCart = handle((payload) => api.post("/cart", payload));
export const updateCartItem = handle((id, payload) => api.put(`/cart/${id}`, payload));
export const removeCartItem = handle((id) => api.delete(`/cart/${id}`));
export const removeProductFromCart = handle((productId) => api.delete(`/cart/product/${productId}`));
export const clearCart = handle(() => api.post(`/cart/clear`));
export const checkout = handle((payload) => api.post(`/checkout`, payload));

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  removeProductFromCart,
  clearCart,
  checkout,
};
