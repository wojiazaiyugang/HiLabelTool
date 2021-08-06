import path from "path"

import fse from "fs-extra"

/**
 * 配置文件类型
 * @type {Object}
 */
export const CONFIG_TYPE = {
  classification2: {
    key: "classification2",
    description: "二分类，标注结果是json文件，key是文件名，value是类别，如{'input1.jpg': '正样本', 'input2.jpg': '负样本'}"
  }
}
/**
 * 获取配置文件路径
 * @param folder
 * @return {string}
 */
const getDataSetConfigFile = folder => {
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

/**
 * 读取数据集配置
 * @param dataSet
 * @return {Object}
 */
export const readDataSetConfig = (dataSet) => {
  let configFile = getDataSetConfigFile(dataSet)
  return fse.readJSONSync(configFile)
}