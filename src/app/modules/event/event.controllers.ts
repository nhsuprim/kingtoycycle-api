import { NextFunction, Request, Response } from "express";
import { eventService } from "./event.services";
import { sendSuccess } from "../../helpers/ApiResponse";

const logEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await eventService.logEvent(req);

        return sendSuccess(res, 201, {
            message: "Event logged",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllEvents = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { eventType, sessionId, phone, startDate, endDate, page, limit } =
            req.query;

        const result = await eventService.getAllEvents({
            eventType: eventType as string,
            sessionId: sessionId as string,
            phone: phone as string,
            startDate: startDate as string,
            endDate: endDate as string,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return sendSuccess(res, 200, {
            message: "Events retrieved successfully",
            data: result.events,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

const getEventSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await eventService.getEventSummary({
            startDate: startDate as string,
            endDate: endDate as string,
        });

        return sendSuccess(res, 200, {
            message: "Event summary retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getSessionJourney = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await eventService.getSessionJourney(
            req.params.sessionId,
        );

        return sendSuccess(res, 200, {
            message: "Session journey retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getProductEventStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { startDate, endDate } = req.query;

        const result = await eventService.getProductEventStats({
            startDate: startDate as string,
            endDate: endDate as string,
        });

        return sendSuccess(res, 200, {
            message: "Product event stats retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const eventController = {
    logEvent,
    getAllEvents,
    getEventSummary,
    getSessionJourney,
    getProductEventStats,
};
