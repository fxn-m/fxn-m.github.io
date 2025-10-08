import {
  buildBlogController,
  fetchBlogController,
  fetchBlogPostController
} from "../controllers/blogController"

import { Router } from "express"

const router: Router = Router()

router.get("/", fetchBlogController)
router.get("/build", buildBlogController)
router.get("/:id", fetchBlogPostController)

export default router
