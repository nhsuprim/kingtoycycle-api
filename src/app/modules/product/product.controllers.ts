import { NextFunction, Request, Response } from "express";
import { productService } from "./product.services";
import { sendSuccess } from "../../helpers/ApiResponse";

const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.addProduct(req);

        return sendSuccess(res, 201, {
            message: "Product added successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            categoryId,
            brand,
            stockStatus,
            search,
            color,
            minPrice,
            maxPrice,
            minRating,
            sort,
            limit,
        } = req.query;

        const result = await productService.getAllProducts({
            categoryId: categoryId as string,
            brand: brand as string,
            stockStatus: stockStatus as string,
            search: search as string,
            color: color as string,
            minPrice: minPrice as string,
            maxPrice: maxPrice as string,
            minRating: minRating as string,
            sort: sort as string,
            limit: limit as string,
        });

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await productService.getProductById(req.params.id);

        return sendSuccess(res, 200, {
            message: "Product retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await productService.updateProduct(req);

        return sendSuccess(res, 200, {
            message: "Product updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateStockStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await productService.updateStockStatus(
            req.params.id,
            req.body.stockStatus,
        );

        return sendSuccess(res, 200, {
            message: "Stock status updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await productService.deleteProduct(req.params.id);

        return sendSuccess(res, 200, {
            message: "Product deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const productController = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateStockStatus,
    deleteProduct,
};
