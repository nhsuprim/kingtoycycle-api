import { Request } from "express";
import { prisma } from "../../config/db";

const logEvent = async (req: Request) => {
    const { eventType, sessionId, phone, productId, page, metadata } = req.body;

    return prisma.customerEvent.create({
        data: {
            eventType,
            sessionId,
            phone,
            productId,
            page,
            metadata,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        },
    });
};

const getAllEvents = async (query: {
    eventType?: string;
    sessionId?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) => {
    const where: any = {};

    if (query.eventType) where.eventType = query.eventType;
    if (query.sessionId) where.sessionId = query.sessionId;
    if (query.phone) where.phone = query.phone;

    if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt.gte = new Date(query.startDate);
        if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    const [events, total] = await Promise.all([
        prisma.customerEvent.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.customerEvent.count({ where }),
    ]);

    return {
        events,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

const getEventSummary = async (query: {
    startDate?: string;
    endDate?: string;
}) => {
    const where: any = {};

    if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt.gte = new Date(query.startDate);
        if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const grouped = await prisma.customerEvent.groupBy({
        by: ["eventType"],
        where,
        _count: { _all: true },
    });

    return grouped.map((g) => ({
        eventType: g.eventType,
        count: g._count._all,
    }));
};

const getSessionJourney = async (sessionId: string) => {
    return prisma.customerEvent.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
    });
};

// প্রতিটা product-এ View → Cart → Purchase funnel ও conversion rate
const getProductEventStats = async (query: {
    startDate?: string;
    endDate?: string;
}) => {
    const where: any = { productId: { not: null } };

    if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt.gte = new Date(query.startDate);
        if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const events = await prisma.customerEvent.findMany({
        where,
        select: { productId: true, eventType: true },
    });

    const statsMap: Record<string, Record<string, number>> = {};

    for (const event of events) {
        const pid = event.productId as string;

        if (!statsMap[pid]) statsMap[pid] = {};
        statsMap[pid][event.eventType] =
            (statsMap[pid][event.eventType] || 0) + 1;
    }

    const productIds = Object.keys(statsMap);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, thumbnailImage: true },
    });

    const result = products.map((product) => {
        const eventCounts = statsMap[product.id] || {};

        const productView = eventCounts["PRODUCT_VIEW"] || 0;
        const addToCart = eventCounts["ADD_TO_CART"] || 0;
        const purchase = eventCounts["PURCHASE"] || 0;

        const viewToCartRate =
            productView > 0 ? (addToCart / productView) * 100 : 0;
        const cartToPurchaseRate =
            addToCart > 0 ? (purchase / addToCart) * 100 : 0;
        const viewToPurchaseRate =
            productView > 0 ? (purchase / productView) * 100 : 0;

        return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            thumbnailImage: product.thumbnailImage,
            events: eventCounts,
            funnel: {
                productView,
                addToCart,
                purchase,
                viewToCartRate: Math.round(viewToCartRate * 100) / 100,
                cartToPurchaseRate: Math.round(cartToPurchaseRate * 100) / 100,
                viewToPurchaseRate: Math.round(viewToPurchaseRate * 100) / 100,
            },
            totalEvents: Object.values(eventCounts).reduce(
                (sum, count) => sum + count,
                0,
            ),
        };
    });

    return result.sort((a, b) => b.funnel.productView - a.funnel.productView);
};

export const eventService = {
    logEvent,
    getAllEvents,
    getEventSummary,
    getSessionJourney,
    getProductEventStats,
};
