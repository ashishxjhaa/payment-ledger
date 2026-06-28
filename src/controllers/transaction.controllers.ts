import type { Request, Response } from "express";
import { prisma } from "../../db";
import { z } from "zod";

const transactionSchema = z.object({
  fromAccount: z.string().uuid("Invalid sender account ID"),
  toAccount: z.string("").uuid("Invalid receiver account ID"),
  amount: z
    .number("Amount is required")
    .positive("Amount must be greater than 0"),
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
});

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const parsedResult = transactionSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return res.status(400).json({
        error: parsedResult.error.flatten().fieldErrors,
      });
    }

    const { fromAccount, toAccount, amount, idempotencyKey } =
      parsedResult.data;
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create transaction",
    });
  }
};
