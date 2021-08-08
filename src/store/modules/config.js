const state = {
  config: {}, // 当前配置
}

const mutations = {
  setConfig(state, config) {
    state.config = config
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
