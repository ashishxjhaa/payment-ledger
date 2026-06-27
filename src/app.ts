import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes";
import accountRouter from "./routes/account.routes";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// All route define here, right?

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/accounts", accountRouter);

export default app;
