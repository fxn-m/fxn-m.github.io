import { Router } from "express"
import { sendEmailController } from "../controllers/mailController"

const router: Router = Router()

router.post("/send-email", sendEmailController)

export default router
