import axios from "axios";
import { env } from "../../config/env";
import { sha256Hash } from "../../utils/hash";

interface PurchaseEventInput {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    phone: string;
    email?: string;
}

const sendMetaPurchaseEvent = async (input: PurchaseEventInput) => {
    if (!env.meta.pixelId || !env.meta.accessToken) {
        console.log("[Meta CAPI] Skipped — credentials not configured");
        return { skipped: true };
    }

    const payload = {
        data: [
            {
                event_name: "Purchase",
                event_time: Math.floor(Date.now() / 1000),
                event_id: input.orderId, // ⬅️ ফ্রন্টএন্ড Pixel-এর eventID-এর সাথে মিল, deduplication-এর জন্য
                action_source: "website",
                user_data: {
                    ph: [sha256Hash(input.phone)],
                    ...(input.email ? { em: [sha256Hash(input.email)] } : {}),
                },
                custom_data: {
                    currency: "BDT",
                    value: input.totalAmount,
                    order_id: input.orderNumber,
                },
            },
        ],
        ...(env.meta.testEventCode
            ? { test_event_code: env.meta.testEventCode }
            : {}),
    };

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${env.meta.pixelId}/events`,
            payload,
            { params: { access_token: env.meta.accessToken } },
        );
        return response.data;
    } catch (error: any) {
        console.error(
            "[Meta CAPI] Error:",
            error?.response?.data || error.message,
        );
        return { error: true };
    }
};

export const trackingService = {
    sendMetaPurchaseEvent,
};
