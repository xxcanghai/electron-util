/** 
 * 处理所有统一日志
 * 
 * @date 2018-11-11
 * @author jicanghai
 */

import * as electron from "electron";

/** 日志IPC通道名称 */
const CHANNEL = "async-log";

/** 是否显示日志 */
export const isLog = {
    /** 所有日志 */
    all: true,

    /** zoom通信日志 */
    zoom: true,

    /** win通信日志 */
    win: false,

    /** 服务器socket通信日志 */
    socket: false,
}

/** zoom通信日志 */
export function zoomLog(title: string, ...args: any[]) {
    if (!isLog.zoom) return;
    return systemLog("zoom_" + title, ...args);
}

/** win通信日志 */
export function winLog(title: string, ...args: any[]) {
    if (!isLog.win) return;
    return systemLog("win_" + title, ...args);
}

/** 服务器socket通信日志 */
export function socketLog(title: string, ...args: any[]) {
    if (!isLog.socket) return;
    return systemLog("socket_" + title, ...args);
}

/** 输出系统日志 */
export function systemLog(title: string, argumentsObject: IArguments)
export function systemLog(title: string, ...args: any[])
export function systemLog(title: string, ...args: any[]) {
    if (!isLog.all) return;

    // 判断第二个参数是否为arguments对象
    if (!(args[0] instanceof Array) &&
        (typeof args[0] === "object") &&
        ("callee" in args[0]) && //含有callee属性
        (typeof args[0].length === "number")) { // 有数值型的length属性
        args = Array.prototype.slice.call(args[0]);
    }
    args = args.map(a => {
        return typeof a == "function" ? "<Function>" : a;
    });
    args = [`%c>>[${title}]`, "color:blue;font-weight:bold;"].concat(args);
    return console.log(...args);
}

/** 初始化渲染进程监听主进程发来的日志 */
export function initRenderLogReceive() {
    // 向主进程发送日志通道空消息，告知渲染进程已准备好
    electron.ipcRenderer.send(CHANNEL);

    // 准备接收主进程发来的日志数据
    electron.ipcRenderer.on(CHANNEL, (ipcEvent: Electron.Event, title: string, ...args: any[]) => {
        var logTitle = `%c[M]`;
        var logStyle = ["color:red;"]
        if (title.length>0) {
            logTitle += ` %c>>[${title}]`;
            logStyle.push("color:red;font-weight:bold;");
        }
        args = [logTitle].concat(logStyle).concat(args);
        console.log(...args);
    });
}