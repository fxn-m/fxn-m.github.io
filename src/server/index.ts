import express from "express"
import env from "./config/env"
import { configureMiddleware } from "./middleware"
import { configureRoutes } from "./routes"
import { ensureReadingListFileExists } from "./utils/fileUtils"

const app = express()
const port = env.port

// Configure middleware
configureMiddleware(app)

// Configure routes
configureRoutes(app)

// Start the server
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`)

    try {
        await ensureReadingListFileExists()
        console.log("Reading list file is ready")
    } catch (error) {
        console.error("Error ensuring reading list file exists:", error)
    }
})
