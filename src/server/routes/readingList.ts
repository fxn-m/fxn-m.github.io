import { Router } from "express"
import {
  enrichReadingListController,
  getReadingListController
} from "../controllers/readingListController"

const router: Router = Router()

router.get("/", getReadingListController)
router.post("/enrich", enrichReadingListController)

export default router
