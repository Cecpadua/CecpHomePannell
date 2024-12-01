<template>
  <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>


    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        <v-toolbar-title>系统设置</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-list lines="two" subheader>
        <!-- <v-list-subheader>User Controls</v-list-subheader>

        <v-list-item subtitle="Set the content filtering level to restrict apps that can be downloaded"
          title="Content filtering" link></v-list-item>

        <v-list-item subtitle="Require password for purchase or use password to restrict purchase" title="Password"
          link></v-list-item>

        <v-divider></v-divider> -->

        <v-list-subheader>General</v-list-subheader>

        <v-list-item subtitle="用于调试使用" title="Devtools"
          @click="store.state.devtools = !store.state.devtools; switchEruda()">
          <template v-slot:prepend>
            <v-list-item-action start>
              <v-checkbox-btn v-model="store.state.devtools" color="primary"></v-checkbox-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import eruda from 'eruda'

import { inject } from 'vue';
const socketService = inject('$socketService');
import { useStore } from 'vuex'
const store = useStore()

const dialog = ref(false)

watch(() => store.state.dialog, (value) => {
  if (value.dialog === 'systemSetting') {
    dialog.value = value.value
  }
}, { immediate: true })


watch(() => dialog.value, (value) => {
  if (!value) {
    store.commit('setDialog', { dialog: 'systemSetting', value: false })
  }
})
const switchEruda = () => {
  if (store.state.devtools) {
    eruda.init()
  } else {
    eruda.destroy()
  }
}





</script>
