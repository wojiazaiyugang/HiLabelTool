<template>
  <div class="flex-center-page">
    <div style="width: 500px">
      HiLabelTool可以识别处理的数据集格式为
      <el-tree :data="tree" default-expand-all style="margin-top: 20px">
        <div slot-scope="{node, data}" style="display: flex">
          <div>{{data.label}}</div>
          <div style="margin-left: 50px">（{{data.description}}）</div>
        </div>
      </el-tree>
    </div>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      tree: [{
        label: "数据集",
        description: "数据集文件夹",
        children: [{
          label: "config.json",
          description: "HiLabelTool可读的该数据集的配置文件"
        },{
          label: "data.json",
          description: "该数据集的标注结果"
        },{
          label: "data",
          description: "存放数据的文件夹",
          children: [{
            label: "1.jpg",
            description: "数据文件，根据数据集的不同可能是图片或者文件夹"
          },{
            label: "...",
            description: "其他数据文件"
          }]
        }]
      }]
    }
  }
}
</script>

<style scoped>

</style>