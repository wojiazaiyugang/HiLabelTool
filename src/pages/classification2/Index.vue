<template>
  <div class="classification2">
    <div style="display: flex;flex: 1">
      <div class="button" @click="labelCurrentImage(config.negativeLabel)">
        负样本<br/>
        标签：{{config.negativeLabel }}<br/>
        {{ config.outputFolder }}<br/>
        已标注：{{negativeResultCount}}<br/>
        快捷键：键盘左方向
      </div>
      <div style="width: 60%;display: flex;flex-direction: column;justify-content: center;align-content: center">
        <div style="text-align: center;font-size: 12px">
          当前正在标注：{{images[currentIndex]}}<br/>
          共计{{images.length}}个,当前{{currentIndex + 1}} <br/>
          <el-button v-if="currentIndex > 0" @click="undoLast">撤销上一张标注</el-button>
        </div>
        <img v-if="currentImage" :src="currentImage" style="height: 100%;width: 100%;object-fit: contain"/>
        <div v-else style="text-align: center">标注完成</div>
      </div>
      <div class="button" @click="labelCurrentImage(config.positiveLabel)">
        正样本<br/>
        标签：{{config.positiveLabel }}<br/>
        {{ config.outputFolder }}<br/>
        已标注：{{positiveResultCount}}<br/>
        快捷键：键盘右方向
      </div>
    </div>
    <div style="height: 30px;border-top: 1px solid black">
      {{currentIndex+1}}/{{images.length}}
      {{ log }}
    </div>
    <el-dialog title="设置" :visible.sync="configDialogVisible" fullscreen>
      <el-form :model="config" :rules="rules" ref="form" label-width="120px" label-position="left">
        <el-form-item label="输入数据目录" prop="inputFolder">
          <el-input v-model="config.inputFolder" style="width: 500px"></el-input>
          <el-button @click="selectInputFolder">选择</el-button>
        </el-form-item>
        <el-form-item label="生成结果目录" prop="outputFolder">
          <el-input v-model="config.outputFolder" style="width: 500px"></el-input>
          <el-button @click="selectOutputFolder">选择</el-button>
        </el-form-item>
        <el-form-item label="正样本标签" prop="positiveLabel">
          <el-input v-model="config.positiveLabel" style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item label="负样本标签" prop="negativeLabel">
          <el-input v-model="config.negativeLabel" style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item label="移动原始图片">
          <el-tooltip content="标注完之后原始图片会被移动到目标文件夹而不是复制">
            <el-switch v-model="config.transfer"></el-switch>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="跳过已标注">
          <el-tooltip content="已经标注过的图片不再标注">
            <el-switch v-model="config.continue"></el-switch>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="importConfig">加载配置</el-button>
        <el-button @click="start">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import fse from "fs-extra"
import {getCurrentWindow} from "@electron/remote"
import {register, unregisterAll} from "electron-localshortcut"

import {copyFile, moveFile, readAllImage, selectFile, selectFolder, removeFile} from "@/utils/fs"
import {CONFIG_TYPE, writeDataSetConfig} from "@/utils/config"
import {readDataSetResult, writeDataSetResult} from "@/utils/result"
import path from "path"

