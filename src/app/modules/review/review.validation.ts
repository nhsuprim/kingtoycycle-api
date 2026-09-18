import { z } from "zod";

const ratingSchema = z
    .number({
        required_error: "Rating is required",
        invalid_type_error: "Rating must be a number",
    })
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .refine((value) => Number.isFinite(value), {
        message: "Rating must be a valid number",
    });

const addReview = z.object({
    productId: z
        .string({
            required_error: "Product is required",
        })
        .min(1, "Product is required"),

    customerName: z
        .string({
            required_error: "Customer name is required",
            invalid_type_error: "Customer name must be a string",
        })
        .trim()
        .min(2, "Customer name must be at least 2 characters"),

    rating: ratingSchema,

    comment: z
        .string({
            required_error: "Comment is required",
            invalid_type_error: "Comment must be a string",
        })
        .trim()
        .min(3, "Comment must be at least 3 characters"),
});

const updateReview = z.object({
    customerName: z
        .string({
            invalid_type_error: "Customer name must be a string",
        })
        .trim()
        .min(2, "Customer name must be at least 2 characters")
        .optional(),

    rating: ratingSchema.optional(),

    comment: z
        .string({
            invalid_type_error: "Comment must be a string",
        })
        .trim()
        .min(3, "Comment must be at least 3 characters")
        .optional(),
});

export const reviewValidation = {
    addReview,
    updateReview,
};
