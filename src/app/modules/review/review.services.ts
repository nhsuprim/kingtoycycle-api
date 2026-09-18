import prisma from "../../shared/prisma";

interface AddReviewData {
    productId: string;
    customerName: string;
    rating: number;
    comment: string;
}

interface UpdateReviewData {
    customerName?: string;
    rating?: number;
    comment?: string;
}

/**
 * Product-এর averageRating এবং reviewCount recalculate করে।
 */
const recalculateProductRating = async (productId: string) => {
    const reviews = await prisma.review.findMany({
        where: {
            productId,
        },
        select: {
            rating: true,
        },
    });

    const reviewCount = reviews.length;

    const averageRating =
        reviewCount > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviewCount
            : 0;

    await prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            reviewCount,
            averageRating: Math.round(averageRating * 10) / 10,
        },
    });
};

/**
 * Add Review
 */
const addReview = async (data: AddReviewData) => {
    // Extra safety validation
    if (data.rating < 0 || data.rating > 5) {
        throw new Error("Rating must be between 0 and 5");
    }

    // Check product exists
    const product = await prisma.product.findUnique({
        where: {
            id: data.productId,
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    // Rating maximum 1 decimal
    const rating = Math.round(data.rating * 10) / 10;

    const review = await prisma.review.create({
        data: {
            productId: data.productId,
            customerName: data.customerName.trim(),
            rating,
            comment: data.comment.trim(),
        },
    });

    // Recalculate product rating
    await recalculateProductRating(data.productId);

    return review;
};

/**
 * Get Reviews By Product
 */
const getReviewsByProduct = async (productId: string) => {
    return prisma.review.findMany({
        where: {
            productId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Get All Reviews
 */
const getAllReviews = async (query: { productId?: string }) => {
    const where = query.productId
        ? {
              productId: query.productId,
          }
        : {};

    return prisma.review.findMany({
        where,
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    thumbnailImage: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Update Review
 */
const updateReview = async (id: string, data: UpdateReviewData) => {
    // Find existing review
    const existing = await prisma.review.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Review not found");
    }

    // Extra safety validation
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
        throw new Error("Rating must be between 0 and 5");
    }

    const updateData: UpdateReviewData = {
        ...data,
    };

    // Trim text values
    if (data.customerName !== undefined) {
        updateData.customerName = data.customerName.trim();
    }

    if (data.comment !== undefined) {
        updateData.comment = data.comment.trim();
    }

    // Round rating to 1 decimal
    if (data.rating !== undefined) {
        updateData.rating = Math.round(data.rating * 10) / 10;
    }

    const updated = await prisma.review.update({
        where: {
            id,
        },
        data: updateData,
    });

    // Rating changed হলে product rating recalculate
    if (data.rating !== undefined) {
        await recalculateProductRating(existing.productId);
    }

    return updated;
};

/**
 * Delete Review
 */
const deleteReview = async (id: string) => {
    // Find existing review
    const existing = await prisma.review.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Review not found");
    }

    // Delete review
    const deleted = await prisma.review.delete({
        where: {
            id,
        },
    });

    // Recalculate product rating
    await recalculateProductRating(existing.productId);

    return deleted;
};

export const reviewService = {
    addReview,
    getReviewsByProduct,
    getAllReviews,
    updateReview,
    deleteReview,
};
