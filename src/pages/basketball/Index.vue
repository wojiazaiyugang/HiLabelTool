<template>
  <div class="basketball">
    <div style="display: flex;flex: 1">
      <SideBar style="width: 50px;height: 100%"/>
      <div id="stage" style="flex: 1;border: 1px solid black">
      </div>
      <div style="width: 80px;background: rgba(75,58,58,0.07)">21321</div>
    </div>
    <div style="height: 80px;background: rgba(203,191,191,0.12)">
    </div>
  </div>
</template>

<script>
import Konva from "konva"
import SideBar from "@/components/side-bar/Index"
export default {
  name: "Index",
  components: {SideBar},
  computed: {
    container() {return document.getElementById(this.containerID)}
  },
  mounted() {
    this.initKonva()
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeImage()
    })
    this.resizeObserver.observe(document.getElementById("app"))
  },
  data() {
    return {
      containerID: "stage", //div的id
      setTimeoutTimer: null, //
      stage: null, // konva的stage
      imageURL: "C:\\Users\\wojia\\Desktop\\1\\00001.jpg"
    }
  },
  methods: {
    /**
     * 初始化konva
     */
    initKonva() {
      this.stage = new Konva.Stage({
        container: this.containerID,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      })
      let layer = new Konva.Layer()
      this.stage.add(layer)
      let imageObj = new Image()
      imageObj.src = this.imageURL
      let image = new Konva.Image({
        image: imageObj,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      })
      layer.add(image)
    },
    /**
     * resize要标注的图片
     */
    resizeImage() {
      this.setTimeoutTimer && clearTimeout(this.setTimeoutTimer)
      this.setTimeoutTimer = setTimeout(()=> {
        console.log(this.container.offsetWidth, this.container.offsetHeight)
        this.stage.width(this.container.offsetWidth)
        this.stage.height(this.container.offsetHeight)
        this.stage.scale({ x: 0.9, y: 0.9 })
      }, 1000)

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
}
</style>