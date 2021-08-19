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
    <el-dialog title="校验结果" :visible.sync="dialogVisible">
      数据集数据个数：{{Object.keys(result).length}}
      校验后数据集数据个数：{{Object.keys(newResult).length}}
      <template slot="footer">
        <el-button @click="fix">修正</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import fs from "fs"
import {Message} from "element-ui"
import {selectFolder} from "@/utils/fs"
import {getDataSetConfigFile} from "@/utils/config"
import {readDatasetResult, writeDataSetResult} from "@/utils/result"
import path from "path"

const rules = {
  datasetFolder: [{required: true, message: "不能为空"}]
}
export default {
  name: "check-dataset",
  data() {
    return {
      config: {
        datasetFolder: "C:\\Users\\wojiazaiyugang\\Desktop\\output"
      },
      rules,
      dialogVisible: true,
      result: {},
      newResult: {}, // 校正后的数据集
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
      this.newResult = {}
      this.result = readDatasetResult(this.config.datasetFolder)
      for (let r of Object.keys(this.result)) {
        if (fs.existsSync(path.join(this.config.datasetFolder, r)))
          this.newResult[r] = this.result[r]
      }
      this.dialogVisible = true
    },
    fix() {
      writeDataSetResult(this.config.datasetFolder, this.newResult)
      Message.success("修正成功")
      this.dialogVisible = false
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