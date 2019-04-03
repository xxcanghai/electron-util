import * as child_process from "child_process";
import * as loudness from "loudness";

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