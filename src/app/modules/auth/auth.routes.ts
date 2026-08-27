import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { authLimiter } from "../../middlewares/rateLimiter";

import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

// Step 1: email + password -> OTP sent to email
router.post(
    "/login",
    authLimiter,
    validate(authValidation.loginSchema),
    authController.login,
);

// Step 2: email + otp -> access + refresh tokens (HTTP-only cookies)
router.post(
    "/verify-otp",
    authLimiter,
    validate(authValidation.verifyOtpSchema),
    authController.verifyOtp,
);

router.post(
    "/resend-otp",
    authLimiter,
    validate(authValidation.resendOtpSchema),
    authController.resendOtp,
);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authenticate, authController.logout);

router.get("/me", authenticate, authController.me);

export const authRoutes = router;
