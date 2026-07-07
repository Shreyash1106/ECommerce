// src/api/websocket.js
// Simple WebSocket wrapper that connects to the backend notification endpoint
// and provides a subscribe/unsubscribe interface.

let socket = null;
const listeners = new Set();

export function connectWebSocket(token) {
  if (socket) return; // already connected
  const wsUrl = `${import.meta.env.VITE_WS_URL || "ws://localhost:8000"}/ws/notifications?token=${token}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    // WebSocket connected
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((cb) => cb(data));
    } catch (e) {
      console.error("Invalid WS message", e);
    }
  };

  socket.onclose = () => {
    // WebSocket closed
    socket = null;
    // optional reconnection logic could be added here
  };

  socket.onerror = (err) => {
    console.error("WebSocket error", err);
  };
}

export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
  listeners.clear();
}

export function subscribe(callback) {
  listeners.add(callback);
  // return unsubscribe function
  return () => listeners.delete(callback);
}
