import dotenv from "dotenv";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path'

 
import connectDB from "./config/mongoDB.js";
import { initSocket } from "./config/socket.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import searchRoutes from "./routes/search.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

 
connectDB();

 
const app = express();

 
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://social-ouxf.onrender.com",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);

 
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use("/api/auth", authRouter);

// User routes
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

 
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
 
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`WebSocket ready for real-time connections`);
});
