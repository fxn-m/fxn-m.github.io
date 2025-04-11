import { Router } from "express"
import { getReadingListController } from "../controllers/readingListController"

const router: Router = Router()

router.get("/", getReadingListController)

export default router
