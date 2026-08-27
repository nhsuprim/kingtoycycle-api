import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../helpers/ApiResponse";
import { userService } from "./user.service";

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;

    const result = await userService.getAllUsers({
        status: status as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
    });

    return sendSuccess(res, 200, { data: result.users, meta: result.meta });
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);

    return sendSuccess(res, 200, { data: user });
});

const createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);

    return sendSuccess(res, 201, {
        message: "Staff member created",
        data: user,
    });
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);

    return sendSuccess(res, 200, { message: "User updated", data: user });
});

const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUserStatus(
        req.params.id,
        req.body.status,
        req.user!.id,
    );

    return sendSuccess(res, 200, {
        message: "User status updated",
        data: user,
    });
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.id, req.user!.id);

    return sendSuccess(res, 200, { message: "User deleted" });
});

export const userController = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
};
