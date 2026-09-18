import express from "express";
import { reviewController } from "./review.controllers";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

// Public — storefront-এ product page-এ review দেখানোর জন্য
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Admin only
router.get(
    "/",
    authenticate,
    authorize("REVIEW_MANAGE"),
    reviewController.getAllReviews,
);

router.post(
    "/",
    authenticate,
    authorize("REVIEW_MANAGE"),
    reviewController.addReview,
);

router.patch(
    "/:id",
    authenticate,
    authorize("REVIEW_MANAGE"),
    reviewController.updateReview,
);

router.delete(
    "/:id",
    authenticate,
    authorize("REVIEW_MANAGE"),
    reviewController.deleteReview,
);

export const reviewRoutes = router;
