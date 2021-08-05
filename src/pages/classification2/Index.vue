<template>
  <div class="classification2">
    2分类
    <el-dialog title="设置" :visible.sync="configDialogVisible" fullscreen>
      <el-form :model="config" label-width="120px">
        <el-form-item label="输入数据目录">
          <el-input disabled v-model="config.inputFolder" style="width: 700px"></el-input>
          <el-button @click="selectInputFolder">选择</el-button>
        </el-form-item>
        <el-form-item label="生成结果目录">
          <el-input disabled v-model="config.outputFolder" style="width: 700px"></el-input>
          <el-button @click="selectOutputFolder">选择</el-button>
        </el-form-item>
        <el-form-item label="移动原始图片">
          <el-tooltip content="标注完之后原始图片会被移动到目标文件夹而不是复制">
            <el-switch v-model="config.transfer"></el-switch>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="importConfig">加载配置</el-button>
        <el-button @click="start">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {selectFolder, selectFile} from "@/utils/fs"

export default {
  name: "Index",
  data() {
    return {
      configDialogVisible: true, // 设置对话框可见性
      config: {
        inputFolder: "",
        outputFolder: "",
        transfer: false,
      }
    }
  },
  methods: {
    async selectInputFolder() {
      this.config.inputFolder = await selectFolder()
    },
    async selectOutputFolder() {
      this.config.outputFolder = await selectFolder()
    },
    start() {

    },
    async importConfig() {
      let file = await selectFile(["json"])
      console.log(file)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.classification2 {
  .el-dialog {
    display: flex;
    flex-direction: column;

    .el-dialog__body {
      flex: 1;
    }
  }
}
</style>