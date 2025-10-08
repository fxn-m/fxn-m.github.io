import { Router } from "express"

import {
  buildBlogController,
  fetchBlogController,
  fetchBlogPostController
} from "../controllers/blogController"

const router: Router = Router()

router.get("/", fetchBlogController)
router.get("/build", buildBlogController)
router.get("/:id", fetchBlogPostController)

export default router
