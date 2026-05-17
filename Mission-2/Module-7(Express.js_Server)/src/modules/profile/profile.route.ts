import { Router } from "express";
import { profileController } from "./profile.controller.js";

const router = Router();

router.post('/', profileController.createProfile);

export const profileRoute = router;