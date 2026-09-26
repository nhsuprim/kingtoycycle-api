import express, { NextFunction, Request, Response } from "express";
import { productController } from "./product.controllers";
import { productValidation } from "./product.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { fileUploader } from "../../helpers/fileUploaders";

const router = express.Router();

router.get("/feed/meta.xml", productController.getMetaFeed);

router.post(
    "/",
    authenticate,
    authorize("PRODUCT_CREATE"),

    fileUploader.upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),

    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = productValidation.addProduct.parse(
                JSON.parse(req.body.data),
            );

            return productController.addProduct(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.patch(
    "/:id",
    authenticate,
    authorize("PRODUCT_UPDATE"),

    fileUploader.upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),

    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = productValidation.updateProduct.parse(
                JSON.parse(req.body.data),
            );

            return productController.updateProduct(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    "/:id/stock-status",
    authenticate,
    authorize("PRODUCT_UPDATE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = productValidation.updateStockStatus.parse(req.body);
            return productController.updateStockStatus(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.delete(
    "/:id",
    authenticate,
    authorize("PRODUCT_DELETE"),
    productController.deleteProduct,
);

export const productRoutes = router;
