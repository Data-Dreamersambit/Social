import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";

// 🧠 Get all users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filteredUsers = await User.find({
      _id: { $ne: user._id },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 💬 Get all messages between logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: userToChatId } = req.params; // User ID from URL

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userToChat = await User.findById(userToChatId);
    if (!userToChat)
      return res.status(404).json({ message: "Receiver not found" });

    const messages = await Message.find({
      $or: [
        { senderId: user._id, receiverId: userToChat._id },
        { senderId: userToChat._id, receiverId: user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🚀 Send a message
export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params; // receiver's User ID

    const { text } = req.body;

    const senderId = req.userId;

    const sender = await User.findById(senderId);

    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload media if any
    const mediaUploads = [];
    if (req.files?.images) {
      for (const img of req.files.images) {
        const result = await uploadToCloudinary(img.path, {
          folder: "messages/images",
          resource_type: "image",
        });
        mediaUploads.push({ url: result.secure_url, type: "image" });
      }
    }
    if (req.files?.videos) {
      for (const vid of req.files.videos) {
        const result = await uploadToCloudinary(vid.path, {
          folder: "messages/videos",
          resource_type: "video",
        });
        mediaUploads.push({ url: result.secure_url, type: "video" });
      }
    }

    const newMessage = await Message.create({
      senderId: sender._id,
      receiverId: receiver._id,
      text,
      media: mediaUploads,
    });

    // Real-time delivery 🚀
    const receiverSocketId = getReceiverSocketId(receiver._id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};