"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Permission keys from documentation Section 18
const PERMISSIONS = [
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "PRODUCT_DELETE",
    "CATEGORY_MANAGE",
    "BRAND_MANAGE",
    "ORDER_VIEW",
    "ORDER_UPDATE",
    "COUPON_MANAGE",
    "SALES_REPORT_VIEW",
    "STAFF_MANAGE",
    "SHIPPING_MANAGE",
    "ANALYTICS_VIEW",
    "REVIEW_MANAGE",
    "BANNER_CREATE",
    "BANNER_UPDATE",
    "BANNER_DELETE",
];
async function main() {
    console.log("🌱 Seeding database...");
    // 1. Permissions
    const permissions = await Promise.all(PERMISSIONS.map((key) => prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key },
    })));
    console.log(`✅ ${permissions.length} permissions ready`);
    // 2. Admin role — gets every permission
    const adminRole = await prisma.role.upsert({
        where: { name: "Admin" },
        update: { permissionIds: permissions.map((p) => p.id) },
        create: {
            name: "Admin",
            description: "Full access to all modules",
            permissionIds: permissions.map((p) => p.id),
        },
    });
    console.log(`✅ Admin role ready (${adminRole.id})`);
    // 3. Staff role — no permissions by default (Admin assigns later)
    await prisma.role.upsert({
        where: { name: "Staff" },
        update: {},
        create: {
            name: "Staff",
            description: "Limited access — permissions assigned individually by Admin",
            permissionIds: [],
        },
    });
    console.log("✅ Staff role ready");
    // 4. First Admin user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    const passwordHash = await bcryptjs_1.default.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: "Super Admin",
            email: adminEmail,
            passwordHash,
            status: "ACTIVE",
            roleId: adminRole.id,
        },
    });
    console.log(`✅ Admin user ready: ${admin.email}`);
    if (!process.env.SEED_ADMIN_PASSWORD) {
        console.log(`   ⚠️  Using default password "${adminPassword}" — change it after first login!`);
    }
    console.log("🌱 Seeding complete.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
