// Preview markdown files as they will appear on GitHub, rendered by the GitHub
// markdown API and styled with github-markdown-css.
//
// Usage: node scripts/preview-markdown.ts [file.md]
//
// Starts a server bound to localhost (or reuses one that is already running)
// and opens the given file in the default browser. Pages reload automatically
// when a file in the same directory changes.
//
// Requests are authenticated with GITHUB_TOKEN (from the environment or .env).
// Unauthenticated requests are limited to 60 per hour, authenticated requests
// to 5,000 per hour.
//
// A “Local files” toggle (top right, off by default) rewrites raw file URLs
// starting with GITHUB_RAW_URL to this server so commands in guides fetch
// files from the working tree instead of GitHub.

import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { watch } from "node:fs"
import { readFile, stat } from "node:fs/promises"
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

// Variables already set in the environment take precedence over .env
try {
  process.loadEnvFile(join(root, ".env"))
} catch {
  // .env is optional
}

const host = "127.0.0.1"
const port = Number(process.env.PORT ?? 8080)
const token = process.env.GITHUB_TOKEN || undefined

// Prefix of raw file URLs in guides (curl commands), rewritten to this server
// when “Local files” is on so commands fetch files from the working tree
const rawUrl =
  process.env.GITHUB_RAW_URL ||
  "https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/"
const cssPath = join(
  root,
  "node_modules/github-markdown-css/github-markdown.css"
)

// Hostnames the server answers to, other hostnames pointing to 127.0.0.1 (DNS
// rebinding) are refused
const hosts = new Set([`${host}:${port}`, `localhost:${port}`])

const toPathname = (relativePath: string): string =>
  relativePath.split(sep).filter(Boolean).map(encodeURIComponent).join("/")

const file = process.argv[2]
const relativePath = file === undefined ? "" : relative(root, resolve(file))

if (relativePath.startsWith("..")) {
  console.error(`${file} is outside of ${root}`)
  process.exit(1)
}

const url = `http://${host}:${port}/${toPathname(relativePath)}`

// Types needed to display pages, other files are served as downloads
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
}

// Rendered HTML keyed by markdown hash so reloads triggered by unrelated
// changes (or browser refreshes) do not consume API requests
const cache = new Map<string, string>()

// Render markdown to HTML through the GitHub API (the same renderer GitHub
// uses for pages, so the preview matches what readers will see). Every
// response logs the remaining quota and failures are thrown with the API’s
// own message so they can be shown in the page.
const render = async (markdown: string): Promise<string> => {
  const key = createHash("sha256").update(markdown).digest("hex")
  const cached = cache.get(key)
  if (cached !== undefined) {
    return cached
  }
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "sunknudsen/guides preview",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`
  }
  const response = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers,
    body: JSON.stringify({ text: markdown, mode: "gfm" }),
  })
  const remaining = response.headers.get("x-ratelimit-remaining")
  const limit = response.headers.get("x-ratelimit-limit")
  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `GitHub API responded with ${response.status} ${response.statusText} (${remaining}/${limit} requests remaining)\n\n${body}`
    )
  }
  const html = await response.text()
  console.info(`Rendered markdown (${remaining}/${limit} requests remaining)`)
  if (cache.size >= 100) {
    cache.delete(cache.keys().next().value as string)
  }
  cache.set(key, html)
  return html
}

// Escape text for safe insertion into HTML (page title and error messages)
const escape = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

// Script embedded in every page. It adds heading ids, scrolls to the URL
// fragment, rewrites raw file URLs when “Local files” is on and listens for
// change events from the server, swapping the article in place (rather than
// reloading) so the scroll position survives. The page defines rawUrl first.
const client = String.raw`
const article = document.querySelector("article")
const toggle = document.querySelector("button")
const localFiles = () => localStorage.getItem("localFiles") === "on"
// Replace the raw file URL prefix in text (code blocks) and link targets with
// this server’s origin
const rewrite = () => {
  toggle.textContent = "Local files: " + (localFiles() ? "on" : "off")
  if (!localFiles()) {
    return
  }
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    node.nodeValue = node.nodeValue.replaceAll(rawUrl, location.origin + "/")
  }
  for (const link of article.querySelectorAll("a[href]")) {
    if (link.href.startsWith(rawUrl)) {
      link.href = location.origin + "/" + link.href.slice(rawUrl.length)
    }
  }
}
// The API renders headings without ids, GitHub adds them when serving pages.
// Mirror GitHub’s slug rules so in-page links work (browser copy of
// scripts/utilities/slug.ts, keep both in sync).
const anchor = () => {
  const slugs = new Map()
  for (const heading of article.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const slug = heading.textContent
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{Nd}\p{Nl}\p{M}\p{Pc} -]/gu, "")
      .replace(/ /g, "-")
    const count = slugs.get(slug) ?? 0
    slugs.set(slug, count + 1)
    heading.id = count === 0 ? slug : slug + "-" + count
  }
}
const jump = () => {
  const id = decodeURIComponent(location.hash.slice(1))
  if (id !== "") {
    document.getElementById(id)?.scrollIntoView()
  }
}
// Fetch the page again and swap the article in place
const update = async () => {
  const response = await fetch(location.pathname, { headers: { Accept: "text/html" } })
  const document_ = new DOMParser().parseFromString(await response.text(), "text/html")
  article.innerHTML = document_.querySelector("article").innerHTML
  document.title = document_.title
  anchor()
  rewrite()
}
const source = new EventSource(location.pathname + "?events")
source.onmessage = update
toggle.onclick = () => {
  localStorage.setItem("localFiles", localFiles() ? "off" : "on")
  update()
}
addEventListener("hashchange", jump)
anchor()
rewrite()
jump()
`

// HTML shell around rendered markdown, styled like GitHub (light and dark).
// The toggle carries the markdown-body class only so GitHub’s color tokens,
// which the stylesheet scopes to that class, apply to it as well.
const page = (title: string, body: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escape(title)}</title>
<link rel="stylesheet" href="/node_modules/github-markdown-css/github-markdown.css">
<style>
body { margin: 0; }
article.markdown-body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; }
@media (max-width: 767px) { article.markdown-body { padding: 15px; } }
pre.error { white-space: pre-wrap; }
/* Styled like GitHub’s small default button, using the stylesheet’s tokens */
button.markdown-body { position: fixed; top: 8px; right: 8px; padding: 3px 12px; font-size: 12px; font-weight: var(--base-text-weight-medium); line-height: 20px; color: var(--fgColor-default); background-color: var(--bgColor-muted); border: 1px solid var(--borderColor-default); border-radius: 6px; cursor: pointer; }
button.markdown-body:hover { background-color: var(--bgColor-neutral-muted); }
</style>
</head>
<body>
<button type="button" class="markdown-body"></button>
<article class="markdown-body">
${body}
</article>
<script type="module">const rawUrl = ${JSON.stringify(rawUrl)}${client}</script>
</body>
</html>
`

