import jwt, { JwtPayload, Secret }  from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express"
import ApiError from '../erros/ApiError';
import httpStatus from 'http-status';

const auth = (...roles: string[]) => {
    return async (req: Request & {user?: any}, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!")
            
            }

            const verifiedUser = jwt.verify(token, process.env.ACCESS_JWT_SECRET as Secret) as JwtPayload

            req.user = verifiedUser

            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!")
            }
            next()
        }
        catch (err) {
            next(err)
        }
    }
};

export default auth;