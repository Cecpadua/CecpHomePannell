<template>

    <v-dialog
      v-model="dialog"
      max-width="320"
      persistent
    >
      <v-list
        class="py-2"
        color="primary"
        elevation="12"
        rounded="lg"
      >
        <v-list-item
          prepend-icon="$vuetify-outline"
          :title="(store.state.dialog.text || '请稍等') + '...'"
        >
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="x-large"></v-icon>
            </div>
          </template>

          <template v-slot:append>
            <v-progress-circular
              color="primary"
              indeterminate="disable-shrink"
              size="16"
              width="2"
            ></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
</template>
<script setup>
import { ref,watch } from 'vue'

import { useStore } from 'vuex'
const store = useStore()
const dialog = ref(false)

watch(() => store.state.dialog, (value) => {
  if (value.dialog == 'loading') {
    dialog.value = value.value
  }
}, { immediate: true })

watch(()=> dialog.value, (value) => {
  if(!value){
    store.commit('setDialog', {dialog: 'loading', value: false})
  }
})
</script>