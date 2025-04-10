import { Router } from "express"
import { getReadingListController, markReadController } from "../controllers/readingListController"

const router: Router = Router()

router.get("/", getReadingListController)
router.post("/mark-read/:id", markReadController)

export default router
