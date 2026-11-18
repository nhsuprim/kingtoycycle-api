import axios from "axios";

export const revalidateFrontend = async (tags: string[]) => {
    const url = process.env.FRONTEND_URL;
    const secret = process.env.REVALIDATE_SECRET;

    if (!url || !secret || tags.length === 0) return;

    try {
        await axios.post(
            `${url}/api/revalidate`,
            { tags },
            { headers: { "x-revalidate-secret": secret }, timeout: 5000 },
        );
    } catch (error: any) {
        console.error("[Revalidate] failed:", error?.message);
    }
};
