import { NextFunction, Request, Response } from "express";
import { shippingService } from "./shipping.services";
import { sendSuccess } from "../../helpers/ApiResponse";

const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await shippingService.getSettings();

        return sendSuccess(res, 200, {
            message: "Shipping settings retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await shippingService.updateSettings(req.body);

        return sendSuccess(res, 200, {
            message: "Shipping settings updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const shippingController = {
    getSettings,
    updateSettings,
};
