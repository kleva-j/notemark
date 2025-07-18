import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";

import path from "node:path";

// const require = createRequire(import.meta.url);
// import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let window: BrowserWindow | null;

function createWindow() {
  window = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1360,
    height: 840,
    title: "NoteMark",
    center: true,
    vibrancy: "under-window",
    trafficLightPosition: { x: 15, y: 10 },
    titleBarStyle: process.platform === "darwin" ? "hidden" : "default",
    autoHideMenuBar: true,
    frame: false,
    visualEffectState: "active",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      sandbox: true,
      contextIsolation: true,
    },
  });

  // Test active push message to Renderer-process.
  window.webContents.on("did-finish-load", () =>
    window?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    )
  );

  window.webContents.openDevTools();

  if (VITE_DEV_SERVER_URL) {
    window.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    window.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    window = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
