# 随会客户端说明 suimeetinge

使用技术栈：
- 客户端：electron
- 前端：vue
- 脚手架：electron-vue
- 语言：TypeScript
- 构建打包：electron-packager


# 1.开发前准备
因为zoom的限制，必须使用以下版本：
```
node.js: v8.12.0 x86 (32-bit) 
electron: v2.0.7
```

node.js: v8.12.0 x86下载地址：https://nodejs.org/dist/v8.12.0/node-v8.12.0-x86.msi

electron:使用npm下载

建议使用nvm管理node版本，下载地址：https://github.com/coreybutler/nvm-windows/releases/download/1.1.7/nvm-setup.zip

# 2.安装npm依赖包

执行命令：
``` 
npm install
```
部分包可能会下载失败，可使用以下历史文件，下载后解压到项目目录，再执行`npm install`安装额外新增包

https://pan.baidu.com/s/1nZyMnMKVAkoZrVzot1d14A 提取码: d2r8

# 3.开发
执行命令：
``` bash
# 启动开发环境
npm run dev
```

# 4.构建应用
执行命令：
``` bash
# 将在dist目录生成构建后exe应用
npm run build
```

# 5.打包安装包

todo...