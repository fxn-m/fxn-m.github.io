import { Router } from "express"
import { getStravaActivitiesController } from "../controllers/stravaController"

const router = Router()

router.get("/activities", getStravaActivitiesController)

export default router
