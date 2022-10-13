import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";

import {ERendererCustomEvents, EMainCustomEvents} from "./typings/custom-events";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const currentDocument = {
  path: null as string,
  title: "",
};

let mainWindow: BrowserWindow;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#050a18",
    titleBarStyle: "hidden",
    minHeight: 400,
    minWidth: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on(ERendererCustomEvents.SAVE_DOCUMENT, (_, args) => {
  if (currentDocument.path === null) {
    dialog
      .showSaveDialog(mainWindow, {
        filters: [{ name: "text files", extensions: ["txt"] }],
      })
      .then(({ filePath }) => {
        currentDocument.path = filePath;
        currentDocument.title = path.parse(filePath).base;
        mainWindow.webContents.send(EMainCustomEvents.DOCUMENT_SAVED, {
          title: currentDocument.title,
        });
        fs.writeFile(filePath, args.inputText, error => {
          console.log(error);
        });
      });
  } else {
    mainWindow.webContents.send(EMainCustomEvents.DOCUMENT_SAVED, {
      title: currentDocument.title,
    });
    console.log(currentDocument.path);
    fs.writeFile(currentDocument.path, args.inputText, error => {
      console.log(error);
    });
  }
});

ipcMain.on(ERendererCustomEvents.OPEN_DOCUMENT, () => {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [{ name: "text files", extensions: ["txt"] }],
    })
    .then(({ filePaths }) => {
      fs.readFile(filePaths[0], "utf8", (error, documentText) => {
        currentDocument.path = filePaths[0];
        currentDocument.title = path.parse(filePaths[0]).base;
        mainWindow.webContents.send(EMainCustomEvents.DOCUMENT_OPENED, {
          text: documentText,
          title: currentDocument.title,
        });
      });
    });
});

ipcMain.on(ERendererCustomEvents.CREATE_NEW_DOCUMENT, () => {
  currentDocument.path = null;
  currentDocument.title = "";
  mainWindow.webContents.send(EMainCustomEvents.NEW_DOCUMENT_CREATED);
});

ipcMain.on(ERendererCustomEvents.CLOSE_APPLICATION, () => {
  app.quit();
});
