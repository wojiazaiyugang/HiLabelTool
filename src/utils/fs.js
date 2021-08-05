import {remote} from "electron"

/**
 * 选择一个文件夹
 * @return {Promise.resolve}
 */
export const selectFolder = async () => {
  return new Promise((resolve => {
    let folders = remote.dialog.showOpenDialogSync({
      properties: ["openDirectory"]
    })
    if (folders) resolve(folders[0])
  }))
}

/**
 * 选择本地文件路径
 * @param suffixes 后缀, ["json", "text"]
 * @return {Promise.resolve}
 */
export const selectFile = (suffixes = []) => {
  return new Promise(resolve => {
    let filePaths = remote.dialog.showOpenDialogSync({
      filters: [{
        name: "支持的格式",
        extensions: suffixes,
      }]
    })
    if (filePaths)
      resolve(filePaths[0])
  })
}