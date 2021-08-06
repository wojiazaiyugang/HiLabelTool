import * as remote from "@electron/remote"
import fs from "fs"

/**
 * 选择一个文件夹，返回文件夹路径
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

/**
 * 获取一个文件夹下所有的图片文件
 * @param folder
 * @return {Array<String>}
 */
export const readAllImage = folder => {
  let images = []
  fs.readdirSync(folder).forEach(file => {
    if (["jpg", "png"].includes(file.split(".").pop())) images.push(file)
  })
  return images
}

/**
 * 复制文件
 * @param {String} from
 * @param {String} to
 */
export const copyFile = (from, to) => {
  let readPipe = fs.createReadStream(from)
  let writePipe = fs.createWriteStream(to)
  readPipe.pipe(writePipe)
}

/**
 * 移动文件
 * @param {String} from
 * @param {String} to
 */
export const moveFile = (from, to) => {
  copyFile(from, to)
  fs.unlinkSync(from)
}

/**
 * 删除文件
 * @param file
 */
export const removeFile = file => {
  fs.unlinkSync(file)
}