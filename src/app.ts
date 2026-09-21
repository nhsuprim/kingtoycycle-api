import express, { Application, NextFunction, Request, Response } from "express";

import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";

import globalErrorHandler from "./app/middlewares/globalErrorHandle";
import router from "./app/routes";

dotenv.config();

const app: Application = express();

// ===============================
// Parsers
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===============================
// CORS
// ===============================

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);

// ===============================
// Health Check
// ===============================

app.get("/", (req: Request, res: Response) => {
    res.send({
        Message: "Welcome To King Toy Cycle Server..",
    });
});

// ===============================
// API Routes
// ===============================

app.use("/api/v1", router);

// ===============================
// Not Found
// ===============================

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});

// ===============================
// Global Error Handler
// ===============================

app.use(globalErrorHandler);

export default app;
