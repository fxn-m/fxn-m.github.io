import fs from "fs"
import path from "path"
import showdown from "showdown"
import { v4 as uuidv4 } from "uuid"

const converter = new showdown.Converter({ metadata: true })
const markdownDir = path.join(__dirname, "../src/markdown") // Source directory for Markdown files
const outputDir = path.join(__dirname, "../public/html") // Output directory for HTML files
const index = []

if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true })
}

fs.mkdirSync(outputDir, { recursive: true })

// Convert each Markdown file to HTML
fs.readdirSync(markdownDir).forEach(async (file) => {
    console.log("Converting", file, "to HTML")
    if (file.endsWith(".md")) {
        const markdown = fs.readFileSync(path.join(markdownDir, file), "utf-8")
        const html = converter.makeHtml(markdown)
        const outputFile = path.join(outputDir, file.replace(".md", ".html"))
        fs.writeFileSync(outputFile, html)

        const { title, date } = converter.getMetadata()

        index.push({
            id: uuidv4(),
            title: file.replace(".md", ""),
            headerTitle: title
                .replace(".md", "")
                .replace(/\s+/g, "-")
                .replace(/[^a-zA-Z0-9-]/g, "")
                .toLowerCase(),
            date: date
        })
    }
})

fs.writeFileSync(path.join(outputDir, "index.json"), JSON.stringify(index, null, 2))
