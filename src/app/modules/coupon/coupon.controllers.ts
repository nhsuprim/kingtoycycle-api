import { NextFunction, Request, Response } from "express";
import { couponService } from "./coupon.services";
import { sendSuccess } from "../../helpers/ApiResponse";

const addCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await couponService.addCoupon(req.body);

        return sendSuccess(res, 201, {
            message: "Coupon created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllCoupons = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { status } = req.query;

        const result = await couponService.getAllCoupons({
            status: status as string,
        });

        return sendSuccess(res, 200, {
            message: "Coupons retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getCouponById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await couponService.getCouponById(req.params.id);

        return sendSuccess(res, 200, {
            message: "Coupon retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await couponService.updateCoupon(
            req.params.id,
            req.body,
        );

        return sendSuccess(res, 200, {
            message: "Coupon updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await couponService.updateStatus(
            req.params.id,
            req.body.status,
        );

        return sendSuccess(res, 200, {
            message: "Coupon status updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await couponService.deleteCoupon(req.params.id);

        return sendSuccess(res, 200, {
            message: "Coupon deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const couponController = {
    addCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateStatus,
    deleteCoupon,
};
