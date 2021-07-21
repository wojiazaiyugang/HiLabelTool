<template>
<div class="side-bar">
  <div class="button" @click="routeTo('/')">
    <i class="iconfont icon-shouye"></i>
    首页
  </div>
  <div class="button" @click="openSettingDialog">
    <i class="iconfont icon-shezhi"></i>
    设置
  </div>
</div>
</template>

<script>
import {routeTo} from "@/utils/router"

export default {
  name: "Index",
  methods: {
    routeTo : path => routeTo(path),
    /**
     * 打开设置对话框
     */
    openSettingDialog() {

    }
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  background: rgba(94, 88, 88, 0.09);
  width: 100%;
  height: 100%;

  .button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>