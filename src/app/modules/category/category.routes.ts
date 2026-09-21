import { categoryController } from "./category.controllers";
import express, { NextFunction, Request, Response } from "express";
import { categoryValidation } from "./category.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { fileUploader } from "../../helpers/fileUploaders";

const router = express.Router();

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

router.get("/", categoryController.getCategories);

router.get("/:id", categoryController.getCategoryById);

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

router.get("/slug/:slug", categoryController.getCategoryBySlug);

export const categoryRoutes = router;
