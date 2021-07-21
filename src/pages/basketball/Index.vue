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
import konva from "konva"
import SideBar from "@/components/side-bar/Index"
export default {
  name: "Index",
  components: {SideBar},
  mounted() {
    this.initKonva()
  },
  data() {
    return {
      image: "C:\\Users\\wojia\\Desktop\\1\\00001.jpg"
    }
  },
  methods: {
    /**
     * 初始化konva
     */
    initKonva() {
      let stage = new konva.Stage({
        container: "stage",
        width: 200,
        height: 200
      })
      let layer = new konva.Layer()
      stage.add(layer)
      
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