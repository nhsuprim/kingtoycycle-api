import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.use(authenticate, authorize("STAFF_MANAGE"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

router.post(
    "/",
    validate(userValidation.createUserSchema),
    userController.createUser,
);

router.patch(
    "/:id",
    validate(userValidation.updateUserSchema),
    userController.updateUser,
);

router.patch(
    "/:id/status",
    validate(userValidation.updateStatusSchema),
    userController.updateUserStatus,
);

router.delete("/:id", userController.deleteUser);

export const userRoutes = router;
