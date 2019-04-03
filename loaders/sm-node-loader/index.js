var path = require("path");

module.exports = function (content) {
  const defaultConfig = {
    rewritePath: ""
  };

  const config = Object.assign(defaultConfig, this.query);
  const fileName = path.basename(this.resourcePath);

  // return (
  //   "const path = require('path');" +
  //   "const filePath = path.resolve(__dirname, " +
  //   JSON.stringify(fileName) +
  //   ");" +
  //   "try { global.process.dlopen(module, filePath); } " +
  //   "catch(exception) { throw new Error('Cannot open ' + filePath + ': ' + exception); };"
  // );


  // console.log("[sm-node-loader],webpack模式：",this._compiler.options.mode)

  if (this._compiler.options.mode == "production") {
    // 编译阶段，node文件使用相对路径
    return (
      "const path = require('path');" +
      "const filePath = path.resolve(path.join(__dirname, " +
      JSON.stringify(path.join(defaultConfig.rewritePath, fileName)) +
      "));" +
      "try { global.process.dlopen(module, filePath); } " +
      "catch(exception) { throw new Error('Cannot open ' + filePath + '-' + __dirname + ': ' + exception); };"
    );
  } else {
    // 开发阶段，node文件直接引用本机实际绝对路径
    return (
      "const path = require('path');" +
      "const filePath = " + JSON.stringify(this.resourcePath) + ";" +
      "try { global.process.dlopen(module, filePath); } " +
      "catch(exception) { throw new Error('Cannot open ' + filePath + '-' + __dirname + ': ' + exception); };"
    );
  }


  // 最终生成代码：
  // const filePath = path.resolve(path.join(__dirname, "lib/node_modules/zoomsdk/build/Release/zoomsdk.node"));

  //                                                                          lib/node_modules/zoomsdk/build/Release/zoomsdk.node
  // Y:\WebSite\waibao\suimeetinge\src\lib\node_modules\zoomsdk\build\Release\lib\node_modules\zoomsdk\build\Release\zoomsdk.node
};

module.exports.raw = true;