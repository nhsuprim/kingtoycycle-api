import prisma from "../../shared/prisma";

const getAllRoles = async () => {
    return prisma.role.findMany({
        select: {
            id: true,
            name: true,
            description: true,
        },
        orderBy: { name: "asc" },
    });
};

export const roleService = {
    getAllRoles,
};
