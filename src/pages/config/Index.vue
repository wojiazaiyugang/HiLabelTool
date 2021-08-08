<template>
<div class="page">
  <el-form size="small" :model="config" :rules="RULES" ref="form" label-width="120px" label-position="left">
    <el-form-item label="标注类型" prop="type">
      <el-select v-model="config" value-key="type">
        <el-option v-for="{defaultConfig, description, name} in CONFIG_TYPE" :key="name" :label="name + '（' + description + ')'" :value="defaultConfig"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="config.hasOwnProperty('inputFolder')" label="输入数据目录" prop="inputFolder">
      <el-input v-model="config.inputFolder" style="width: 500px"></el-input>
      <el-button @click="selectInputFolder">选择</el-button>
    </el-form-item>
    <el-form-item v-if="config.hasOwnProperty('outputFolder')" label="生成结果目录" prop="outputFolder">
      <el-input v-model="config.outputFolder" style="width: 500px"></el-input>
      <el-button @click="selectOutputFolder">选择</el-button>
    </el-form-item>
    <el-form-item v-if="config.hasOwnProperty('positiveLabel')" label="正样本标签" prop="positiveLabel">
      <el-input v-model="config.positiveLabel" style="width: 300px"></el-input>
    </el-form-item>
    <el-form-item v-if="config.hasOwnProperty('negativeLabel')" label="负样本标签" prop="negativeLabel">
      <el-input v-model="config.negativeLabel" style="width: 300px"></el-input>
    </el-form-item>
    <el-form-item v-if="config.hasOwnProperty('transfer')" label="移动原始图片">
      <el-tooltip content="标注完之后原始图片会被移动到目标文件夹而不是复制">
        <el-switch v-model="config.transfer"></el-switch>
      </el-tooltip>
    </el-form-item>
    <el-form-item v-if="config.hasOwnProperty('continue')" label="跳过已标注">
      <el-tooltip content="已经标注过的图片不再标注">
        <el-switch v-model="config.continue"></el-switch>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="操作">
      <el-button @click="start">开始标注</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import {selectFolder} from "@/utils/fs"

import {mapMutations} from "vuex"

import {CONFIG_TYPE, writeDataSetConfig} from "@/utils/config"

const RULES = {
  type: [{required: true, message: "不能为空"}],
  inputFolder: [{required: true, message: "不能为空"}],
  outputFolder: [{required: true, message: "不能为空"}],
  positiveLabel: [{required: true, message: "不能为空"}],
  negativeLabel: [{required: true, message: "不能为空"}],
}

export default {
  name: "Index",
  data() {
    return {
      config: {}, // 配置
      RULES,
      CONFIG_TYPE,
    }
  },
  methods: {
    ...mapMutations({
      setConfig: "config/setConfig"
    }),
    async start() {
      try {
        await this.$refs["form"].validate()
      } catch (err) {
        return
      }
      writeDataSetConfig(this.config.outputFolder, this.config)
      this.setConfig(this.config)
      if (this.config.type === CONFIG_TYPE.bbox.defaultConfig.type) this.routeTo("/basketball")
      else if (this.config.type === CONFIG_TYPE.classification2.defaultConfig.type) this.routeTo("/classification2")
    },
    async selectInputFolder() {
      this.config.inputFolder = await selectFolder()
    },
    async selectOutputFolder() {
      this.config.outputFolder = await selectFolder()
    },
  }
}
</script>

<style scoped>

</style>