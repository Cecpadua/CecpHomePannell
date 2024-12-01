<template>
    <v-dialog
      v-model="dialog"
      max-width="400"
      persistent
    >

      <v-card
        prepend-icon="mdi-alert-circle"
        :text="store.state.dialog.text || '你确定吗?'"
        title="注意"
      >
        <template v-slot:actions>
          <v-spacer></v-spacer>

          <v-btn @click="dialog = false; onCancel()">
            取消
          </v-btn>

          <v-btn @click="dialog = false; onAgree()">
            确定
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
</template>
<script setup>
import { ref,watch } from 'vue'

import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)

watch(() => store.state.dialog, (value) => {
  if (value.dialog == 'confirm') {
    dialog.value = value.value
  }
}, { immediate: true })

watch(()=> dialog.value, (value) => {
  if(!value){
    store.commit('setDialog', {dialog: 'confirm', value: false})
  }
})

const onAgree = () => {
  console.log('Agree')
  if(store.state.dialog.callback){
    store.state.dialog.callback(1)
  }
}
const onCancel = () => {
  console.log('Cancel')
  if(store.state.dialog.callback){
    store.state.dialog.callback(0)
  }
}
</script>