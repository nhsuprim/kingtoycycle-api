import { z } from "zod";

const bannerImage = z.object({
    title: z.string({ required_error: "Banner title is required" }).min(2),
});

const changeStatus = z.object({
    isActive: z.boolean({ required_error: "isActive is required" }),
});

export const homepageValidation = {
    bannerImage,
    changeStatus,
};
