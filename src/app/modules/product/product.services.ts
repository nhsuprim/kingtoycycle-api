import { Request } from "express";
import { prisma } from "../../config/db";
import { ApiError } from "../../helpers/ApiError";
import { fileUploader } from "../../helpers/fileUploaders";
import { IFile } from "../../interface/file";

const addProduct = async (req: Request) => {
    const files = req.files as {
        thumbnail?: IFile[];
        images?: IFile[];
    };

    const thumbnailFile = files?.thumbnail?.[0];
    const galleryFiles = files?.images || [];

    if (!thumbnailFile) {
        throw ApiError.badRequest("Thumbnail image is required");
    }

    const uploadedThumbnail =
        await fileUploader.uploadToCloudinary(thumbnailFile);
    req.body.thumbnailImage = uploadedThumbnail.secure_url;
    req.body.thumbnailPublicId = uploadedThumbnail.public_id;

    if (galleryFiles.length > 0) {
        const uploadedGallery = await Promise.all(
            galleryFiles.map((file) => fileUploader.uploadToCloudinary(file)),
        );
        req.body.images = uploadedGallery.map((img) => img.secure_url);
        req.body.imagePublicIds = uploadedGallery.map((img) => img.public_id);
    }

    const { sku, categoryId } = req.body;

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku)
        throw ApiError.conflict("A product with this SKU already exists");

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });
    if (!category) throw ApiError.badRequest("Invalid category");

    const result = await prisma.product.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            sku: req.body.sku,
            color: req.body.color,
            brand: req.body.brand,
            regularPrice: req.body.regularPrice,
            discountPrice: req.body.discountPrice,
            stockStatus: req.body.stockStatus || "IN_STOCK",
            thumbnailImage: req.body.thumbnailImage,
            thumbnailPublicId: req.body.thumbnailPublicId,
            images: req.body.images || [],
            imagePublicIds: req.body.imagePublicIds || [],
            categoryId: req.body.categoryId,
        },
    });

    return result;
};

const getAllProducts = async (query: {
    categoryId?: string;
    brand?: string;
    stockStatus?: string;
    search?: string;
}) => {
    const where: any = {};

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brand) where.brand = { equals: query.brand, mode: "insensitive" };
    if (query.stockStatus) where.stockStatus = query.stockStatus;

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { sku: { contains: query.search, mode: "insensitive" } },
        ];
    }

    return prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });
};

const getProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
    });

    if (!product) throw ApiError.notFound("Product not found");

    return product;
};

const updateProduct = async (req: Request) => {
    const { id } = req.params;

    const files = req.files as {
        thumbnail?: IFile[];
        images?: IFile[];
    };

    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) throw ApiError.notFound("Product not found");

    // ---- Thumbnail বদলালে পুরনোটা Cloudinary থেকে delete ----
    const thumbnailFile = files?.thumbnail?.[0];
    if (thumbnailFile) {
        const uploaded = await fileUploader.uploadToCloudinary(thumbnailFile);
        req.body.thumbnailImage = uploaded.secure_url;
        req.body.thumbnailPublicId = uploaded.public_id;

        if (existingProduct.thumbnailPublicId) {
            await fileUploader.deleteFromCloudinary([
                existingProduct.thumbnailPublicId,
            ]);
        }
    }

    // ---- Gallery images বদলালে পুরনো সবগুলো Cloudinary থেকে delete ----
    const galleryFiles = files?.images || [];
    if (galleryFiles.length > 0) {
        const uploadedGallery = await Promise.all(
            galleryFiles.map((file) => fileUploader.uploadToCloudinary(file)),
        );

        req.body.images = uploadedGallery.map((img) => img.secure_url);
        req.body.imagePublicIds = uploadedGallery.map((img) => img.public_id);

        if (existingProduct.imagePublicIds?.length > 0) {
            await fileUploader.deleteFromCloudinary(
                existingProduct.imagePublicIds,
            );
        }
    }

    if (req.body.sku && req.body.sku !== existingProduct.sku) {
        const existingSku = await prisma.product.findUnique({
            where: { sku: req.body.sku },
        });
        if (existingSku)
            throw ApiError.conflict("A product with this SKU already exists");
    }

    if (req.body.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: req.body.categoryId },
        });
        if (!category) throw ApiError.badRequest("Invalid category");
    }

    const result = await prisma.product.update({
        where: { id },
        data: req.body,
    });

    return result;
};

const updateStockStatus = async (
    id: string,
    stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED",
) => {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) throw ApiError.notFound("Product not found");

    return prisma.product.update({ where: { id }, data: { stockStatus } });
};

const deleteProduct = async (id: string) => {
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) throw ApiError.notFound("Product not found");

    const linkedOrderItems = await prisma.orderItem.count({
        where: { productId: id },
    });

    if (linkedOrderItems > 0) {
        throw ApiError.badRequest(
            "Cannot delete: this product has existing orders. Mark it as DISCONTINUED instead.",
        );
    }

    const publicIdsToDelete = [
        ...(existingProduct.thumbnailPublicId
            ? [existingProduct.thumbnailPublicId]
            : []),
        ...(existingProduct.imagePublicIds || []),
    ];

    if (publicIdsToDelete.length > 0) {
        await fileUploader.deleteFromCloudinary(publicIdsToDelete);
    }

    return prisma.product.delete({ where: { id } });
};

export const productService = {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateStockStatus,
    deleteProduct,
};
