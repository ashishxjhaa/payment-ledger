import express from "express";
import authRouter from "./routes/auth.routes";

const app = express();

app.use(express.json({ limit: "16kb" }));

// All route define here, right?

app.use("/api/v1/auth", authRouter);

export default app;