const rules = {
  inputFolder: [{required: true, message: "不能为空"}],
  outputFolder: [{required: true, message: "不能为空"}],
  positiveLabel: [{required: true, message: "不能为空"}],
  negativeLabel: [{required: true, message: "不能为空"}],
}
export default {
  name: "Index",
  computed: {
    // 当前正在分类的图片
    currentImage() {
      if (this.currentIndex >=0 && this.images.length > this.currentIndex) return path.join(this.config.inputFolder, this.images[this.currentIndex])
      return ""
    },
    // 正样本个数
    positiveResultCount() {
      return Object.values(this.result).filter(result => result === this.config.positiveLabel).length
    },
    negativeResultCount() {
      return Object.values(this.result).filter(result => result === this.config.negativeLabel).length
    }
  },
  destroyed() {
    this.removeShortcut()
  },
  data() {
    return {
      configDialogVisible: true, // 设置对话框可见性
      config: {
        type: CONFIG_TYPE.classification2,
        inputFolder: "", // 输入文件夹
        outputFolder: "", // 输出文件夹
        transfer: false, // 移动图片
        continue: true, // 跳过已经标注的
        negativeLabel: "", // 负样本标签
        positiveLabel: "", // 正样本标签
      },
      rules,
      currentIndex: -1, // 当前index
      images: [], // 所有图片
      labeledImages: [], // 已经标注的图片 用于撤销
      result: {}, // 标注结果
      log: ""
    }
  },
  methods: {
    /**
     * 注册快捷键
     */
    addShortcut() {
      register(getCurrentWindow(),"Left", ()=> {this.labelCurrentImage(this.config.negativeLabel)})
      register(getCurrentWindow(),"Right", ()=> {this.labelCurrentImage(this.config.positiveLabel)})
    },
    removeShortcut() {
      unregisterAll(getCurrentWindow())
    },
    async selectInputFolder() {
      this.config.inputFolder = await selectFolder()
    },
    async selectOutputFolder() {
      this.config.outputFolder = await selectFolder()
    },
    async start() {
      try {
        await this.$refs["form"].validate()
      } catch (err) {
        return
      }
      this.result = readDataSetResult(this.config.outputFolder)
      writeDataSetConfig(this.config.outputFolder, this.config)
      this.configDialogVisible = false
      this.images = readAllImage(this.config.inputFolder)
      this.currentIndex = this.getNextIndex()
      if (this.currentIndex >= this.images.length)
        this.$message.info("该数据集已经标注完成")
      this.addShortcut()
    },
    async importConfig() {
      let file = await selectFile(["json"])
      this.config = fse.readJSONSync(file)
    },
    /**
     * 获取下一个需要标注的index
     * @return {int}
     */
    getNextIndex() {
      let index = this.currentIndex + 1
      if (this.config.continue) {
        while (Object.keys(this.result).includes(this.images[index]) && index < this.images.length) {
          this.log = `跳过已经标注过的图片${this.images[index]}`
          index += 1
        }
      }
      if (index >= this.images.length)
        this.$message.info("已经标注完成")
      return index
    },
    /**
     * 撤销上一张标记结果
     */
    undoLast() {
      let image = this.images[this.currentIndex - 1]
      // 删除图片
      if (this.config.transfer)
        moveFile(path.join(this.config.outputFolder, image), path.join(this.config.inputFolder, image))
      else
        removeFile(path.join(this.config.outputFolder, image))
      // 删除数据
      delete this.result[image]
      writeDataSetResult(this.config.outputFolder, this.result)
      this.currentIndex = this.currentIndex - 1
    },
    /**
     * 标注当前图片
     * @param label
     */
    labelCurrentImage(label) {
      if (this.currentIndex < 0 || this.currentIndex >= this.images.length) return
      this.log = `${this.currentImage}标记为${label}`
      this.$set(this.result, this.images[this.currentIndex], label)
      let toFile = path.join(this.config.outputFolder, this.images[this.currentIndex])
      if (this.config.transfer)
        moveFile(this.currentImage, toFile)
      else
        copyFile(this.currentImage, toFile)
      writeDataSetResult(this.config.outputFolder, this.result)
      this.currentIndex = this.getNextIndex()
    },
  }
}
</script>

<style lang="scss" scoped>
.classification2 {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .button {
    width: 20%;
    border: 1px solid #5daf34;
    padding: 20px;
    word-wrap: break-word;
    font-size: 18px;

    &:hover {
      cursor: pointer;
      background: #5daf34;
    }
  }
}
</style>

<style lang="scss">
.classification2 {
  .el-dialog {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .el-dialog__body {
      flex: 1;
    }
  }
}
</style>