/**
 * tool
 * js基础类库函数，提供通用的处理函数，以及对js的扩展
 * 
 * @date 2016-05-20
 * @author jicanghai
 */

import * as _ from "lodash"
import * as fs from "fs";
import * as request from "request";
import * as electron from "electron";

/**
 * 寄生组合式继承,使得subType继承superType
 * @param {any} subType 子类
 * @param {any} superType 基类
 */
export function inheritParasitic(subType: any, superType: any): any {
    var proto = inheritOriginal(superType.prototype);
    proto.constructor = subType;
    subType.prototype = proto;
    //兼容IE8，手动给prototype添加__proto__值
    if (subType.prototype.__proto__ === undefined) {
        subType.prototype.__proto__ = superType.prototype;
    }
    return subType;
};

/**
 * 原型式继承
 * @param {any} obj
 */
export function inheritOriginal(obj: any): any {
    function F(): void { }
    F.prototype = obj;
    return new F();
};

/**
 * 组合式继承
 * @param {any} subType 子类
 * @param {any} superType 基类
 */
export function inheritCombine(subType: any, superType: any): any {
    subType.prototype = new superType();
    subType.prototype.constructor = subType;
};

/**
 * 根据命名空间获取数据。
 * 例：参数为 {a:{b:3}},"a.b" 可得到3。
 * 数组可用 点数字 来获取。例： {a:[{b:1},{b:2}]},"a.0.b" 可得到1
 * 若obj不为对象或数组则返回null；若没有匹配到指定数据返回undefined
 * @param {Object} obj 要获取数据的源对象
 * @param {string} ns 点分隔命名空间字符串，请用.n代替[n]
 */
export function getDataByNS(obj: Object, ns: string): any {
    var arr: any[] = []
    var result: Object = obj;
    if (!_.isObject(obj) && !_.isArray(obj)) {
        return null;
    }
    if (typeof (ns) !== "string" || ns.length === 0) {
        return obj;
    }
    arr = _.filter(
        ns.replace(/^[\s\.]*|[\s\.]*$|[^\w\. ]/g, "").replace(/\.{2,}/, ".").split("."),
        n => n.length > 0);
    return arr.length == 0 ?
        result :
        getObj(result, arr);

    function getObj(o: Object, ar: any[]) {
        try {
            return o = o[ar[0]], (ar.length <= 1) ? o : (o === undefined || o === null) ? undefined : getObj(o, ar.slice(1));
        } catch (e) {
            return undefined;
        }
    }
};

/**
 * 获取指定函数的函数名称（用于兼容IE）
 * @param {Function} fun 任意函数
 */
export function getFunctionName(fun: Function): string {
    if ((<any>fun).name !== undefined) return (<any>fun).name;
    var ret: string = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
};

/**
 * 从某个可能是函数的值变量中获取值（多用于插件config）
 * @param {Function|any} obj 某个可能是函数或对象的变量
 * @param {Object} fnThis 调用这个函数的this值
 * @param {any[]} argsArr 调用这个函数的参数列表
 */
export function getValueByFnOrArg(obj: Function | any, fnThis?: Object, argsArr?: any[]): any {
    var cellResult: any = null;
    if (!_.isFunction(obj)) return obj;
    cellResult = obj.apply(fnThis, [].slice.call(argsArr));
    return cellResult;
};

/**
 * 用正则表达式实现html转码
 * @param {string = ""} str 要编码的字符串
 */
export function htmlEncode(str: string = ""): string {
    var s: string = "";
    if (str.length == 0) return "";
    s = str.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    return s;
};

/**
 * 用正则表达式实现html解码
 * @param {string = ""} str 要解码的字符串
 */
