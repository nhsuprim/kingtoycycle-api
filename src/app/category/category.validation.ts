import { z } from "zod";

const addCategory = z.object({
    name: z.string({
        required_error: "Title is required",
    }),
});

export const categoryValidation = {
    addCategory,
};
