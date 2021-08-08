import Vue from "vue"
import Vuex from "vuex"

import config from "@/store/modules/config"
import setting from "@/store/modules/setting"

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {config, setting},
  plugins: [],
  strict: process.env.NODE_ENV !== "production"
})

