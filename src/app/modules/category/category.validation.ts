import { z } from "zod";

const addCategory = z.object({
    name: z.string({ required_error: "Category name is required" }).min(2),
    description: z.string().optional(),
});

const updateCategory = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const categoryValidation = {
    addCategory,
    updateCategory,
};
