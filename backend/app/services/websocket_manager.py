import asyncio
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect

class WebSocketManager:
    """Manage active WebSocket connections per user.

    Connections are stored in a dict mapping ``user_id`` to a set of ``WebSocket`` objects.
    The manager provides helpers to connect, disconnect, send a personal
    message, and broadcast to all connections of a specific user.
    """
    def __init__(self) -> None:
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Lock to avoid race conditions when adding/removing connections
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: int) -> None:
        """Accept a new websocket connection and register it for the user."""
        await websocket.accept()
        async with self._lock:
            connections = self.active_connections.setdefault(user_id, set())
            connections.add(websocket)

    async def disconnect(self, websocket: WebSocket, user_id: int) -> None:
        """Remove a websocket from the user's active set.
        If the set becomes empty we delete the key to keep the dict tidy.
        """
        async with self._lock:
            connections = self.active_connections.get(user_id)
            if connections and websocket in connections:
                connections.remove(websocket)
                if not connections:
                    del self.active_connections[user_id]
        await websocket.close()

    async def send_personal_message(self, message: str, user_id: int) -> None:
        """Send ``message`` to all websockets associated with ``user_id``.
        If the user has no active connections the call is a no‑op.
        """
        async with self._lock:
            connections = self.active_connections.get(user_id, set()).copy()
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception:
                # If a connection fails we clean it up silently.
                await self.disconnect(connection, user_id)

    async def broadcast(self, message: str) -> None:
        """Send ``message`` to **all** connected clients.
        Useful for system‑wide announcements.
        """
        async with self._lock:
            all_connections = [ws for conns in self.active_connections.values() for ws in conns]
        for connection in all_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Find the user_id for this websocket to clean up.
                async with self._lock:
                    for uid, conns in list(self.active_connections.items()):
                        if connection in conns:
                            await self.disconnect(connection, uid)
                            break
