import { Request } from "express";

import { fileUploader } from "../../helpers/fileUploaders";
import { IFile } from "../../interface/file";
import prisma from "../../shared/prisma";
import { slugify } from "../../utils/slugify";

const addCategory = async (req: Request) => {
    const files = req.files as {
        file?: IFile[];
        bannerImage?: IFile[];
    };

    const imageFile = files?.file?.[0];
    const bannerFile = files?.bannerImage?.[0];

    if (imageFile) {
        const uploaded = await fileUploader.uploadToCloudinary(imageFile);
        req.body.image = uploaded.secure_url;
    }

    if (bannerFile) {
        const uploadedBanner =
            await fileUploader.uploadToCloudinary(bannerFile);

        req.body.bannerimage = uploadedBanner.secure_url;
    }

    const { name } = req.body;

    if (!name) {
        throw new Error("Category name is required");
    }

    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
    });

    if (existingCategory) {
        throw new Error("This category name is already listed");
    }

    const serialCount =
        req.body.serial_count !== undefined &&
        req.body.serial_count !== null &&
        req.body.serial_count !== ""
            ? Number(req.body.serial_count)
            : null;

    if (serialCount !== null) {
        if (!Number.isInteger(serialCount) || serialCount < 1) {
            throw new Error("Serial count must be a positive number");
        }

        const serialExists = await prisma.category.findFirst({
            where: {
                serial_count: serialCount,
            },
        });

        if (serialExists) {
            throw new Error(
                `Serial count ${serialCount} is already used by another category`,
            );
        }
    }

    let slug = slugify(name);

    const slugExists = await prisma.category.findUnique({
        where: { slug },
    });

    if (slugExists) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const result = await prisma.category.create({
        data: {
            name: req.body.name,
            slug,
            image: req.body.image,
            bannerimage: req.body.bannerimage,
            description: req.body.description,
            serial_count: serialCount,
        },
    });

    return result;
};

const getAllCategories = async () => {
    const categories = await prisma.category.findMany();

    return categories.sort((a, b) => {
        const aSerial = a.serial_count;
        const bSerial = b.serial_count;

        if (aSerial !== null && bSerial !== null) {
            return aSerial - bSerial;
        }

        if (aSerial !== null) {
            return -1;
        }

        if (bSerial !== null) {
            return 1;
        }

        return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    });
};

const getCategoryById = async (id: string) => {
    return prisma.category.findUnique({
        where: { id },
    });
};

const updateCategory = async (req: Request) => {
    const { id } = req.params;

    const existingCategory = await prisma.category.findUniqueOrThrow({
        where: { id },
    });

    const files = req.files as {
        file?: IFile[];
        bannerImage?: IFile[];
    };

    const imageFile = files?.file?.[0];
    const bannerFile = files?.bannerImage?.[0];

    if (imageFile) {
        const uploaded = await fileUploader.uploadToCloudinary(imageFile);
        req.body.image = uploaded.secure_url;
    }

    if (bannerFile) {
        const uploadedBanner =
            await fileUploader.uploadToCloudinary(bannerFile);

        req.body.bannerimage = uploadedBanner.secure_url;
    }

    if (req.body.name && req.body.name !== existingCategory.name) {
        const duplicate = await prisma.category.findFirst({
            where: {
                name: {
                    equals: req.body.name,
                    mode: "insensitive",
                },
                NOT: {
                    id,
                },
            },
        });

        if (duplicate) {
            throw new Error("This category name is already listed");
        }

        req.body.slug = slugify(req.body.name);

        const slugExists = await prisma.category.findFirst({
            where: {
                slug: req.body.slug,
                NOT: {
                    id,
                },
            },
        });

        if (slugExists) {
            req.body.slug = `${req.body.slug}-${Date.now()
                .toString()
                .slice(-4)}`;
        }
    }

    if (
        req.body.serial_count !== undefined &&
        req.body.serial_count !== null &&
        req.body.serial_count !== ""
    ) {
        const serialCount = Number(req.body.serial_count);

        if (!Number.isInteger(serialCount) || serialCount < 1) {
            throw new Error("Serial count must be a positive number");
        }

        const serialExists = await prisma.category.findFirst({
            where: {
                serial_count: serialCount,
                NOT: {
                    id,
                },
            },
        });

        if (serialExists) {
            throw new Error(
                `Serial count ${serialCount} is already used by another category`,
            );
        }

        req.body.serial_count = serialCount;
    } else if (req.body.serial_count === null || req.body.serial_count === "") {
        req.body.serial_count = null;
    }

    return prisma.category.update({
        where: { id },
        data: {
            ...req.body,
        },
    });
};

const deleteCategory = async (id: string) => {
    await prisma.category.findUniqueOrThrow({
        where: { id },
    });

    return prisma.category.delete({
        where: { id },
    });
};

const getCategoryBySlug = async (slug: string) => {
    return prisma.category.findUnique({
        where: { slug },
    });
};

export const categoryService = {
    addCategory,
    getAllCategories,
    getCategoryById,
    deleteCategory,
    updateCategory,
    getCategoryBySlug,
};
