import { createStore } from 'vuex';

let server_ip = localStorage.getItem('server_ip') || 'http://' + window.location.hostname + ':3001';

const store = createStore({
  state: {
    server_ip: server_ip,
    lightgroups: [],
    lights: [],
    stairs: [],
    webcams: [],
    dialog: {},
    toast: { show: false },
    settings:{eruda:false}
  },
  getters: {
    getLightByGroupId: (state) => (group_id) => {
      return state.lights.filter(light => light.lightgroup_id === group_id);
    },
    getLight: (state) => (light_id) => {
      return state.lights.find(light => light.id == light_id);
    },
    getLightPositionBitByGroup: (state) => (group_id) => {
      console.log('getLightPositionBitByGroup', group_id);
      let lights = state.lights.filter(light => light.lightgroup_id == group_id);
      let bits = Array(32).fill(0);
      lights.forEach(light => {
        bits[light.channel] = 1;
      });
      return bits;
    },
    getGroupIdByLight: (state) => (light_id) => {
      let light = state.lights.find(light => light.id == light_id);
      return light ? light.lightgroup_id : 0;
    },
  },
  mutations: {
    setLightGroups(state, lightgroups) {
      state.lightgroups = lightgroups;
    },
    setLights(state, lights) {
      state.lights = lights;
    },

    setLightAllOn(state) {
      state.lights.forEach(light => {
        light.status = true;
      });
    },
    setLightAllOff(state) {
      state.lights.forEach(light => {
        light.status = false;
      });
    },
    setLightAllOnByGroupId(state, group_id ) {
      state.lights.forEach(light => {
        if (light.lightgroup_id == group_id) {
          light.status = true;
        }
      });
    },
    setLightAllOffByGroupId(state, group_id) {
      state.lights.forEach(light => {
        if (light.lightgroup_id == group_id) {
          light.status = false;
        }
      });
    },
    /**
     * 从设备返回的数据中设置灯的状态
     * @param {*} state 
     * @param {*} statusBit 
     * @returns 
     */
    setLightsStatusByBit(state, statusBit) {
    // bit 如果第0位是1 表示channel 1 是开的
      if(statusBit.length != 32) return;
     statusBit.forEach((status, index) => {
        let light = state.lights.find(light => light.channel == index+1);
        console.log('setLightsStatusByBit', index+1, status, light);
        if (light) light.status = !!status;
      });
    },
    /**
     * 设置灯的状态
     * @param {*} state 
     * @param {*} param1 
     */
    setLightStatus(state, { channel, status }) {
      if(channel == 255) {
        state.lights.forEach(light => {
          if(light.channel) light.status = !!status;
        });
        return;
      }

      let light = state.lights.find(light => light.id == channel-1);
      if (light) light.status = status;
    },


    setStairAllOpen(state, { callback }) {
      console.log('setStairAllOpen');
      state.stairs.forEach(stair => {
        if (callback) {
          callback(stair);
        }
      });
    },
    setStairAllClose(state, { callback }) {
      console.log('setStairAllClose');
      state.stairs.forEach(stair => {
        if (callback) {
          callback(stair);
        }
      });
    },
    setStairAllStop(state, { callback }) {
      console.log('setStairAllStop');
      if (callback) {
        state.stairs.forEach(stair => {
          callback(stair);
        });
      }
    },
    setStairs(state, stairs) {
      state.stairs = stairs;
    },
    setWebcams(state, webcams) {
      state.webcams = webcams;
    },
    setDialog(state, dialog) {
      state.dialog = dialog;
    },
    setToast(state, toast) {
      state.toast = toast;
      state.toast.show = true;
    },
    clearToast(state) {
      state.toast = { show: false };
    },

  },
  actions: {
    setToast({ commit, state }, { toast, timeout = 500 }) {
      if (state.toast) {
        setTimeout(() => {
          commit('setToast', toast);
        }, timeout); // 延迟后重新设置
      } else {
        commit('setToast', toast); // 立即设置 toast
        setTimeout(() => {
          commit('clearToast'); // 自动清理 toast
        }, timeout);
      }
    },
    async fetchtLightGroups({ commit }) {
      fetch(server_ip + '/api/lightgroup')
        .then((res) => res.json())
        .then((data) => {
          commit('setLightGroups', data.data);
        });
    },
    async fetchLights({ commit }) {
      fetch(server_ip + '/api/light')
        .then((res) => res.json())
        .then((data) => {
          commit('setLights', data.data);
        });
    },
    async fetchStairs({ commit }) {
      fetch(server_ip + '/api/stair')
        .then((res) => res.json())
        .then((data) => {
          commit('setStairs', data.data);
        });
    },
    async fetchWebcams({ commit }) {
      fetch(server_ip + '/api/camera')
        .then((res) => res.json())
        .then((data) => {
          commit('setWebcams', data.data);
        });
    },
    async init({ dispatch }) {
      return Promise.all([dispatch('fetchtLightGroups'),
        dispatch('fetchLights'),
        dispatch('fetchStairs'),
        dispatch('fetchWebcams')]);
    },

    async deleteLightGroup({ dispatch }, id) {
      return fetch(server_ip + '/api/lightgroup/' + id, {
        method: 'DELETE',
      }).then(() => {
        dispatch('fetchtLightGroups');
      });
    },
    async deleteLight({ dispatch }, id) {
      return fetch(server_ip + '/api/light/' + id, {
        method: 'DELETE',
      }).then(() => {
        dispatch('fetchLights');

      });
    },
    async deleteCamera({ dispatch }, id) {
      return fetch(server_ip + '/api/camera/' + id, {
        method: 'DELETE',
      }).then(() => {
        return dispatch('fetchWebcams');
      });
    },
    async deleteStair({ dispatch }, id) {
      return fetch(server_ip + '/api/stair/' + id, {
        method: 'DELETE',
      }).then(() => {
        return dispatch('fetchStairs');
      });
    }

  },
});

export default store;
