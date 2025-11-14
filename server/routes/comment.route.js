import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  addCommentToPost,
  getPostComments,
  updateComment,
  deleteComment,
  replyToComment,
  toggleComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

 
router.post("/comment/:postId", requireAuth, addCommentToPost);
 
router.get("/comment/:postId", getPostComments);

 
router.patch("/:commentId", requireAuth, updateComment);

 
router.delete("/:commentId", requireAuth, deleteComment);

 
router.post("/reply/:commentId", requireAuth, replyToComment);

 
router.patch("/like/:commentId", requireAuth, toggleComment);

export default router;