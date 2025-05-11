import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { createServer } from "http"
import { ollamaRouter } from "./routes/ollama"
import { allhandsRouter } from "./routes/allhands"
import { configRouter } from "./routes/config"

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Routes
app.use("/api/ollama", ollamaRouter)
app.use("/api/allhands", allhandsRouter)
app.use("/api/config", configRouter)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
})

// Create HTTP server
const server = createServer(app)

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})

export default server
