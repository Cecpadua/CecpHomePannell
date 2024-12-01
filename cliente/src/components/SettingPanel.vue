<template>
  <v-row class="h-100 align-content-center">
    <v-col cols="12" md="4" sm="6">
      <v-card append-icon="mdi-chevron-right" class="mx-auto align-content-center" style="height: 100px;" title="灯光设置" link
      @click="store.commit('setDialog', {dialog: 'lightSetting', value: true})">
        <template v-slot:prepend>
          <v-icon size="large">mdi-lightbulb-group</v-icon>
        </template>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" sm="6">
      <v-card append-icon="mdi-chevron-right" class="mx-auto align-content-center" style="height: 100px;" title="相机设置" link
      @click="store.commit('setDialog', {dialog: 'cameraSetting', value: true})">
        <template v-slot:prepend>
          <v-icon size="large">mdi-webcam</v-icon>
        </template>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" sm="6">
      <v-card append-icon="mdi-chevron-right" class="mx-auto align-content-center" style="height: 100px;" title="合唱台设置" link
      @click="store.commit('setDialog', {dialog: 'stairSetting', value: true})"
      >

        <template v-slot:prepend>
          <v-icon size="large">mdi-stairs</v-icon>
        </template>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" sm="6">
      <v-card append-icon="mdi-chevron-right" class="mx-auto align-content-center" style="height: 100px;" title="本机设置" link
      @click="store.commit('setDialog', {dialog: 'systemSetting', value: true})"
      >
        <template v-slot:prepend>
          <v-icon size="large">mdi-cog</v-icon>
        </template>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" sm="6">
      <v-card append-icon="mdi-chevron-right" class="mx-auto align-content-center" style="height: 100px;" title="关于本机" link
      @click="store.commit('setDialog', {dialog: 'aboutDevice', value: true})">
        <template v-slot:prepend>
          <v-icon size="large">mdi-information</v-icon>
        </template>
      </v-card>
    </v-col>

    <v-col cols="12" md="4" sm="6">
      <v-card append-icon="mdi-chevron-right" class="mx-auto align-content-center" style="height: 100px;" title="关机" link
      @click="store.commit('setDialog', {dialog: 'confirm', value: true, text: '关机后你只可以通重新插拔电源线来开机, 关机不会影响现在的任何情况。', callback: (result)=>{
        if(result === 1){
          socketService.send(JSON.stringify({type: 'shutdown'}))
        } else {
          store.commit('setDialog', {dialog: 'confirm', value: false})
        }
      }})">
        <template v-slot:prepend>
          <v-icon size="large">mdi-power</v-icon>
        </template>
      </v-card>
    </v-col>

  </v-row>
  <AboutDevice />
  <LightSetting />
  <CameraSetting />
  <StairSetting />
  <SystemSetting />

  <!--csc modbus calcolator-->
  <v-bottom-sheet>
    <template v-slot:activator="{ props }">
      <div style="position: fixed; bottom: 20px; right: 20px;">
       <v-btn color="primary" v-bind="props">
          <v-icon>mdi-calculator-variant</v-icon>
        </v-btn>
      </div>
    </template>

    <v-card
      title="Waveshare Modbus Command Calculator"
    >
    <!-- a input, a out input with copy button-->
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="modbusCmd" label="Modbus Command Hex" outlined hide-details @update:model-value="calcCrc()"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="modbusCmdOut" label="Modbus Command Hex" outlined hide-details readonly
          append-icon="mdi-content-copy" @click:append="copyToClipboard(modbusCmdOut)"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</v-bottom-sheet>


</template>
<script setup>
import { ref, inject } from 'vue'
import AboutDevice from './AboutDevice.vue';
import LightSetting from './LightSetting.vue';
import CameraSetting from './CameraSetting.vue';
import StairSetting from './StairSetting.vue';
import SystemSetting from './SystemSetting.vue';
import { useStore } from 'vuex'
const store = useStore();

const socketService = inject('$socketService');

const modbusCmd = ref('')
const modbusCmdOut = ref('')

const calcCrc = () => {
  const cmd = modbusCmd.value; // 获取输入命令字符串
  const cmdArr = cmd.split(' ').map((v) => parseInt(v, 16)); // 转换为十六进制数组

  // 计算 CRC-16 (Modbus)
  const crc = calculateCRC16Modbus(cmdArr);

  const crcLow = (crc & 0xFF).toString(16).padStart(2, '0').toUpperCase(); // CRC低字节
  const crcHigh = ((crc >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase(); // CRC高字节

  // 输出完整命令：原始命令 + CRC低字节 + CRC高字节
  modbusCmdOut.value = cmd + ' ' + crcLow  + ' ' + crcHigh;
};

const calculateCRC16Modbus = (buffer) => {
  let crc = 0xFFFF; // Modbus CRC 初始值为 0xFFFF
  for (const byte of buffer) {
    crc ^= byte; // 与字节异或
    for (let i = 0; i < 8; i++) { // 循环移位8次
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xA001; // 右移并异或多项式 0xA001
      } else {
        crc >>= 1; // 仅右移
      }
    }
  }
  return crc;
};


const copyToClipboard = (text) => {
  if(navigator.clipboard){
    navigator.clipboard.writeText(text)
  } else {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  store.commit('setToast', {text: 'Copied', color: 'success'})
}
</script>