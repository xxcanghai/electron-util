/** 
 * 处理所有主进程的日志，并将主进程的日志发送到渲染进程
 * 
 * @date 2018-11-14
 * @author jicanghai
 */

import * as electron from 'electron';

/** 日志IPC通道名称 */
const CHANNEL = "async-log";

/** 渲染进程IPC */
const ipcMain = electron.ipcMain

/** 渲染进度主窗口 */
var mainBrowser: electron.BrowserWindow = <any>null;

/** 渲染进程是否准备好 */
var isRenderReady: boolean = false;

/** 渲染进程未准备好时的主进程日志缓存 */
var nullLogArr: any[][] = [];


/** 是否显示日志 */
// 只控制是否发送到渲染进程，所有日志都会在主进程控制台显示
export const isLog = {
    /** 是否显示所有日志 */
    all: true,

    /** 是否显示zoom通信日志 */
    zoom: true,
}

// 等待接收渲染进程发来的消息，来判断渲染进程是否已经准备好
ipcMain.on(CHANNEL, (ipcEvent: electron.IpcMessageEvent, ...args) => {
    // 收到任何日志通信事件，都标明渲染进程已准备好
    isRenderReady = true;
    log("logRender inited!");
})

/**
 * 初始化主进程日志模块
 * @param {electron.BrowserWindow} browserWindow 主窗口BrowserWindow对象（即要发送到的渲染进程窗口）
 */
export function init(browserWindow: electron.BrowserWindow) {
    mainBrowser = browserWindow;
}

/** 普通手打日志 */
export function log(...args: any[]) {
    // 在主进程控制台显示日志
    console.log(...args);

    sendLog("", ...args)
}

/** zoom日志 */
export function zoomLog(title: string, ...args: any[]) {
    // 在主进程控制台显示日志
    console.log(...args);

    if (!isLog.zoom) return;
    sendLog("zoom_" + title, ...args)
}

/** 向渲染进程发送日志数据 */
function sendLog(title: string = "", ...args: any[]) {

    // 判断日志是否发送
    if (!isLog.all) return;

    // 拼接日志类型
    args = [title].concat(args);

    // 如果渲染进程准备好则发送日志
    if (mainBrowser && mainBrowser.webContents && isRenderReady) {
        // 发送历史日志
        if (nullLogArr.length > 0) {
            nullLogArr.forEach((logs: any[]) => {
                // mainBrowser.webContents.send('log', a)
                // mainBrowser.webContents.executeJavaScript(`console.log("${a}")`)
                mainBrowser.webContents.send(CHANNEL, ...logs);
            })
            nullLogArr = [];
        }
        // mainBrowser.webContents.send('log', args)
        // mainBrowser.webContents.executeJavaScript(`console.log("${args}")`)
        mainBrowser.webContents.send(CHANNEL, ...args);
    }
    // 如果渲染进程未准备好，则先写入缓存
    else {
        nullLogArr.push(args);
    }
}