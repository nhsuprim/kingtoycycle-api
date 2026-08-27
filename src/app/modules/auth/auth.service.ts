import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { ApiError } from "../../helpers/ApiError";
import { env } from "../../config/env";
import { generateOtp, sendOtpEmail } from "../../utils/otp";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../utils/jwt";

/**
 * Step 1 — verify email/password, generate + email an OTP.
 * Does NOT issue tokens yet (Section 17: Email+Password -> OTP -> Login).
 */
const requestLogin = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.status !== "ACTIVE") {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 8);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: otpHash,
            otpExpiresAt: new Date(
                Date.now() + env.otp.expiresInMinutes * 60 * 1000,
            ),
            otpAttemptCount: 0,
            otpLastSentAt: new Date(),
        },
    });

    await sendOtpEmail(user.email, otp);

    return { message: "OTP sent to your email" };
};

const verifyOtpAndLogin = async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
        throw ApiError.badRequest(
            "No pending OTP for this account. Please login again.",
        );
    }

    if (user.otpAttemptCount >= env.otp.maxAttempts) {
        throw ApiError.forbidden(
            "Maximum OTP attempts exceeded. Please request a new code.",
        );
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
        throw ApiError.badRequest(
            "OTP has expired. Please request a new code.",
        );
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpCode);

    if (!isOtpValid) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpAttemptCount: {
                    increment: 1,
                },
            },
        });

        throw ApiError.badRequest("Invalid OTP");
    }

    const accessToken = signAccessToken({
        userId: user.id,
        roleId: user.roleId,
    });

    const refreshToken = signRefreshToken({
        userId: user.id,
        roleId: user.roleId,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 8);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: null,
            otpExpiresAt: null,
            otpAttemptCount: 0,
            refreshTokenHash,
        },
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
        },
    };
};

const resendOtp = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otpLastSentAt) {
        throw ApiError.badRequest("No pending login to resend OTP for.");
    }

    const secondsSinceLastSend =
        (Date.now() - user.otpLastSentAt.getTime()) / 1000;

    if (secondsSinceLastSend < env.otp.resendCooldownSeconds) {
        const wait = Math.ceil(
            env.otp.resendCooldownSeconds - secondsSinceLastSend,
        );

        throw ApiError.badRequest(
            `Please wait ${wait}s before requesting another OTP.`,
        );
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 8);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: otpHash,
            otpExpiresAt: new Date(
                Date.now() + env.otp.expiresInMinutes * 60 * 1000,
            ),
            otpAttemptCount: 0,
            otpLastSentAt: new Date(),
        },
    });

    await sendOtpEmail(user.email, otp);

    return {
        message: "A new OTP has been sent to your email",
    };
};

const refreshTokens = async (refreshToken: string) => {
    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user || !user.refreshTokenHash) {
        throw ApiError.unauthorized("Session not found. Please log in again.");
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
        throw ApiError.unauthorized("Session invalid. Please log in again.");
    }

    const newAccessToken = signAccessToken({
        userId: user.id,
        roleId: user.roleId,
    });

    const newRefreshToken = signRefreshToken({
        userId: user.id,
        roleId: user.roleId,
    });

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 8);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshTokenHash: newRefreshTokenHash,
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

const logout = async (userId: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshTokenHash: null,
        },
    });
};

export const authService = {
    requestLogin,
    verifyOtpAndLogin,
    resendOtp,
    refreshTokens,
    logout,
};
