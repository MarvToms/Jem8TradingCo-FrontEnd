import api from "./axios";

export async function postChatMessage(payload) {
  try {
    const response = await api.post("/chat/messages", payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
}

export default { postChatMessage };
