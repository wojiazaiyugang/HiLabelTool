<template>
  <div class="basketball">
    <div style="display: flex;flex: 1">
      <div class="side-bar">
        <el-tooltip content="标注完一个bbox后是否自动选择该bbox">
          <div class="button" :class="config.autoSelect ? 'active': ''"
               @click="updateConfig('autoSelect', !config.autoSelect)">
            <i class="iconfont icon-xuanze"></i>
            自动选择(s)
          </div>
        </el-tooltip>
        <el-tooltip content="是否显示辅助十字线">
          <div class="button" :class="config.showCrossHair ? 'active': ''"
               @click="updateConfig('showCrossHair', !config.showCrossHair)">
            <i class="iconfont icon-shizixian-"></i>
            十字线(c)
          </div>
        </el-tooltip>
        <div class="button">
          <el-color-picker :value="config.lineColor" show-alpha @change="changeColor"></el-color-picker>
          颜色
        </div>
        <el-tooltip content="保存当前结果并切换到上一张图片">
          <div class="button" @click="labelPreviousImage()">
            <i class="iconfont icon-shangyige"></i>
            上一个(a)
          </div>
        </el-tooltip>
        <el-tooltip content="保存当前结果并切换到下一张图片">
          <div class="button" @click="labelNextImage()">
            <i class="iconfont icon-xiayige"></i>
            下一个(d)
          </div>
        </el-tooltip>
        <el-tooltip content="删除当前选择的矩形框">
          <div class="button" @click="deleteLabelRect">
            <i class="iconfont icon-delete"></i>
            删除(del)
          </div>
        </el-tooltip>
      </div>
      <div style="background: rgba(51,81,116,0.56);flex: 1;position: relative">
        <div id="stage" style="width: 100%;height: 100%;position: absolute"></div>
      </div>
      <div style="width: 160px;display: flex;flex-direction: column;background: rgba(75,58,58,0.07)">
        <div style="height: 40%;border-bottom: 1px solid black;overflow-y: auto;overflow-x: hidden">
          <div v-for="(label, index) in config.labels"
               :key="index"
               class="label-button"
               :style="{background: label.color}"
          @click="setSelectedRectLabel(label)">
          {{label.name}}({{index}})
          </div>
        </div>
        <div style="flex: 1;display: flex;flex-direction: column">
          <div v-for="(labelRect, index) in labelRects"
               class="label-rect"
               :style="{background: labelRect.label ? labelRect.label.color: null}"
               :key="index"
          @click="selectRect(labelRect)">
            {{ labelRect.label ? labelRect.label.name : '未知类别' }}
            {{ labelRect.stay ? '保留' : '不保留' }}
            <span class="link" style="margin-left: auto" @click="changeStay(labelRect)">切换</span>
          </div>
        </div>
      </div>
    </div>
    <div
      style="display: flex;flex-wrap: nowrap;height: 80px;background: rgba(203,191,191,0.12);overflow-y: auto">
      当前图片{{this.images[this.currentImageIndex]}}<br/>
      已经标注bbox个数：{{ labelRects.length }} 标注进度：{{ currentImageIndex }}/{{ images.length }}<br/>
      当前状态；{{ status }} {{ pointerPosition }}<br/>
      {{ log }}
    </div>
  </div>
</template>

<script>
import path from "path"
import Konva from "konva"
import {remote} from "electron"
import * as fs from "fs"
import {mapState, mapMutations} from "vuex"
import {register, unregisterAll} from "electron-localshortcut"
import {getCurrentWindow} from "@electron/remote"

import {writeCurrentDataSetResult, readCurrentDatasetResult} from "@/utils/data-set"
import {updateConfig} from "@/utils/config"
import {showInfo} from "@/utils/notice"

const STATUS = { // 状态
  normal: "正常状态",
  drawing: "正在绘图",
  selecting: "选择了某个图形",
  hovering: "悬停在某个图形上",
}
const LABEL_RECT_NAME = "LABEL_RECT_NAME" // 标注的bbox的名字

