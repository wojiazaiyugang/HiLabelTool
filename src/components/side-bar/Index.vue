<template>
<div class="side-bar">
  <div class="button">
    <i class="iconfont icon-juxing"></i>
    矩形
  </div>
  <div class="button" @click="test">
    <i class="iconfont icon-shizixian-"></i>
    十字线
  </div>
  <div class="button" style="margin-top: auto" @click="routeTo('/')">
    <i class="iconfont icon-shouye"></i>
    首页
  </div>
  <div class="button" @click="openSettingDialog">
    <i class="iconfont icon-shezhi"></i>
    设置
  </div>
  {{setting.showCrossHair}}
</div>
</template>

<script>
import {routeTo} from "@/utils/router"
import {mapState, mapMutations} from "vuex"

export default {
  name: "Index",
  computed: {
    ...mapState({
      setting: state => state.setting.setting
    })
  },
  methods: {
    ...mapMutations({
      setShowCrossHair: "setting/setShowCrossHair"
    }),
    routeTo : path => routeTo(path),
    /**
     * 打开设置对话框
     */
    openSettingDialog() {

    },
    test() {
      console.log(this.setting.showCrossHair)
      this.setShowCrossHair(!this.setting.showCrossHair)
    }
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  background: rgba(94, 88, 88, 0.09);
  width: 100%;
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
}
</style>