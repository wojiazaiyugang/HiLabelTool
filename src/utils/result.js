import path from "path"

import fs from "fs"
import fse from "fs-extra"

/**
 * 获取数据集标注结果
 * @param folder
 * @return {string}
 */
const getDataSetResultFile = folder => {
  return path.join(folder, "data.json")
}

/**
 * 读取数据集的标注结果
 */
export const readDataSetResult = dataSet => {
  let resultFile = getDataSetResultFile(dataSet)
  if (!fs.existsSync(resultFile)) fse.outputJsonSync(resultFile, {})
  return fse.readJSONSync(resultFile)
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