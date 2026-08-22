import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import progressRouter from "./progress";
import winsRouter from "./wins";
import milestonesRouter from "./milestones";
import focusRouter from "./focus";
import plannerRouter from "./planner";
import visionRouter from "./vision";
import documentsRouter from "./documents";
import quotesRouter from "./quotes";
import settingsRouter from "./settings";
import storageRouter from "./storage";
import calendarRouter from "./calendar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(progressRouter);
router.use(winsRouter);
router.use(milestonesRouter);
router.use(focusRouter);
router.use(plannerRouter);
router.use(visionRouter);
router.use(documentsRouter);
router.use(quotesRouter);
router.use(settingsRouter);
router.use(storageRouter);
router.use(calendarRouter);

export default router;
