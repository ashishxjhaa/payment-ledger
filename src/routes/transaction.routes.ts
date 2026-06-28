import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTransaction,
  getAccountBalance,
} from "../controllers/transaction.controllers";

const router = Router();

router.route("/").post(authMiddleware, createTransaction);

router.route("/balance/:accountId").get(authMiddleware, getAccountBalance);

export default router;
