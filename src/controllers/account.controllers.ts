import type { Request, Response } from "express";
import { prisma } from "../../db";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const account = await prisma.account.create({
      data: {
        userId,
      },
    });

    res.status(201).json({
      account,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create account",
    });
  }
};
