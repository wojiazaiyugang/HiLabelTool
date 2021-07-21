<template>
  <div>
    <el-button @click="routeTo('basketball')">标注篮球</el-button>
    {{setting}}
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
    }),
  },
  mounted() {
    // console.log(this.setS)
    this.setS("jq2323j2")
  },
  methods: {
    // ...mapMutations({
    //   setS: "setting/setSetting"
    // }),
    ...mapMutations({
      setS: "setting/setSetting"
    }),
    routeTo: path => routeTo(path),
  }
}
</script>

<style lang="scss" scoped>

</style>