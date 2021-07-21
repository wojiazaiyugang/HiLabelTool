<template>
  <div>
    <el-button @click="routeTo('basketball')">标注篮球</el-button>
  </div>
</template>

<script>
import {routeTo} from "../../utils/router"

export default {
  name: "Index",
  methods: {
    routeTo: path => routeTo(path)
  }
}
</script>

<style lang="scss" scoped>

</style>