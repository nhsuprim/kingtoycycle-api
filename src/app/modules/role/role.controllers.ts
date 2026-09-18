import { NextFunction, Request, Response } from "express";
import { roleService } from "./role.services";

const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await roleService.getAllRoles();

        res.status(200).json({
            success: true,
            message: "Roles retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const roleController = {
    getAllRoles,
};
