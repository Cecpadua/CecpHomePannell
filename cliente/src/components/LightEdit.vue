<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card prepend-icon="mdi-lightbulb" title="更新灯">
      <v-card-text>
        <v-row dense>
          <v-col cols="6" md="4" sm="4">
            <v-text-field v-model="name" label="设备名称" :rules="[v => !!v || '设备名称不能为空']" required></v-text-field>
          </v-col>
          <v-col cols="6" md="4" sm="4">
            <!--from 0 to 31 -->
            <v-select v-model="channel" :items="channels" label="频道" item-value="channel" item-title="channel">
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title v-text="item.channel"></v-list-item-title>
                  <v-list-item-subtitle v-text="((item.raw.light_id == store.state.dialog.light_id) ? '当前' : item.raw.name) || '未分配'"></v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="6" md="4" sm="4">
            <v-select v-model="group" :items="store.state.lightgroups" label="分组" item-value="id" item-title="name">
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                  <v-list-item-subtitle v-text="((item.raw.id == store.getters.getGroupIdByLight(store.state.dialog.light_id) ) ? '当前' : '')"></v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>


          <v-col cols="12" md="4" sm="6">
            <v-text-field v-model="CmdOn" label="打开指令"></v-text-field>
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-text-field v-model="cmdOff" label="关闭指令"></v-text-field>
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-text-field v-model="ip" label="设备地址"></v-text-field>
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
import { ref, watch } from 'vue'

import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const name = ref('')
const CmdOn = ref('')
const cmdOff = ref('')

const ip = ref('')
import { inject } from 'vue';
const socketService = inject('$socketService');
const channels = ref([{channel: null, light_id: null, name: '未分配'}])
const channel = ref(null)
const group = ref(1)



watch(() => store.state.dialog, (value) => {
  if (value.dialog === 'lightEdit') {
    dialog.value = value.value
    const light = store.state.lights.find(light => light.id == store.state.dialog.light_id)
    if (light) {
      console.log(light)
      name.value = light.name
      CmdOn.value = light.cmdOn
      cmdOff.value = light.cmdOff
      ip.value = light.ip
      group.value = light.lightgroup_id
      channels.value = [null,...Array(32).keys()].map((channel) => {
        if(channel == null){
          return {channel: null, light_id: null, name: '未分配'}
        }

        const light = store.state.lights.find(light => light.channel == channel+1)

        return { channel: channel + 1, light_id: light ? light.id : null, name: light ? light.name : null }
      })
      channel.value = store.state.lights.find(light => light.id == store.state.dialog.light_id)?.channel || null
    }

    console.log(channels.value)

  }
}, { immediate: true })


watch(() => dialog.value, (value) => {
  if (!value) {
    store.commit('setDialog', { dialog: 'lightEdit', value: false })
  }
})

const create = () => {
  if(channel.value == null){
    store.dispatch('setToast', {
      toast: { text: '请选择频道！', color: 'error' },
    })
    return
  }
  loading.value = true

  fetch(store.state.server_ip + '/api/light/' + store.state.dialog.light_id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.value,
      cmdOn: CmdOn.value,
      cmdOff: cmdOff.value,
      ip: ip.value,
      channel: channel.value,
      lightgroup_id: group.value,
    })
  }).then(response => {
    if (response.ok) {
      store.commit('setDialog', { dialog: 'lightEdit', value: false })
      store.dispatch('fetchLights').then(() => {
        store.commit('setDialog', { dialog: 'lightSetting', value: true })
        dialog.value = false
      })
      store.dispatch('setToast', {
        toast: { text: '修改成功！', color: 'success' },
      });
      socketService.send(JSON.stringify(
        { type: 'light', action: 'update' }
      ))
    }
  }).catch(() => {
    store.dispatch('setToast', {
      toast: { text: '修改失败！', color: 'error' },
    })
  }).finally(() => {
    loading.value = false
    dialog.value = false
  })
}
</script>