// Map a request path to a file in the repo, or undefined when it must not be
// served… paths escaping the repo and dotfiles (such as .env) are refused
const resolvePath = (pathname: string): string | undefined => {
  const path = resolve(root, `.${decodeURIComponent(pathname)}`)
  const segments = relative(root, path).split(sep)
  if (segments.some((segment) => segment === ".." || segment.startsWith("."))) {
    return undefined
  }
  return path
}

// Keep a server-sent events connection open for a page and notify it when
// anything in the page’s folder changes (the markdown itself or its images).
// Changes are debounced because editors often write a file in several steps.
const serveEvents = (
  req: IncomingMessage,
  res: ServerResponse,
  path: string
): void => {
  res.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  })
  res.write(": connected\n\n")
  let timeout: NodeJS.Timeout | undefined
  const watcher = watch(dirname(path), { persistent: false }, () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => res.write("data: change\n\n"), 100)
  })
  req.on("close", () => {
    clearTimeout(timeout)
    watcher.close()
  })
}

// Serve a markdown file as a rendered page… when rendering fails (rate limit,
// bad token, network) the error is shown in the page instead so the live
// reload keeps working and the next save can succeed
const serveMarkdown = async (
  res: ServerResponse,
  path: string
): Promise<void> => {
  const title = relative(root, path)
  const markdown = await readFile(path, "utf8")
  let status = 200
  let body: string
  try {
    body = await render(markdown)
  } catch (error) {
    status = 502
    body = `<h1>Preview error</h1><pre class="error">${escape(String(error))}</pre>`
    console.error(error)
  }
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" })
  res.end(page(title, body))
}

// Serve any other file from the repo (images referenced by guides mostly).
// The file is read before headers are sent so a read failure can still be
// reported as an error response.
const serveFile = async (res: ServerResponse, path: string): Promise<void> => {
  const content = await readFile(path)
  res.writeHead(200, {
    // Prevent files (such as SVG) from running scripts at the preview origin
    "Content-Security-Policy": "default-src 'none'",
    "Content-Type": contentTypes[extname(path)] ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  })
  res.end(content)
}

// Route a request… refuse foreign hostnames, then serve the stylesheet from
// node_modules, redirect folders to their README.md, render markdown (or open
// its event stream when “?events” is present) and serve everything else as is
const handle = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  if (!hosts.has(req.headers.host ?? "")) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Forbidden")
    return
  }
  const url = new URL(req.url ?? "/", `http://${host}`)
  const path =
    url.pathname === "/node_modules/github-markdown-css/github-markdown.css"
      ? cssPath
      : resolvePath(url.pathname)
  const stats = path ? await stat(path).catch(() => undefined) : undefined
  if (path === undefined || stats === undefined) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Not found")
    return
  }
  if (stats.isDirectory()) {
    const location = `/${toPathname(join(relative(root, path), "README.md"))}`
    res.writeHead(302, { Location: location })
    res.end()
    return
  }
  if (extname(path) === ".md") {
    if (url.searchParams.has("events")) {
      serveEvents(req, res, path)
    } else {
      await serveMarkdown(res, path)
    }
    return
  }
  await serveFile(res, path)
}

// Open the page in the default browser without blocking the server (a missing
// opener is logged rather than fatal)
const openBrowser = (): void => {
  const command = process.platform === "darwin" ? "open" : "xdg-open"
  spawn(command, [url], { detached: true, stdio: "ignore" })
    .on("error", console.error)
    .unref()
}

if (token === undefined) {
  console.warn(
    "GITHUB_TOKEN is not set, requests are limited to 60 per hour (see README.md)"
  )
}

// Unexpected errors become a 500 when headers are still pending, otherwise
// the connection is dropped (writing headers twice would crash the server)
const server = createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error)
    if (res.headersSent) {
      res.destroy()
      return
    }
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Internal server error")
  })
})

// A port already in use means a preview server is running (for example from
// the VS Code task), so only the browser needs opening
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE" && file !== undefined) {
    console.info(`Server already listening on port ${port}, opening ${url}`)
    openBrowser()
    return
  }
  console.error(error)
  process.exit(1)
})

server.listen(port, host, () => {
  console.info(`Server listening on ${url}`)
  if (file !== undefined) {
    openBrowser()
  }
})
