<template>
  <div class="flex-center-page">
    <div style="display: flex;flex-direction: column;align-items: flex-start">
      <el-button @click="routeTo('basketball')">标注bbox</el-button>
      <el-button @click="routeTo('classification2')" style="margin-top: 20px">图片二分类</el-button>
      <div style="flex-direction: column;margin-top: 20px">
        <el-button @click="routeTo('check-dataset')">校验数据集</el-button>
        <div>通过<span class="link" @click="routeTo('dataset-introduction')">校验规则</span>对数据集进行校验</div>
      </div>
    </div>
  </div>
</template>

<script>
import {routeTo} from "@/utils/router"
import {mapState} from "vuex"

export default {
  name: "Index",
  computed: {
    ...mapState({
      setting: state => state.setting.setting
    }),
  },
  mounted() {
  },
  methods: {
    routeTo: path => routeTo(path),
  }
}
</script>

<style lang="scss" scoped>

</style>