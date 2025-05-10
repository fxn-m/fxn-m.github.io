import { Router } from "express"
import {
  fetchBlogController,
  fetchBlogPostController
} from "../controllers/blogController"

const router: Router = Router()

router.get("/", fetchBlogController)
router.get("/:id", fetchBlogPostController)

export default router
