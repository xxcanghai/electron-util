process.env.NODE_ENV = 'production'

const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const gulp = require("gulp");
const gutil = require("gulp-util");
const iconv = require("iconv-lite");
const rimraf = require("rimraf");
const runSequence = require("run-sequence");
const del = require("del");
const fsExtra = require("fs-extra-promise");
const moment = require("moment");
const _ = require("lodash");
const packageJson = require("./package.json");
const packager = require('electron-packager')
const webpack = require('webpack')
const Multispinner = require('multispinner')
const say = require('cfonts').say;
const chalk = require('chalk')
const jsonFormat = require("json-format");
const mainConfig = require('./.electron-vue/webpack.main.config');
const rendererConfig = require('./.electron-vue/webpack.renderer.config');


const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

/** 环境变量列表 */
const envList = ["prod", "dev", "test"];
const appEnvFileName = "app_env.config"
const buildDir = path.join(__dirname, './build')
const iconPath = path.join(__dirname, './src/icon.ico')
// const configjson = require('./urlConfig.js');
/** 整体构建变量集合，也用于替换封装安装包脚本（.iss文件）变量 */
var app = createApp("prod");
// console.log(app);

/**
 * 创建构建变量集合
 */
function createApp(envName) {
    return {
        /** 应用英文名称 */
        MyAppName: packageJson.appname,
        /** 应用中文名称 */
        MyAppChName: packageJson.appchname,
        /** 应用内部产品名称 */
        MyAppProductName: packageJson.name,
        /** 应用目录 */
        MyAppPath: path.join(__dirname),
        /** 应用版本 */
        MyAppVersion: packageJson.appversion,
        /** 目标平台 */
        MyAppPlatform: "win32",
        MyAppArch: "ia32",
        /** 当前日期 （YYYY-MM-DD HH:mm:ss "2017-09-21 20:17:53"） */
        MyAppBuildDate: moment().format("YYYYMMDD"),
        /** 最终打包生成的安装包文件名 */
        MyOutputFilename: `${packageJson.appname}_${envName}_${packageJson.appversion}_${moment().format("YYYYMMDD")}`,
        /** 应用环境，默认prod线上环境 */
        MyAppEnv: envName,
        /** 应用发布者，公司名称 */
        MyAppPublisher: packageJson.apppublisher,
        // MyAppNodeEnv: "{{--data.nodeEnv--}}"

        /** 签名工具路径 */
        MySignToolPath: path.join(__dirname, "./sign/signtool/x86/signtool.exe"),
        /** 证书文件路径 */
        MyPfxPath: path.join(__dirname, "./sign/cert/wdj.p12"),
        /** 证书密码 */
        MyPfxPwd: "weidijia!@#$zxcv",
        /** 应用程序icon */
        MyAppicon: iconPath,
    };
}
    
