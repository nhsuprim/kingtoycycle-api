import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../helpers/ApiResponse";
import { env } from "../../config/env";
import { authService } from "./auth.service";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: "strict" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 15 * 60 * 1000,
};

const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.requestLogin(email, password);

    return sendSuccess(res, 200, {
        message: result.message,
    });
});

const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const { accessToken, refreshToken, user } =
        await authService.verifyOtpAndLogin(email, otp);

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 200, {
        message: "Login successful",
        data: { user },
    });
});

const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await authService.resendOtp(email);

    return sendSuccess(res, 200, {
        message: result.message,
    });
});

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Refresh token missing",
        });
    }

    const { accessToken, refreshToken: newRefreshToken } =
        await authService.refreshTokens(token);

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 200, {
        message: "Token refreshed",
    });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.id) {
        await authService.logout(req.user.id);
    }

    res.clearCookie("accessToken", {
        path: "/",
    });

    res.clearCookie("refreshToken", {
        path: "/api/auth",
    });

    return sendSuccess(res, 200, {
        message: "Logged out successfully",
    });
});

const me = asyncHandler(async (req: Request, res: Response) => {
    return sendSuccess(res, 200, {
        data: {
            user: req.user,
        },
    });
});

export const authController = {
    login,
    verifyOtp,
    resendOtp,
    refreshToken,
    logout,
    me,
};
