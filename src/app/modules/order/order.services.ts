// import { prisma } from "../../config/db";
import { ApiError } from "../../helpers/ApiError";
import prisma from "../../shared/prisma";
import { generateOrderNumber } from "../../utils/orderNumber";
import { getShippingCharge, ShippingArea } from "../../utils/shipping";
import { trackingService } from "../tracking/tracking.services";

interface CreateOrderInput {
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    area: ShippingArea;
    items: { productId: string; quantity: number }[];
    couponCode?: string;
}

const createOrder = async (input: CreateOrderInput) => {
    // ---- ১. প্রতিটা product খুঁজে বের করা ও stock চেক ----
    const products = await prisma.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
    });

    if (products.length !== input.items.length) {
        throw ApiError.badRequest("One or more products were not found");
    }

    for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId)!;

        if (product.stockStatus !== "IN_STOCK") {
            throw ApiError.badRequest(
                `"${product.name}" is currently out of stock`,
            );
        }
    }

    // ---- ২. Subtotal calculate ----
    const orderItemsData = input.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const unitPrice = product.discountPrice ?? product.regularPrice;

        return {
            productId: product.id,
            productName: product.name,
            productCode: product.sku,
            price: unitPrice,
            quantity: item.quantity,
        };
    });

    const subtotal = orderItemsData.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    // ---- ৩. Shipping charge (Admin-panel থেকে সেট করা, DB থেকে dynamic) ----
    const shippingCost = await getShippingCharge(input.area);

    // ---- ৪. Coupon apply (applicableToAll / product / category অনুযায়ী) ----
    let couponDiscount = 0;
    let couponId: string | undefined;

    if (input.couponCode) {
        const coupon = await prisma.coupon.findUnique({
            where: { code: input.couponCode },
        });

        if (!coupon || coupon.status !== "ACTIVE") {
            throw ApiError.badRequest("Invalid or inactive coupon code");
        }

        const now = new Date();
        if (now < coupon.startDate || now > coupon.expiryDate) {
            throw ApiError.badRequest(
                "This coupon has expired or is not yet active",
            );
        }

        if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
            throw ApiError.badRequest(
                `Minimum order amount for this coupon is ৳${coupon.minimumOrderAmount}`,
            );
        }

        if (coupon.usageLimit) {
            const totalUsage = await prisma.couponUsage.count({
                where: { couponId: coupon.id },
            });
            if (totalUsage >= coupon.usageLimit) {
                throw ApiError.badRequest(
                    "This coupon has reached its usage limit",
                );
            }
        }

        if (coupon.perCustomerUsageLimit) {
            const customerUsage = await prisma.couponUsage.count({
                where: { couponId: coupon.id, phone: input.phone },
            });
            if (customerUsage >= coupon.perCustomerUsageLimit) {
                throw ApiError.badRequest(
                    "You have already used this coupon the maximum number of times",
                );
            }
        }

        let eligibleAmount = subtotal;

        if (!coupon.applicableToAll) {
            eligibleAmount = orderItemsData.reduce((sum, item) => {
                const product = products.find((p) => p.id === item.productId)!;

                const isProductMatch = coupon.applicableProductIds.includes(
                    product.id,
                );
                const isCategoryMatch = coupon.applicableCategoryIds.includes(
                    product.categoryId,
                );

                if (isProductMatch || isCategoryMatch) {
                    return sum + item.price * item.quantity;
                }
                return sum;
            }, 0);

            if (eligibleAmount === 0) {
                throw ApiError.badRequest(
                    "This coupon is not applicable to any product in your cart",
                );
            }
        }

        couponDiscount =
            coupon.discountType === "PERCENTAGE"
                ? (eligibleAmount * coupon.discountValue) / 100
                : coupon.discountValue;

        if (coupon.maximumDiscount) {
            couponDiscount = Math.min(couponDiscount, coupon.maximumDiscount);
        }

        couponDiscount = Math.min(couponDiscount, eligibleAmount);

        couponId = coupon.id;
    }

    const totalAmount = subtotal - couponDiscount + shippingCost;

    // ---- ৫. Order + OrderItem তৈরি ----
    const order = await prisma.order.create({
        data: {
            orderNumber: generateOrderNumber(),
            customerName: input.customerName,
            phone: input.phone,
            email: input.email,
            address: input.address,
            area: input.area,
            subtotal,
            shippingCost,
            couponDiscount,
            totalAmount,
            couponId,
            paymentMethod: "COD",
            paymentStatus: "UNPAID",
            orderStatus: "PENDING",
            items: {
                create: orderItemsData,
            },
        },
        include: { items: true },
    });

    // ---- ৬. Coupon usage record করা ----
    if (couponId) {
        await prisma.couponUsage.create({
            data: { couponId, phone: input.phone, orderId: order.id },
        });
    }

    // ---- ৭. Meta CAPI-তে Purchase event পাঠানো (fire-and-forget, order flow block করবে না) ----
    trackingService
        .sendMetaPurchaseEvent({
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            phone: order.phone,
            email: order.email || undefined,
        })
        .catch(() => {
            // ইতিমধ্যে service-এর ভিতরে catch করা আছে, এটা শুধু extra safety
        });

    return order;
};

const getAllOrders = async (query: {
    orderStatus?: string;
    paymentStatus?: string;
    phone?: string;
}) => {
    const where: any = {};

    if (query.orderStatus) where.orderStatus = query.orderStatus;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.phone) where.phone = query.phone;

    // return all orders with order items and product details and category details
    return prisma.order.findMany({
        where,
        include: {
            items: { include: { product: { include: { category: true } } } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getOrderById = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
    });

    if (!order) throw ApiError.notFound("Order not found");

    const orderDetails = {
        ...order,
        items: order.items.map((item) => ({
            ...item,
            product: item.productId ? { id: item.productId } : null,
        })),
    };
    return orderDetails;
};

const trackOrder = async (payload: any) => {
    const { orderNumber, phone } = payload;

    const order = await prisma.order.findFirst({
        where: {
            OR: [{ orderNumber }, { phone }],
        },
        include: {
            items: true,
        },
    });

    if (!order) {
        throw ApiError.notFound(
            "Order not found. Please check your order number or phone number.",
        );
    }

    return order;
};

const updateOrderStatus = async (id: string, orderStatus: string) => {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) throw ApiError.notFound("Order not found");

    return prisma.order.update({
        where: { id },
        data: { orderStatus: orderStatus as any },
    });
};

const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) throw ApiError.notFound("Order not found");

    return prisma.order.update({
        where: { id },
        data: { paymentStatus: paymentStatus as any },
    });
};

export const orderService = {
    createOrder,
    getAllOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    updatePaymentStatus,
};
