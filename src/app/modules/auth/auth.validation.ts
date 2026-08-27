import { z } from "zod";

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),

    query: z.object({}).optional(),

    params: z.object({}).optional(),
});

const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Valid email is required"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),

    query: z.object({}).optional(),

    params: z.object({}).optional(),
});

const resendOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Valid email is required"),
    }),

    query: z.object({}).optional(),

    params: z.object({}).optional(),
});
export const authValidation = {
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
};
