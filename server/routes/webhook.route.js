import express from "express";
import { handleClerkWebhook } from "../controllers/user.controller.js";
import { verifyClerkWebhook } from "../middleware/verifyClerkWebhook.js";

const router = express.Router();

// Clerk Webhook (raw body required for signature verification)
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  verifyClerkWebhook,
  handleClerkWebhook
);

export default router;
