import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { ApiError } from "../../helpers/ApiError";

const getAllUsers = async (query: {
    status?: string;
    page?: number;
    limit?: number;
}) => {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.status
        ? { status: query.status as "ACTIVE" | "INACTIVE" }
        : {};

    const [rawUsers, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { role: true },
        }),
        prisma.user.count({ where }),
    ]);

    const users = rawUsers.map(
        ({ passwordHash, otpCode, refreshTokenHash, ...safeUser }) => safeUser,
    );

    return {
        users,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { role: { include: { permissions: true } } },
    });

    if (!user) throw ApiError.notFound("User not found");

    const { passwordHash, otpCode, refreshTokenHash, ...safeUser } = user;

    return safeUser;
};

const createUser = async (data: {
    name: string;
    email: string;
    password: string;
    roleId: string;
}) => {
    const existing = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existing)
        throw ApiError.conflict("A user with this email already exists");

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });

    if (!role) throw ApiError.badRequest("Invalid role");

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash,
            roleId: data.roleId,
            status: "ACTIVE",
        },
    });

    const { passwordHash: _, otpCode, refreshTokenHash, ...safeUser } = user;

    return safeUser;
};

const updateUser = async (
    id: string,
    data: { name?: string; email?: string; roleId?: string },
) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw ApiError.notFound("User not found");

    if (data.email && data.email !== user.email) {
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing)
            throw ApiError.conflict("A user with this email already exists");
    }

    if (data.roleId) {
        const role = await prisma.role.findUnique({
            where: { id: data.roleId },
        });

        if (!role) throw ApiError.badRequest("Invalid role");
    }

    const updated = await prisma.user.update({ where: { id }, data });

    const { passwordHash, otpCode, refreshTokenHash, ...safeUser } = updated;

    return safeUser;
};

const updateUserStatus = async (
    id: string,
    status: "ACTIVE" | "INACTIVE",
    requesterId: string,
) => {
    if (id === requesterId && status === "INACTIVE") {
        throw ApiError.badRequest("You cannot deactivate your own account");
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw ApiError.notFound("User not found");

    const updated = await prisma.user.update({
        where: { id },
        data: {
            status,
            ...(status === "INACTIVE" ? { refreshTokenHash: null } : {}),
        },
    });

    const { passwordHash, otpCode, refreshTokenHash, ...safeUser } = updated;

    return safeUser;
};

const deleteUser = async (id: string, requesterId: string) => {
    if (id === requesterId) {
        throw ApiError.badRequest("You cannot delete your own account");
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw ApiError.notFound("User not found");

    await prisma.user.delete({ where: { id } });

    return { id };
};

export const userService = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
};
