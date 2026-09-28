import { z } from "zod";

const addCategory = z.object({
    name: z.string({ required_error: "Category name is required" }).min(2),
    description: z.string().optional(),
    serial_count: z.number().int().positive().nullable().optional(),
});

const updateCategory = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    serial_count: z.number().int().positive().nullable().optional(),
});

export const categoryValidation = {
    addCategory,
    updateCategory,
};
