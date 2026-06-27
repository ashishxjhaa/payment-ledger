import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

type JwtPayload = {
  userId: string;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};
