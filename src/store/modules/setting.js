const state = {
  setting: { // 配置
    showCrossHair: false, // 是否显示辅助十字线
  }
}


const mutations = {
  setSetting(state, setting) {
    state.setting = setting
  },
  setShowCrossHair(state, showCrossHair) {
    state.showCrossHair = showCrossHair
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
