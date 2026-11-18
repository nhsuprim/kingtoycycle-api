import { categoryController } from "./category.controllers";
import express, { NextFunction, Request, Response } from "express";
import { categoryValidation } from "./category.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { fileUploader } from "../../helpers/fileUploaders";
import { cacheControl } from "../../middlewares/cacheControl";

const router = express.Router();

router.get("/", cacheControl(120), categoryController.getCategories);
router.get(
    "/slug/:slug",
    cacheControl(120),
    categoryController.getCategoryBySlug,
);
router.get("/:id", cacheControl(120), categoryController.getCategoryById);

router.post(
    "/",
    authenticate,
    authorize("CATEGORY_MANAGE"),
    fileUploader.upload.fields([
        { name: "file", maxCount: 1 },
        { name: "bannerImage", maxCount: 1 },
    ]),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = categoryValidation.addCategory.parse(
                JSON.parse(req.body.data),
            );
            return categoryController.addCategory(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    "/:id",
    authenticate,
    authorize("CATEGORY_MANAGE"),
    fileUploader.upload.fields([
        { name: "file", maxCount: 1 },
        { name: "bannerImage", maxCount: 1 },
    ]),

    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = categoryValidation.updateCategory.parse(
                JSON.parse(req.body.data),
            );
            return categoryController.updateCategory(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.delete(
    "/:id",
    authenticate,
    authorize("CATEGORY_MANAGE"),
    categoryController.deleteCategory,
);

export const categoryRoutes = router;
