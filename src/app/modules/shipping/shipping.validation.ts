import { z } from "zod";

const updateSettings = z.object({
    insideDhakaCharge: z.number().nonnegative().optional(),
    outsideDhakaCharge: z.number().nonnegative().optional(),
    freeDeliveryEnabled: z.boolean().optional(),
});

export const shippingValidation = {
    updateSettings,
};
