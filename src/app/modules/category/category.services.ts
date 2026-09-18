import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploaders";
import { IFile } from "../../interface/file";
import prisma from "../../shared/prisma";
import { slugify } from "../../utils/slugify";

const addCategory = async (req: Request) => {
    const files = req.files as { file?: IFile[] };
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
        where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existingCategory) {
        throw new Error("This category name is already listed");
    }

    let slug = slugify(name);
    const slugExists = await prisma.category.findUnique({ where: { slug } });
    if (slugExists) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`; // duplicate হলে unique করে নিলো
    }

    const result = await prisma.category.create({
        data: {
            name: req.body.name,
            slug,
            image: req.body.image,
            description: req.body.description,
        },
    });

    return result;
};
const getAllCategories = async () => {
    return prisma.category.findMany({ orderBy: { createdAt: "desc" } });
};

const getCategoryById = async (id: string) => {
    return prisma.category.findUnique({ where: { id } });
};

const updateCategory = async (req: Request) => {
    const { id } = req.params;

    const existingCategory = await prisma.category.findUniqueOrThrow({
        where: { id },
    });

    const files = req.files as { file?: IFile[] };
    const imageFile = files?.file?.[0];

    if (imageFile) {
        const uploaded = await fileUploader.uploadToCloudinary(imageFile);
        req.body.image = uploaded.secure_url;
    }

    if (req.body.name && req.body.name !== existingCategory.name) {
        const duplicate = await prisma.category.findFirst({
            where: { name: { equals: req.body.name, mode: "insensitive" } },
        });

        if (duplicate) {
            throw new Error("This category name is already listed");
        }

        req.body.slug = slugify(req.body.name);
    }

    return prisma.category.update({
        where: { id },
        data: { ...req.body },
    });
};
const deleteCategory = async (id: string) => {
    await prisma.category.findUniqueOrThrow({ where: { id } });

    return prisma.category.delete({ where: { id } });
};

const getCategoryBySlug = async (slug: string) => {
    return prisma.category.findUnique({ where: { slug } });
};

export const categoryService = {
    addCategory,
    getAllCategories,
    getCategoryById,
    deleteCategory,
    updateCategory,
    getCategoryBySlug,
};
