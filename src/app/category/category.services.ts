import { Request } from "express";
import { fileUploader } from "../helpers/fileUploaders";
import { IFile } from "../interface/file";
import prisma from "../shared/prisma";

const addCategory = async (req: Request) => {
    const files = req.files as {
        file?: IFile[];
    };

    const imageFile = files?.file?.[0];

    if (imageFile) {
        const uploaded = await fileUploader.uploadToCloudinary(imageFile);
        req.body.image = uploaded.secure_url;
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

    const result = await prisma.category.create({
        data: {
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
        },
    });

    return result;
};

const getAllCategories = async () => {
    const categories = await prisma.category.findMany();
    return categories;
};

const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: {
            id,
        },
    });
    return category;
};

//delete

const deleteCategory = async (id: string) => {
    const existingCategory = await prisma.category.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const category = await prisma.category.delete({
        where: {
            id,
        },
    });
    return category;
};

const updateCategory = async (id: string, data: any) => {
    const existingCategory = await prisma.category.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const category = await prisma.category.update({
        where: {
            id,
        },
        data: {
            ...data,
        },
    });
    return category;
};

export const categoryService = {
    addCategory,
    getAllCategories,
    getCategoryById,
    deleteCategory,
    updateCategory,
};
