const { app, BrowserWindow, shell } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

let server = null;
let mainWindow = null;

function startStaticServer(outDir) {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      try {
        const decodedUrl = decodeURIComponent(req.url.split("?")[0]);
        let safePath = path.normalize(decodedUrl).replace(/^(\.\.[/\\])+/, "");
        if (safePath === "/" || safePath === "\\") {
          safePath = "/index.html";
        }

        let filePath = path.join(outDir, safePath);

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          const htmlCandidate = filePath + ".html";
          if (fs.existsSync(htmlCandidate)) {
            filePath = htmlCandidate;
          } else if (fs.existsSync(path.join(filePath, "index.html"))) {
            filePath = path.join(filePath, "index.html");
          } else {
            filePath = path.join(outDir, "index.html");
          }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Support HTTP Range requests for smooth audio & video seeking
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

          if (start >= fileSize || end >= fileSize) {
            res.writeHead(416, {
              "Content-Range": `bytes */${fileSize}`,
            });
            return res.end();
          }

          const chunkSize = end - start + 1;
          const fileStream = fs.createReadStream(filePath, { start, end });
          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": contentType,
          });
          fileStream.pipe(res);
        } else {
          res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": contentType,
            "Accept-Ranges": "bytes",
          });
          fs.createReadStream(filePath).pipe(res);
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve(port);
    });

    server.on("error", reject);
  });
}

async function createWindow(port) {
  const iconPath = path.join(__dirname, "../public/images/app-icon.ico");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: "HVL - RPT MCK",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: "#080808",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Open external links in user's default browser (e.g. Spotify, Apple Music, YouTube)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const outDir = path.join(__dirname, "../out");

  if (!fs.existsSync(outDir)) {
    console.error("The 'out' directory does not exist. Please run 'next build' first.");
    app.quit();
    return;
  }

  try {
    const port = await startStaticServer(outDir);
    await createWindow(port);
  } catch (error) {
    console.error("Failed to start application:", error);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (server) {
    server.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
