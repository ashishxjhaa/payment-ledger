import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createAccount } from "../controllers/account.controllers";

const router = Router();

router.route("/").post(authMiddleware, createAccount);

export default router;
