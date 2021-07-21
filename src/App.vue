<template>
  <div id="app">
    <router-view style="width: 100%;height: 100%"/>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {}
}
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  user-select: none;
  height: 100vh;
  width: 100vw;
}
</style>
