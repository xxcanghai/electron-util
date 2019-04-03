import * as logRender from "./js/logRender";
import Vue, { ComponentOptions } from 'vue'
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
import './style/element-variables.scss';
import vueElectron from 'vue-electron';
import * as electron from "electron";

import App from './App.vue'
import { newRouter } from './router'
import store from './store'
import * as fsExt from "fs-extra-promise";
import * as path from "path";

main();
async function main() {

  // console.log("main.ts")

  // 初始化渲染进程监听主进程发来的日志
  logRender.initRenderLogReceive();

  // 增加快捷键，F12均可打开控制台
  window.addEventListener("keydown", e => {
    // F2:113
    // F12:123
    if (e.keyCode == 123) {
      electron.remote.getCurrentWebContents().openDevTools({ mode: "detach" });
    }
  }, true);


  if (!process.env.IS_WEB) {
    Vue.use(vueElectron);
  }

  Vue.config.productionTip = false;
  Vue.use(ElementUI);

  /** 植入全局变量 */
  window["Vue"] = Vue;
  window["electron"] = electron;

  // Vue.mixin({
  //   mounted(){
  //     console.log("mixin mounted!",this)
  //   }
  // })


  new Vue({
    components: {
      App,
    },
    router: newRouter,
    store,
    template: '<App/>'
  }).$mount('#app');
}