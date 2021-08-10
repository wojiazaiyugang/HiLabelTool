const state = {
  config: { // 当前配置
    type: "",
    inputFolder: "", // 输入数据文件夹
    outputFolder: "", // 输出文件夹
    transfer: false, // 移动图片
    negativeLabel: "", // 负样本标签
    positiveLabel: "", // 正样本标签
    showCrossHair: false, // 是否显示辅助十字线
    autoSelect: false, // 标注完自动select该bbox
    labels: [],  // 标签
  },
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
