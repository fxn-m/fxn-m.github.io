import { Router } from "express"
import { notionWebhookController } from "../controllers/notionController"

const router: Router = Router()

router.post("/webhooks", notionWebhookController)

export default router
