import path from "path"

import fse from "fs-extra"
import store from "@/store/index"

// 公共配置
const COMMON_DEFAULT_CONFIG = {
  inputFolder: "C:\\Users\\wojia\\Desktop\\1", // 输入数据文件夹
  outputFolder: "C:\\Users\\wojia\\Desktop\\output", // 输出文件夹
  transfer: false, // 移动图片
}
/**
 * 配置文件类型
 * @type {Object}
 */
export const CONFIG_TYPE = {
  classification2: {
    name: "数据二分类",
    description: "数据二分类",
    defaultConfig: Object.assign({}, COMMON_DEFAULT_CONFIG, {
      type: "classification2",
      negativeLabel: "0", // 负样本标签
      positiveLabel: "1", // 正样本标签
    }),
  },
  bbox: {
    name: "bbox标注",
    description: "多类别图片bounding box标注",
    defaultConfig: Object.assign({}, COMMON_DEFAULT_CONFIG, {
      type: "bbox",
      showCrossHair: false, // 是否显示辅助十字线
      lineColor: "#000000", // 辅助线颜色
      autoSelect: false, // 标注完自动select该bbox
      labels: [],  // 标签
    }),
  }
}
/**
 * 获取配置文件路径
 * @param folder
 * @return {string}
 */
export const getDataSetConfigFile = folder => {
  return path.join(folder, "config.json")
}

/**
 * 写数据集配置文件
 * @param {String} dataSet
 * @param {Object} config
 */
export const writeDataSetConfig = (dataSet, config) => {
  let configFile = getDataSetConfigFile(dataSet)
  fse.outputJSONSync(configFile, config)
}

export const writeCurrentDatasetConfig = config => {
  let currentDataset = store.state.config.config.outputFolder
  writeDataSetConfig(currentDataset, config)
}


/**
 * 读取数据集配置
 * @param dataSet
 * @return {Object}
 */
export const readDatasetConfig = (dataSet) => {
  let configFile = getDataSetConfigFile(dataSet)
  return fse.readJSONSync(configFile)
}

export const readCurrentDatasetConfig = () => {
  let currentDataset = store.state.config.config.outputFolder
  return readDatasetConfig(currentDataset)
}

export const updateConfig = (key, value) => {
  let config = JSON.parse(JSON.stringify(store.state.config.config))
  config[key] = value
  store.commit("config/setConfig", config)
  writeCurrentDatasetConfig(config)
}
