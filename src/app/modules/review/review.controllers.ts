import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.services";
import { reviewValidation } from "./review.validation";

const addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = reviewValidation.addReview.parse(req.body);
        const result = await reviewService.addReview(parsed);

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getReviewsByProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await reviewService.getReviewsByProduct(
            req.params.productId,
        );

        res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { productId } = req.query;
        const result = await reviewService.getAllReviews({
            productId: productId as string,
        });

        res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsed = reviewValidation.updateReview.parse(req.body);
        const result = await reviewService.updateReview(req.params.id, parsed);

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await reviewService.deleteReview(req.params.id);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const reviewController = {
    addReview,
    getReviewsByProduct,
    getAllReviews,
    updateReview,
    deleteReview,
};
