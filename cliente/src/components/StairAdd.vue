<template>
    <v-dialog v-model="dialog" max-width="600">
      <v-card prepend-icon="mdi-lightbulb" title="新建合唱台">
        <v-card-text>
          <v-row class="h-100" style="overflow-y: auto;">
              <v-col cols="6">
                <v-text-field v-model="name" label="名称" hide-details></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="ip" label="IP" hide-details></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="cmdUp" label="升指令" hide-details></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="cmdDown" label="降指令" hide-details></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="cmdStop" label="停指令" hide-details></v-text-field>
              </v-col>
              
            </v-row>
        
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="关闭" variant="plain" @click="dialog = false"></v-btn>

          <v-btn color="primary" text="创建" variant="tonal" @click="create()"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script setup>
import { ref,watch } from 'vue'

import { useStore } from 'vuex'
import { inject } from 'vue';
const socketService = inject('$socketService');


const store = useStore()
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const name = ref('')
const ip = ref('')
const cmdUp = ref('')
const cmdDown = ref('')
const cmdStop = ref('')

watch(() => store.state.dialog, (value) => {
  if (value.dialog == 'stairAdd') {
    dialog.value = value.value
    // clear all fields

    name.value = ''
    ip.value = ''
    cmdUp.value = ''
    cmdDown.value = ''
    cmdStop.value = ''

  }
}, { immediate: true })


watch(()=>dialog.value, (value) => {
  if(!value){
    store.commit('setDialog', {dialog: 'stairAdd', value: false})
  }
})

const create = () => {

  loading.value = true
 
  fetch(store.state.server_ip +  '/api/stair', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.value,
      ip: ip.value,
      cmdUp: cmdUp.value,
      cmdDown: cmdDown.value,
      cmdStop: cmdStop.value,
    })
  }).then(response => {
    if(response.status == 200){
      store.commit('setDialog', {dialog: 'stairAdd', value: false})
      store.dispatch('fetchStairs')
      store.dispatch('setToast', {
            toast: { text: '创建成功！', color: 'success' },
          });
    socketService.send(JSON.stringify({ type: 'stair', action: 'add' }));
    }
    loading.value = false
    dialog.value = false
  }).catch(() => {
    loading.value = false
  })

}
</script>