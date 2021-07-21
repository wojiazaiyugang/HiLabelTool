<template>
  <div class="basketball">
    <div style="display: flex;flex: 1">
      <SideBar style="width: 50px;height: 100%"/>
      <div style="flex: 1">1212</div>
      <div style="width: 80px;background: rgba(75,58,58,0.07)">21321</div>
    </div>
    <div style="height: 80px;background: rgba(203,191,191,0.12)">

    </div>
  </div>
</template>

<script>
import SideBar from "@/components/side-bar/Index"
export default {
  name: "Index",
  components: {SideBar}
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