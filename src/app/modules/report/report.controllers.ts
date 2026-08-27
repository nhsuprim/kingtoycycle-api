import { NextFunction, Request, Response } from "express";
import { reportService } from "./report.services";
import { sendSuccess } from "../../helpers/ApiResponse";

const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await reportService.getSummary({
            startDate: startDate as string,
            endDate: endDate as string,
        });

        return sendSuccess(res, 200, {
            message: "Sales summary retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getOrderStatusBreakdown = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await reportService.getOrderStatusBreakdown({
            startDate: startDate as string,
            endDate: endDate as string,
        });

        return sendSuccess(res, 200, {
            message: "Order status breakdown retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getTopProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { startDate, endDate, limit } = req.query;

        const result = await reportService.getTopProducts(
            { startDate: startDate as string, endDate: endDate as string },
            limit ? Number(limit) : 10,
        );

        return sendSuccess(res, 200, {
            message: "Top products retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getSalesByDate = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await reportService.getSalesByDate({
            startDate: startDate as string,
            endDate: endDate as string,
        });

        return sendSuccess(res, 200, {
            message: "Sales trend retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getCouponUsageStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await reportService.getCouponUsageStats({
            startDate: startDate as string,
            endDate: endDate as string,
        });

        return sendSuccess(res, 200, {
            message: "Coupon usage stats retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const reportController = {
    getSummary,
    getOrderStatusBreakdown,
    getTopProducts,
    getSalesByDate,
    getCouponUsageStats,
};
