import { Router } from "express"
import { sendEmailController } from "../controllers/mailController"

const router: Router = Router()

router.post("/send", sendEmailController)

export default router
