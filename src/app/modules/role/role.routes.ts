import express from "express";
import { roleController } from "./role.controllers";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

// শুধু STAFF_MANAGE permission থাকলেই role list দেখা যাবে (staff assign করার সময় লাগে)
router.get(
    "/",
    authenticate,
    authorize("STAFF_MANAGE"),
    roleController.getAllRoles,
);

export const roleRoutes = router;
