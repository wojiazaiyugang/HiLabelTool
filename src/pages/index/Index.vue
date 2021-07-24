<template>
  <div>
    <el-button @click="routeTo('basketball')">标注bbox</el-button>
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