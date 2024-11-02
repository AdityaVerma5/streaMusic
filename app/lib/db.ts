// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Avoid multiple instances of Prisma Client in development
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prismaClient =
    global.prisma ||
    new PrismaClient({
        log: ["query", "info", "warn", "error"],
    });

if (process.env.NODE_ENV !== "production") global.prisma = prismaClient;
