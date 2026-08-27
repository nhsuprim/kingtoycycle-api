import { z } from "zod";
const addCoupon = z
    .object({
        code: z
            .string({ required_error: "Coupon code is required" })
            .min(3)
            .toUpperCase(),
        discountType: z.enum(["PERCENTAGE", "FIXED"], {
            required_error: "Discount type is required",
        }),
        discountValue: z
            .number({ required_error: "Discount value is required" })
            .positive(),

        minimumOrderAmount: z.number().nonnegative().optional(),
        maximumDiscount: z.number().positive().optional(),

        startDate: z.string({ required_error: "Start date is required" }),
        expiryDate: z.string({ required_error: "Expiry date is required" }),

        usageLimit: z.number().int().positive().optional(),
        perCustomerUsageLimit: z.number().int().positive().optional(),

        applicableToAll: z.boolean().optional(), // ⬅️ নতুন
        applicableProductIds: z.array(z.string()).optional(),
        applicableCategoryIds: z.array(z.string()).optional(),
    })
    .refine(
        (data) =>
            data.applicableToAll === true ||
            (data.applicableProductIds &&
                data.applicableProductIds.length > 0) ||
            (data.applicableCategoryIds &&
                data.applicableCategoryIds.length > 0),
        {
            message:
                "Select 'applicableToAll: true' or provide at least one product/category",
            path: ["applicableToAll"],
        },
    );

const updateCoupon = z.object({
    discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
    discountValue: z.number().positive().optional(),
    minimumOrderAmount: z.number().nonnegative().optional(),
    maximumDiscount: z.number().positive().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    usageLimit: z.number().int().positive().optional(),
    perCustomerUsageLimit: z.number().int().positive().optional(),
    applicableToAll: z.boolean().optional(),
    applicableProductIds: z.array(z.string()).optional(),
    applicableCategoryIds: z.array(z.string()).optional(),
});

const updateStatus = z.object({
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status is required",
    }),
});

export const couponValidation = {
    addCoupon,
    updateCoupon,
    updateStatus,
};
