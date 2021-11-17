<!--
 * @Description: 添加或编辑
 * @Author: Neo
 * @Date: 2019-12-11
 * @LastEditTime: 2021-11-17
 * @LastEditors: Neo
-->
<template>
  <div class="example">
    <el-form :model="formData">
      <el-form-item label="上传图片：" prop="imgList">
        <ImgUpload v-model="formData.imgList"/>
      </el-form-item>
    </el-form>

    <div>{{ formData.imgList }}</div>
  </div>
</template>

<script>
import ImgUpload from '../ImgUpload/index.vue'

export default {
  components: { ImgUpload },
  data () {
    return {
      type: 'add', // add添加，edit编辑
      formData: {
        imgList: [], // vue2.x里需要提前定义好字段初始值，以便支持数据响应式
      }
    }
  },
  created () {
    this.type = this.$route.query.type || 'add'
    
    if (this.type === 'edit') {
      this.getDetail()
    }
  },
  methods: {
    // 获取详情
    getDetail () {
      setTimeout(() => {
        const res = {
          imgList: ['https://abc.png']
        }
        this.formData = res
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped>
</style>