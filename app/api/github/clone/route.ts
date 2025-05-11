import { type NextRequest, NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    // Parse GitHub URL to extract owner and repo
    const urlParts = repoUrl.replace(/\/$/, "").split("/")
    const owner = urlParts[urlParts.length - 2]
    const repo = urlParts[urlParts.length - 1]

    if (!owner || !repo) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    // Initialize Octokit (without auth for public repos)
    const octokit = new Octokit()

    // Get repository contents
    const files = await fetchRepositoryContents(octokit, owner, repo)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error cloning repository:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clone repository" },
      { status: 500 },
    )
  }
}

async function fetchRepositoryContents(octokit: Octokit, owner: string, repo: string, path = "") {
  const files: any[] = []

  try {
    // Get contents of the current path
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })

    // Process each item
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === "file") {
          // Skip large files and binary files
          if (shouldSkipFile(item.name, item.size)) {
            continue
          }

          try {
            // Get file content
            const fileResponse = await octokit.repos.getContent({
              owner,
              repo,
              path: item.path,
              mediaType: {
                format: "raw",
              },
            })

            // Add file to the list
            const content =
              typeof fileResponse.data === "string" ? fileResponse.data : JSON.stringify(fileResponse.data, null, 2)

            files.push({
              path: item.path,
              content,
              type: getFileType(item.name),
            })
          } catch (error) {
            console.error(`Error fetching file ${item.path}:`, error)
          }
        } else if (item.type === "dir") {
          // Recursively fetch directory contents
          const dirFiles = await fetchRepositoryContents(octokit, owner, repo, item.path)
          files.push(...dirFiles)
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching contents for ${path}:`, error)
  }

  return files
}

function shouldSkipFile(filename: string, size: number) {
  // Skip files larger than 1MB
  if (size > 1024 * 1024) {
    return true
  }

  // Skip binary files and other non-text files
  const binaryExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".ico",
    ".svg",
    ".webp",
    ".mp3",
    ".mp4",
    ".wav",
    ".ogg",
    ".avi",
    ".mov",
    ".webm",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".rar",
    ".tar",
    ".gz",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".pyc",
    ".class",
    ".o",
    ".obj",
  ]

  return binaryExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

function getFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || ""

  // Map extensions to types
  const extensionMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    md: "markdown",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rb: "ruby",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    xml: "xml",
    svg: "svg",
    sql: "sql",
    graphql: "graphql",
    prisma: "prisma",
  }

  return extensionMap[extension] || "text"
}
