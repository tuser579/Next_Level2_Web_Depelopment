import { Router } from "express";
import { userController } from "./user.controller.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post('/', userController.createUser);

router.get('/',auth('admin', 'agent'), userController.getAllUsers);

router.get('/:id', userController.getSingleUser);

router.put(`/:id`, userController.updateSingleUser);

router.delete(`/:id`, userController.deleteSingleUser);

export const userRoute = router;