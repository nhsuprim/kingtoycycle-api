import { z } from "zod";

const orderItemSchema = z.object({
    productId: z.string({ required_error: "Product id is required" }),
    quantity: z
        .number({ required_error: "Quantity is required" })
        .int()
        .positive(),
});

const createOrder = z.object({
    customerName: z
        .string({ required_error: "Customer name is required" })
        .min(2),
    phone: z.string({ required_error: "Phone number is required" }).min(6),
    email: z.string().email().optional(),
    address: z.string({ required_error: "Address is required" }).min(5),
    area: z.enum(["DHAKA", "OUTSIDE_DHAKA"], {
        required_error: "Area is required",
    }),
    items: z.array(orderItemSchema).min(1, "At least one product is required"),
    couponCode: z.string().optional(),
});

const updateOrderStatus = z.object({
    orderStatus: z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
        "REFUNDED",
    ]),
});

const updatePaymentStatus = z.object({
    paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]),
});

const trackOrder = z.object({
    orderNumber: z
        .string({ required_error: "Order number is required" })
        .min(1),
});

export const orderValidation = {
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    trackOrder,
};
