const state = {
  config: { // 当前配置
    type: "",
    skipLabeled: false, // 跳过已经标注的
    dataSet: "", // 数据集文件夹
    negativeLabel: "", // 负样本标签
    positiveLabel: "", // 正样本标签
    showCrossHair: false, // 是否显示辅助十字线
    lineColor: "rgba(0,0,0,0.27)", // 辅助线颜色
    autoSelect: false, // 标注完自动select该bbox
    labels: [],  // 标签
  },
}

const mutations = {
  setConfig(state, config) {
    state.config = JSON.parse(JSON.stringify(config))
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
