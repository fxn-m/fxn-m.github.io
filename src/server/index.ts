import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const port = process.env.PORT || 3000
const protocol = process.env.PROTOCOL || "https"
const domain = process.env.DOMAIN || "fxn-m.com"

const origin = `${protocol}://${domain}${domain === "localhost" ? `:5173` : ""}`

import type { Request, Response } from "express"
import { getReadingList } from "./utils/getReadingList"
import { sendMail } from "./utils/mailgun"

import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const writeReadingList = async () => {
    const readingList = await getReadingList()
    const filePath = path.join(__dirname, "readingList.json")
    fs.writeFileSync(filePath, JSON.stringify(readingList, null, 2))
}

const app = express()
app.use(express.json())
app.use(
    cors({
        origin: origin,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true // Allow cookies, if needed
    })
)

app.post("/send-email", (req: Request, res: Response) => {
    const { name, email, message } = req.body

    sendMail(name, email, message, function (err: Error, data: any) {
        if (err) {
            console.log(err)
            res.status(500).json({ message: "Internal Error" })
        } else {
            res.status(200).json({ message: "Email sent!!!" })
        }
    })
})

app.get("/get-reading-list", (_: Request, res: Response) => {
    const filePath = path.join(__dirname, "readingList.json")
    const readingList = fs.readFileSync(filePath, "utf8")
    res.status(200).json(JSON.parse(readingList))
})

app.post("/mark-read/:id", (req: any, res: any) => {
    const secret = req.body.secret
    const id = req.params.id

    if (secret !== process.env.README_SECRET) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    return res.status(200).json({ message: id + " marked as read" })
})

const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const SPOTIFY_CURRENT_TRACK_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"

async function getSpotifyAccessToken() {
    const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!
        })
    })

    if (!response.ok) {
        throw new Error("Failed to refresh Spotify access token")
    }

    const data = (await response.json()) as any
    return data.access_token
}

async function getCurrentPlayingTrack(token: string) {
    const response = await fetch(SPOTIFY_CURRENT_TRACK_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error("Failed to fetch current track")
    }

    const data = (await response.json()) as any
    return data.item // Currently playing track
}

app.get("/spotify/current-track", async (_: any, res: any) => {
    console.log("Fetching current song...")
    try {
        const accessToken = await getSpotifyAccessToken()
        const currentTrack = await getCurrentPlayingTrack(accessToken)

        if (!currentTrack) {
            return res.status(200).json({ message: "No song currently playing" })
        }

        res.status(200).json({
            externalUrl: currentTrack.external_urls.spotify,
            name: currentTrack.name,
            artist: currentTrack.artists.map((a: any) => a.name).join(", "),
            album: currentTrack.album.name,
            cover: currentTrack.album.images[0]?.url
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch current song" })
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    if (!fs.existsSync(path.join(__dirname, "readingList.json"))) {
        writeReadingList()
    }
    console.log("Reading list written to file")
})
