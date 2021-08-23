<template>
  <div class="classification2">
    <div style="display: flex;flex: 1">
      <div class="button" :class="result[currentImage] === config.negativeLabel ? 'active' : null" @click="labelCurrentImage(config.negativeLabel)">
        负样本<br/>
        标签：{{config.negativeLabel }}<br/>
        {{ config.outputFolder }}<br/>
        已标注：{{negativeResultCount}}<br/>
      </div>
      <div style="width: 60%;display: flex;flex-direction: column;justify-content: center;align-content: center">
        <div style="text-align: center;font-size: 12px">
          <div style="font-size: 18px">标注进度：{{currentIndex+1}}/{{images.length}}</div>
          当前正在标注：{{images[currentIndex]}}<br/>
          快捷键：<br />
          标记为正样本并切换到下一张：方向键下（或者点击右侧正样本区域） <br />
          标记为负样本并切换到下一张：方向键上（或者点击左侧负样本区域） <br />
          切换到上一张 ：方向键左<br />
          切换到下一张：方向键右 <br />
        </div>
        <img v-if="currentImagePath" :src="currentImagePath" style="height: 100%;width: 100%;object-fit: contain"/>
        <div v-else style="text-align: center;font-size: 40px">文件不存在</div>
      </div>
      <div class="button" :class="result[currentImage] === config.positiveLabel ? 'active' : null" @click="labelCurrentImage(config.positiveLabel)">
        正样本<br/>
        标签：{{config.positiveLabel }}<br/>
        {{ config.outputFolder }}<br/>
        已标注：{{positiveResultCount}}<br/>
      </div>
    </div>
    <div style="height: 30px;border-top: 1px solid black">
      {{currentIndex+1}}/{{images.length}}
      {{ log }}
    </div>
  </div>
</template>

<script>
import fs from "fs"
import path from "path"
import {getCurrentWindow} from "@electron/remote"
import {register, unregisterAll} from "electron-localshortcut"
import {mapState} from "vuex"

import {copyFile, moveFile, readAllImage} from "@/utils/fs"
import {readCurrentDatasetResult, writeDataSetResult} from "@/utils/result"
import {showInfo} from "@/utils/notice"
import {Message} from "element-ui"

export default {
  name: "Index",
  computed: {
    ...mapState({
      config: state => state.config.config
    }),
    /**
     * 当前图片名称
     * @return {String}
     */
    currentImage() {
      return this.images[this.currentIndex] || ""
    },
    /**
     * 当前正在分类的图片路径
     * @return {String}
     */
    currentImagePath() {
      let imagePath = path.join(this.config.inputFolder, this.currentImage)
      if (!fs.existsSync(imagePath)) return ""
      if (this.currentIndex >=0 && this.images.length > this.currentIndex) return imagePath
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
    this.result = readCurrentDatasetResult()
    this.addShortcut()
  },
  destroyed() {
    this.removeShortcut()
  },
  data() {
    return {
      configDialogVisible: true, // 设置对话框可见性
      currentIndex: 0, // 当前index
      images: [], // 所有图片
      result: {}, // 标注结果
      log: "",
      saving: false, // 是否正在保存，防止长按
    }
  },
  methods: {
    /**
     * 注册快捷键
     */
    addShortcut() {
      register(getCurrentWindow(),"Up", ()=> {this.labelCurrentImage(this.config.negativeLabel)})
      register(getCurrentWindow(),"Down", ()=> {this.labelCurrentImage(this.config.positiveLabel)})
      register(getCurrentWindow(),"Left", ()=> {
        if (this.currentIndex === 0) {
          showInfo("没有上一张了")
          return
        }
        this.currentIndex = this.currentIndex - 1
      })
      register(getCurrentWindow(),"Right", ()=> {
        if (this.currentIndex === this.images.length - 1) {
          showInfo("没有下一张了")
          return
        }
        this.currentIndex = this.currentIndex + 1
      })
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
    /**s
     * 标注当前图片
     * @param label
     */
    async labelCurrentImage(label) {
      if (this.saving) return
      if (!this.currentImagePath) {
        Message.info("图片不存在")
        return
      }
      this.saving = true
      this.log = `${this.currentImagePath}标记为${label}`
      this.$set(this.result, this.images[this.currentIndex], label)
      let toFile = path.join(this.config.outputFolder, this.images[this.currentIndex])
      if (this.config.transfer)
      {
        if (fs.existsSync(this.currentImagePath))
          await moveFile(this.currentImagePath, toFile)
      }
      else
        await copyFile(this.currentImagePath, toFile)
      writeDataSetResult(this.config.outputFolder, this.result)
      if (this.currentIndex === this.images.length - 1) {
        showInfo("没有下一张了")
        return
      }
      this.currentIndex = this.currentIndex + 1
      // sleep一下防止img标签对图片资源的占用
      setTimeout(() => {
        this.saving = false
      }, 100)
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
    //box-sizing: border-box;
    padding: 20px;
    word-wrap: break-word;
    font-size: 18px;

    &:hover {
      cursor: pointer;
      background: #5daf34;
    }
  }

  .active {
    background: #5daf34;
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
