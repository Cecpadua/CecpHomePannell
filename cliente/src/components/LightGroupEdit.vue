<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card prepend-icon="mdi-lightbulb" title="修改灯分组">
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

        <v-btn color="primary" text="修改" variant="tonal" @click="create()"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { onMounted, ref,watch } from 'vue'

import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const name = ref('')
import { inject } from 'vue';
const socketService = inject('$socketService');


watch(() => store.state.dialog, (value) => {
if (value.dialog === 'lightGroupEdit') {
  dialog.value = value.value
  const lightgroup = store.state.lightgroups.find(lightgroup => lightgroup.id == store.state.dialog.lightgroup_id)
  if(lightgroup){
    name.value = lightgroup.name
  }
}
}, { immediate: true })


watch(()=>dialog.value, (value) => {
if(!value){
  store.commit('setDialog', {dialog: 'lightGroupEdit', value: false})
}
})

const create = () => {

loading.value = true

fetch(store.state.server_ip +  '/api/lightgroup/'+store.state.dialog.lightgroup_id, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: name.value,
  })
}).then(response => response.json())
  .then(data => {
    loading.value = false
    store.commit('setDialog', {dialog: 'lightGroupEdit', value: false})
    store.dispatch('fetchtLightGroups')
    store.dispatch('setToast', {
          toast: { text: '修改成功！', color: 'success' },
        });
    socketService.send(JSON.stringify({ type: 'lightgroup', action: 'update' }));
    dialog.value = false
  }).catch(() => {
    loading.value = false
    store.dispatch('setToast', {
          toast: { text: '修改失败！', color: 'error' },
        });
    
  })
}
</script>