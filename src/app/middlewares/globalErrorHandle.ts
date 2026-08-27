import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ApiError } from "../helpers/ApiError";
// Import your custom ApiError

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Declare statusCode as 'number' to allow other status codes like 400, 404, etc.
    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    // Handle Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        message = "Validation Error";
        error = err.message;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            // Handle unique constraint violation (e.g., duplicate email)
            message =
                "Duplicate field error. The provided value for a unique field already exists.";
            error = err.meta?.target; // Specify which field caused the conflict
            statusCode = httpStatus.BAD_REQUEST; // Return a 400 (Bad Request)
        }
    }

    // Handle custom ApiError
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        error = err.stack;
    }

    res.status(statusCode).json({
        success,
        message,
        error,
    });
};

export default globalErrorHandler;
