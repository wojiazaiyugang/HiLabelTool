<template>
<div>
  <el-dialog
    title="配置"
    :visible.sync="dialogVisible"
    fullscreen>
    <el-form :model="config" label-width="120px" size="mini">
      <el-form-item label="待标注目录">
        <el-input v-model="config.dataSet" style="width: 50%"></el-input>
        <el-button @click="selectDataSet('dataSet')">选择</el-button>
      </el-form-item>
      <el-form-item label="正样本目录">
        <el-input v-model="config.positiveDir" style="width: 50%"></el-input>
        <el-button @click="selectDataSet('positiveDir')">选择</el-button>
      </el-form-item>
      <el-form-item label="负样本目录">
        <el-input v-model="config.negativeDir" style="width: 50%"></el-input>
        <el-button @click="selectDataSet('negativeDir')">选择</el-button>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <el-button @click="dialogVisible = false" type="primary">确定</el-button>
    </template>
    <div>简介：用于视频类型的数据二分类</div>
    <div>操作：方向键上是标注为正样本，方向键下是标注为负样本</div>
    <div>注意：<br />1、一个视频标注后会被移动到对应的文件夹，如果不想原始数据集被修改，在标注之前将数据集复制一份<br />
                    2、标注完一个视频后，页面下方会显示日志说明将哪个文件移动到哪个文件夹了，如果手抖标注错了，标注工具
      不提供撤销功能，可以去对应的文件夹手动把错误的文件移动到正确的目录
    </div>
  </el-dialog>
  {{videos[currentVideoIndex]}}
  <video id="video" style="width: 300px;height: 300px"></video>
</div>
</template>

<script>
import {selectFolder} from "@/utils/fs"
import fs from "fs"
import path from "path"

export default {
  name: "Index",
  computed: {
    /**
     * 文件夹里的所有视频路径
     */
    videos() {
      let result = []
      fs.readdirSync(this.config.dataSet).forEach(file => {
        if (["mp4"].includes(file.split(".").pop())) result.push(path.join(this.config.dataSet, file))
      })
      return result
    }
  },
  mounted() {
    let video = document.getElementById("video")
    video.src = require("C:\\Users\\wojiazaiyugang\\Desktop\\1\\00a2809adc89fa68eabfe7d4b1170f02.mp4")
  },
  data() {
    return {
      dialogVisible: false, // 配置对话框可见性
      currentVideoIndex: 0,
      config: {
        dataSet: "C:\\Users\\wojiazaiyugang\\Desktop\\1", // 目录
        positiveDir: "C:\\Users\\wojiazaiyugang\\Desktop\\zheng", // 正样本目录
        negativeDir: "C:\\Users\\wojiazaiyugang\\Desktop\\fu", // 负样本目录
      }
    }
  },
  methods: {
    /**
     * 选择文件夹
     * @param target
     */
    selectDataSet(target) {
      selectFolder().then(dataSet => {
        this.config[target] = dataSet
        this.currentVideoIndex = 0
      })
    },
  }
}
</script>

<style scoped>

</style>