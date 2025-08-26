
# Socket.IO and WebSockets - Revision Notes

## 1. Introduction
- **WebSocket**: A communication protocol that provides full-duplex (two-way) communication between client and server over a single TCP connection.
- **Socket.IO**: A JavaScript library built on top of WebSockets (but not limited to them). It provides additional features like:
  - Automatic reconnection
  - Event-based communication
  - Fallback to other protocols if WebSocket is not supported

---

## 2. WebSocket Basics
- **Protocol**: `ws://` or `wss://` (secure)
- **Lifecycle**:
  1. Client sends WebSocket handshake request.
  2. Server upgrades HTTP connection to WebSocket.
  3. Messages can be exchanged in both directions.
- **API** (Browser Example):
  ```javascript
  const socket = new WebSocket("ws://localhost:8080");

  socket.onopen = () => {
      console.log("Connected to server");
      socket.send("Hello Server!");
  };

  socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
  };

  socket.onclose = () => {
      console.log("Disconnected");
  };
  ```

---

## 3. Socket.IO Basics
- Built on WebSockets but can fall back to **long polling** if needed.
- Provides **event-based communication** instead of raw message strings.

### Installation
```bash
npm install socket.io
npm install socket.io-client
```

### Server (Node.js)
```javascript
const { Server } = require("socket.io");
const io = new Server(3000);

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("message", (msg) => {
        console.log("Message:", msg);
        socket.emit("reply", "Message received!");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
```

### Client (Browser)
```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("message", "Hello Server!");
  });

  socket.on("reply", (data) => {
      console.log("Server replied:", data);
  });
</script>
```

---

## 4. Key Differences (WebSocket vs Socket.IO)
| Feature              | WebSocket                     | Socket.IO                     |
|----------------------|-------------------------------|--------------------------------|
| Protocol             | WebSocket protocol (RFC 6455) | Custom protocol over WebSocket/HTTP |
| Transport fallback   | No                            | Yes (long-polling, etc.)       |
| Event-based model    | No (just messages)            | Yes                           |
| Auto reconnection    | No                            | Yes                           |
| Acknowledgements     | No                            | Yes                           |

---

## 5. Use Cases
- **WebSockets**: Real-time apps where overhead must be minimal (e.g., games, trading apps).
- **Socket.IO**: Chat apps, collaborative tools, dashboards where reliability, fallbacks, and events are important.

---

## 6. Summary
- Use **WebSocket** when you only need lightweight, raw, real-time communication.
- Use **Socket.IO** when you need robustness, events, reconnection, and fallback mechanisms.
