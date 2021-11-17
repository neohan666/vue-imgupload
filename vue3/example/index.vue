<!--
 * @Description: 使用示例
 * @Author: Neo
 * @Date: 2021-07-29
 * @LastEditTime: 2021-11-17
 * @LastEditors: Neo
-->
<template>
  <div class="example">
    <el-form ref="formRef" :model="formData">
      <el-form-item label="上传图片：" prop="imgList">
        <ImgUpload
          v-model="formData.imgList"
          @change="onImgUploadChange"
        />
      </el-form-item>
    </el-form>

    <div>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </div>

    <div>{{ formData.imgList }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ImgUpload from '../ImgUpload/index.vue'

const formRef = ref<any>(null)
const formData = ref<any>({
  imgList: [],
})

getData()

// 模拟接口请求后数据回显
function getData () {
  setTimeout(() => {
    formData.value.imgList = [
      'https://abc.png',
    ]
  }, 1000)
}

// 提交
function onSubmit () {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      console.log(formData.value)
    }
  })
}

// change事件触发imgList单独校验
function onImgUploadChange () {
  formRef.value.validateField('imgList')
}
</script>

<style lang="less" scoped>
</style>
