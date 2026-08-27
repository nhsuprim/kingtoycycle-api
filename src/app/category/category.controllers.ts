import { NextFunction, Request, Response } from "express";
import { categoryService } from "./category.services";

const addCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.addCategory(req);

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await categoryService.getAllCategories();

        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};
// get category by id

const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await categoryService.getCategoryById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

//delete category by id

const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await categoryService.deleteCategory(req.params.id);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await categoryService.updateCategory(
            req.params.id,
            req.body,
        );
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

export const categoryController = {
    addCategory,
    getCategories,
    getCategoryById,
    deleteCategory,
    updateCategory,
};
