import { Router } from "express";
import { issueController } from "./issue.controller.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post("/",auth("contributor", "maintainer"), issueController.createIssue);
router.get("/", issueController.getAllIssues);

router.get('/:id', issueController.getSingleIssue);
router.patch('/:id', auth("contributor", "maintainer"), issueController.updateSingleIssue);
router.delete('/:id', auth("maintainer"), issueController.deleteSingleIssue);

export const issueRoute = router;