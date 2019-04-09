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
      <el-tab-pane label="WIFI管理" name="wifi">
        <el-button type="primary" @click="getWifiList()">获取wifi列表</el-button>
        <el-button type="primary" @click="getCurrentConnectionClick()">获取当前连接的wifi</el-button>
        <el-button type="primary" @click="wifiDisconnect()">断开当前wifi连接</el-button>
        <el-table :data="wifiList" border style="width: 100%">
          <el-table-column sortable prop="mac" label="MAC"></el-table-column>
          <!-- <el-table-column sortable prop="bssid" label="BSSID"></el-table-column> -->
          <el-table-column sortable prop="ssid" label="SSID"></el-table-column>
          <el-table-column sortable prop="channel" label="信道"></el-table-column>
          <el-table-column sortable prop="frequency" label="频率"></el-table-column>
          <el-table-column sortable prop="signal_level" label="信号强度"></el-table-column>
          <el-table-column sortable prop="quality" label="质量"></el-table-column>
          <el-table-column sortable prop="security" label="安全"></el-table-column>
          <el-table-column sortable prop="security_flags" label="security_flags"></el-table-column>
          <!-- <el-table-column prop="mode" label="mode"></el-table-column> -->
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span v-if="currWifi.ssid==scope.row.ssid" style="color:green;font-weight: bold;">已连接</span>
              <el-button v-else size="mini" type="primary" @click="wifiConnect(scope.row)">连接</el-button><br>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="UDP通信" name="udp">UDP通信</el-tab-pane>
      <el-tab-pane label="UVC控制" name="uvc">
        <div>
          <canvas style="border:1px solid;" ref="webCameraCanvas" width="320" height="240"></canvas>
        </div>
        <div>
          <el-button type="primary" @click="initWebCamera()">开启摄像头</el-button>
          <el-button type="primary" @click="closeWebCamera()">停止摄像头</el-button>
          <el-button type="primary" @click="getDevices()">获取设备列表</el-button>
        </div>
        <el-table :data="deviceList" border style="width: 100%">
          <el-table-column sortable prop="kind" label="kind" width="100"></el-table-column>
          <el-table-column sortable prop="label" label="label" width="200"></el-table-column>
          <el-table-column sortable prop="deviceId" label="deviceId"></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>



<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as os from "os";
import * as VueRouter from "vue-router";
import * as electron from "electron";
import * as system from "../js/system";
import * as wifi from "../js/wifi";
import WebCamera from "../js/WebCamera";
const jsonFormat = require("json-format");

@Component({})
export default class Main extends Vue {
  name = "Main";
  tabActive = "wifi";
  volume = -1;
  wifiList: wifi.NetworkItem[] = [];
  currWifi: wifi.NetworkItem = <any>{};
  webcam!: WebCamera;
  canvas!: HTMLCanvasElement;
  deviceList: MediaDeviceInfo[] = [];

  system = system;

  async mounted() {
    console.log("wifi", wifi);
    this.volume = await system.auidoGetVolume();
    this.getWifiList();
    this.canvas = <HTMLCanvasElement>this.$refs["webCameraCanvas"];
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

  getWifiList() {
    wifi.scan((err, networks) => {
      console.log("[wifi.scan]", err, networks);
      if (err || networks == undefined) {
        return alert(err);
      }
      this.wifiList = networks;
      this.getCurrentConnection();
    });
  }

  getCurrentConnection(cb = (...args) => {}) {
    wifi.getCurrentConnection((err, networks) => {
      cb(err, networks);
      if (err || networks == undefined || networks.length == 0) {
        this.currWifi = <any>{};
        return;
      }
      this.currWifi = networks[0];
    });
  }

  getCurrentConnectionClick() {
    this.getCurrentConnection((err, networks) => {
      console.log("[wifi.getCurrentConnection]", err, networks);
      if (err) {
        return alert(err);
      }
      if (networks == undefined || networks.length == 0) {
        this.currWifi = <any>{};
        return alert("当前wifi未连接");
      }
      this.currWifi = networks[0];
      alert(jsonFormat(networks));
    });
  }

  wifiConnect(network: wifi.NetworkItem) {
    // var pwd = prompt(`请输入要连接的 ${network.ssid} 的密码：`) || "";
    this.$prompt(`请输入要连接的 ${network.ssid} 的密码：`, "提示")
      .then(({ value }) => {
        wifi.connect({ ssid: network.ssid, password: value }, err => {
          console.log("[wifi.connect]", err);
          if (err) {
            return alert(err);
          }
          alert("连接成功");
          this.getCurrentConnection();
        });
      })
      .catch(() => {});
  }

  wifiDisconnect() {
    wifi.disconnect(err => {
      console.log("[wifi.disconnect]", err);
      if (err) {
        return alert(err);
      }
      alert("断开成功");
      this.getCurrentConnection();
    });
  }

  initWebCamera() {
    this.webcam = new WebCamera({
      width: 320,
      height: 240,
      targetCanvas: this.canvas,
      onSuccess() {
        console.log("webCamera onSuccess");
      },
      onError(err) {
        console.log("webCamera onError", err);
        alert(err.message);
      },
      onNotSupported() {
        console.log("webCamera onNotSupported");
      },
      onFrame() {
        // console.log("webCamera onFrame", arguments);
      }
    });
  }

  closeWebCamera() {
    this.webcam.stop();
  }

  async getDevices() {
    this.deviceList = (await WebCamera.getDevices()).filter(
      d => d.kind == "audioinput" || d.kind == "videoinput"
    );
  }
}
</script>

<style lang="scss" scoped>
</style>
