import { Server } from "socket.io";

let io;
const userSocketMap = {}; // { userId: socketId }

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["https://social-ged2.onrender.com/" ],
      credentials: true,
    },
  });
//   "https://nexora-gfbk.vercel.app"

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];
export { io };