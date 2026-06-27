import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendRegistrationEmail from "../services/email.service";

const registerSchema = z.object({
  name: z.string("Name is required"),
  email: z.email("Email is required").trim().toLowerCase(),
  password: z.string().min(6, "Password must be 6 characters long"),
});

const loginSchema = z.object({
  email: z.email("Email is required").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsedResult = registerSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return res.status(400).json({
        error: parsedResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = parsedResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token);

    res.status(201).json({
      message: "User created successfully",
      user: { name: user.name, email: user.email },
      token,
    });

    await sendRegistrationEmail(user.email, user.name);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to register",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const parsedResult = loginSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return res.status(400).json({
        error: parsedResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsedResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credential",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token);

    res.status(200).json({
      message: "Login successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Login failed",
    });
  }
};
