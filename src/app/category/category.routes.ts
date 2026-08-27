import express, { NextFunction, Request, Response } from "express";
import { categoryController } from "./category.controllers";
import { categoryValidation } from "./category.validation";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { fileUploader } from "../helpers/fileUploaders";
const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("CATEGORY_MANAGE"),

    fileUploader.upload.fields([
        { name: "file", maxCount: 1 }, // category image
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

router.delete(
    "/:id",
    authenticate,
    authorize("CATEGORY_MANAGE"),
    categoryController.deleteCategory,
);

router.put(
    "/:id",
    authenticate,
    authorize("CATEGORY_MANAGE"),
    categoryController.updateCategory,
);

export const categoryRoutes = router;
