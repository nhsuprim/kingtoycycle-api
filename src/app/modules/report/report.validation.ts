import { z } from "zod";

const dateRangeQuery = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const reportValidation = {
    dateRangeQuery,
};
