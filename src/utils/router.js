import router from "../router"

/**
 * 路由跳转
 * @param path
 */
export const routeTo = async path => {
  await router.push({
    path: path
  })
}