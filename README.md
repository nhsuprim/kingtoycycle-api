# E-Commerce Backend — Phase 1 & 2

Documentation-এর roadmap অনুযায়ী (Section 39):
- **Phase 1:** Project setup — Express, TypeScript, MongoDB, Prisma, environment ✅
- **Phase 2:** Admin/Staff authentication — Email + Password + 2-Step OTP + JWT + RBAC ✅

## যা তৈরি হয়েছে

```
backend/
├── prisma/
│   ├── schema.prisma      # সব entity: User, Role, Permission, Product, Category,
│   │                      # Brand, Order, OrderItem, Coupon, CouponUsage,
│   │                      # ShippingSetting, PaymentMethod
│   └── seed.ts            # Default permissions, Admin/Staff role, first Admin user
├── src/
│   ├── config/            # env.ts, db.ts (Prisma client)
│   ├── middlewares/       # authenticate, authorize (RBAC), rateLimiter,
│   │                      # validate (Zod), errorHandler, notFound
│   ├── helpers/           # ApiError, ApiResponse
│   ├── utils/             # jwt.ts, otp.ts, asyncHandler.ts
│   ├── modules/
│   │   └── auth/          # login (step1) → OTP verify (step2) → tokens
│   │       (product/category/brand/order/... folders আছে, পরের ফেজে fill হবে)
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
# .env-এ DATABASE_URL (MongoDB Atlas), JWT secrets, SMTP details বসান
```

MongoDB replica set প্রয়োজন (Prisma transactions/relations-এর জন্য) —
MongoDB Atlas ব্যবহার করলে এটা by default enabled থাকে।

```bash
npm run prisma:generate
npm run prisma:push       # schema থেকে MongoDB collections তৈরি করবে
npm run prisma:seed       # Admin user, roles, permissions, shipping, payment methods seed করবে
npm run dev                # http://localhost:5000
```

Seed করার পর default admin:
- Email: `admin@example.com` (অথবা `.env`-এ `SEED_ADMIN_EMAIL` দিলে সেটা)
- Password: `ChangeMe123!` (অথবা `SEED_ADMIN_PASSWORD`)

## Auth flow (Section 17)

```
POST /api/auth/login          { email, password }        → OTP পাঠানো হবে email-এ
POST /api/auth/verify-otp     { email, otp }              → accessToken + refreshToken
                                                              (HTTP-only cookies)
POST /api/auth/resend-otp     { email }                   → নতুন OTP (cooldown সহ)
POST /api/auth/refresh-token  (cookie থেকে)                → নতুন access+refresh token
POST /api/auth/logout         (authenticated)              → refresh token invalidate
GET  /api/auth/me             (authenticated)               → current user info
```

Development মোডে (`SMTP_HOST` সেট না থাকলে) OTP console-এ log হবে —
আসল email পাঠানোর জন্য `.env`-এ SMTP credentials দিন।

## RBAC ব্যবহার (Section 18)

```ts
router.post(
  '/products',
  authenticate,
  authorize('PRODUCT_CREATE'),
  productController.create
);
```

Admin role-এ সব permission auto-assign হয় (seed script দেখুন)। Staff-দের জন্য
Admin Panel থেকে নির্দিষ্ট permission assign করা হবে (এটা Phase 2-এর staff module-এ আসবে)।

## পরবর্তী ধাপ (roadmap অনুযায়ী)

- Phase 3: Product / Category / Brand modules + Cloudinary image upload
- Phase 4: Storefront-facing APIs — search, filter, cart, checkout
- Phase 5: COD order flow, shipping charge calc, coupon validation, inventory
- Phase 6: Admin dashboard + sales/revenue report aggregation
- Phase 7: GTM/GA4/Meta Pixel/CAPI/Google Ads server-side tracking endpoints
- Phase 8: Security hardening, SEO, performance, tests, deployment

বলুন কোন module দিয়ে পরের ধাপে যেতে চান — যেমন এখন **Product + Category + Brand
(Phase 3)** বানিয়ে দিতে পারি, since সেটা সবচেয়ে foundational।
