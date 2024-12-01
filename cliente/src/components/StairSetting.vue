<template>
  <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>

    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        <v-toolbar-title>合唱台设置</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn text="Save" variant="text" @click="dialog = false"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container style="height: calc(100% - 56px);">
        <v-row class="h-100">
          <v-col cols="4" class="h-100">
            <v-card class="h-100" variant="outlined">
              <v-card-title>合唱台</v-card-title>
              <v-card-text style="overflow-y: auto; height: calc(100% - 40px);">
                <div>
                  <v-list v-model:selected="currentStair" mandatory @update:selected="onChange"> 

                    <v-list-item v-for="i in store.state.stairs" :title="i.name" :value="i.id">
                      <template v-slot:append>
                        <v-btn icon="mdi-delete" variant="text" size="x-small" density="comfortable" color="red" @click="store.commit('setDialog', {
                          dialog: 'confirm', value: true, text: '删除后不可恢复, 确定删除吗?', callback: (result) => {
                            if (result === 1) {
                              store.dispatch('deleteStair', i.id).then(() => {
                                store.commit('setToast', { text: '删除成功', color: 'success' })
                                socketService.send(JSON.stringify({ type: 'stair', action: 'delete' }));
                                 // 如果 value[0] 的id 不在 store.state.stairs 中，说明已经被删除了， 如果webcame不为空，那就选中第一个，否者清空所有fileds
    if(store.state.stairs.length > 0){
      currentStair = [store.state.stairs[0].id]
      onChange(currentStair)
    }else{
      name = ''
      ip = ''
      cmdUp = ''
      cmdDown = ''
      cmdStop = ''
    }

                              }).catch((err) => {
                                console.log(err)
                                store.commit('setToast', { text: '删除失败', color: 'error' })
                              })
                            } else {
                              store.commit('setDialog', { dialog: 'confirm', value: false })
                            }
                          }
                        })">
                        </v-btn>
                      </template>
                    </v-list-item>
                    <div class="text-center">
                      <v-btn variant="text" icon="mdi-plus"
                        @click="store.commit('setDialog', { dialog: 'stairAdd', value: true })"></v-btn>
                    </div>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="8" class="h-100">
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
              <v-col cols="12">
                <v-btn color="primary" @click="
                  update()
                  ">保存</v-btn>
              </v-col>
            </v-row>

          </v-col>

        </v-row>
      </v-container>
    </v-card>
  </v-dialog>

<StairAdd></StairAdd>
</template>
<script setup>
import { ref, watch } from 'vue'
import StairAdd from './StairAdd.vue';
import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)
const currentStair = ref([store.state.stairs?.at(0)?.id])
import { inject } from 'vue';
const socketService = inject('$socketService');

const name = ref(store.state.stairs[0]?.name)
const ip = ref(store.state.stairs[0]?.ip)
const cmdUp = ref(store.state.stairs[0]?.cmdUp)
const cmdDown = ref(store.state.stairs[0]?.cmdDown)
const cmdStop = ref(store.state.stairs[0]?.cmdStop)

const onChange = (id) => {
  const stair = store.state.stairs.find(stair => stair.id == id[0])
  if (stair) {
    name.value = stair.name
    ip.value = stair.ip
    cmdUp.value = stair.cmdUp
    cmdDown.value = stair.cmdDown
    cmdStop.value = stair.cmdStop
  }
}

watch(() => store.state.dialog, (value) => {
  if (value.dialog === 'stairSetting') {
    dialog.value = value.value
  }
}, { immediate: true })


watch(() => dialog.value, (value) => {
  if (!value) {
    store.commit('setDialog', { dialog: 'stairSetting', value: false })
  }
})

const update = () => {
  console.log('update', currentStair.value)

  fetch(store.state.server_ip + '/api/stair/' + currentStair.value[0], {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.value,
      ip: ip.value,
      cmdUp: cmdUp.value,
      cmdDown: cmdDown.value,
      cmdStop: cmdStop.value
    })
  }).then(response => response.json())
    .then(data => {
      store.commit('setToast', { text: '保存成功', color: 'success' })
      socketService.send(JSON.stringify({ type: 'stair', action: 'update' }));
      store.dispatch('fetchStairs')
    }).catch((err) => {
      console.log(err)
      store.commit('setToast', { text: '保存失败', color: 'error' })
    })

}


</script>