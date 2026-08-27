import { z } from "zod";

const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        roleId: z.string().min(1, "Role is required"),
    }),
});

const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        roleId: z.string().optional(),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});

const updateStatusSchema = z.object({
    body: z.object({
        status: z.enum(["ACTIVE", "INACTIVE"]),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});

export const userValidation = {
    createUserSchema,
    updateUserSchema,
    updateStatusSchema,
};
