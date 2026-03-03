import api from "./axios";

const handle = (fn) => async (...args) => {
  try {
    const res = await fn(...args);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || "API error" };
  }
};

export const getProductReviews = handle((productId) => api.get(`/products/${productId}/reviews`));
export const getReview = handle((id) => api.get(`/reviews/${id}`));
export const createReview = handle((productId, payload) => api.post(`/products/${productId}/reviews`, payload));
export const updateReview = handle((id, payload) => api.put(`/reviews/${id}`, payload));
export const deleteReview = handle((id) => api.delete(`/reviews/${id}`));

export default {
  getProductReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
