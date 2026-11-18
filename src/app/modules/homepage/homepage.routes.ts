import express, { NextFunction, Request, Response } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { fileUploader } from "../../helpers/fileUploaders";
import { homepageValidation } from "./homepage.validations";
import { homepageController } from "./homepage.controllers";
import { cacheControl } from "../../middlewares/cacheControl";

const router = express.Router();

router.get(
    "/get-all-banners",
    cacheControl(120),
    homepageController.getAllBannerImages,
);
router.get(
    "/get-banner/:id",
    cacheControl(120),
    homepageController.getBannerImageById,
);

router.post(
    "/add-banner",
    authenticate,
    authorize("BANNER_CREATE"),
    fileUploader.upload.fields([{ name: "image", maxCount: 1 }]),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = homepageValidation.bannerImage.parse(
                JSON.parse(req.body.data),
            );
            return homepageController.bannerImage(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    "/change-banner-status/:id",
    authenticate,
    authorize("BANNER_UPDATE"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = homepageValidation.changeStatus.parse(req.body);
            return homepageController.changeBannerImageStatus(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.delete(
    "/delete-banner/:id",
    authenticate,
    authorize("BANNER_DELETE"),
    homepageController.deleteBannerImage,
);

export const homepageRoutes = router;
