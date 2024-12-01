<template>
  <div class="text-center pa-4">
    <v-dialog
      v-model="dialog"
      transition="dialog-bottom-transition"
      fullscreen
    >

      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
          <v-toolbar-title>关于本机</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-list
          lines="two"
          subheader
        >
          <v-list-subheader>关于软件</v-list-subheader>

          <v-list-item
            title="版本"
            subtitle="1.0.0"
            link
          ></v-list-item>

          <v-divider></v-divider>

          <v-list-subheader>关于设备</v-list-subheader>
          <v-list-item
            title="设备名称"
            subtitle="树莓派"
            link
          ></v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref,watch } from 'vue'

import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)


watch(() => store.state.dialog, (value) => {
  if (value.dialog === 'aboutDevice') {
    dialog.value = value.value
  }
}, { immediate: true })







</script>