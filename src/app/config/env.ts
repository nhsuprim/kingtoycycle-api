import dotenv from "dotenv";

dotenv.config();

function required(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    port: Number(process.env.PORT) || 5000,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

    databaseUrl: required("DATABASE_URL"),

    jwt: {
        accessSecret: required("JWT_ACCESS_SECRET"),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        refreshSecret: required("JWT_REFRESH_SECRET"),
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },

    cookie: {
        secure: process.env.COOKIE_SECURE === "true",
    },

    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.SMTP_FROM || "no-reply@example.com",
    },

    otp: {
        expiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES) || 5,
        maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
        resendCooldownSeconds:
            Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
    },

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },

    rateLimit: {
        windowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
        maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },

    meta: {
        pixelId: process.env.META_PIXEL_ID || "",
        accessToken: process.env.META_ACCESS_TOKEN || "",
        testEventCode: process.env.META_TEST_EVENT_CODE || "",
    },
};
