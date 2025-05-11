import { Router } from "express"
import { getStravaActivitiesController } from "../controllers/stravaController"

const router: Router = Router()

router.get("/activities", getStravaActivitiesController)

export default router
