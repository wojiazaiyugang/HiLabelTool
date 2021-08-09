<template>
  <div class="classification2">
    <div style="display: flex;flex: 1">
      <div class="button" @click="labelCurrentImage(config.negativeLabel)">
        负样本<br/>
        标签：{{config.negativeLabel }}<br/>
        {{ config.outputFolder }}<br/>
        已标注：{{negativeResultCount}}<br/>
        快捷键：键盘下方向
      </div>
      <div style="width: 60%;display: flex;flex-direction: column;justify-content: center;align-content: center">
        <div style="text-align: center;font-size: 12px">
          当前正在标注：{{images[currentIndex]}}<br/>
          <el-button>上一张（←）</el-button>
          <el-button>下一张（→）</el-button><br/>
          共计{{images.length}}个,当前{{currentIndex + 1}} <br/>
        </div>
        <img v-if="currentImage" :src="currentImage" style="height: 100%;width: 100%;object-fit: contain"/>
        <div v-else style="text-align: center">标注完成</div>
      </div>
      <div class="button" @click="labelCurrentImage(config.positiveLabel)">
        正样本<br/>
        标签：{{config.positiveLabel }}<br/>
        {{ config.outputFolder }}<br/>
        已标注：{{positiveResultCount}}<br/>
        快捷键：键盘上方向
      </div>
    </div>
    <div style="height: 30px;border-top: 1px solid black">
      {{currentIndex+1}}/{{images.length}}
      {{ log }}
    </div>
  </div>
</template>

<script>
import path from "path"
import {getCurrentWindow} from "@electron/remote"
import {register, unregisterAll} from "electron-localshortcut"
import {mapState} from "vuex"

import {copyFile, moveFile, readAllImage} from "@/utils/fs"
import {writeDataSetResult} from "@/utils/result"

const rules = {
  inputFolder: [{required: true, message: "不能为空"}],
  outputFolder: [{required: true, message: "不能为空"}],
  positiveLabel: [{required: true, message: "不能为空"}],
  negativeLabel: [{required: true, message: "不能为空"}],
}
export default {
  name: "Index",
  computed: {
    ...mapState({
      config: state => state.config.config
    }),
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
  mounted() {
    this.images = readAllImage(this.config.inputFolder)
    this.currentIndex = this.getNextIndex()
    if (this.currentIndex >= this.images.length)
      this.$message.info("该数据集已经标注完成")
    this.addShortcut()
  },
  destroyed() {
    this.removeShortcut()
  },
  data() {
    return {
      configDialogVisible: true, // 设置对话框可见性
      rules,
      currentIndex: -1, // 当前index
      images: [], // 所有图片
      result: {}, // 标注结果
      log: ""
    }
  },
  methods: {
    /**
     * 注册快捷键
     */
    addShortcut() {
      register(getCurrentWindow(),"Up", ()=> {this.labelCurrentImage(this.config.negativeLabel)})
      register(getCurrentWindow(),"Down", ()=> {this.labelCurrentImage(this.config.positiveLabel)})
    },
    removeShortcut() {
      unregisterAll(getCurrentWindow())
    },
    /**
     * 获取下一个需要标注的index
     * @return {int}
     */
    getNextIndex() {
      let index = this.currentIndex + 1
      if (index >= this.images.length)
        this.$message.info("已经标注完成")
      return index
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