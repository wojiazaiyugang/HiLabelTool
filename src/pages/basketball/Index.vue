<template>
  <div class="basketball">
    <div style="display: flex;flex: 1">
      <div class="side-bar">
        <div class="button">
          <i class="iconfont icon-juxing"></i>
          矩形
        </div>
        <div class="button" :class="setting.showCrossHair ? 'active': ''"
             @click="setting.showCrossHair = !setting.showCrossHair">
          <i class="iconfont icon-shizixian-"></i>
          十字线
        </div>
        <div class="button" @click="labelPreviousImage()">
          <i class="iconfont icon-shangyige"></i>
          上一个
        </div>
        <div class="button" @click="labelNextImage()">
          <i class="iconfont icon-xiayige"></i>
          下一个
        </div>
        <div class="button" @click="deleteLabelRect">
          <i class="iconfont icon-delete"></i>
          删除
        </div>
        <div class="button" style="margin-top: auto" @click="routeTo('/')">
          <i class="iconfont icon-shouye"></i>
          首页
        </div>
        <div class="button" @click="settingDialogVisible = true">
          <i class="iconfont icon-shezhi"></i>
          设置
        </div>
        <div class="button" @click="test">
          <i class="iconfont icon-ceshi"></i>
          DEBUG
        </div>
      </div>
      <div style="background: rgba(17,255,0,0.06);flex: 1;position: relative">
        <div id="stage" style="width: 100%;height: 100%;position: absolute"></div>
      </div>
      <div style="width: 80px;background: rgba(75,58,58,0.07)"></div>
    </div>
    <div
      style="display: flex;flex-wrap: nowrap;height: 80px;background: rgba(203,191,191,0.12);overflow-y: auto">
      已经标注bbox个数：{{ labelBBoxCount }} 标注进度：{{ currentImageIndex }}/{{ images.length }}
      <br/>
      当前状态；{{ status }} {{ pointerPosition }}
      <br/>
      {{ log }}
      <!--      <img v-for="(image, index) in images" :key="image" :src="image" style="height: 100%;width: auto">-->
    </div>
    <el-dialog title="设置" :visible.sync="settingDialogVisible" fullscreen>
      <el-form :model="setting" label-width="120px">
        <el-form-item label="数据目录">
          <el-input disabled v-model="setting.inputFolder" style="width: 700px"></el-input>
          <el-button @click="selectFolder">选择</el-button>
        </el-form-item>
        <el-form-item label="生成结果目录">
          <el-input disabled v-model="setting.outputFolder" style="width: 700px"></el-input>
          <el-button @click="selectFolder">选择</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="this.loadDataFolder">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from "path"
import Konva from "konva"
import {remote} from "electron"
import * as fs from "fs"
import fse from "fs-extra"

import {routeTo} from "@/utils/router"

const STATUS = { // 状态
  normal: "正常状态",
  drawing: "正在绘图",
  selecting: "选择了某个图形",
  hovering: "悬停在某个图形上",
  moving: "正在移动某个图形",
  resizing: "正在resize某个图形",
}
const LABEL_RECT_NAME = "LABEL_RECT_NAME" // 标注的bbox的名字

