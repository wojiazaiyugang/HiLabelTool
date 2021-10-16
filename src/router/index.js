import Vue from "vue"
import Router from "vue-router"
import {ipcRenderer} from "electron"

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: "/",
      component: require("@/pages/index/Index").default,
    },
    {
      path: "/basketball",
      component: require("@/pages/basketball/Index").default,
    },
    {
      path: "/classification2",
      component: require("@/pages/classification2/Index").default
    },
    {
      path: "/config",
      component: require("@/pages/config/Index").default
    },
    {
      path: "/video-classification2",
      component: require("@/pages/video-classification2/Index").default
    }
  ]
})

ipcRenderer.on("route", async (event, arg) => {
  if (arg !== router.currentRoute.path)
    await router.push(arg)
})

export default router