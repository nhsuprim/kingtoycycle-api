import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Reuse a single PrismaClient instance (important in dev with ts-node/nodemon
// to avoid exhausting MongoDB connections on hot reload).
declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

export const prisma =
    global.__prisma ||
    new PrismaClient({
        log: env.isProduction ? ["error", "warn"] : ["error", "warn"],
    });

export async function connectDatabase(): Promise<void> {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log("✅ MongoDB connected via Prisma");
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
}
