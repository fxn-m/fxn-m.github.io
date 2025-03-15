import express from "express"
import cors from "cors"
import type { Express } from "express"

export const configureMiddleware = (app: Express): void => {
  app.use(express.json())
  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true // Allow cookies, if needed
    })
  )
}