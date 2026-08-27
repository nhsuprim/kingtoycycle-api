import { z } from "zod";

const addProduct = z.object({
    name: z.string({ required_error: "Product name is required" }).min(2),
    description: z.string({ required_error: "Description is required" }).min(5),
    sku: z.string({ required_error: "SKU is required" }).min(1),
    color: z.string({ required_error: "Color is required" }).min(1),
    brand: z.string().optional(),
    regularPrice: z
        .number({ required_error: "Regular price is required" })
        .positive(),
    discountPrice: z.number().positive().optional(),
    stockStatus: z
        .enum(["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"])
        .optional(),
    categoryId: z.string({ required_error: "Category is required" }).min(1),
});

const updateProduct = z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    sku: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    brand: z.string().optional(),
    regularPrice: z.number().positive().optional(),
    discountPrice: z.number().positive().optional(),
    categoryId: z.string().optional(),
});

const updateStockStatus = z.object({
    stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"], {
        required_error: "Stock status is required",
    }),
});

export const productValidation = {
    addProduct,
    updateProduct,
    updateStockStatus,
};
