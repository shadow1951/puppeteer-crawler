import { Router } from "express";
import { crawlData } from "../controller/pupteerController.mjs";
import { crawlEmails } from "../controller/emailController.mjs";
import { loginToPacifyca, testCrawl } from "../controller/testController.mjs";

const router = Router();

router.get("/crawlit", crawlData);
router.get("/crawlEmail", crawlEmails);
//rourter.get("/scrap",scrapData)
router.get("/tcrawl", testCrawl);
router.get("/details", loginToPacifyca);
export default router;
