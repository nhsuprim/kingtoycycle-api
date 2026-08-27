import express from "express";
import { reportController } from "./report.controllers";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

// সব route-ই Admin/Staff only, একই permission দিয়ে protected
router.use(authenticate, authorize("SALES_REPORT_VIEW"));

router.get("/summary", reportController.getSummary);
router.get("/order-status", reportController.getOrderStatusBreakdown);
router.get("/top-products", reportController.getTopProducts);
router.get("/sales-by-date", reportController.getSalesByDate);
router.get("/coupon-usage", reportController.getCouponUsageStats);

export const reportRoutes = router;
