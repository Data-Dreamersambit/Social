import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const addCommentToPost = async (req, res) => {
  try {
    const { postId } = req.params; // 🧩 Post ID
    const { text } = req.body;
    const clerkId = req.auth.userId; // Clerk User ID

    // 🧠 1️⃣ Validate input
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    // 🧱 2️⃣ Find Post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 👤 3️⃣ Find user from your database using Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 💬 4️⃣ Create a new top-level comment
    const newComment = await Comment.create({
      text: text.trim(),
      user: user._id,
      post: post._id,
      parentComment: null, // Top-level comment
    });

    // 🧩 5️⃣ Add comment reference to the post
    post.comments.push(newComment._id);
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    // 🎨 6️⃣ Populate comment with user data before returning
    const populatedComment = await newComment.populate("user", "fullName  ");

    // 🚀 7️⃣ Respond with success
    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: populatedComment,
      
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment." });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // 🧩 1️⃣ Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 💬 2️⃣ Fetch all top-level comments for the post
    const comments = await Comment.find({
      post: postId,
      parentComment: null,
    })
      .populate("user", "fullName profileImage ")
      .sort({ createdAt: -1 }); // newest comments first

    // 🔁 3️⃣ For each top-level comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("user", "fullName profileImage")
          .sort({ createdAt: 1 }); // oldest reply first for natural flow

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    // 🚀 4️⃣ Send back response
    res.status(200).json({
      success: true,
      totalComments: commentsWithReplies.length,
      comments: commentsWithReplies,
    });
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
};

// ✅ Update comment (owner only)
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params; // comment ID
    const { text } = req.body;
    const clerkId = req.auth.userId;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    // 🧍‍♂️ Find user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 💬 Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // 🔒 Authorization check — only comment owner can update
    if (comment.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment." });
    }

    // ✏️ Update the comment text
    comment.text = text;
    const updatedComment = await comment.save();

    // 🧩 Populate user details before sending back
    const populatedComment = await updatedComment.populate(
      "user",
      "fullName profileImage "
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment." });
  }
};

// ✅ Delete comment (owner or admin)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const clerkId = req.auth.userId;

    // 🧍 Find the user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 💬 Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // 🔒 Authorization
    if (comment.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment." });
    }

    // 💬 If it’s a reply, decrement parent’s repliesCount
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    // 🧩 Update post’s comment count
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments?.filter(
        (cId) => cId.toString() !== commentId
      );
      post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1);
      await post.save();
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment." });
  }
};

// ✅ Reply to a comment
export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params; // 🧩 Parent comment ID
    const { text } = req.body;
    const clerkId = req.auth.userId;

    // 🧠 Validate text
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Reply text is required." });
    }

    // 💬 Find the parent comment
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found." });
    }

    // 🧾 Find the associated post
    const post = await Post.findById(parentComment.post);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 👤 Find the user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✍️ Create the reply
    const reply = await Comment.create({
      text: text.trim(),
      user: user._id,
      post: parentComment.post,
      parentComment: parentComment._id, // reference to parent comment
    });

    // 🔢 Update counts efficiently
    await Comment.findByIdAndUpdate(parentComment._id, {
      $inc: { repliesCount: 1 },
    });

    await Post.findByIdAndUpdate(post._id, {
      $inc: { commentsCount: 1 },
      $push: { comments: reply._id },
    });

    // 👥 Populate reply with user details
    const populatedReply = await reply.populate(
      "user",
      "fullName  profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Reply added successfully.",
      reply: populatedReply,
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Failed to add reply." });
  }
};

// ✅ Like or unlike a comment
export const toggleComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const clerkId = req.auth.userId;

    // 1️⃣ Find the user
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found." });

    // 2️⃣ Find the comment (select only what we need)
    const comment = await Comment.findById(commentId).select(
      "likes likesCount"
    );
    if (!comment)
      return res.status(404).json({ message: "Comment not found." });

    const userIdStr = user._id.toString();
    const hasLiked = comment.likes.some((id) => id.toString() === userIdStr);

    // 3️⃣ Atomic toggle
    const update = hasLiked
      ? { $pull: { likes: user._id }, $inc: { likesCount: -1 } }
      : { $addToSet: { likes: user._id }, $inc: { likesCount: 1 } };

    const updated = await Comment.findByIdAndUpdate(commentId, update, {
      new: true,
    }).select("likesCount");

    res.status(200).json({
      success: true,
      message: hasLiked ? "Comment unliked." : "Comment liked.",
      liked: !hasLiked,
      userId: user._id,
      likesCount: updated.likesCount,
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({ message: "Failed to toggle like." });
  }
};