export function htmlDecode(str: string = ""): string {
    var s: string = "";
    if (str.length == 0) return "";
    s = str.replace(/&amp;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    return s;
};

/**
 * 获得一个任意长度的随机字符串
 * @param {number = 8} count 随机字符串长度，默认长度8
 */
export function getRandomStr(count: number = 8): string {
    var str: string = "";
    for (var i = 0; i < count; i++) {
        str += (Math.random() * 10).toString(36).charAt(parseInt(((Math.random() * 5) + 2).toString()));
    }
    return str;
};

/**
 * 字符串格式化
 * @param {string} str 含格式替换符的字符串
 * @param {any[]} args 要被替换的对象
 */
export function stringFormat(str: string, ...args: any[]): string | null {
    if (arguments.length == 0) {
        return null;
    } else if (args.length == 0) {
        return str;
    }
    for (var i = 0; i < args.length; i++) {
        var re = new RegExp('\\{' + i + '\\}', 'gm');
        str = str.replace(re, args[i]);
    }
    return str;
};

/**
 * 根据布尔值字符串返回布尔值
 * @param {boolean|string} boolStr 可能是布尔值的字符串
 * @param {any} defaultValue 如果不是一个布尔值将返回此值，若此值未设定将抛出异常
 */
export function getBoolByStr(boolStr: boolean | string, defaultValue?: any): boolean | any {
    convert: {
        if (typeof (boolStr) != "boolean" && typeof (boolStr) != "string") {
            break convert;
        }
        var trueStr: string = toStr(true)
        var falseStr: string = toStr(false);
        boolStr = toStr(boolStr);
        var bool = (boolStr === trueStr) ? true :
            ((boolStr === falseStr) ? false : null);
        if (typeof (bool) === "boolean") {
            return bool;
        }
    }
    //bool string Error
    if (arguments.length < 2) {
        throw Error("Bool String Error!");
    } else {
        return defaultValue;
    }
    //object to string
    function toStr(s: any): string {
        try {
            return s.toString().toLowerCase();
        } catch (e) {
            throw Error(e);
        }
    }
};

/**
 * 获取某对象是否为原生DOM对象
 * @param {Element} obj 要检测的对象
 */
export function isDomElement(obj: Element): boolean {
    if (typeof (Element) === "function") {
        return obj instanceof Element;
    } else {
        if (obj.nodeType == undefined) {
            return false;
        } else {
            return obj.nodeType == 1;
        }
    }
};

/**
 * 兼容IE的原生添加事件方法
 * @param {EventTarget} element DOM对象
 * @param {string} eventType 事件名称
 * @param {Function} listener 事件响应函数
 * @param {boolean} useCapture 是否为捕获模式，默认为false
 */
export function addEvent(element: EventTarget, eventType: string, listener: (e?: Event) => any, useCapture: boolean = false) {
    var w3cType: string = eventType.replace(/^on/i, "");
    var ieType: string = "on" + w3cType;
    if (document["addEventListener"] != undefined) {
        element.addEventListener(w3cType, listener, useCapture);
    } else {
        (<any>element).attachEvent(ieType, listener);
    }
}

// /**
//  * 检查当前浏览器是否有Function.prototype.bind函数，如没有则手动实现(兼容IE8)
//  * @returns
//  */
// export function checkFunctionBind(): void {
//     if (typeof (Function.prototype.bind) === "function") return;
//     Function.prototype.bind = function (oThis) {
//         if (typeof this !== 'function') {
//             // closest thing possible to the ECMAScript 5
//             // internal IsCallable function
//             throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
//         }

//         var aArgs = Array.prototype.slice.call(arguments, 1),
//             fToBind = this,
//             fNOP = function () { },
//             fBound = function () {
//                 return fToBind.apply(this instanceof fNOP && oThis
//                     ? this
//                     : oThis,
//                     aArgs.concat(Array.prototype.slice.call(arguments)));
//             };

//         fNOP.prototype = this.prototype;
//         fBound.prototype = new fNOP();

//         return fBound;
//     };
// }

// /**
//  * 将this对象绑定到指定函数的最后一个参数
//  * 通常用于将某插件的实例化对象的this绑定到事件响应函数中
//  * @param {Function} fn 普通事件处理函数
//  * @param {Object} thisobj 当前实例化对象
//  * @returns
//  */
// export function eventBindThis(fn: Function, thisobj: Object): any {
//     if (thisobj === undefined) return fn;
//     return function () {
//         return fn.apply(this, Array.prototype.slice.call(arguments).concat(thisobj));
//     };
// }

/**
 * 获取当前url中的参数列表，返回参数字典对象
 * 
 * @param {string} url 要匹配的url字符串
 * @returns {{ [index: string]: string }} (description)
 */
export function getQueryObject<T = { [index: string]: string }>(url: string): T {
    var search: string = "";
    var obj: T = <T>{};
    var reg: RegExp = /([^?&=]+)=([^?&=]*)/g;

    if (typeof url != "string") throw new Error("url need string");

    //匹配出query部分
    if (url.indexOf("?") >= 0) {
        search = url.substring(url.lastIndexOf("?") + 1);
    } else {
        search = url;
    }

    //过滤掉hash
    if (search.lastIndexOf("#") != -1) {
        search = search.substr(0, search.lastIndexOf("#"));
    }

    //匹配
    search.replace(reg, function (rs, $1, $2) {
        //解码
        var name = decodeURIComponent($1);
        var val = decodeURIComponent($2);
        val = String(val);
        obj[name] = val;
        return rs;
    });

    return obj;
}

/**
 * 获取将指定对象拼接成查询参数字符串（eg:name=value&name2=value2&...）
 * 
 * @export
 * @param {*} queryData 参数对象
 * @returns {string} (description)
 */
export function getQueryString(queryData: any = {}): string {
    var queryArr: { name: string, val: any }[] = [];
    var queryStr: string = "";

    // TODO 应该用$.isPlainObject来判断
    if (typeof queryData !== "object") throw new Error("queryData need Object");

    //遍历读取        
    Object.keys(queryData).forEach(name => {
        if (typeof queryData[name] == "function") return;
        queryArr.push({
            name: name,
            val: queryData[name]
        });
    });

    //拼接
    queryStr = queryArr.map(o => {
        return encodeURIComponent(o.name) + "=" + encodeURIComponent(String(o.val)); //必须编码
    }).join("&");

    return queryStr;
}

/**
 * 获取将指定查询参数对象，hash值拼接成完成url
 * 
 * @export
 * @param {string} path 要拼接的url的path
 * @param {*} queryData 查询参数对象 
 * @param {string} [hash=""] hash值（锚点）
 * @returns {string} (description)
 */
export function getQueryStringUrl(path: string, queryData: any = {}, hash: string = ""): string {
    var queryStr: string = getQueryString(queryData);
    var result: string = "";

    if (typeof hash != "string") throw new Error("hash need string");

    if (queryStr.length > 0) {
        queryStr = "?" + queryStr;
    }

    if (hash.length > 0) {
        hash = "#" + hash;
    }

    result = path + queryStr + hash;
    return result;
}

/**
 * 合并两个URL路径，解决合并过程中斜线（/）符号的问题
 * 
 * @param {string} path1 前一个url路径
 * @param {string} path2 后一个url路径
 * @returns {string} (description)
 */
export function urlCombine(path1: string, path2: string): string {
    if (typeof path1 != "string" || typeof path2 != "string") {
        throw new Error("path need string");
    } else if (path1.length == 0 || path2.length == 0) {
        return path1 + path2;
    }

    //去除前路径末尾及后路径开头的多个斜线
    path1 = path1.replace(/\/+$/g, "/");
    path2 = path2.replace(/^\/+/g, "/");

    var last = path1[path1.length - 1];
    var first = path2[0];
    var result = "";

    if (last == "/" && first == "/") {
        result = path1 + path2.substr(1);
    } else if (last != "/" && first != "/") {
        result = path1 + "/" + path2;
    } else {
        result = path1 + path2;
    }
    return result;
}

/**
 * 对比字符串版本号的大小，返回1则v1大于v2，返回-1则v1小于v2，返回0则v1等于v2
 * 
 * @author github.com/xxcanghai
 * @param {string} v1 要进行比较的版本号1
 * @param {string} v2 要进行比较的版本号2
 * @returns
 */
export function versionCompare(v1: string, v2: string): number {
    var GTR = 1; //大于
    var LSS = -1; //小于
    var EQU = 0; //等于
    var v1arr = String(v1).split(".").map(function (a) {
        return parseInt(a);
    });
    var v2arr = String(v2).split(".").map(function (a) {
        return parseInt(a);
    });
    var arrLen = Math.max(v1arr.length, v2arr.length);
    var result: number = EQU;

    //排除错误调用
    if (v1 == undefined || v2 == undefined) {
        // throw new Error();
        return EQU;
    }

    //检查空字符串，任何非空字符串都大于空字符串
    if (v1.length == 0 && v2.length == 0) {
        return EQU;
    } else if (v1.length == 0) {
        return LSS;
    } else if (v2.length == 0) {
        return GTR;
    }

    //循环比较版本号
    for (var i = 0; i < arrLen; i++) {
        result = xxcanghaiComp(v1arr[i], v2arr[i]);
        if (result == EQU) {
            continue;
        } else {
            break;
        }
    }
    return result;

    function xxcanghaiComp(n1, n2) {
        if (typeof n1 != "number") {
            n1 = 0;
        }
        if (typeof n2 != "number") {
            n2 = 0;
        }
        if (n1 > n2) {
            return GTR;
        } else if (n1 < n2) {
            return LSS;
        } else {
            return EQU;
        }
    }
}

export function downloadFile(url: string, savePath: string, onComplete: () => void): request.Request;
export function downloadFile(option: downloadFileOption): request.Request;
export function downloadFile(optionOrUrl: downloadFileOption | string): request.Request {
    var noop = function () { };
    var option: downloadFileOption = <any>{};
    if (typeof optionOrUrl == "string") {
        option = {
            url: arguments[0],
            savePath: arguments[1],
            onComplete: arguments[2]
        }
    } else if (typeof optionOrUrl == "object") {
        option = optionOrUrl;
    } else {
        throw new Error("downloadFile调用方式不合法");
    }

    if (typeof option.url != "string" || option.url.length == 0) {
        throw new Error("option参数必须包含下载链接url字段");
    }
    if (typeof option.savePath != "string" || option.savePath.length == 0) {
        throw new Error("option参数必须包含保存路径savePath字段");
    }
    /** 默认配置对象 */
    var defOpt: downloadFileOption = {
        url: "",
        savePath: "",
        requestOption: <any>{},
        createWriteStreamOption: {},
        isIgnoreResponseStatusCodeError: false,
        isOpenOnComplete: false,
        onProgress: noop,
        onError: noop,
        onComplete: noop,
    }
    option = _.merge({}, defOpt, option);

    /** 文件写入流 */
    var ws: fs.WriteStream = fs.createWriteStream(option.savePath, option.createWriteStreamOption);
    /** 文件总大小 */
    var fileLength: number = 0;
    /** 已下载大小 */
    var receiveLength: number = 0;
    /** 是否遇到了错误 */
    var hasError: boolean = false;

    var req = request(option.url, option.requestOption)
        // .on("request", function (req: http.ClientRequest) {
        //     console.log("on-request", arguments);// 请求发起时
        // })
        // .on("complete", function (resp: Response, body?: string | Buffer) {
        //     console.log("on-complete", arguments);// 流接收完毕时
        // })
        .on("response", function (resp: request.Response) {
            // 判断响应码，不符合200 即为错误
            if (!option.isIgnoreResponseStatusCodeError && resp.statusCode != 200) {
                if (typeof option.onError == "function") {
                    option.onError(resp, "response");
                    req.abort();
                    deleteFile();
                    hasError = true;
                    return;
                }
            }

            // 获取文件总长度
            var headerItem: string | string[] = resp.headers['content-length'] || "";
            if (<any>headerItem instanceof Array) {
                headerItem = headerItem[0];
            }
            fileLength = parseInt(<any>headerItem, 10) || 0;
        })
        .on("data", function (data: Buffer | string) {
            receiveLength += data.length;
            /** 已下载的百分比 */
            var rate: number = parseFloat(Number(receiveLength / fileLength).toFixed(2));

            // 触发下载进度变更回调
            if (typeof option.onProgress == "function") {
                option.onProgress(rate, receiveLength, fileLength);
            }
        })
        .on("error", function (e: Error) {
            // 网络下载失败
            if (typeof option.onError == "function") {
                option.onError(e, "network");
                hasError = true;
                deleteFile();
                return;
            }
        });

    // 写入文件流
    req.pipe(ws)
        .on("error", function (e: Error) {
            if (typeof option.onError == "function") {
                option.onError(e, "file");
                req.abort();
                hasError = true;
            }
        })
        .on('close', function () {
            if (hasError) {
                // 如果遇到了下载错误，则删除已下载的部分文件或空文件
                deleteFile();
            } else {
                // 触发成功回调函数
                if (typeof option.onComplete == "function") {
                    option.onComplete(ws);
                }
                // 若要打开此文件
                if (option.isOpenOnComplete) {
                    electron.shell.openItem(option.savePath)
                }
            }
        });

    function deleteFile() {
        try {
            ws.close();
            fs.unlinkSync(option.savePath);
        } catch (ex) { }
    }
    return req;
}

/**
 * 下载文件配置对象
 * 
 * @interface downloadFileOption
 */
interface downloadFileOption {
    /**
     * 下载链接地址，必须为完整地址(包含协议、域名等)，不支持相对地址！
     */
    url: string;

    /**
     * 保存完成路径，必须包含文件名。
     * - 可使用完整绝对路径。如 D:\\abc\file.exe
     * - 可省略路径使用相对路径，将保存到以应用程序所在目录的相对路径下。如 file.exe
     */
    savePath: string;

    /**
     * request模块的详细配置对象。
     * - 详见：https://github.com/request/request#requestoptions-callback
     */
    requestOption?: request.CoreOptions;

    /**
     * 创建文件写入流配置对象
     */
    createWriteStreamOption?: string | {
        flags?: string;
        encoding?: string;
        fd?: number;
        mode?: number;
        autoClose?: boolean;
        start?: number;
    };

    /**
     * 忽略响应状态码错误。
     * - 默认为false
     * - 默认情况下，若服务器返回状态码不为200，则认定为发生了错误，自动删除已下载的部分文件或空文件
     * - 通过将此属性设定为true，可强制下载状态码不为200的服务器响应内容
     */
    isIgnoreResponseStatusCodeError?: boolean;

    /**
     * 是否在下载完成后，使用系统默认方式打开文件
     * - 默认为false
     */
    isOpenOnComplete?: boolean;

    /**
     * 下载进度回调函数
     * 
     * @param {number} [rate] 已下载进度，取值为 (0-1)
     * @param {number} [receiveLength] 已下载具体长度
     * @param {number} [fileLength] 完整文件长度
     * @memberof downloadFileOption
     */
    onProgress?(rate?: number, receiveLength?: number, fileLength?: number): void;

    /**
     * 当发生错误时回调函数
     * - 包含下载错误和文件写入错误
     * 
     * @param {*} error 错误对象
     * @param {*} errorType 错误类型，network为网络操作失败，如断网 域名非法等。file为文件操作失败，如无权限等。response为服务器响应码不为200错误
     */
    onError?(error: any, errorType: "network" | "file" | "response"): void;

    /**
     * 下载完成后，文件流关闭后的回调函数
     * 
     * @param {fs.WriteStream} ws 写入流对象
     */
    onComplete?(ws: fs.WriteStream): void;
}