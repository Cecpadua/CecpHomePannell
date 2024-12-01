<template>
  <h2>合唱台控制</h2>
  <v-row dense>
    <v-col cols="6" md="4" sm="6">
      <v-card>
        <v-card-title>全部</v-card-title>
        <v-card-text>
         <v-btn color="primary" class="mt-2 w-100 " @click="store.commit('setStairAllOpen')">展开</v-btn>
          <v-btn color="primary" class="mt-2 w-100 " @click="store.commit('setStairAllStop')">停止</v-btn>
         <v-btn color="primary" class="mt-2 w-100 " @click="store.commit('setStairAllClose')">收起</v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col v-for="i in store.state.stairs" :key="i" cols="12" md="6" sm="6">
      <v-card >
        <v-card-title>{{ i.name }}</v-card-title>
        <v-card-text class="text-center">
          <v-icon color="secondary" size="250">mdi-stairs</v-icon>
          <v-row>
            <v-col cols="4">
              <v-btn color="primary" class="mt-2 w-100" @click="socketService.send(JSON.stringify({type: 'stairs', id: i.id, action: 'open', cmd:i.cmdUp, ip:i.ip}))">
              展开</v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" class="mt-2 w-100" @click="socketService.send(JSON.stringify({type: 'stairs', id: i.id, action: 'stop', cmd:i.cmdStop, ip:i.ip}))">
              停止</v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" class="mt-2 w-100" @click="socketService.send(JSON.stringify({type: 'stairs', id: i.id, action: 'close', cmd:i.cmdDown, ip:i.ip}))">
              收起</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script setup>
import { ref, inject } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const socketService = inject('$socketService');

</script>