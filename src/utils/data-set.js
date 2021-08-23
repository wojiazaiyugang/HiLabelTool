import path from "path"

import fs from "fs"
import fse from "fs-extra"

import store from "@/store/index"

/**
 * 获取数据集标注结果
 * @param folder
 * @return {string}
 */
const getDataSetResultFile = folder => {
  return path.join(folder, "data.json")
}

/**
 * 获取当前数据集
 * @return {string}
 */
export const getCurrentDataSet = () => {
  return store.state.config.config.dataSet
}

/**
 * 读取数据集的标注结果
 * @return {Object}
 */
export const readDatasetResult = dataSet => {
  let resultFile = getDataSetResultFile(dataSet)
  if (!fs.existsSync(resultFile)) fse.outputJsonSync(resultFile, {})
  return fse.readJSONSync(resultFile)
}

/**
 * 读取当前数据集的标注结果
 * @return {Object}
 */
export const readCurrentDatasetResult = () => {
  let currentDataset = getCurrentDataSet()
  return readDatasetResult(currentDataset)
}

/**
 * 写标注结果
 * @param dataSet
 * @param result
 */
export const writeDataSetResult = (dataSet, result) => {
  let resultFile = getDataSetResultFile(dataSet)
  fse.outputJsonSync(resultFile, result)
}

/**
 * 写当前数据集的标注结果
 * @param result
 */
export const writeCurrentDataSetResult = result => {
  let currentDataset = getCurrentDataSet()
  writeDataSetResult(currentDataset, result)
}