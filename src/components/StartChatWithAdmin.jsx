import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function StartChatWithAdmin({
  initialMessage = 'Hello admin',
  onStarted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatroomId, setChatroomId] = useState(null);
  const echoRef = useRef(null);

  const extractChatroomId = (resData) => {
    // Try a few common shapes the backend might return
    return (
      resData?.chatroom_id ||
      resData?.message?.chatroom_id ||
      resData?.data?.chatroom_id ||
      resData?.chatroom?.id ||
      resData?.id ||
      null
    );
  };

  const loadHistory = async (id) => {
    try {
      const r = await api.get('/chat/messages', { params: { chatroom_id: id } });
      // backend may return array directly or wrapped in data
      const list = r.data?.data || r.data || [];
      setMessages(Array.isArray(list) ? list : []);
      return list;
    } catch (err) {
      setError('Failed to load messages');
      return [];
    }
  };

  const subscribe = (id) => {
    if (!window.Echo) return;
    try {
      echoRef.current = window.Echo.private('chat.' + id).listen('NewMessage', (e) => {
        const payload = e?.message || e;
        setMessages((prev) => [...prev, payload]);
      });
    } catch (err) {
      // subscription may fail silently
      console.warn('Echo subscription failed', err);
    }
  };

  const unsubscribe = () => {
    try {
      if (echoRef.current && echoRef.current.unsubscribe) {
        echoRef.current.unsubscribe();
      }
      // also try to leave channel if Echo is available
      if (window.Echo && chatroomId) {
        window.Echo.leave('chat.' + chatroomId);
      }
    } catch (err) {
      // ignore
    }
    echoRef.current = null;
  };

  useEffect(() => {
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/chat/messages', { messages: initialMessage });
      const resData = res.data || {};
      const id = extractChatroomId(resData);
      if (!id) {
        setError('No chatroom_id returned from server');
        setLoading(false);
        return;
      }
      setChatroomId(id);
      const history = await loadHistory(id);
      subscribe(id);
      if (onStarted) onStarted({ chatroomId: id, messages: history });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        window.location.href = '/login';
        return;
      }
      if (status === 422) {
        const validation = err.response?.data || {};
        setError(validation.message || 'Validation error');
      } else {
        setError('Failed to start chat');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={startChat} disabled={loading}>
        {loading ? 'Starting chat…' : 'Contact Admin / Start Chat'}
      </button>
      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>
          {error} <button onClick={startChat}>Retry</button>
        </div>
      )}

      {chatroomId && (
        <div style={{ marginTop: 12 }}>
          <div><strong>Chatroom:</strong> Admin (ID: 1)</div>
          <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #eee', padding: 8, marginTop: 8 }}>
            {messages.length === 0 && <div>No messages</div>}
            {messages.map((m, i) => (
              <div key={i} style={{ padding: 6, borderBottom: '1px solid #f4f4f4' }}>
                <div style={{ fontSize: 12, color: '#555' }}>{m.sender_name || m.sender || m.user?.name || ''}</div>
                <div>{m.messages || m.message || m.text || JSON.stringify(m)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
