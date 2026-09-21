import { prisma } from "../../config/db";
import { ApiError } from "../../helpers/ApiError";
import { generateOrderNumber } from "../../utils/orderNumber";
import { getShippingCharge, ShippingArea } from "../../utils/shipping";
import { notificationService } from "../notification/notification.services";
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

    const orderItemsData = input.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const unitPrice = product.discountPrice ?? product.regularPrice;

        return {
            productId: product.id,
            productName: product.name,
            productCode: product.sku,
            productImage: product.thumbnailImage,
            price: unitPrice,
            quantity: item.quantity,
        };
    });

    const subtotal = orderItemsData.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const shippingCost = await getShippingCharge(input.area);

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
            items: { create: orderItemsData },
        },
        include: { items: true },
    });

    if (couponId) {
        await prisma.couponUsage.create({
            data: { couponId, phone: input.phone, orderId: order.id },
        });
    }

    // ---- Meta CAPI — Purchase event, fire-and-forget (order flow block করবে না) ----
    trackingService
        .sendMetaPurchaseEvent({
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            phone: order.phone,
            email: order.email || undefined,
        })
        .catch(() => {});

    // ---- Telegram — Admin-কে instant notification ----
    notificationService
        .sendOrderNotification({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            phone: order.phone,
            address: order.address,
            area: order.area,
            items: orderItemsData.map((item) => ({
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
            })),
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            couponDiscount: order.couponDiscount,
            totalAmount: order.totalAmount,
        })
        .catch(() => {});

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

    return prisma.order.findMany({
        where,
        include: {
            items: {
                include: { product: { select: { thumbnailImage: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getOrderById = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: { product: { select: { thumbnailImage: true } } },
            },
        },
    });

    if (!order) throw ApiError.notFound("Order not found");
    return order;
};

const trackOrder = async (orderNumber: string) => {
    const order = await prisma.order.findFirst({
        where: { orderNumber },
        include: {
            items: {
                include: { product: { select: { thumbnailImage: true } } },
            },
        },
    });

    if (!order) {
        throw ApiError.notFound(
            "Order not found. Please check your order number.",
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
