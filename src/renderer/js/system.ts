import * as child_process from "child_process";
import * as loudness from "loudness";
import * as ws from "windows-shortcuts";
import * as path from "path";
import * as fsExt from "fs-extra-promise";
import * as packageJson from "../../../package.json";

const STARTUP_PATH = path.join(process.env["APPDATA"] || "", "/Microsoft/Windows/Start Menu/Programs/Startup");

/**
 * 关机
 * @param {number} wait 等待几秒 单位秒
 */
export function shutdown(wait: number = 10): child_process.ChildProcess {
    return child_process.exec(`shutdown -s -t ${wait}`);
}

/** 获取当前是否静音 */
export function auidoGetMuted(): Promise<boolean> {
    return loudness.getMuted();
}

/** 获取当前音量值 */
export function auidoGetVolume(): Promise<number> {
    return loudness.getVolume();
}

/** 设置是否静音 */
export function auidoSetMuted(muted: boolean): Promise<void> {
    return loudness.setMuted(muted);
}

/** 设置音量值 */
export function auidoSetVolume(volume: number): Promise<void> {
    return loudness.setVolume(volume);
}

/** 设置开启自启动，成功返回true，失败返回false，无需catch */
export async function setAutoRun(): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
        var exePath = process.execPath;
        // var exeName=exePath.match(/\\([^\\]+)\.exe/)[1]||"";
        var exeName = packageJson.appchname;
        ws.create(path.join(STARTUP_PATH, `${exeName}.lnk`), exePath, (error: string | null) => {
            if (error) {
                console.error(error);
                res(false);
            } else {
                res(true);
            }
        });
    })
}

/** 取消开启自启动 */
export async function cancelAutoRun() {
    var exeName = packageJson.appchname;
    if (await getIsAutoRun()) {
        return await fsExt.unlinkAsync(path.join(STARTUP_PATH, `${exeName}.lnk`))
    }
}

/** 获取当前是否是开启自启动 */
export async function getIsAutoRun(): Promise<boolean> {
    var exeName = packageJson.appchname;
    var files: string[] = await fsExt.readdirAsync(STARTUP_PATH);
    return files.filter(f => f == `${exeName}.lnk`).length > 0;
}