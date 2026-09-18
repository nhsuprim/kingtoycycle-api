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
    } catch (error) {
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
    } catch (error) {
        next(error);
    }
};

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
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await categoryService.updateCategory(req);

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

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
    } catch (error) {
        next(error);
    }
};

const getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await categoryService.getCategoryBySlug(req.params.slug);

        if (!result) {
            return res
                .status(404)
                .json({ success: false, message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const categoryController = {
    addCategory,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
};
