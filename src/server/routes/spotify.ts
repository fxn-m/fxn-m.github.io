import { Router } from "express"
import { getCurrentTrackController } from "../controllers/spotifyController"

const router: Router = Router()

router.get("/current-track", getCurrentTrackController)

export default router
