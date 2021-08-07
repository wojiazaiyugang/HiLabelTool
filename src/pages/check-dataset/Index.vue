<template>
  <div class="check-dataset page">
    通过<span class="link" @click="routeTo('dataset-introduction')">校验规则</span>对数据集进行校验
    <el-form size="small" :model="config" :rules="rules" ref="form" label-width="120px" label-position="left">
      <el-form-item label="数据集目录" prop="datasetFolder">
        <el-input v-model="config.datasetFolder" style="width: 500px"></el-input>
        <el-button @click="selectDatasetFolder">选择</el-button>
      </el-form-item>
      <el-form-item label="操作">
        <el-button @click="check">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {selectFolder} from "@/utils/fs"

const rules = {
  datasetFolder: [{required: true, message: "不能为空"}]
}
export default {
  name: "check-dataset",
  data() {
    return {
      config: {
        datasetFolder: ""
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