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
router.get("/period-comparison", reportController.getPeriodComparison);
router.get("/revenue-by-category", reportController.getRevenueByCategory);
router.get("/worst-products", reportController.getWorstProducts);
router.get("/stock-overview", reportController.getStockOverview);
router.get("/customer-type", reportController.getCustomerTypeBreakdown);
router.get("/top-customers", reportController.getTopCustomers);
router.get("/area-breakdown", reportController.getAreaBreakdown);
router.get("/coupon-performance", reportController.getCouponPerformance);

export const reportRoutes = router;
