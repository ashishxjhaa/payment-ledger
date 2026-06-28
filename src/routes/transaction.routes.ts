import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createTransaction } from "../controllers/transaction.controllers";

const router = Router();

router.route("/").post(authMiddleware, createTransaction);

export default router;
