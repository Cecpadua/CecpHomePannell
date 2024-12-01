<template>
    <v-dialog v-model="dialog" max-width="600">
      <v-card prepend-icon="mdi-lightbulb" title="新建灯">
        <v-card-text>
            <v-row dense>
              <v-col cols="6" md="4" sm="4">
                <v-text-field v-model="name" label="设备名称" :rules="[v => !!v || '设备名称不能为空']" required></v-text-field>
              </v-col>
              <v-col cols="6" md="4" sm="2">
                <!--from 0 to 31 -->
                <v-select v-model="channel" :items="channels" label="频道" item-value="channel" item-title="channel">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" >
                      <v-list-item-content>
                        <v-list-item-title v-text="item.channel"></v-list-item-title>
                        <v-list-item-subtitle v-text="item.raw.name||'未分配'"></v-list-item-subtitle>
                      </v-list-item-content>
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
const CmdOn = ref('')
const cmdOff = ref('')
const ip = ref('')
const channels = ref([])
const channel = ref(null)

watch(() => store.state.dialog, (value) => {
  if (value.dialog === 'lightAdd') {
    dialog.value = value.value
    // clear all fields
    name.value = ''
    CmdOn.value = ''
    cmdOff.value = ''
    ip.value = ''
    
    channels.value = [...Array(32).keys()].map((channel) => {
      const light = store.state.lights.find(light => light.channel == channel+1)
      return {channel: channel+1, light_id: light ? light.id : null, name: light ? light.name : null}
    })
    console.log(channels.value)
    channel.value = channels[0]

  }
}, { immediate: true })


watch(()=>dialog.value, (value) => {
  if(!value){
    store.commit('setDialog', {dialog: 'lightAdd', value: false})
  }
})

const create = () => {
  if(channel.value == null){
    store.dispatch('setToast', {
      toast: { text: '请选择频道！', color: 'error' },
    });
    return
  }
//   app.post('/api/light', (req, res) => {
//   db.run('INSERT INTO lights ("name", "ip", "cmdOn", "cmdOff", "lightgroup_id") VALUES (?, ?, ?, ?, ?)', [req.body.name, req.body.ip, req.body.cmdOn, req.body.cmdOff, req.body.lightgroup_id],
//     (err) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.json({ message: 'Light added' });
//     }
//   );
// });
  loading.value = true
 
  fetch(store.state.server_ip +  '/api/light', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({name: name.value, ip: ip.value, cmdOn: CmdOn.value, cmdOff: cmdOff.value, lightgroup_id: store.state.dialog.lightgroup_id, channel: channel.value}),
  })
    .then(response => response.json())
    .then(data => {
     
      store.dispatch('fetchLights').then(() => {
        loading.value = false
        dialog.value = false
        store.commit('setDialog', {dialog: 'lightSetting', value: true})
        store.dispatch('setToast', {
          toast: { text: '创建成功！', color: 'success' },
        });
        socketService.send(JSON.stringify({ type: 'light', action: 'add' }))
      })
    })
    .catch((error) => {
      console.error('Error:', error);
      loading.value = false
      store.dispatch('setToast', {
        toast: { text: '创建失败！', color: 'error' },
      });
    });
}
</script>