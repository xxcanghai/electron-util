<template>
  <div id="app">
    <router-view :key="$route.path + $route.query._"></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { RawLocation } from "vue-router";
import * as _ from "lodash";
import { RouterMap } from "./router";
import * as electron from "electron";

@Component
export default class App extends Vue {
  name = "suimeetinge";

  created() {}

  mounted() {
    console.log("App.vue mounted");
  }
}
</script>

<style lang="scss">
// 随会主色调
$main_color: #006bd0;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun,
    sans-serif;
}

html {
  // background-image: url("~@/assets/img/main/bg.png");
  background-color: white;
  height: 100%;
}
</style>
