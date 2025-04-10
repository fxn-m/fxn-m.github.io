import { Router } from "express"
import { fetchBlogController, fetchBlogPostController } from "../controllers/blogController"

const router: Router = Router()

router.get("/blog", fetchBlogController)
router.get("/blog/:id", fetchBlogPostController)

export default router
