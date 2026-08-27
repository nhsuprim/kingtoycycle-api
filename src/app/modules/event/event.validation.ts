import { z } from "zod";

const logEvent = z.object({
    eventType: z.string({ required_error: "Event type is required" }),
    sessionId: z.string().optional(),
    phone: z.string().optional(),
    productId: z.string().optional(),
    page: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export const eventValidation = {
    logEvent,
};
