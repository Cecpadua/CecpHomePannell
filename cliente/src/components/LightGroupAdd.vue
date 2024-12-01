<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card prepend-icon="mdi-lightbulb" title="新建灯分组">
      <v-card-text>
          <v-row dense>
            <v-col cols="12" md="12" sm="12">
              <v-text-field v-model="name" label="分组名称" :rules="[v => !!v || '设备名称不能为空']" required></v-text-field>
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
const store = useStore()
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const name = ref('')
import { inject } from 'vue';
const socketService = inject('$socketService');

watch(() => store.state.dialog, (value) => {
if (value.dialog === 'lightGroupAdd') {
  dialog.value = value.value
  // clear all fields
  name.value = ''
}
}, { immediate: true })


watch(()=>dialog.value, (value) => {
if(!value){
  store.commit('setDialog', {dialog: 'lightGroupAdd', value: false})
}
})

const create = () => {

loading.value = true

fetch(store.state.server_ip +  '/api/lightgroup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: name.value,
  })
}).then(response => {
  if(response.ok){
    store.commit('setDialog', {dialog: 'lightGroupAdd', value: false})
    store.dispatch('fetchtLightGroups')
    store.dispatch('setToast', {
          toast: { text: '创建成功！', color: 'success' },
        });
  socketService.send(JSON.stringify({ type: 'lightgroup', action: 'add' }));

  }
  loading.value = false
}).catch(() => {
  loading.value = false
  store.dispatch('setToast', {
    toast: { text: '创建失败！', color: 'error' },
  });
})
}
</script>