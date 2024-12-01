<template>
  <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>

    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        <v-toolbar-title>灯光设置</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn text="Save" variant="text" @click="dialog = false"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container style="height: calc(100% - 64px);">
        <v-row class="h-100">
          <v-col cols="12" md="4" sm="4" class="h-100">
            <v-card class="h-100" variant="outlined">
              <v-card-title>分组</v-card-title>
              <v-card-text style="overflow-y: auto; height: calc(100% - 40px);">
                <div>
                  <v-list v-model:selected="currentGroup" mandatory @click:select="console.log">

                    <v-list-item v-for="i in store.state.lightgroups" :title="i.name" :value="i.id">
                      <template v-slot:append>
                        <v-btn icon="mdi-pencil" variant="text" size="x-small" density="comfortable" color="orange"
                          @click="store.commit('setDialog', { dialog: 'lightGroupEdit', value: true, lightgroup_id: i.id })">
                        </v-btn>
                        <v-btn icon="mdi-delete" variant="text" size="x-small" density="comfortable" color="red" @click="store.commit('setDialog', {
                          dialog: 'confirm', value: true, text: '删除后不可恢复, 确定删除吗?(此分组所有灯将会被移除)', callback: (result) => {
                            if (result === 1) {
                              store.dispatch('deleteLightGroup', i.id).then(() => {
                                store.commit('setToast', { text: '删除成功', color: 'success' })
                                socketService.send(JSON.stringify({ type: 'lightgroup', action: 'delete' }));
                                if (currentGroup[0] == i.id) {
                                  console.log('正在删除当前选中分组')
                                  currentGroup = [store.state.lightgroups?.at(0)?.id]
                                }
                              }).catch(() => {
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
                        @click="store.commit('setDialog', { dialog: 'lightGroupAdd', value: true })"></v-btn>

                    </div>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="8" sm="8" class="h-100">
            <v-list class="h-100">
              <v-list-item v-for="i in store.getters.getLightByGroupId(currentGroup?.at(0))" :value="i.id">
                <template v-slot:title>
                  <v-list-item-title>
                    {{ i.name }}
                    <v-chip variant="outlined" size="small" color="primary">
                      频道{{ i.channel }}
                    </v-chip>
                  </v-list-item-title>
                </template>
                <template v-slot:append>
                  <v-btn icon="mdi-pencil" variant="text" size="x-small" density="comfortable" color="orange"
                    @click="store.commit('setDialog', { dialog: 'lightEdit', value: true, light_id: i.id })">
                  </v-btn>
                  <v-btn icon="mdi-delete" variant="text" size="x-small" density="comfortable" color="red" @click="store.commit('setDialog', {
                    dialog: 'confirm', value: true, text: '删除后不可恢复, 确定删除吗?', callback: (result) => {
                      if (result === 1) {
                        store.dispatch('deleteLight', i.id).then(() => {
                          store.commit('setToast', { text: '删除成功', color: 'success' })
                          socketService.send(JSON.stringify({ type: 'light', action: 'delete', id: id }));


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
                  @click="store.commit('setDialog', { dialog: 'lightAdd', value: true, lightgroup_id: currentGroup[0] })"></v-btn>
              </div>
              <!-- <v-list-item value="add"
                @click="store.commit('setDialog', { dialog: 'lightAdd', value: true, lightgroup_id: currentGroup[0] })">
                <template v-slot:default="{ active, toggle }">
                  <v-list-item-action class="justify-center">
                    <v-icon @click="toggle" :color="active ? 'primary' : ''">mdi-plus</v-icon>
                  </v-list-item-action>
                </template>
              </v-list-item> -->
            </v-list>

          </v-col>

        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
  <LightAdd />
  <LightEdit />
  <LightGroupAdd />
  <LightGroupEdit />

</template>
<script setup>
import { ref, watch } from 'vue'
import LightAdd from './LightAdd.vue';
import LightEdit from './LightEdit.vue';
import LightGroupAdd from './LightGroupAdd.vue';
import LightGroupEdit from './LightGroupEdit.vue';
import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)
const currentGroup = ref([store.state.lightgroups?.at(0)?.id])
import { inject } from 'vue';
const socketService = inject('$socketService');

watch(() => store.state.dialog, (value) => {
  if (value.dialog === 'lightSetting') {
    dialog.value = value.value
  }
}, { immediate: true })


watch(() => dialog.value, (value) => {
  if (!value) {
    store.commit('setDialog', { dialog: 'lightSetting', value: false })
  }
})





</script>