import axios from "axios";
import { env } from "../../config/env";

interface OrderNotificationInput {
    orderNumber: string;
    customerName: string;
    phone: string;
    address: string;
    area: string;
    items: { productName: string; quantity: number; price: number }[];
    subtotal: number;
    shippingCost: number;
    couponDiscount: number;
    totalAmount: number;
}

const sendOrderNotification = async (input: OrderNotificationInput) => {
    if (!env.telegram.botToken || !env.telegram.chatId) {
        console.log("[Telegram] Skipped — bot not configured");
        return;
    }

    const itemsList = input.items
        .map(
            (item) =>
                `• ${item.productName} × ${item.quantity} — ৳${item.price * item.quantity}`,
        )
        .join("\n");

    const message = `
🛒 *New Order Received!*

*Order:* ${input.orderNumber}
*Customer:* ${input.customerName}
*Phone:* ${input.phone}
*Address:* ${input.address}
*Area:* ${input.area === "DHAKA" ? "Inside Dhaka" : "Outside Dhaka"}

*Items:*
${itemsList}

*Subtotal:* ৳${input.subtotal}
*Shipping:* ৳${input.shippingCost}
${input.couponDiscount > 0 ? `*Discount:* −৳${input.couponDiscount}\n` : ""}*Total:* ৳${input.totalAmount}
`.trim();

    try {
        await axios.post(
            `https://api.telegram.org/bot${env.telegram.botToken}/sendMessage`,
            {
                chat_id: env.telegram.chatId,
                text: message,
                parse_mode: "Markdown",
            },
        );
    } catch (error: any) {
        console.error(
            "[Telegram] Error:",
            error?.response?.data || error.message,
        );
    }
};

export const notificationService = {
    sendOrderNotification,
};