export default {
  name: "Index",
  filters: {
    formatBBox: bbox => `(${bbox.ltX},${bbox.ltY},${bbox.rbX},${bbox.rbY})`
  },
  computed: {
    ...mapState({
      config: state => state.config.config
    }),
    /**
     * 当前在标注的图片
     * @return {String || null}
     */
    currentImage() {
      return this.images[this.currentImageIndex]
    },
    /**
     * 当前正在标注的图片完整路径
     * @return {String}
     */
    currentImagePath() {
      return path.join(this.config.dataSet, this.currentImage)
    },
    /**
     * konva的rect
     */
    labelRects() {
      if (!this.labelGroup) return []
      return this.labelGroup.children.filter(child => child.hasName(LABEL_RECT_NAME))
    },
    container() {
      return document.getElementById(this.containerID)
    },
    /**
     * 可视区域和原始图片的缩放比例
     */
    imageScaleX() {
      return this.container ? this.currentImageSize.width / this.container.offsetWidth : 1
    },
    imageScaleY() {
      return this.container ? this.currentImageSize.height / this.container.offsetHeight : 1
    },
  },
  mounted() {
    this.initKonva()
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeImage()
    })
    this.resizeObserver.observe(document.getElementById(this.containerID))
    this.result = readCurrentDatasetResult()
    this.addShortcut()
    this.loadDataFolder()
  },
  destroyed() {
    unregisterAll(getCurrentWindow())
  },
  data() {
    return {
      status: STATUS.normal, // 当前状态
      containerID: "stage", //div的id
      setTimeoutTimer: null, //
      stage: null, // konva的stage
      layer: null, //
      imageGroup: null, // 图片层
      labelGroup: null, // 画的标签层
      drawGroup: null, // 正在画的层
      imageURL: "C:\\Users\\wojiazaiyugang\\Desktop\\1\\00001.jpg",
      drawing: false, // 当前正在绘画
      drawStartPoint: {x: null, y: null},// 绘画的起始点
      showCrossHair: false, // 是否显示辅助十字线
      images: [], // 图片列表
      currentImageIndex: -1, // 当前的index
      currentImageSize: {width: null, height: null},// 当前原视图像的size
      selectedLabelRect: null, // 选择的label rect
      pointerPosition: {x: null, y: null,},// 当前鼠标在原图上的位置
      log: "", // 日志
      initStageSize: {width: null, height: null},
      stayLabelRects: [], // 保存到下一帧的label rect
      result: {}, // 当前数据集的result
      // 是否需要save，防止疯狂切图的时候不停保存数据错乱，以下情况需要保存：新建bbox，缩放bbox、移动bbox、删除bbox、保留bbox传到下一张
      needSave: false,
    }
  },
  methods: {
    ...mapMutations({
      setConfig: "config/setConfig"
    }),
    changeColor(color) {
      this.updateConfig("lineColor", color)
    },
    updateConfig(key, value) {
      updateConfig(key, value)
    },
    setLabel(rect, label) {
      rect.fill(label.color)
      this.$set(rect, "label", label)
    },
    setSelectedRectLabel(label) {
      if (!this.selectedLabelRect) return
      this.setLabel(this.selectedLabelRect, label)
    },
    /**
     * 注册快捷键
     */
    addShortcut() {
      register(getCurrentWindow(),"C", ()=> {this.updateConfig("showCrossHair", !this.config.showCrossHair)})
      register(getCurrentWindow(),"S", ()=> {this.updateConfig("autoSelect", !this.config.autoSelect)})
      register(getCurrentWindow(),"A", ()=> {this.labelPreviousImage()})
      register(getCurrentWindow(),"D", ()=> {this.labelNextImage()})
      register(getCurrentWindow(),"Delete", ()=> {this.deleteLabelRect()})
      for (let i=0;i<10;i++) {
        if (i >= this.config.labels.length) return
        register(getCurrentWindow(),i.toString(), ()=> {this.setSelectedRectLabel(this.config.labels[i])})
      }
    },
    changeStay(labelRect) {
      this.$set(labelRect, "stay", ! labelRect.stay)
    },
    /**
     * 选择文件夹
     * @return {null | string}
     */
    selectFolder() {
      let folders = remote.dialog.showOpenDialogSync({
        properties: ["openDirectory"]
      })
      if (folders) return folders[0]
    },
    deleteLabelRect() {
      this.destoryAllTransformer()
      this.selectedLabelRect && this.selectedLabelRect.destroy()
      this.setNormalStatus()
      this.needSave = true
    },
    loadDataFolder() {
      fs.readdirSync(this.config.dataSet).forEach(file => {
        if (["jpg", "png"].includes(file.split(".").pop())) this.images.push(file)
      })
      if (this.config.skipLabeled) {
        let labeledImages = Object.keys(this.result)
        this.images = this.images.filter(image => !labeledImages.includes(image))
      }
      this.labelImage(0)
    },
    /**
     * 标注上一张图片
     */
    labelPreviousImage() {
      if (this.needSave)
        this.saveLabelRect()
      if (this.currentImageIndex - 1 < 0) {
        showInfo("没有上一张了")
        return
      }
      this.labelImage(this.currentImageIndex - 1)
    },
    /**
     * 标注 下一张图片
     */
    labelNextImage() {
      if (this.needSave)
        this.saveLabelRect()
      if (this.currentImageIndex + 1 >= this.images.length) {
        showInfo("没有下一张了")
        return
      }
      this.labelImage(this.currentImageIndex + 1)
    },
    /**
     * stage适应container
     */
    fitStageToContainer() {
      this.stage.width(this.container.offsetWidth)
      this.stage.height(this.container.offsetHeight)
      this.initStageSize = {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      }
      this.stage.scale({x: 1, y: 1})
      this.stage.position({x: 0, y: 0})
    },
    /**
     * 设置当前状态为正常
     */
    setNormalStatus() {
      this.status = STATUS.normal
      this.stage.container().style.cursor = "crosshair"
    },
    /**
     * 标注某一张图片
     */
    labelImage(index) {
      this.destoryAllTransformer()
      this.setNormalStatus()
      this.needSave = false
      this.labelRects.forEach(labelRect => {
        if (!labelRect.stay) labelRect.destroy()
        else this.needSave = true
      })
      this.imageGroup.removeChildren()
      this.currentImageIndex = index
      let imageObj = new Image()
      imageObj.src = this.currentImagePath
      imageObj.onload = () => {
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
        this.fitStageToContainer()
        for (let result of this.result[this.currentImage] || []) {
          let rect = this.addRect(result.bbox.ltX / this.imageScaleX, result.bbox.ltY / this.imageScaleY, result.bbox.rbX / this.imageScaleX, result.bbox.rbY / this.imageScaleY)
          if (!rect) continue
          let label = this.config.labels.find(label => label.name === result.label)
          if (label) {
            this.setLabel(rect, label)
          }
        }
      }
    },
    /**
     * 计算bbox
     * @param {Konva.Rect} rect
     * @return {Object}
     */
    getBBox(rect) {
      let [x1, y1] = [Math.round(rect.position().x * this.imageScaleX), Math.round(rect.position().y * this.imageScaleY)]
      let [x2, y2] = [x1 + Math.round(rect.width() * this.imageScaleX * rect.scaleX()), y1 + Math.round(rect.height() * this.imageScaleY * rect.scaleY())]
      return {
        ltX: Math.min(x1, x2),
        ltY: Math.min(y1, y2),
        rbX: Math.max(x1, x2),
        rbY: Math.max(y1, y2)
      }
    },
    /**
     * 保存当前帧标注结果
     */
    async saveLabelRect() {
      this.log = ""
      if (this.labelRects.length === 0) {
        delete this.result[this.currentImage]
      } else {
        let result = []
        this.labelRects.forEach(labelRect => result.push({
          bbox: this.getBBox(labelRect),
          label: labelRect.label ? labelRect.label.name : "未标注类别",
          imageWidth: this.currentImageSize.width,
          imageHeight: this.currentImageSize.height
        }))
        this.result[this.currentImage] = result
      }
      writeCurrentDataSetResult(this.result)
      this.drawGroup.removeChildren()
    },
    /**
     * 初始化konva
     */
    initKonva() {
      this.stage = new Konva.Stage({
        container: this.containerID,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,})
      this.initStageSize = {width: this.container.offsetWidth, height: this.container.offsetHeight,}
      this.stage.on("mouseenter", () => this.onMouseEnter())
      this.stage.on("mouseleave", () => this.onMouseLeave())
      this.stage.on("mousemove", () => this.onMouseMove())
      this.stage.on("mousedown", () => this.onMouseDown())
      this.stage.on("mouseup", () => this.onMouseUp())
      this.stage.on("click", ($event) => this.onClick($event))
      this.stage.on("wheel", ($event) => this.onWheel($event))
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
      this.stage.scale({x: scaleX, y: scaleY})
    },
    onMouseEnter() {
      this.setNormalStatus()
    },
    onMouseLeave() {
      this.drawGroup.removeChildren()
      this.stage.container().style.cursor = "default"
    },
    /**
     * 在图片上移动的事件
     */
    onMouseMove() {
      this.pointerPosition = {
        x: Math.round(this.stage.getRelativePointerPosition().x * this.imageScaleX),
        y: Math.round(this.stage.getRelativePointerPosition().y * this.imageScaleY)
      }
      this.drawGroup.removeChildren()
      if (this.config.showCrossHair && this.status === STATUS.normal) {
        let [x, y] = [this.stage.getRelativePointerPosition().x, this.stage.getRelativePointerPosition().y]
        this.drawGroup.add(
          new Konva.Line({
            points: [0, y, this.stage.width(), y],
            stroke: this.config.lineColor || "green",
            strokeWidth: 1,
            dash: [20, 5]
          }),
          new Konva.Line({
            points: [x, 0, x, this.stage.height()],
            stroke: this.config.lineColor || "green",
            strokeWidth: 1,
            dash: [20, 5]
          })
        )
      }
      if (this.status === STATUS.drawing) {
        let position = this.getValidPointerPosition()
        this.drawGroup.add(new Konva.Rect({
          x: this.drawStartPoint.x,
          y: this.drawStartPoint.y,
          width:  position.x - this.drawStartPoint.x,
          height: position.y - this.drawStartPoint.y,
          stroke: this.config.lineColor || "rgba(0,0,0,0.2)",
          fill: this.config.lineColor || "rgba(0,0,0,0.2)",
          opacity: 0.5,
          strokeWidth: 0.1}))
      }
    },
    /**
     * 拖动过程中可能会超出图片，要限定在stage里面
     * @return {Object}
     */
    getValidPointerPosition() {
      let x = Math.max(0, Math.min(this.stage.width(), this.stage.getRelativePointerPosition().x))
      let y = Math.max(0, Math.min(this.stage.height(), this.stage.getRelativePointerPosition().y))
      return {x, y}
    },
    onMouseDown() {
      if (this.status === STATUS.normal)
        this.startDraw()
      // else if (this.status === STATUS.selecting) {
      //   this.status = STATUS.moving
      //   this.drawGroup.removeChildren()
      // }
    },
    /**
     * @param {MouseEvent} e
     */
    onWheel(e) {
      e.evt.preventDefault()
      let pointer = this.stage.getRelativePointerPosition()
      let step = 0.25
      let oldX = this.stage.scaleX() * pointer.x
      let oldY = this.stage.scaleY() * pointer.y
      if (e.evt.wheelDelta < 0) {
        this.stage.scale({
          x: Math.max(0.1, this.stage.scaleX() - step),
          y: Math.max(0.1, this.stage.scaleY() - step),
        })
      } else {
        this.stage.scale({
          x: this.stage.scaleX() + step,
          y: this.stage.scaleY() + step,
        })
      }
      let xOffset = oldX - (this.stage.scaleX() * pointer.x)
      let yOffset = oldY - (this.stage.scaleY() * pointer.y)
      this.stage.position({
        x: this.stage.position().x + xOffset,
        y: this.stage.position().y + yOffset
      })
    },
    /**
     * 舞台点击事件，用于添加和删除transformer
     */
    onClick(e) {
      if (this.status === STATUS.hovering)
        this.selectRect(e.target)
      else if (this.status === STATUS.selecting) {
        this.destoryAllTransformer()
        this.setNormalStatus()
        this.selectedLabelRect = null
      }
    },
    destoryAllTransformer() {
      this.stage.find("Transformer").forEach(t => t.destroy())
    },
    /**
     * 选择一个rect
     * @param {Konva.Rect} rect
     */
    selectRect(rect) {
      this.destoryAllTransformer()
      let transFormer = new Konva.Transformer({rotateEnabled: false})
      this.labelGroup.add(transFormer)
      this.selectedLabelRect = rect
      transFormer.nodes([rect])
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
    /**
     * 添加一个标注框，可能会添加失败
     * @return {Konva.Rect || null}
     */
    addRect(ltX, ltY, rbX, rbY) {
      let rect = new Konva.Rect({
        x: ltX,
        y: ltY,
        width: rbX - ltX,
        height: rbY - ltY,
        fill: this.config.lineColor || "rgba(31,25,25,0.93)",
        opacity: 0.5,
        draggable: true,
        name: LABEL_RECT_NAME,
        strokeScaleEnabled: false
      })
      if (rect.width() < 5) {  // 太小的bbox不要
        this.$message.warning("框太小了，不要了")
        return null
      }
      rect.on("mouseenter", () => {
        if (this.status === STATUS.normal) {
          this.stage.container().style.cursor = "pointer"
          this.status = STATUS.hovering
        }
      })
      rect.on("mouseleave", () => {
        if (this.status === STATUS.hovering)
          this.setNormalStatus()
      })
      rect.on("transformstart", () => {
      })
      rect.on("dragmove", () => {
        this.needSave = true
      })
      rect.on("transformend", () => {
        this.needSave = true
      })
      this.labelGroup.add(rect)
      return rect
    },
    stopDraw() {
      // 处理从右向左画框的情况
      let ltX = Math.min(this.drawStartPoint.x, this.stage.getRelativePointerPosition().x)
      let rbX = Math.max(this.drawStartPoint.x, this.stage.getRelativePointerPosition().x)
      let ltY = Math.min(this.drawStartPoint.y, this.stage.getRelativePointerPosition().y)
      let rbY = Math.max(this.drawStartPoint.y, this.stage.getRelativePointerPosition().y)
      ltX = Math.max(0, ltX)
      ltY = Math.max(0, ltY)
      rbX = Math.min(this.stage.width(), rbX)
      rbY = Math.min(this.stage.height(), rbY)
      let rect = this.addRect(ltX, ltY, rbX, rbY)
      if (rect && this.config.autoSelect)
        this.$nextTick(()=>{this.selectRect(rect)})
      this.setNormalStatus()
      this.needSave = true
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
    width: 75px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px;

      &:hover {
        cursor: pointer;
      }
    }

    .active {
      color: #55a532;
    }
  }

  .label-button {
    height: 50px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      cursor: pointer;
    }
  }

  .label-rect {
    padding: 5px;
    background: rgba(17, 17, 17, 0.7);
    color: white;
    white-space: nowrap;
    display: flex;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
