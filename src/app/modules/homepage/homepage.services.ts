import { Request } from "express";
import { IFile } from "../../interface/file";
import { fileUploader } from "../../helpers/fileUploaders";
import { ApiError } from "../../helpers/ApiError";
import prisma from "../../shared/prisma";

const bannerImage = async (req: Request) => {
    const files = req.files as {
        image?: IFile[];
    };

    const bannerImg = files?.image?.[0];

    if (!req.body.title?.trim()) {
        throw ApiError.badRequest("Banner title is required");
    }

    if (!bannerImg) {
        throw ApiError.badRequest("Banner image is required");
    }

    const uploadedTbannerImg = await fileUploader.uploadToCloudinary(bannerImg);
    req.body.bannerImg = uploadedTbannerImg.secure_url;

    const result = await prisma.banner.create({
        data: {
            title: req.body.title,
            image: req.body.bannerImg,
        },
    });

    return result;
};

//get all banner images
const getAllBannerImages = async () => {
    const result = await prisma.banner.findMany();
    return result;
};

//get banner image by id
const getBannerImageById = async (id: string) => {
    const result = await prisma.banner.findUnique({
        where: { id },
    });
    return result;
};
//change status of banner image
const changeBannerImageStatus = async (id: string, status: boolean) => {
    const result = await prisma.banner.update({
        where: { id },
        data: { isActive: status },
    });
    return result;
};

//delete banner image
const deleteBannerImage = async (id: string) => {
    const result = await prisma.banner.delete({
        where: { id },
    });
    return result;
};

export const homepageServices = {
    bannerImage,
    getAllBannerImages,
    getBannerImageById,
    changeBannerImageStatus,
    deleteBannerImage,
};
