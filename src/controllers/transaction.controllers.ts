import type { Request, Response } from "express";
import { prisma } from "../../db";
import { z } from "zod";

const transactionSchema = z.object({
  fromAccount: z.string().uuid("Invalid sender account ID"),
  toAccount: z.string().uuid("Invalid receiver account ID"),
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

    const userId = req.userId;

    const senderAccount = await prisma.account.findFirst({
      where: {
        id: fromAccount,
        userId,
      },
    });
    if (!senderAccount) {
      return res.status(403).json({
        error: "You do not have access to this account",
      });
    }

    const receiverAccount = await prisma.account.findUnique({
      where: { id: toAccount },
    });
    if (!receiverAccount) {
      return res.status(404).json({
        error: "Receiver account not found",
      });
    }

    const existing = await prisma.transaction.findUnique({
      where: {
        idempotencyKey,
      },
    });
    if (existing) {
      if (existing.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: existing,
        });
      }

      if (existing.status === "PENDING") {
        return res.status(200).json({
          message: "Transaction is still processing",
        });
      }

      if (existing.status === "FAILED") {
        return res.status(500).json({
          message: "Transaction processing failed, please retry",
        });
      }

      if (existing.status === "REVERSED") {
        return res.status(500).json({
          message: "Transaction was reversed, please retry",
        });
      }
    }

    if (senderAccount.id === receiverAccount.id) {
      return res.status(400).json({
        error: "Sender and receiver accounts cannot be the same",
      });
    }

    if (senderAccount.status !== "ACTIVE") {
      return res.status(400).json({
        error: "Sender account is not active",
      });
    }

    if (receiverAccount.status !== "ACTIVE") {
      return res.status(400).json({
        error: "Receiver account is not active",
      });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: {
          id: senderAccount.id,
        },
        data: {
          balance: { decrement: amount },
        },
      });

      await tx.account.update({
        where: {
          id: receiverAccount.id,
        },
        data: {
          balance: { increment: amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: senderAccount.id,
          toAccountId: receiverAccount.id,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      });

      await tx.ledger.create({
        data: {
          accountId: senderAccount.id,
          transactionId: transaction.id,
          amount,
          type: "DEBIT",
        },
      });

      await tx.ledger.create({
        data: {
          accountId: receiverAccount.id,
          transactionId: transaction.id,
          amount,
          type: "CREDIT",
        },
      });

      await tx.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      return transaction;
    });

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create transaction",
    });
  }
};
