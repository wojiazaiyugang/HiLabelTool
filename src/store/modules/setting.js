const state = {
  setting: "i am setting"
}


const mutations = {
  setSetting(state, setting) {
    state.setting = setting
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
