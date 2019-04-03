import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'
import Main from '../view/Main.vue';

Vue.use(Router);

export var RouterMap = {
  Main: <RouteConfig>{
    path: '/Main',
    component: Main
  },
}
var routesList: RouteConfig[] = Object.keys(RouterMap).map(n => {
  // 为每个router对象增加name属性
  var obj: RouteConfig = RouterMap[n];
  obj.name = n;
  obj.props = true;
  return obj;
}).concat([
  // 追加特殊router对象
  {
    name: "/",
    path: '/',
    redirect: RouterMap.Main.path
  },
  {
    path: '*',
    redirect: { path: '/' }
  }
]);

export var newRouter = new Router({
  routes: routesList
})
