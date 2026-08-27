import { prisma } from "../../config/db";

// Singleton pattern — একটাই settings document থাকবে, না থাকলে default দিয়ে তৈরি হবে
const getSettings = async () => {
    let settings = await prisma.shippingSettings.findFirst();

    if (!settings) {
        settings = await prisma.shippingSettings.create({ data: {} });
    }

    return settings;
};

const updateSettings = async (data: {
    insideDhakaCharge?: number;
    outsideDhakaCharge?: number;
    freeDeliveryEnabled?: boolean;
}) => {
    const settings = await getSettings();

    return prisma.shippingSettings.update({
        where: { id: settings.id },
        data,
    });
};

export const shippingService = {
    getSettings,
    updateSettings,
};
