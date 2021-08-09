<template>
  <div class="check-dataset page">
    <el-form :model="config" :rules="rules" ref="form" label-width="120px" label-position="left">
      <el-form-item label="数据集目录" prop="datasetFolder">
        <el-input v-model="config.datasetFolder" style="width: 500px"></el-input>
        <el-button @click="selectDatasetFolder">选择</el-button>
      </el-form-item>
      <el-form-item label="操作">
        <el-button @click="check">校验</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import fs from "fs"
import {selectFolder} from "@/utils/fs"
import {readDatasetConfig, getDataSetConfigFile} from "@/utils/config"

const rules = {
  datasetFolder: [{required: true, message: "不能为空"}]
}
export default {
  name: "check-dataset",
  data() {
    return {
      config: {
        datasetFolder: "C:\\Users\\wojiazaiyugang\\Desktop\\进球判定1"
      },
      rules,
    }
  },
  methods: {
    async check() {
      try {
        await this.$refs["form"].validate()
      } catch (err) {
        return
      }
      let configFile = getDataSetConfigFile(this.config.datasetFolder)
      if (!fs.existsSync(configFile)) {
        this.$message.error("未检测到数据集配置文件config.json")
        return
      }
      let config = readDatasetConfig(this.config.datasetFolder)
      console.log(config)
    },
    async selectDatasetFolder() {
      this.config.datasetFolder = await selectFolder()
    },
  },
}
</script>

<style lang="scss" scoped>
.check-dataset {
}
</style>