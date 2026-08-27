import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { categoryRoutes } from "../category/category.routes";
import { productRoutes } from "../modules/product/product.routes";
import { couponRoutes } from "../modules/coupon/coupon.routes";
import { shippingRoutes } from "../modules/shipping/shipping.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { reportRoutes } from "../modules/report/report.routes";
import { eventRoutes } from "../modules/event/event.routes";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/category",
        route: categoryRoutes,
    },
    {
        path: "/product",
        route: productRoutes,
    },
    {
        path: "/coupon",
        route: couponRoutes,
    },
    {
        path: "/shipping",
        route: shippingRoutes,
    },
    {
        path: "/order",
        route: orderRoutes,
    },
    {
        path: "/report",
        route: reportRoutes,
    },
    {
        path: "/event",
        route: eventRoutes,
    },

    // {
    //     path: "/admin",
    //     route: adminRoutes,
    // },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
