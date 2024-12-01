<template>
        <h2>相机控制</h2>
        <v-row dense>
          <v-col v-for="i in store.state.webcams" :key="i" cols="12" md="6" sm="6">
            <v-card>
              <v-card-title>{{ i.name }}</v-card-title>
              <v-card-text class="text-center">
                <v-icon color="secondary" size="250">mdi-webcam</v-icon>
                <v-row>
                  <v-col cols="4">
                    <v-btn color="primary" class="mt-2 w-100" @click="socketService.send(JSON.stringify({type: 'camera', id: i.id, action: 'up', cmd:i.cmdUp, ip:i.ip}))"
                    >升</v-btn>
                  </v-col>
                  <v-col cols="4">
                    <v-btn color="primary" class="mt-2 w-100" @click="socketService.send(JSON.stringify({type: 'camera', id: i.id, action: 'stop', cmd:i.cmdStop, ip:i.ip}))"
                    >停</v-btn>
                  </v-col>
                  <v-col cols="4">
                    <v-btn color="primary" class="mt-2 w-100" @click="socketService.send(JSON.stringify({type: 'camera', id: i.id, action: 'down', cmd:i.cmdDown, ip:i.ip}))"
                    >降</v-btn>
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