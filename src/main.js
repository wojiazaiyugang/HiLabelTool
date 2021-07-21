import Vue from "vue"
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
import iView from "iview"
import "iview/dist/styles/iview.css"
import App from "./App.vue"
import router from "./router"
import store from "./store"
// 阿里巴巴图标
import "@/assets/css/iconfont.css"

Vue.use(ElementUI)
Vue.use(iView)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
  store
}).$mount("#app")
