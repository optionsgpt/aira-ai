import express from "express"
import fs from "fs"
import path from "path"

const router = express.Router()
const CONFIG_FILE = path.join(process.cwd(), "config.json")

// Default configuration
const DEFAULT_CONFIG = {
  ollama: {
    apiHost: "http://localhost:11434",
    defaultModel: "llama3",
  },
  allhands: {
    apiUrl: "https://api.allhands.ai",
    defaultModel: "default",
  },
  preferredBackend: "ollama", // 'ollama' or 'allhands'
  features: {
    fileAttachments: true,
    codeExecution: true,
    projectExplorer: true,
  },
}

// Helper function to read config
const readConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, "utf8")
      return JSON.parse(configData)
    }
    return DEFAULT_CONFIG
  } catch (error) {
    console.error("Error reading config:", error)
    return DEFAULT_CONFIG
  }
}

// Helper function to write config
const writeConfig = (config: any) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error("Error writing config:", error)
    return false
  }
}

// Get current configuration
router.get("/", (req, res) => {
  const config = readConfig()

  // Remove sensitive information
  const safeConfig = { ...config }
  if (safeConfig.allhands && safeConfig.allhands.apiKey) {
    safeConfig.allhands.apiKey = "********"
  }

  res.json(safeConfig)
})

// Update configuration
router.post("/", (req, res) => {
  try {
    const newConfig = req.body
    const currentConfig = readConfig()

    // Merge configs
    const mergedConfig = {
      ...currentConfig,
      ...newConfig,
      ollama: { ...currentConfig.ollama, ...newConfig.ollama },
      allhands: { ...currentConfig.allhands, ...newConfig.allhands },
      features: { ...currentConfig.features, ...newConfig.features },
    }

    // Update environment variables
    if (newConfig.ollama?.apiHost) {
      process.env.OLLAMA_API_HOST = newConfig.ollama.apiHost
    }

    if (newConfig.ollama?.defaultModel) {
      process.env.OLLAMA_MODEL = newConfig.ollama.defaultModel
    }

    if (newConfig.allhands?.apiKey) {
      process.env.ALLHANDS_API_KEY = newConfig.allhands.apiKey
    }

    if (newConfig.allhands?.apiUrl) {
      process.env.ALLHANDS_API_URL = newConfig.allhands.apiUrl
    }

    // Save config
    const success = writeConfig(mergedConfig)

    if (success) {
      res.json({ success: true, config: mergedConfig })
    } else {
      res.status(500).json({ error: "Failed to save configuration" })
    }
  } catch (error) {
    console.error("Error updating config:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update configuration",
    })
  }
})

export const configRouter = router
