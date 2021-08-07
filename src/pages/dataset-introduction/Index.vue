<template>
  <div class="flex-center-page">
    <div style="width: 500px">
      HiLabelTool可以识别处理的数据集格式为
      <el-tree :data="tree" default-expand-all style="margin: 20px 0">
        <div slot-scope="{node, data}" style="display: flex">
          <div>{{data.label}}</div>
          <div style="margin-left: 50px">（{{data.description}}）</div>
        </div>
      </el-tree>
      在校验数据集时，首先会读取数据集中的config.json文件，config.json文件记录了该数据集的类型、配置，然后会
      读取data.json中的数据并和data文件夹中的数据进行对比，如果全部校验通过则该数据集校验通过
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