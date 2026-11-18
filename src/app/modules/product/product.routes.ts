import express, { NextFunction, Request, Response } from "express";
import { productController } from "./product.controllers";
import { productValidation } from "./product.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { fileUploader } from "../../helpers/fileUploaders";
import { cacheControl } from "../../middlewares/cacheControl";

const router = express.Router();

router.get("/feed/meta.xml", cacheControl(3600), productController.getMetaFeed);
router.get("/facets", productController.getFacets);
router.get("/", cacheControl(30), productController.getProducts);
router.get("/:id", cacheControl(30), productController.getProductById);

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
