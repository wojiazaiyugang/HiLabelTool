<template>
  <div class="basketball">
    <div style="display: flex;flex: 1">
      <div class="side-bar">
        <div class="button">
          <i class="iconfont icon-juxing"></i>
          矩形
        </div>
        <div class="button" :class="setting.showCrossHair ? 'active': ''" @click="setting.showCrossHair = !setting.showCrossHair">
          <i class="iconfont icon-shizixian-"></i>
          十字线
        </div>
        <div class="button" style="margin-top: auto" @click="routeTo('/')">
          <i class="iconfont icon-shouye"></i>
          首页
        </div>
        <div class="button">
          <i class="iconfont icon-shezhi"></i>
          设置
        </div>
      </div>
      <div id="stage" style="flex: 1;border: 1px solid black;overflow: hidden">
      </div>
      <div style="width: 80px;background: rgba(75,58,58,0.07)">21321</div>
    </div>
    <div style="height: 80px;background: rgba(203,191,191,0.12)">
    </div>
  </div>
</template>

<script>
import Konva from "konva"

import {routeTo} from "@/utils/router"

export default {
  name: "Index",
  computed: {
    container() {
      return document.getElementById(this.containerID)
    }
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
      labelResults: [], // 当前标注结果
      setting: { // 配置
        showCrossHair: false, // 是否显示辅助十字线
      }
    }
  },
  methods: {
    routeTo : path => routeTo(path),
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
      this.imageLayer = new Konva.Layer()
      let imageObj = new Image()
      imageObj.src = this.imageURL
      let image = new Konva.Image({
        image: imageObj,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      })
      this.imageLayer.add(image)
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
        // this.stage.scale({ x: 0.9, y: 0.9 })
      }, 50)
    },
    onMouseEnter() {
      this.stage.container().style.cursor = "crosshair"
    },
    onMouseLeave() {
      this.drawing = false
      this.stage.container().style.cursor = "default"
      this.drawLayer.removeChildren()
    },
    /**
     * 在图片上移动的事件
     */
    onMouseMove() {
      this.drawLayer.removeChildren()
      if (this.setting.showCrossHair)
        this.drawLayer.add(
          new Konva.Line({
            points: [0, this.stage.getRelativePointerPosition().y, this.stage.width(), this.stage.getRelativePointerPosition().y],
            stroke: "green",
            strokeWidth: 1,
            dash: [20, 5]
          }),
          new Konva.Line({
            points: [this.stage.getRelativePointerPosition().x, 0, this.stage.getRelativePointerPosition().x, this.stage.height()],
            stroke: "green",
            strokeWidth: 1,
            dash: [20, 5]
          }))
      if (this.drawing)
        this.drawLayer.add(new Konva.Rect({
          x: this.drawStartPoint.x,
          y: this.drawStartPoint.y,
          width: this.stage.getRelativePointerPosition().x - this.drawStartPoint.x,
          height: this.stage.getRelativePointerPosition().y - this.drawStartPoint.y,
          stroke: "#000",
          strokeWidth: 2
        }))
        // console.log(this.stage.getRelativePointerPosition())
    },
    onMouseDown() {
      this.startDraw()
    },
    onMouseUp() {
      this.stopDraw()
    },
    startDraw() {
      this.drawing = true
      this.drawStartPoint = this.stage.getRelativePointerPosition()
    },
    stopDraw() {
      this.drawing = false
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