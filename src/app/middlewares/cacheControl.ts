import { NextFunction, Request, Response } from "express";

export const cacheControl =
    (sMaxAge: number) => (req: Request, res: Response, next: NextFunction) => {
        const src = req.query.src;

        // Next.js server (ISR) ও Admin panel-এর request CDN cache পাবে না
        if (src === "isr" || src === "admin") {
            res.setHeader("Cache-Control", "no-store");
            return next();
        }

        res.setHeader(
            "Cache-Control",
            `public, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge * 2}`,
        );
        next();
    };
