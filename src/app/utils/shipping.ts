import { prisma } from "../config/db";

export type ShippingArea = "DHAKA" | "OUTSIDE_DHAKA";

export const getShippingCharge = async (
    area: ShippingArea,
): Promise<number> => {
    let settings = await prisma.shippingSettings.findFirst();

    if (!settings) {
        settings = await prisma.shippingSettings.create({ data: {} });
    }

    if (settings.freeDeliveryEnabled) {
        return 0;
    }

    return area === "DHAKA"
        ? settings.insideDhakaCharge
        : settings.outsideDhakaCharge;
};
