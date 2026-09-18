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

// ---- Period Comparison (current vs previous period, growth %) ----
const getAggregatesForRange = async (start: Date, end: Date) => {
    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            createdAt: { gte: start, lte: end },
        },
        select: { totalAmount: true },
    });

    return {
        revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        orderCount: orders.length,
    };
};

const calcGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
};

const getPeriodComparison = async (range: DateRange) => {
    const now = new Date();
    const end = range.endDate ? new Date(range.endDate) : now;
    const start = range.startDate
        ? new Date(range.startDate)
        : new Date(now.getFullYear(), now.getMonth(), 1);

    const periodMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodMs);

    const [current, previous] = await Promise.all([
        getAggregatesForRange(start, end),
        getAggregatesForRange(prevStart, prevEnd),
    ]);

    return {
        current,
        previous,
        revenueGrowthPercent: calcGrowth(current.revenue, previous.revenue),
        orderGrowthPercent: calcGrowth(current.orderCount, previous.orderCount),
    };
};

// ---- Revenue by Category ----
const getRevenueByCategory = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            ...dateFilter,
        },
        include: {
            items: {
                include: {
                    product: { include: { category: true } },
                },
            },
        },
    });

    const categoryMap: Record<
        string,
        { categoryName: string; revenue: number; quantity: number }
    > = {};

    for (const order of orders) {
        for (const item of order.items) {
            const categoryName =
                item.product?.category?.name ?? "Uncategorized";
            const key = categoryName;

            if (!categoryMap[key]) {
                categoryMap[key] = { categoryName, revenue: 0, quantity: 0 };
            }
            categoryMap[key].revenue += item.price * item.quantity;
            categoryMap[key].quantity += item.quantity;
        }
    }

    return Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
};

// ---- Worst / Slow-moving Products ----
const getWorstProducts = async (range: DateRange, limit = 10) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            ...dateFilter,
        },
        include: { items: true },
    });

    const soldMap: Record<
        string,
        { totalQuantity: number; totalRevenue: number }
    > = {};

    for (const order of orders) {
        for (const item of order.items) {
            if (!soldMap[item.productId]) {
                soldMap[item.productId] = { totalQuantity: 0, totalRevenue: 0 };
            }
            soldMap[item.productId].totalQuantity += item.quantity;
            soldMap[item.productId].totalRevenue += item.price * item.quantity;
        }
    }

    const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, sku: true },
    });

    const combined = allProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        totalQuantity: soldMap[p.id]?.totalQuantity ?? 0,
        totalRevenue: soldMap[p.id]?.totalRevenue ?? 0,
    }));

    return combined
        .sort(
            (a, b) =>
                a.totalQuantity - b.totalQuantity ||
                a.totalRevenue - b.totalRevenue,
        )
        .slice(0, limit);
};

// ---- Stock Status Overview ----
const getStockOverview = async () => {
    const grouped = await prisma.product.groupBy({
        by: ["stockStatus"],
        _count: { _all: true },
    });

    return grouped.map((g) => ({
        status: g.stockStatus,
        count: g._count._all,
    }));
};

// ---- New vs Returning Customers ----
const getCustomerTypeBreakdown = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const rangeOrders = await prisma.order.findMany({
        where: dateFilter,
        select: { phone: true },
        distinct: ["phone"],
    });

    const phones = rangeOrders.map((o) => o.phone);

    if (phones.length === 0) {
        return { newCustomers: 0, returningCustomers: 0 };
    }

    const startBoundary = range.startDate ? new Date(range.startDate) : null;

    let newCount = 0;
    let returningCount = 0;

    for (const phone of phones) {
        const firstOrder = await prisma.order.findFirst({
            where: { phone },
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
        });

        const isNew =
            !startBoundary ||
            (firstOrder && firstOrder.createdAt >= startBoundary);

        if (isNew) newCount += 1;
        else returningCount += 1;
    }

    return { newCustomers: newCount, returningCustomers: returningCount };
};

// ---- Top Customers by Spend ----

const getTopCustomers = async (range: DateRange, limit = 10) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: VALID_SALE_STATUSES as any },
            ...dateFilter,
        },
        select: {
            phone: true,
            customerName: true,
            totalAmount: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const customerMap: Record<
        string,
        {
            phone: string;
            customerName: string;
            totalSpent: number;
            orderCount: number;
        }
    > = {};

    for (const order of orders) {
        if (!customerMap[order.phone]) {
            customerMap[order.phone] = {
                phone: order.phone,
                customerName: order.customerName,
                totalSpent: 0,
                orderCount: 0,
            };
        }
        customerMap[order.phone].totalSpent += order.totalAmount;
        customerMap[order.phone].orderCount += 1;
    }

    return Object.values(customerMap)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
};

// ---- Area-wise Orders (Dhaka vs Outside Dhaka) ----
const getAreaBreakdown = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const grouped = await prisma.order.groupBy({
        by: ["area"],
        where: dateFilter,
        _count: { _all: true },
        _sum: { totalAmount: true },
    });

    return grouped.map((g) => ({
        area: g.area,
        orderCount: g._count._all,
        revenue: g._sum.totalAmount ?? 0,
    }));
};

// ---- Per-Coupon Performance ----
const getCouponPerformance = async (range: DateRange) => {
    const dateFilter = buildDateFilter(range);

    const orders = await prisma.order.findMany({
        where: {
            couponId: { not: null },
            ...dateFilter,
        },
        select: { couponId: true, couponDiscount: true },
    });

    const couponMap: Record<
        string,
        { orderCount: number; totalDiscount: number }
    > = {};

    for (const order of orders) {
        const cId = order.couponId as string;
        if (!couponMap[cId])
            couponMap[cId] = { orderCount: 0, totalDiscount: 0 };
        couponMap[cId].orderCount += 1;
        couponMap[cId].totalDiscount += order.couponDiscount;
    }

    const couponIds = Object.keys(couponMap);
    const coupons = await prisma.coupon.findMany({
        where: { id: { in: couponIds } },
        select: { id: true, code: true },
    });

    return coupons
        .map((c) => ({
            couponId: c.id,
            code: c.code,
            orderCount: couponMap[c.id].orderCount,
            totalDiscount: couponMap[c.id].totalDiscount,
        }))
        .sort((a, b) => b.totalDiscount - a.totalDiscount);
};

export const reportService = {
    getSummary,
    getOrderStatusBreakdown,
    getTopProducts,
    getSalesByDate,
    getCouponUsageStats,
    getPeriodComparison,
    getRevenueByCategory,
    getWorstProducts,
    getStockOverview,
    getCustomerTypeBreakdown,
    getTopCustomers,
    getAreaBreakdown,
    getCouponPerformance,
};