envList.forEach(env => {
    // // 修改app变量任务
    // gulp.task("createApp:" + env, cb => {
    //     app = createApp(env);
    //     cb();
    // });

    // webpack编译，生成到dist目录
    gulp.task("dist:" + env, cb => {
        app = createApp(env);
        greeting()

        del.sync(['dist/electron/*', '!.gitkeep'])

        const tasks = ['main', 'renderer']
        const m = new Multispinner(tasks, {
            preText: 'building',
            postText: 'process'
        })

        let results = ''

        m.on('success', () => {
            process.stdout.write('\x1B[2J\x1B[0f')
            console.log(`\n\n${results}`)
            cb()
        })

        // webpack编译主进程
        pack(mainConfig).then(result => {
            results += result + '\n\n'
            m.success('main')
        }).catch(err => {
            m.error('main')
            console.log(`\n  ${errorLog}failed to build main process`)
            console.error(`\n${err}\n`)
            process.exit(1)
        })

        // webpack编译渲染进程
        pack(rendererConfig).then(result => {
            results += result + '\n\n'
            m.success('renderer')
        }).catch(err => {
            m.error('renderer')
            console.log(`\n  ${errorLog}failed to build renderer process`)
            console.error(`\n${err}\n`)
            process.exit(1)
        })
    });

    // 打包项目，生成exe文件，生成到build目录
    gulp.task("pack:" + env, cb => {
        app = createApp(env);
        // 默认输出目录：<out>/<name>-<platform>-<arch>
        /**
         * `electron-packager` options
         * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
         */
        var config = {
            arch: app.MyAppArch, // ia32，x64，armv7l，arm64 （electron >= 1.8.0），mips64el （electron >= 1.8.2-beta.5及），all
            asar: false, // 不能使用asar，会导致加载zoom文件失败
            /** 打包源文件夹 */
            dir: path.join(__dirname, './'),
            /** 打包目标文件夹 */
            out: buildDir,
            icon: iconPath,
            ignore: [
                // /\.gitkeep/,
                /^\..*/,
                /^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web|doc|loaders|tool|tsdist|sign|setup)/,
                /tsconfig\.json$/,
                /\.bat$/,
                /\.DS_Store/,
                /Thumbs\.db/,
                /gulpfile\.js/,
                /\.old$/
            ],
            overwrite: true,

            // /** Electron的版本 */
            // electronVersion: "1.4.13",

            /** 打包目标平台 */
            platform: app.MyAppPlatform,

            /** 应用的著作权 */
            appCopyright: "",

            /** 应用程序名称。默认为package.json的productName或name值。 */
            name: packageJson.appname,

            /** 应用版本号,默认为package.json中的version */
            appVersion: packageJson.appversion,

            /** 应用程序的构建版本。默认值为appVersion */
            // buildVersion:"",

            /** 其他资源文件 */
            extraResource: [],

            /** 可执行文件名，不包含.exe */
            executableName: packageJson.appname,

            /** 临时目录，默认为系统临时目录 */
            // tmpdir:"",

            // windows程序的元数据信息
            // win32metadata: {
            //   CompanyName: "", //（默认为author最近的名字package.json）
            //   FileDescription: "", //（默认为productName或name距离最近package.json）
            //   OriginalFilename: "", //（默认为重命名.exe文件）
            //   ProductName: "", //（默认为productName或name距离最近package.json）
            //   InternalName: "", //（默认为productName或name距离最近package.json）
            //   "requested-execution-level": "", //
            //   "application-manifest": "", //
            // },

            // /** 将应用程序目录复制到临时目录后要调用的函数数组 */
            // afterCopy: [function (buildPath, electronVersion, platform, arch, callback) {
            //   log("onAfterCopy")
            // }],

            // /** 在Electron被提取到临时目录之后要调用的函数数组 */
            // afterExtract: [function (buildPath, electronVersion, platform, arch, callback) {
            //   log("onAfterExtract")
            // }],

            // /** 在临时目录中运行prune命令后要调用的函数数组 */
            // afterPrune: [function (buildPath, electronVersion, platform, arch, callback) {
            //   log("onAfterPrune")
            // }],

            err: function () {
                log("onERROR!!!", arguments)
            },

            appPaths: function (paths) {
                log("onAppPaths", arguments)
            }
        }

        del.sync(['build/*']);
        packager(config).then(appPaths => {
            var packDir = path.join(buildDir, `${app.MyAppName}-${app.MyAppPlatform}-${app.MyAppArch}`)

            // 复制图标文件到软件根目录
            var iconDstPath = path.join(packDir, "icon.ico");
            fsExtra.copySync(iconPath, iconDstPath);

            var configSrcPath = path.join(packDir, "smconfigurl.json");
            // 开发环境配置文件地址
            var devconfigSrcPath = path.join(packDir, "resources/app/smconfig.json");
            var devconfigSrcPathUrl = path.join(packDir, "resources/app/smconfigurl.json");
            // fsExtra.copySync(configSrcPath, configDstPath);
            // 移除开发环境配置文件
            fsExtra.removeSync(devconfigSrcPath);
            fsExtra.removeSync(devconfigSrcPathUrl);

            // // 根据环境写入接口地址配置文件
            // var extConfigMap = configjson.extConfigMap;
            // // 写入配置对象到文件
            // fsExtra.writeFileSync(configSrcPath, jsonFormat(extConfigMap[env]));

            // 创建环境标识文件
            if (app.MyAppEnv !== "prod") {
                var appEnvPath = path.join(packDir, appEnvFileName);
                fsExtra.writeFileSync(appEnvPath, app.MyAppEnv);
            }
            // C:\ProgramData\Package Cache\{f65db027-aff3-4070-886a-0d87064aabb1}\vcredist_x86.exe,0   DisplayIcon
            cb();
        }).catch(err => {
            log(err + '\n')
        });

        function log() {
            console.log.apply(console, ["[electron-packager]"].concat([].slice.call(arguments)));
        }
    });

    // 封装安装包任务。将编译后的.exe文件目录封装成安装包
    gulp.task("setup:" + env, cb => {
        app = createApp(env);

        // 读取安装包ISS脚本模板
        let tpl = iconv.decode(fs.readFileSync(path.join(__dirname, "./setup/setup.iss")), "gbk");
        // 渲染模板，生成最终执行脚本
        Object.keys(app).forEach(key => {
            tpl = tpl.replace(new RegExp("{{" + key + "}}", "g"), app[key]);
        });
        //----【DEV】-----

        // //去除签名以及压缩，提高测试封装安装包脚本效率
        // tpl = tpl
        //     .replace(/^SignTool=.*$/gm, "")
        //     .replace(/^SignToolRetryCount=.*$/gm, "")
        //     .replace(/Compression=lzma/, "Compression=none");

        //-----【DEV】-----

        var issPath = path.join(buildDir, "setup.iss");
        fs.writeFileSync(issPath, iconv.encode(tpl, "gbk"));
        // gutil.log("[setup.iss]", "-------------------↓InnoSetup脚本内容↓------------------------");
        // gutil.log("[setup.iss]", tpl);
        // gutil.log("[setup.iss]", "-------------------↑InnoSetup脚本内容↑------------------------");
        // run('"setup\\Inno Setup 5\\Iscc.exe"', ['.\\dist\\setup.iss'], { shell: true, cwd: __dirname })

        // 复制inno辅助工具DLL文件到dist目录
        // fsExtra.copy(path.join(__dirname, "./setup/InnoHelp.dll"),path.join(distDir, "InnoHelp.dll"));

        run('"setup\\Inno Setup 5\\Iscc.exe"', [
            `/Smysign="${app.MySignToolPath} $p"`, // 定义签名工具
            path.join(buildDir, "setup.iss") // 定义执行的ISS脚本路径
        ], {
                shell: true,
                cwd: __dirname
            })
            .then(() => {
                cb();
            }).catch((err) => {
                cb(err);
            });
    });

    // // 完整构建任务
    // gulp.task("build:" + env, cb => runSequence("dist:" + env, "pack:" + env, "setup:" + env, err => {
    //     if (err) {
    //         gutil.log(`[full-log]`, "完整构建过程中出现错误而中止！请检查输出日志！");
    //     } else {
    //         gutil.log(`[full-log]`, "完整构建全部完成！");
    //     }
    //     cb();
    // }));

    // 完整构建任务
    gulp.task("build:" + env, cb => runSequence("dist:" + env, "pack:" + env, err => {
        if (err) {
            gutil.log(`[full-log]`, "完整构建过程中出现错误而中止！请检查输出日志！");
        } else {
            gutil.log(`[full-log]`, "完整构建全部完成！");
        }
        cb();
    }));
});

