import { Router } from "express";
import { crawlData } from "../controller/pupteerController.mjs";
import { crawlEmails } from "../controller/emailController.mjs";

const router = Router();

router.get("/crawlit", crawlData);
router.get("/crawlEmail", crawlEmails);

export default router;
