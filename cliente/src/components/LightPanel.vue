<template>
  <h2>灯光控制</h2>
  <v-row dense class="flex-nowrap overflow-auto">
    <v-col cols="6" md="2" sm="2">
      <v-card>
        <v-card-title>全部</v-card-title>
        <v-card-text>
          <v-btn color="primary" class="mt-2 w-100 " @click="
            store.commit('setLightAllOn');
          LightCommand.sendCommand(socketService, LightCommand.allControll(ALL_GROUPS, LIGHT_ON), store.state.lights[0].ip)
            ">打开</v-btn>
          <v-btn color="primary" class="mt-2 w-100 " @click="
            store.commit('setLightAllOff');
          LightCommand.sendCommand(socketService, LightCommand.allControll(ALL_GROUPS, LIGHT_OFF), store.state.lights[0].ip)
            ">关闭</v-btn>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- <v-col v-for="group in store.state.lightgroups" :key="group" cols="6" md="2" sm="2">
      <v-card>
        <v-card-title>{{ group.name }}</v-card-title>
      
        <v-card-text>
         <v-btn color="primary" class="mt-2 w-100 " @click="
            store.commit('setLightAllOnByGroupId', group.id);
            LightCommand.sendCommand(socketService, LightCommand.writeStatus(ALL_GROUPS,store.getters.getLightPositionBitByGroup(group.id)) , store.state.lights[0].ip)
            ">打开</v-btn>
         <v-btn color="primary" class="mt-2 w-100 " @click="
            store.commit('setLightAllOffByGroupId', group.id);
            LightCommand.turnOffBit(socketService,'192.168.1.158:23',store.getters.getLightPositionBitByGroup(group.id))">关闭</v-btn>
        </v-card-text>
      </v-card>
    </v-col> -->
  </v-row>

  <v-row dense>
    <template v-for="group in store.state.lightgroups" :key="group">
      <v-col cols="12">
        {{ group.name }}
        <v-row dense>
          <v-col v-for="i in store.getters.getLightByGroupId(group.id)" :key="i" cols="6" md="2" sm="2">
            <v-card>
              <v-card-title>{{ i.name }}</v-card-title>
              <v-card-text>
                <v-switch inset color="primary" hide-details class="justify-center" v-model="i.status" @update:model-value="(v) => {
                  if (v) {
                    LightCommand.sendCommand(socketService, LightCommand.singleControll(ALL_GROUPS, i.channel, LIGHT_ON), i.ip)
                  } else {
                    LightCommand.sendCommand(socketService, LightCommand.singleControll(ALL_GROUPS, i.channel, LIGHT_OFF), i.ip)
                  }
                }"></v-switch>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </template>
  </v-row>
</template>
<script setup>
import { ref, inject, onMounted } from 'vue'
import { useStore } from 'vuex'
const store = useStore()

const socketService = inject('$socketService');
const loading = ref(false)

import { LIGHT_ON, LIGHT_OFF, ALL_GROUPS, GROUP1, GROUP2 } from './LightCommand';
import LightCommand from './LightCommand';

import { READ, WRITE, WRITE_MULTI } from './LightCommand';

onMounted(() => {
  LightCommand.onCommandResponse(socketService, (data) => {
    let result = LightCommand.readResult(data);
    switch(result?.type){
      case READ:
        console.log('read result:', result);
        store.commit('setLightsStatusByBit', result.data);
        break;
      case WRITE:
        console.log('write result:', result);
        store.commit('setLightStatus“', {channel: result.data.address, status: result.data.data});
        break;
      case WRITE_MULTI:
        console.log('write multi result:', result);
        LightCommand.sendCommand(socketService, LightCommand.readStatus(ALL_GROUPS), store.state.lights[0].ip);
        console.log("获取灯光状态请求已发送");
        break;
    } 
  }, "192.168.1.158:23")

})



</script>