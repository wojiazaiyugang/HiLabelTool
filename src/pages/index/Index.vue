<template>
  <div style="border-top: 1px solid rgba(0,0,0,0.11)">
    <el-button @click="routeTo('basketball')">标注bbox</el-button>
    <el-button @click="routeTo('classification2')">图片二分类</el-button>
    <el-button @click="routeTo('check-dataset')">校验数据集</el-button>
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