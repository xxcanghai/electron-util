<template>
  <div :page-name="name">
    <el-tabs type="card" v-model="tabActive">
      <el-tab-pane label="系统控制" name="system">
        <el-button type="primary" @click="shutdown(30)">关机(等待30秒)</el-button>
        <el-button type="primary" @click="shutdown(0)">立即关机</el-button>
        <br><br>
        
        <el-button type="primary" @click="sound(10)">音量增大</el-button>
        <el-button type="primary" @click="sound(-10)">音量减小</el-button>

      </el-tab-pane>
      <el-tab-pane label="WIFI管理" name="wifi">WIFI管理</el-tab-pane>
      <el-tab-pane label="UDP通信" name="udp">UDP通信</el-tab-pane>
      <el-tab-pane label="UVC控制" name="uvc">UVC控制</el-tab-pane>
    </el-tabs>
  </div>

</template>



<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as os from "os";
import * as VueRouter from "vue-router";
import * as electron from "electron";
import * as system from "../js/system";

@Component({})
export default class Main extends Vue {
  name = "Main";
  tabActive = "system";

  shutdown(t: number) {
    system.shutdown(t);
  }

  sound(n:number){

  }

  mounted() {}
}
</script>

<style lang="scss" scoped>
</style>
