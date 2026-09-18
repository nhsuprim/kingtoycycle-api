import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import cookieParser from "cookie-parser";

import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandle";
import router from "./app/routes";
// import globalErrorHandler from "./app/middleware/globalErrorHandle";

const app: Application = express();
// app.use(cors());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);
app.use(cookieParser());
dotenv.config();

//parser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send({
        Message: "Welcome To King Toy Cycle Server..",
    });
});

app.use("/api/v1", router);

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
app.use(globalErrorHandler);

export default app;
