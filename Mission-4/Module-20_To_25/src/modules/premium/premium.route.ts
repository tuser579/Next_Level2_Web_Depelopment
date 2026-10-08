import { Router } from "express";
import { premiumController } from "./premium.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { subscriptionGuard } from "../../middlewares/premiumGuard";

const router = Router();

router.get(
    '/',
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    subscriptionGuard(),
    premiumController.getPremiumContent
);

export const premiumRoutes = router;