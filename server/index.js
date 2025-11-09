import dotenv from "dotenv";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path'

// 🧩 Local imports
import connectDB from "./config/mongoDB.js";
import { initSocket } from "./config/socket.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import searchRoutes from "./routes/search.route.js";
import messageRoutes from "./routes/message.route.js";
import { verifyClerkWebhook } from "./middleware/verifyClerkWebhook.js";
import { handleClerkWebhook } from "./controllers/user.controller.js";

dotenv.config();

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize Express app
const app = express();

// ✅ CORS setup
app.use(
  cors({
    origin: "https://social-ged2.onrender.com/",
    credentials: true,
  })
);

// ⚠️ Clerk Webhook route — must be declared before express.json()
app.post(
  "/api/webhook/clerk",
  express.raw({ type: "application/json" }),
  verifyClerkWebhook,
  handleClerkWebhook
);

// ✅ Parse JSON and cookies (after webhook)
app.use(express.json());
app.use(cookieParser());

// ✅ API routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/search", searchRoutes);
app.use("/api/messages", messageRoutes);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/client/dist")));

app.get(/.*/, (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});


// ✅ Create and run HTTP server
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
 
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`WebSocket ready for real-time connections`);
});
