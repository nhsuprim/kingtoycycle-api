import { NextFunction, Request, Response } from "express";
import { homepageServices } from "./homepage.services";

const bannerImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await homepageServices.bannerImage(req);
        res.status(201).json({
            success: true,
            message: "Banner added successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllBannerImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await homepageServices.getAllBannerImages();
        res.status(200).json({
            success: true,
            message: "Banners retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getBannerImageById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await homepageServices.getBannerImageById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Banner retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const changeBannerImageStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await homepageServices.changeBannerImageStatus(
            req.params.id,
            req.body.isActive,
        );
        res.status(200).json({
            success: true,
            message: "Banner status updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteBannerImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await homepageServices.deleteBannerImage(req.params.id);
        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const homepageController = {
    bannerImage,
    getAllBannerImages,
    getBannerImageById,
    changeBannerImageStatus,
    deleteBannerImage,
};
