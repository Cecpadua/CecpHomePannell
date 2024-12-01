<template>
  <v-app>
    <v-system-bar app style="justify-content: space-between !important;">
      <div>
        <span>
          <v-icon :color="connection?'green':'red'" icon="mdi-circle" title="连接状态"></v-icon>
          <span class="vertical-align-middle ms-1">{{ connection?'已连接':'未连接' }}</span>
          <span v-if="device_count > 1">
            <span class="mx-1">|</span>
            <v-icon icon="mdi-tablet-cellphone"></v-icon><span class="vertical-align-middle ms-1">除本机外，还有{{ device_count-1 }}设备在线</span>
          </span>
        </span>
        

        
      </div>
      <div>
        <v-icon icon="mdi-wifi-strength-4"></v-icon>
        <span class="ms-2">{{ date_time }}</span>
      </div>
    </v-system-bar>
    <v-navigation-drawer v-model="drawer" rail permanent>
      <v-list v-model:selected="currentPanel" density="compact" nav style="height: 100%; align-content: center;" mandatory>
        <v-list-item prepend-icon="mdi-lightbulb-group" title="灯控" value="LightPanel"></v-list-item>
        <v-list-item prepend-icon="mdi-stairs" title="台阶" value="StairPanel"></v-list-item>
        <v-list-item prepend-icon="mdi-webcam" title="相机" value="CameraPanel"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="设置" value="SettingPanel"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container class="h-100">
        <template v-for="panel in currentPanel" :key="panel">
          <KeepAlive>
            <LightPanel v-if="panel === 'LightPanel'" />
          </KeepAlive>
            <StairPanel v-if="panel === 'StairPanel'"/>
            <CameraPanel v-if="panel === 'CameraPanel'"/>
            <SettingPanel v-if="panel === 'SettingPanel'" />

        </template>
      </v-container>
      <v-snackbar
        v-model="store.state.toast.show"
        :timeout="5000"
        :color="store.state.toast.color"
        elevation="24"
        @update:modelValue="store.commit('clearToast')">
        {{ store.state.toast.text }}
      </v-snackbar>

      
      
    </v-main>
  </v-app>
  <ConfirmDialog />
  <LoadingDialog />
</template>

<script setup>

import LightPanel from '@/components/LightPanel.vue'
import StairPanel from '@/components/StairPanel.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import CameraPanel from '@/components/CameraPanel.vue'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import LoadingDialog from '@/components/LoadingDialog.vue'

import { ref, computed, onMounted,inject } from 'vue'
import { useStore } from 'vuex'

let store = useStore();

const drawer = ref(true)
const currentPanel = ref(['LightPanel'])
const device_count = ref(0)
const connection = ref(false)

// update date_time every second
const date_time = ref(new Date().toLocaleString());
setInterval(() => {
  date_time.value = new Date().toLocaleString()
}, 1000)



const socketService = inject('$socketService');

onMounted(() => {
    socketService.addOnConnectionListener(() => {

      store.dispatch('init').then((result) => {
        store.commit('setDialog', {dialog: 'loading', value: false})
        connection.value = true
      }).catch((err) => {
        store.commit('setToast', {toast: { text: '初始化失败！', color: 'error' }});
      });
    });

    socketService.addOnMessageListener((message) => {
      if(JSON.parse(message).type === 'total') {
        device_count.value = (JSON.parse(message).data) || 1
        console.log("当前在线人数",device_count.value)
      }

      //同步其他人的操作
      // {"type":"light","id":1,"value":true,"cmd":"AABBCCDDEEFF","ip":"localhost"}
      // {"type":"light","id":1,"value":false,"cmd":"FFEEDDCCBBAA","ip":"localhost"}

      if(JSON.parse(message).type === 'lightgroup' && JSON.parse(message).action === 'add') {
        store.dispatch('fetchtLightGroups')
      }
      if(JSON.parse(message).type === 'lightgroup' && JSON.parse(message).action === 'update') {
        store.dispatch('fetchtLightGroups')
      }
      if(JSON.parse(message).type === 'lightgroup' && JSON.parse(message).action === 'delete') {
        store.dispatch('fetchtLightGroups')
      }

      if(JSON.parse(message).type === 'stair' && JSON.parse(message).action === 'add') {
        store.dispatch('fetchStairs')
      }
      if(JSON.parse(message).type === 'stair' && JSON.parse(message).action === 'update') {
        store.dispatch('fetchStairs')
      }
      if(JSON.parse(message).type === 'stair' && JSON.parse(message).action === 'delete') {
        store.dispatch('fetchStairs')
      }

      if(JSON.parse(message).type === 'camera' && JSON.parse(message).action === 'add') {
        store.dispatch('fetchWebcams')
      }
      if(JSON.parse(message).type === 'camera' && JSON.parse(message).action === 'update') {
        store.dispatch('fetchWebcams')
      }
      if(JSON.parse(message).type === 'camera' && JSON.parse(message).action === 'delete') {
        store.dispatch('fetchWebcams')
      }
    });

    socketService.addOnDisconnectionListener(() => {
      store.commit('setDialog', {dialog: 'loading', value: true, text: '正在连接', })
      connection.value = false
    });

    socketService.addOnErrorListener((error) => {
      store.commit('setDialog', {dialog: 'loading', value: true, text: '正在连接', })
      connection.value = false
    });

})

</script>

<style scoped>

</style>