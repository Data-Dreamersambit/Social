// socket.js
import { io } from "socket.io-client";
import { API_BASE_URL } from "./apiUrl";
import { useSelector } from "react-redux";

export const useSocket = () => {
  const { currentAuthUser } = useSelector((state) => state.user);
  const userId = currentAuthUser?._id;

  const socket = io(API_BASE_URL.replace("/api", ""), {
    withCredentials: true,
    transports: ["websocket"],
    query: { userId: userId?.toString() }, // 👈 Pass User ID to backend
  });

  return socket;
};