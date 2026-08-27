import crypto from "crypto";

export const sha256Hash = (value: string): string => {
    return crypto
        .createHash("sha256")
        .update(value.trim().toLowerCase())
        .digest("hex");
};
