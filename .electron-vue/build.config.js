// 【弃用】


// const path = require('path')

// function log() {
//   console.log.apply(console, ["[electron-packager]"].concat([].slice.call(arguments)));
// }

// /**
//  * `electron-packager` options
//  * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
//  */
// module.exports = {
//   arch: 'ia32', // ia32，x64，armv7l，arm64 （electron >= 1.8.0），mips64el （electron >= 1.8.2-beta.5及），all
//   asar: false, // todo 不使用asar
//   /** 打包源文件夹 */
//   dir: path.join(__dirname, '../'),
//   /** 打包目标文件夹 */
//   out: path.join(__dirname, '../build'),
//   icon: path.join(__dirname, '../src/icon'),
//   ignore: [
//     // /\.gitkeep/,
//     /^\..*/,
//     /^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web|doc|loaders|tool)/,
//     /tsconfig\.json$/,
//     /\.bat$/,
//     /\.DS_Store/,
//     /Thumbs\.db/
//   ],
//   overwrite: true,

//   /** 打包目标平台 */
//   platform: process.env.BUILD_TARGET || 'all',

//   /** 应用的著作权 */
//   appCopyright: "",

//   /** 应用程序名称。默认为package.json的productName或name值。 */
//   // name:"",

//   /** 应用版本号,默认为package.json中的version */
//   // appVersion: packagejson.version,

//   /** 应用程序的构建版本。默认值为appVersion */
//   // buildVersion:"",

//   /** 其他资源文件 */
//   extraResource: [],

//   /** 可执行文件名，不包含.exe */
//   // executableName:"",

//   /** 临时目录，默认为系统临时目录 */
//   // tmpdir:"",

//   // windows程序的元数据信息
//   // win32metadata: {
//   //   CompanyName: "", //（默认为author最近的名字package.json）
//   //   FileDescription: "", //（默认为productName或name距离最近package.json）
//   //   OriginalFilename: "", //（默认为重命名.exe文件）
//   //   ProductName: "", //（默认为productName或name距离最近package.json）
//   //   InternalName: "", //（默认为productName或name距离最近package.json）
//   //   "requested-execution-level": "", //
//   //   "application-manifest": "", //
//   // },

//   // /** 将应用程序目录复制到临时目录后要调用的函数数组 */
//   // afterCopy: [function (buildPath, electronVersion, platform, arch, callback) {
//   //   log("onAfterCopy")
//   // }],

//   // /** 在Electron被提取到临时目录之后要调用的函数数组 */
//   // afterExtract: [function (buildPath, electronVersion, platform, arch, callback) {
//   //   log("onAfterExtract")
//   // }],

//   // /** 在临时目录中运行prune命令后要调用的函数数组 */
//   // afterPrune: [function (buildPath, electronVersion, platform, arch, callback) {
//   //   log("onAfterPrune")
//   // }],

//   err: function () {
//     log("onERROR!!!", arguments)
//   },

//   appPaths: function (paths) {
//     log("onAppPaths", arguments)
//   }
// }