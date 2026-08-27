import { prisma } from "../../config/db";

const VALID_SALE_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
];

interface DateRange {
    startDate?: string;
    endDate?: string;
}

const buildDateFilter = (range: DateRange) => {
    if (!range.startDate && !range.endDate) return {};

    const filter: any = {};
    if (range.startDate) filter.gte = new Date(range.startDate);
    if (range.endDate) filter.lte = new Date(range.endDate);

    return { createdAt: filter };
};

const getSummary = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            ...dateFilter,
        },
        select: {
            totalAmount: true,
            phone: true,
            paymentStatus: true,
        },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const unpaidCount = orders.filter(
        (o) => o.paymentStatus === "UNPAID",
    ).length;
    const paidCount = orders.filter((o) => o.paymentStatus === "PAID").length;

    const cancelledCount = await prisma.order.count({
        where: { orderStatus: "CANCELLED", ...dateFilter },
    });

    return {
        totalRevenue,
        totalOrders,
        uniqueCustomers,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        paidCount,
        unpaidCount,
        cancelledCount,
    };
};

const getOrderStatusBreakdown = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const grouped = await prisma.order.groupBy({
        by: ["orderStatus"],
        where: dateFilter,
        _count: { _all: true },
    });

    return grouped.map((g) => ({
        status: g.orderStatus,
        count: g._count._all,
    }));
};

interface TopProduct {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
}

const getTopProducts = async (range: DateRange, limit = 10) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            ...dateFilter,
        },
        include: { items: true },
    });

    const productMap: Record<string, TopProduct> = {};

    for (const order of orders) {
        for (const item of order.items) {
            if (productMap[item.productId]) {
                productMap[item.productId].totalQuantity += item.quantity;
                productMap[item.productId].totalRevenue +=
                    item.price * item.quantity;
            } else {
                productMap[item.productId] = {
                    productId: item.productId,
                    productName: item.productName,
                    totalQuantity: item.quantity,
                    totalRevenue: item.price * item.quantity,
                };
            }
        }
    }

    return Object.values(productMap)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
};

interface DailySales {
    date: string;
    revenue: number;
    orderCount: number;
}

const getSalesByDate = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            ...dateFilter,
        },
        select: { totalAmount: true, createdAt: true },
    });

    const dailyMap: Record<string, DailySales> = {};

    for (const order of orders) {
        const dateKey = order.createdAt.toISOString().split("T")[0];

        if (dailyMap[dateKey]) {
            dailyMap[dateKey].revenue += order.totalAmount;
            dailyMap[dateKey].orderCount += 1;
        } else {
            dailyMap[dateKey] = {
                date: dateKey,
                revenue: order.totalAmount,
                orderCount: 1,
            };
        }
    }

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
};

const getCouponUsageStats = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            couponId: { not: null },
            ...dateFilter,
        },
        select: { couponId: true, couponDiscount: true },
    });

    const totalDiscountGiven = orders.reduce(
        (sum, o) => sum + o.couponDiscount,
        0,
    );
    const totalCouponOrders = orders.length;

    return { totalCouponOrders, totalDiscountGiven };
};

export const reportService = {
    getSummary,
    getOrderStatusBreakdown,
    getTopProducts,
    getSalesByDate,
    getCouponUsageStats,
};
