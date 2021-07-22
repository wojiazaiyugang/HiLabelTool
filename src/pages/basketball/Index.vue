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
        <div class="button" @click="labelImage(currentImageIndex - 1)">
          <i class="iconfont icon-shangyige"></i>
          上一个
        </div>
        <div class="button" @click="saveLabelResult">
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
      </div>
      <div id="stage" style="flex: 1;border: 1px solid black;overflow: hidden">
      </div>
      <div style="width: 80px;background: rgba(75,58,58,0.07)">
        标注个数{{ labelBBoxCount }}
        当前帧{{ currentImageIndex }}
        状态{{ status }}
      </div>
    </div>
    <div
      style="display: flex;flex-wrap: nowrap;height: 80px;background: rgba(203,191,191,0.12);border-top: 1px solid black;overflow-y: auto">
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

import {routeTo} from "@/utils/router"

const STATUS = { // 状态
  normal: "正常状态",
  drawing: "正在绘图",
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
      return this.labelLayer ? this.labelLayer.children.filter(child => child.hasName(LABEL_RECT_NAME)).length : 0
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
      imageLayer: null, // 图片层
      labelLayer: null, // 画的标签层
      drawLayer: null, // 正在画的层
      imageURL: "C:\\Users\\\\wojiazaiyugang\\Desktop\\1\\00001.jpg",
      drawing: false, // 当前正在绘画
      drawStartPoint: { // 绘画的起始点
        x: null,
        y: null
      },
      setting: { // 配置
        showCrossHair: false, // 是否显示辅助十字线
        inputFolder: "C:\\Users\\wojia\\Desktop\\1", // 输入数据文件夹
        outputFolder: "C:\\Users\\wojia\\Desktop", // 输出文件夹
      },
      images: [], // 图片列表
      currentImageIndex: -1, // 当前的index
      currentImageSize: { // 当前原视图像的size
        width: null,
        height: null
      },
      selectedLabelRect: null, // 选择的label rect
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
     * 加载下一张图片
     */
    labelImage(index) {
      if (index < 0) {
        this.currentImageIndex = 0
        return
      }
      if (index === this.images.length) {
        this.currentImageIndex = this.images.length - 1
        return
      }
      this.saveLabelResult()
      this.labelLayer.removeChildren()
      this.imageLayer.removeChildren()
      this.currentImageIndex = index
      let imageObj = new Image()
      imageObj.src = this.images[this.currentImageIndex]
      this.currentImageSize = {
        width: imageObj.width,
        height: imageObj.height
      }
      // console.log(imageObj.size())
      let image = new Konva.Image({
        image: imageObj,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      })
      this.imageLayer.add(image)
    },
    saveLabelResult() {
      let rect = this.labelLayer.getChildren()[0]
      if (rect) {
        let [ltX, ltY] = [parseInt(rect.position().x * this.scaleX), parseInt(rect.position().y * this.scaleY)]
        let [rbX, rbY] = [ltX + parseInt(rect.width() * this.scaleX * rect.scaleX()), ltY + parseInt(rect.height() * this.scaleY * rect.scaleY())]
        console.log(ltX, ltY, rbX, rbY, rect.scaleX(), rect.scaleY())
      }
    },
    /**
     * 初始化konva
     */
    initKonva() {
      this.stage = new Konva.Stage({
        container: this.containerID,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      })
      this.stage.on("mouseenter", () => this.onMouseEnter())
      this.stage.on("mouseleave", () => this.onMouseLeave())
      this.stage.on("mousemove", () => this.onMouseMove())
      this.stage.on("mousedown", () => this.onMouseDown())
      this.stage.on("mouseup", () => this.onMouseUp())
      this.stage.on("click", ($event) => this.onClick($event))
      this.imageLayer = new Konva.Layer()
      this.labelLayer = new Konva.Layer()
      this.drawLayer = new Konva.Layer()
      this.stage.add(this.imageLayer, this.labelLayer, this.drawLayer)
    },
    /**
     * resize要标注的图片
     */
    resizeImage() {
      this.setTimeoutTimer && clearTimeout(this.setTimeoutTimer)
      this.setTimeoutTimer = setTimeout(() => {
        this.stage.width(this.container.offsetWidth - 2)
        this.stage.height(this.container.offsetHeight - 2)
      }, 50)
    },
    onMouseEnter() {
      this.status = STATUS.normal
      this.stage.container().style.cursor = "crosshair"
    },
    onMouseLeave() {
      this.status = STATUS.normal
      this.drawLayer.removeChildren()
      this.stage.container().style.cursor = "default"
    },
    /**
     * 在图片上移动的事件
     */
    onMouseMove() {
      this.drawLayer.removeChildren()
      if (this.setting.showCrossHair && this.status === STATUS.normal) {
        let [x, y] = [this.stage.getRelativePointerPosition().x, this.stage.getRelativePointerPosition().y]
        let label = new Konva.Label({
          x: x + 10,
          y: y - 10,
          opacity: 0.7
        })
        label.add(
          new Konva.Tag({
            fill: "#000"
          }),
          new Konva.Text({
            text: `(${parseInt(x * this.scaleX)},${parseInt(y * this.scaleY)})`,
            fontFamily: "Calibri",
            fontSize: 18,
            padding: 5,
            fill: "#FFF"
          })
        )
        this.drawLayer.add(
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
          }),
          label
        )
      }
      if (this.status === STATUS.drawing)
        this.drawLayer.add(new Konva.Rect({
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
      else if (this.status === STATUS.hovering) {
        this.status = STATUS.moving
        this.drawLayer.removeChildren()
      }
    },
    /**
     * 舞台点击事件，用于添加和删除transformer
     */
    onClick(e) {
      this.stage.find("Transformer").forEach(t => t.destroy())
      if (!e.target.hasName(LABEL_RECT_NAME)) {
        this.selectedLabelRect = null
        return
      }
      let transFormer = new Konva.Transformer()
      this.labelLayer.add(transFormer)
      this.selectedLabelRect = e.target
      transFormer.nodes([e.target])
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
        name: LABEL_RECT_NAME
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
          this.status = STATUS.normal
        }
      })
      rect.on("transformstart", () => {
        this.status = STATUS.resizing
      })
      rect.on("transformend", () => {
        this.status = STATUS.normal
      })
      this.labelLayer.add(rect)
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
}
</style>