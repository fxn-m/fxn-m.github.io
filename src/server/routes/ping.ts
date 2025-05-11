import { Router } from "express"

const router: Router = Router()

router.get("/", (_, res) => {
  res.status(200).json({ message: "pong" })
})

export default router
