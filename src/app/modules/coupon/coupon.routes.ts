import express, { NextFunction, Request, Response } from "express";
import { couponController } from "./coupon.controllers";
import { couponValidation } from "./coupon.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("COUPON_MANAGE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = couponValidation.addCoupon.parse(req.body);
            return couponController.addCoupon(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.get(
    "/",
    authenticate,
    authorize("COUPON_MANAGE"),
    couponController.getAllCoupons,
);

router.get(
    "/:id",
    authenticate,
    authorize("COUPON_MANAGE"),
    couponController.getCouponById,
);

router.patch(
    "/:id",
    authenticate,
    authorize("COUPON_MANAGE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = couponValidation.updateCoupon.parse(req.body);
            return couponController.updateCoupon(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    "/:id/status",
    authenticate,
    authorize("COUPON_MANAGE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = couponValidation.updateStatus.parse(req.body);
            return couponController.updateStatus(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.delete(
    "/:id",
    authenticate,
    authorize("COUPON_MANAGE"),
    couponController.deleteCoupon,
);

export const couponRoutes = router;
