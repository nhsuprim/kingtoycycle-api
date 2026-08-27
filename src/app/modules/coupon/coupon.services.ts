import { prisma } from "../../config/db";
import { ApiError } from "../../helpers/ApiError";

const addCoupon = async (data: any) => {
    const existing = await prisma.coupon.findUnique({
        where: { code: data.code },
    });

    if (existing) {
        throw ApiError.conflict("A coupon with this code already exists");
    }

    const startDate = new Date(data.startDate);
    const expiryDate = new Date(data.expiryDate);

    if (expiryDate <= startDate) {
        throw ApiError.badRequest("Expiry date must be after the start date");
    }

    return prisma.coupon.create({
        data: {
            code: data.code,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minimumOrderAmount: data.minimumOrderAmount,
            maximumDiscount: data.maximumDiscount,
            startDate,
            expiryDate,
            usageLimit: data.usageLimit,
            perCustomerUsageLimit: data.perCustomerUsageLimit,
            applicableToAll: data.applicableToAll || false,
            applicableProductIds: data.applicableProductIds || [],
            applicableCategoryIds: data.applicableCategoryIds || [],
        },
    });
};
const getAllCoupons = async (query: { status?: string }) => {
    const where = query.status
        ? { status: query.status as "ACTIVE" | "INACTIVE" }
        : {};

    return prisma.coupon.findMany({ where, orderBy: { createdAt: "desc" } });
};

const getCouponById = async (id: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) throw ApiError.notFound("Coupon not found");

    return coupon;
};

const updateCoupon = async (id: string, data: any) => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) throw ApiError.notFound("Coupon not found");

    const updateData: any = { ...data };

    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);

    const finalStart = updateData.startDate || coupon.startDate;
    const finalExpiry = updateData.expiryDate || coupon.expiryDate;

    if (finalExpiry <= finalStart) {
        throw ApiError.badRequest("Expiry date must be after the start date");
    }

    return prisma.coupon.update({ where: { id }, data: updateData });
};

const updateStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) throw ApiError.notFound("Coupon not found");

    return prisma.coupon.update({ where: { id }, data: { status } });
};

const deleteCoupon = async (id: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) throw ApiError.notFound("Coupon not found");

    const usageCount = await prisma.couponUsage.count({
        where: { couponId: id },
    });

    if (usageCount > 0) {
        throw ApiError.badRequest(
            `Cannot delete: this coupon has already been used ${usageCount} time(s). Deactivate it instead.`,
        );
    }

    return prisma.coupon.delete({ where: { id } });
};

export const couponService = {
    addCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateStatus,
    deleteCoupon,
};
