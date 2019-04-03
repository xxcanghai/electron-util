import * as child_process from "child_process";

/**
 * 关机
 * @param {number} wait 等待几秒 单位秒
 */
export function shutdown(wait: number = 10): child_process.ChildProcess {
    return child_process.exec(`shutdown -s -t ${wait}`);
}