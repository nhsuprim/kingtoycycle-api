import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.services";
import { sendSuccess } from "../../helpers/ApiResponse";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.createOrder(req.body);

        return sendSuccess(res, 201, {
            message: "Order placed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { orderStatus, paymentStatus, phone } = req.query;

        const result = await orderService.getAllOrders({
            orderStatus: orderStatus as string,
            paymentStatus: paymentStatus as string,
            phone: phone as string,
        });

        return sendSuccess(res, 200, {
            message: "Orders retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await orderService.getOrderById(req.params.id);

        return sendSuccess(res, 200, {
            message: "Order retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const trackOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderNumber } = req.body;

        const result = await orderService.trackOrder(orderNumber);

        return sendSuccess(res, 200, {
            message: "Order found",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await orderService.updateOrderStatus(
            req.params.id,
            req.body.orderStatus,
        );

        return sendSuccess(res, 200, {
            message: "Order status updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updatePaymentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await orderService.updatePaymentStatus(
            req.params.id,
            req.body.paymentStatus,
        );

        return sendSuccess(res, 200, {
            message: "Payment status updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const orderController = {
    createOrder,
    getAllOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    updatePaymentStatus,
};
