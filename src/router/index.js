import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: "/",
      component: require("@/pages/index/Index").default,
    }
  ]
})
export default router