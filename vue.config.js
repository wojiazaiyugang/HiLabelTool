const path = require("path")
//
function resolve(dir) {
  return path.join(__dirname, dir)
}
//
module.exports = {
  //   // 输出文件目录
  //   outputDir: "dist",
  //   assetsDir: "assets", // 静态资源目录 (js, css, img, fonts)
  //   publicPath: "./",
  lintOnSave: process.env.NODE_ENV !== "production",
  devServer: {
    // can be overwritten by process.env.HOST
    // host: "localhost",
    // port: 3000,
    overlay: {
      errors: false
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))

    // config.module
    //   .rule("node")
    //   .test(/\.node$/)
    //   .use("node-loader")
    //   .loader("node-loader")
    //   .end()
  },
  css: {
  // //     // css预设器配置项
    loaderOptions: {
      scss: {
        additionalData: "@import \"~@/assets/css/global_style.scss\";"
      },
    },
  },
  //   configureWebpack: {
  //     node: {
  //       process: true,
  //     },
  //     plugins: [
  //       new MonocoEditorPlugin({})
  //     ]
  //   },
  //   transpileDependencies: [
  //     "vue-echarts",
  //     "resize-detector"
  //   ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        "productName": "HiLabelTool",
        // "files": ["dist_electron/**/*"],
        //         "productName": "RobotStudio",
        "win": {
          "icon": "public/images/logo.ico"
        },
        // "mac": {
        //   "icon": "public/images/logo.ico"
        // },
        "linux": {
          "icon": "public/images/logo.ico",
          "target": [
            "deb"
          ]
        }
        //         "publish": [{
        //           "provider": "generic",
        //           "url": "http://static.highvenue.cn/"
        //         }],
        //         "nsis": {
        //           "oneClick": false, // 是否一键安装
        //           "createDesktopShortcut": "always", // 是否添加桌面快捷方式
        //           "allowToChangeInstallationDirectory": true, // 允许修改安装目录
        //           "installerIcon": "public/image/RobotStudio/logo.ico", //安装的图标
        //           "installerHeader": "public/image/RobotStudio/logo.ico", // 安装的头部,
        //           "installerHeaderIcon": "public/image/RobotStudio/logo.ico", // 不知道是啥
        //         },
      },
      nodeIntegration: true
    //       npmRebuild: false
    }
  }
}
