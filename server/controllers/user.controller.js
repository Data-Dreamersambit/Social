 import User from "../models/user.model.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";
import Post from "../models/post.model.js";


export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch user with selected fields and populate only necessary info
    const user = await User.findById(userId)
      .select(
        "fullName profileImage email username followers following likedPosts savedPosts uploadedPosts"
      )
      .populate({
        path: "followers following",
        select: "fullName profileImage username",
      })
      .populate({
        path: "likedPosts savedPosts uploadedPosts",
        select: "caption media createdAt", // only relevant post info
      })
      .lean(); // returns plain JS object, not Mongoose document

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params; // person to follow/unfollow
    const currentUserId = req.userId; // logged-in user's ID

    // find logged-in user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // prevent following yourself
    if (currentUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser)
      return res.status(404).json({ message: "Target user not found" });

    let isFollowing;

    // check if already following
    if (currentUser.following.includes(userId)) {
      // 🔹 Unfollow logic
      await Promise.all([
        User.findByIdAndUpdate(currentUser._id, {
          $pull: { following: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { followers: currentUser._id },
        }),
      ]);

      isFollowing = false;
    } else {
      // 🔹 Follow logic
      await Promise.all([
        User.findByIdAndUpdate(currentUser._id, {
          $addToSet: { following: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $addToSet: { followers: currentUser._id },
        }),
      ]);

      isFollowing = true;
    }

    const updatedUser = await User.findById(userId)
      .select("fullName profileImage followers following")
      .populate("followers", "fullName profileImage")
      .populate("following", "fullName profileImage");

    return res.status(200).json({
      success: true,
      message: isFollowing
        ? "Followed successfully."
        : "Unfollowed successfully.",
      isFollowing,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle follow.",
    });
  }
};
