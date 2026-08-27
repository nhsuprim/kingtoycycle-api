import express, { NextFunction, Request, Response } from "express";
import { eventController } from "./event.controllers";
import { eventValidation } from "./event.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

// Public — frontend থেকে যেকোনো customer action log হবে, login লাগবে না
router.post("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = eventValidation.logEvent.parse(req.body);
        return eventController.logEvent(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Admin only
router.get(
    "/",
    authenticate,
    authorize("ANALYTICS_VIEW"),
    eventController.getAllEvents,
);

router.get(
    "/summary",
    authenticate,
    authorize("ANALYTICS_VIEW"),
    eventController.getEventSummary,
);

router.get(
    "/product-stats",
    authenticate,
    authorize("ANALYTICS_VIEW"),
    eventController.getProductEventStats,
);

router.get(
    "/session/:sessionId",
    authenticate,
    authorize("ANALYTICS_VIEW"),
    eventController.getSessionJourney,
);

export const eventRoutes = router;
