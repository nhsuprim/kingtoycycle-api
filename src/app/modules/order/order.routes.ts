import express, { NextFunction, Request, Response } from "express";
import { orderController } from "./order.controllers";
import { orderValidation } from "./order.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

// Public — customer checkout, login লাগবে না
router.post("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = orderValidation.createOrder.parse(req.body);
        return orderController.createOrder(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Public — customer নিজের order track করবে
router.post("/track", (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = orderValidation.trackOrder.parse(req.body);
        return orderController.trackOrder(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Admin/Staff only
router.get(
    "/",
    authenticate,
    authorize("ORDER_VIEW"),
    orderController.getAllOrders,
);

router.get(
    "/:id",
    authenticate,
    authorize("ORDER_VIEW"),
    orderController.getOrderById,
);

router.patch(
    "/:id/status",
    authenticate,
    authorize("ORDER_UPDATE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = orderValidation.updateOrderStatus.parse(req.body);
            return orderController.updateOrderStatus(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    "/:id/payment-status",
    authenticate,
    authorize("ORDER_UPDATE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = orderValidation.updatePaymentStatus.parse(req.body);
            return orderController.updatePaymentStatus(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

export const orderRoutes = router;
