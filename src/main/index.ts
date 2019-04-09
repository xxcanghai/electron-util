import * as electron from 'electron'
import * as logMain from "./logMain";
import * as packageJsonFile from "../../package.json";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    (<any>global).__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

/** 主加载URL */
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;

/** 主窗口对象 */
var mainWindow: Electron.BrowserWindow;

/** 弹出窗口对象 */
var popWindow: Electron.BrowserWindow;

/** 托盘图标 */
var tray: electron.Tray;

const app = electron.app;

const log = logMain.log;

/** 创建主窗口 */
function createMainWindow() {
    log("app ready!", new Date().toLocaleTimeString());

    /**
     * Initial window options
     */
    mainWindow = new electron.BrowserWindow({
        // 主界面大小
        // height: 580,
        // width: 900,
        // useContentSize: true,
        resizable: true,
        // frame: false,
        // center: true,
        title: packageJsonFile.appchname,
        // transparent: true,
        webPreferences: {
            plugins: true,
            webSecurity: false
        }
    })
    logMain.init(mainWindow);
    mainWindow.loadURL(winURL);
    mainWindow.on('closed', () => {
        mainWindow = <any>null;
    })
    // mainWindow.webContents.openDevTools();
    mainWindow["winName"] = "main";

}

/** 向global中植入全局对象 */
function setGlobal() {
    global["mainWindow"] = mainWindow;
    global["popWindow"] = popWindow;
}


app.on('ready', () => {
    createMainWindow();
    setGlobal();
})


app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow()
    }
})

app.on("quit", (event, exitCode) => {
    app.exit();
})


//点击任务栏右键关闭 事件触发顺序：window-all-closed》before-quit》will-quit》quit
//执行app.quit事件触发顺序：before-quit》window-all-closed》before-quit》will-quit》quit
//执行app.exit事件触发顺序：quit

// app.on("before-quit", (e) => {
//     electron.dialog.showErrorBox("before-quit", "");
// })

// app.on("will-quit", (e) => {
//     electron.dialog.showErrorBox("will-quit", "");
// })

// app.on("quit", (e) => {
//     electron.dialog.showErrorBox("quit", "");
// })

// app.on("window-all-closed", () => {
//     electron.dialog.showErrorBox("window-all-closed", "");
// })



/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */