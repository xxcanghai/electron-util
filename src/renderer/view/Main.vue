<template>
  <div :page-name="name">
    <el-tabs type="card" v-model="tabActive">
      <el-tab-pane label="系统控制" name="system">
        <el-button type="primary" @click="system.shutdown(30)">关机(等待30秒)</el-button>
        <el-button type="primary" @click="system.shutdown(0)">立即关机</el-button>
        <br><br>

        <div>当前音量值：
          <span v-text="volume"></span>
        </div>
        <el-button type="primary" @click="auidoVolumeAdd()">音量增大</el-button>
        <el-button type="primary" @click="auidoVolumeMinus()">音量减小</el-button>
        <el-button type="primary" @click="auidoGetMuted()">获取当前是否静音</el-button>
        <el-button type="primary" @click="auidoSetMuted(true)">设置静音</el-button>
        <el-button type="primary" @click="auidoSetMuted(false)">取消静音</el-button>
        <el-button type="primary" @click="auidoGetVolume()">获取当前音量值</el-button>
        <el-button type="primary" @click="auidoSetVolume(100)">设置音量值100</el-button>
        <!-- 此处有bug，无法设置为音量0 -->
        <el-button type="primary" @click="auidoSetVolume(1)">设置音量值1</el-button>
        <br><br>

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
  volume = -1;

  system = system;

  async mounted() {
    this.volume = await system.auidoGetVolume();
  }

  async auidoGetMuted() {
    alert(await system.auidoGetMuted());
  }

  auidoSetMuted(muted: boolean) {
    system.auidoSetMuted(muted);
  }

  async auidoGetVolume() {
    this.volume = await system.auidoGetVolume();
    alert(this.volume);
    return this.volume;
  }

  auidoSetVolume(v: number) {
    if (v > 100) v = 100;
    if (v < 0) v = 0;
    this.volume = v;
    system.auidoSetVolume(this.volume);
  }

  auidoVolumeAdd() {
    this.auidoSetVolume(this.volume + 10);
  }

  auidoVolumeMinus() {
    this.auidoSetVolume(this.volume - 10);
  }
}
</script>

<style lang="scss" scoped>
</style>