export default {
  name: "Index",
  computed: {
    container() {
      return document.getElementById(this.containerID)
    },
    labelBBoxCount() {
      return this.labelGroup ? this.labelGroup.children.filter(child => child.hasName(LABEL_RECT_NAME)).length : 0
    },
    /**
     * x方向缩放比例
     */
    scaleX() {
      return this.currentImageSize.width / this.container.offsetWidth
    },
    scaleY() {
      return this.currentImageSize.height / this.container.offsetHeight
    },
  },
  mounted() {
    this.initKonva()
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeImage()
    })
    this.resizeObserver.observe(document.getElementById(this.containerID))
  },
  data() {
    return {
      status: "", // 当前状态
      settingDialogVisible: true, // 设置对话框可见性
      containerID: "stage", //div的id
      setTimeoutTimer: null, //
      stage: null, // konva的stage
      layer: null, //
      imageGroup: null, // 图片层
      labelGroup: null, // 画的标签层
      drawGroup: null, // 正在画的层
      imageURL: "C:\\Users\\\\\\wojiazaiyugang\\Desktop\\1\\00001.jpg",
      drawing: false, // 当前正在绘画
      drawStartPoint: { // 绘画的起始点
        x: null,
        y: null
      },
      setting: { // 配置
        showCrossHair: false, // 是否显示辅助十字线
        inputFolder: "C:\\Users\\\\wojiazaiyugang\\Desktop\\1", // 输入数据文件夹
        outputFolder: "C:\\Users\\\\wojiazaiyugang\\Desktop", // 输出文件夹
      },
      images: [], // 图片列表
      currentImageIndex: -1, // 当前的index
      currentImageSize: { // 当前原视图像的size
        width: null,
        height: null
      },
      selectedLabelRect: null, // 选择的label rect
      pointerPosition: { // 当前鼠标在原图上的位置
        x: null,
        y: null,
      },
      log: "", // 日志
      initStageSize: {
        width: null,
        height: null
      }
    }
  },
  methods: {
    routeTo: path => routeTo(path),
    selectFolder() {
      let folders = remote.dialog.showOpenDialogSync({
        properties: ["openDirectory"]
      })
      if (folders) this.setting.inputFolder = folders[0]
    },
    deleteLabelRect() {
      this.stage.find("Transformer").forEach(t => t.destroy())
      this.selectedLabelRect && this.selectedLabelRect.destroy()
    },
    loadDataFolder() {
      this.settingDialogVisible = false
      fs.readdirSync(this.setting.inputFolder).forEach(item => {
        if (["jpg", "png"].includes(item.split(".").pop())) this.images.push(path.join(this.setting.inputFolder, item))
      })
      this.labelImage(0)
    },
    /**
     * 标注上一张图片
     */
    labelPreviousImage() {
      this.saveLabelResult()
      if (this.currentImageIndex - 1 < 0) {
        return
      }
      this.labelImage(this.currentImageIndex - 1)
    },
    /**
     * 标注 下一张图片
     */
    labelNextImage() {
      this.saveLabelResult()
      if (this.currentImageIndex + 1 >= this.images.length) {
        return
      }
      this.labelImage(this.currentImageIndex + 1)
    },
    /**
     * 标注某一张图片
     */
    labelImage(index) {
      this.labelGroup.removeChildren()
      this.imageGroup.removeChildren()
      this.currentImageIndex = index
      let imageObj = new Image()
      imageObj.src = this.images[this.currentImageIndex]
      this.currentImageSize = {
        width: imageObj.width,
        height: imageObj.height
      }
      let image = new Konva.Image({
        image: imageObj,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      })
      this.imageGroup.add(image)
    },
    /**
     * 保存当前帧标注结果
     */
    saveLabelResult() {
      let result = []
      let labelResults = this.labelGroup.getChildren().filter(child => child.hasName(LABEL_RECT_NAME))
      if (labelResults.length === 0) return
      labelResults.forEach(labelResult => {
        let [ltX, ltY] = [Math.round(labelResult.position().x * this.scaleX), Math.round(labelResult.position().y * this.scaleY)]
        let [rbX, rbY] = [ltX + Math.round(labelResult.width() * this.scaleX * labelResult.scaleX()), ltY + Math.round(labelResult.height() * this.scaleY * labelResult.scaleY())]
        result.push({
          ltX: ltX,
          ltY: ltY,
          rbX: rbX,
          rbY: rbY
        })
      })
      let inputFilePath = this.images[this.currentImageIndex]
      let outputFileName = inputFilePath.substring(inputFilePath.lastIndexOf(path.sep) + 1)
      let outputFilePath = `${path.join(this.setting.outputFolder, outputFileName)}.json`
      fse.outputJsonSync(outputFilePath, result)
      this.log = `标注结果保存到${outputFilePath}`
    },
    /**
     * 初始化konva
     */
    initKonva() {
      this.stage = new Konva.Stage({
        container: this.containerID,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
      })
      this.initStageSize = {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
      }
      this.stage.on("mouseenter", () => this.onMouseEnter())
      this.stage.on("mouseleave", () => this.onMouseLeave())
      this.stage.on("mousemove", () => this.onMouseMove())
      this.stage.on("mousedown", () => this.onMouseDown())
      this.stage.on("mouseup", () => this.onMouseUp())
      this.stage.on("click", ($event) => this.onClick($event))
      this.layer = new Konva.Layer()
      this.imageGroup = new Konva.Group()
      this.labelGroup = new Konva.Group()
      this.drawGroup = new Konva.Group()
      this.layer.add(this.imageGroup, this.labelGroup, this.drawGroup)
      this.stage.add(this.layer)
    },
    /**
     * resize要标注的图片
     */
    resizeImage() {
      let scaleX = this.container.offsetWidth / this.initStageSize.width
      let scaleY = this.container.offsetHeight / this.initStageSize.height
      this.stage.width(this.container.offsetWidth)
      this.stage.height(this.container.offsetHeight)
      this.stage.scale({x: scaleX, y:scaleY})

    },
    test() {
      this.stage.scale({x: this.stage.scaleX() + 0.1, y: this.stage.scaleY() + 0.1})
    },
    onMouseEnter() {
      this.status = STATUS.normal
      this.stage.container().style.cursor = "crosshair"
    },
    onMouseLeave() {
      this.status = STATUS.normal
      this.drawGroup.removeChildren()
      this.stage.container().style.cursor = "default"
    },
    /**
     * 在图片上移动的事件
     */
    onMouseMove() {
      this.pointerPosition = {
        x: Math.round(this.stage.getRelativePointerPosition().x * this.scaleX),
        y: Math.round(this.stage.getRelativePointerPosition().y * this.scaleY)
      }
      this.drawGroup.removeChildren()
      if (this.setting.showCrossHair && this.status === STATUS.normal) {
        let [x, y] = [this.stage.getRelativePointerPosition().x, this.stage.getRelativePointerPosition().y]
        this.drawGroup.add(
          new Konva.Line({
            points: [0, y, this.stage.width(), y],
            stroke: "green",
            strokeWidth: 1,
            dash: [20, 5]
          }),
          new Konva.Line({
            points: [x, 0, x, this.stage.height()],
            stroke: "green",
            strokeWidth: 1,
            dash: [20, 5]
          })
        )
      }
      if (this.status === STATUS.drawing)
        this.drawGroup.add(new Konva.Rect({
          x: this.drawStartPoint.x,
          y: this.drawStartPoint.y,
          width: this.stage.getRelativePointerPosition().x - this.drawStartPoint.x,
          height: this.stage.getRelativePointerPosition().y - this.drawStartPoint.y,
          stroke: "#000",
          strokeWidth: 2
        }))
    },
    onMouseDown() {
      if (this.status === STATUS.normal)
        this.startDraw()
      else if (this.status === STATUS.selecting) {
        this.status = STATUS.moving
        this.drawGroup.removeChildren()
      }
    },
    /**
     * 舞台点击事件，用于添加和删除transformer
     */
    onClick(e) {
      this.stage.find("Transformer").forEach(t => t.destroy())
      if (!e.target.hasName(LABEL_RECT_NAME)) {
        this.status = STATUS.normal
        this.selectedLabelRect = null
        return
      }
      let transFormer = new Konva.Transformer()
      this.labelGroup.add(transFormer)
      this.selectedLabelRect = e.target
      transFormer.nodes([e.target])
      this.status = STATUS.selecting
    },
    onMouseUp() {
      if (this.status === STATUS.drawing)
        this.stopDraw()
    },
    startDraw() {
      this.status = STATUS.drawing
      this.drawStartPoint = this.stage.getRelativePointerPosition()
    },
    stopDraw() {
      this.status = STATUS.normal
      let rect = new Konva.Rect({
        x: this.drawStartPoint.x,
        y: this.drawStartPoint.y,
        width: this.stage.getRelativePointerPosition().x - this.drawStartPoint.x,
        height: this.stage.getRelativePointerPosition().y - this.drawStartPoint.y,
        stroke: "#000",
        strokeWidth: 2,
        draggable: true,
        name: LABEL_RECT_NAME,
        strokeScaleEnabled: false
      })
      if (rect.width() < 20) return // 太小的bbox不要
      rect.on("mouseenter", () => {
        if (this.status !== STATUS.drawing) {
          this.stage.container().style.cursor = "pointer"
          this.status = STATUS.hovering
        }
      })
      rect.on("mouseleave", () => {
        if (this.status !== STATUS.drawing) {
          this.stage.container().style.cursor = "crosshair"
          if (this.status === STATUS.hovering)
            this.status = STATUS.normal
        }
      })
      rect.on("transformstart", () => {
        this.status = STATUS.resizing
      })
      rect.on("transformend", () => {
        this.status = STATUS.normal
      })
      this.labelGroup.add(rect)
    }
  }
}
</script>

<style lang="scss" scoped>
.basketball {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .side-bar {
    background: rgba(94, 88, 88, 0.09);
    width: 50px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px;
      white-space: nowrap;

      &:hover {
        cursor: pointer;
      }
    }

    .active {
      color: #55a532;
    }
  }
}
</style>

<style lang="scss">
.basketball {
  .el-dialog {
    display: flex;
    flex-direction: column;

    .el-dialog__body {
      flex: 1;
    }
  }

  .el-form-item__content {
    display: flex;
    flex-wrap: nowrap;
  }
}
</style>