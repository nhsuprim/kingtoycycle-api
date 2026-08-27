import express, { NextFunction, Request, Response } from "express";
import { shippingController } from "./shipping.controllers";
import { shippingValidation } from "./shipping.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

// Public — customer checkout page-এ charge দেখানোর জন্য
router.get("/", shippingController.getSettings);

// Admin only
router.patch(
    "/",
    authenticate,
    authorize("SHIPPING_MANAGE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = shippingValidation.updateSettings.parse(req.body);
            return shippingController.updateSettings(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

export const shippingRoutes = router;