// 默认不加环境的任务为均为线上环境
gulp.task("dist", cb => runSequence("dist:prod", cb));
gulp.task("pack", cb => runSequence("pack:prod", cb));
gulp.task("setup", cb => runSequence("setup:prod", cb));
gulp.task("build", cb => runSequence("build:prod", cb));

// 默认任务为 完整构建线上环境包
gulp.task("default", cb => runSequence("build:prod", cb));

/**
 * 执行命令
 *
 * @param {string} command 命令
 * @param {string[]} [args] 参数数组
 * @param {child_process.SpawnOptions} [options] 选项
 * @returns
 */
function run(command, args, options) {
    return new Promise(function (resolve, reject) {
        var output = child_process.spawn(command, args, options);
        output.stdout.on('data', function (data) {
            var out = iconv.decode(data, "gbk");
            process.stdout.write(out);
            // gutil.log("[run-log]", out);
        });
        output.stderr.on('data', function (data) {
            var err = iconv.decode(data, "gbk");
            process.stderr.write(err);
            // gutil.log("[run-err]", err);
        });
        output.on('error', function (err) {
            reject(err);
        });
        output.on('close', function (code, signal) {
            if (code == 0) {
                resolve();
            } else {
                reject("错误退出码! code:" + code + " signal:" + signal);
            }
        });
    });
}

function removeDir(dir) {
    return new Promise(function (resolve, reject) {
        rimraf(dir, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function greeting() {
    const cols = process.stdout.columns
    let text = ''

    if (cols > 85) text = 'lets-build'
    else if (cols > 60) text = 'lets-|build'
    else text = false

    if (text && !isCI) {
        say(text, {
            colors: ['yellow'],
            font: 'simple3d',
            space: false
        })
    } else console.log(chalk.yellow.bold('\n  lets-build'))
    console.log()
}

function pack(config) {
    return new Promise((resolve, reject) => {
        config.mode = 'production'
        webpack(config, (err, stats) => {
            if (err) reject(err.stack || err)
            else if (stats.hasErrors()) {
                let err = ''

                stats.toString({
                    chunks: false,
                    colors: true
                })
                    .split(/\r?\n/)
                    .forEach(line => {
                        err += `    ${line}\n`
                    })

                reject(err)
            } else {
                resolve(stats.toString({
                    chunks: false,
                    colors: true
                }))
            }
        })
    })
}