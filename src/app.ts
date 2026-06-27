import express from "express";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// All route define here, right?

app.use("/api/v1/auth", authRouter);

export default app;
