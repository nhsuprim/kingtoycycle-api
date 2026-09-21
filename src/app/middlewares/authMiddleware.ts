import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ApiError } from "../helpers/ApiError";

const auth = (...roles: string[]) => {
    return async (
        req: Request & { user?: any },
        res: Response,
        next: NextFunction,
    ) => {
        try {
            // 1. Cookie থেকে access token নাও
            let token = req.cookies?.accessToken;

            // 2. চাইলে Authorization header থেকেও support করবে
            // Format: Bearer <token>
            if (!token) {
                const authHeader = req.headers.authorization;

                if (authHeader?.startsWith("Bearer ")) {
                    token = authHeader.split(" ")[1];
                }
            }

            // 3. কোনো token না থাকলে unauthorized
            if (!token) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "You are not authorized!",
                );
            }

            // 4. JWT verify
            const verifiedUser = jwt.verify(
                token,
                process.env.ACCESS_JWT_SECRET as Secret,
            ) as JwtPayload;

            // 5. User request-এর সাথে attach
            req.user = verifiedUser;

            // 6. Role check
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

export default auth;
