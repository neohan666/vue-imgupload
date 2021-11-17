<!--
 * @Description: 图片上传组件
 * @Author: Neo
 * @Date: 2021-08-25
 * @LastEditTime: 2021-11-17
 * @LastEditors: Neo
-->
<template>
  <div class="uploadWrapper">
    <Vuedraggable
      class="vue-draggable"
      :class="{ 'disabled': disabled }"
      v-model="imgList"
      @start="onDragStart"
      @end="onDragEnd"
      :item-key="getItemKey"
    >
      <!-- 拖拽元素 -->
      <template #item="{element, index}">
        <div
          class="draggable-item"
          :style="{ 'width': showWidth + 'px', 'height': showHeight + 'px' }"
        >
          <el-image :src="element" :preview-src-list="[element]"></el-image>
          <div class="shadow" @click="onRemoveHandler(index)">
            <i class="el-icon-delete"></i>
          </div>
        </div>
      </template>

      <!-- 禁用层遮罩 -->
      <template #header v-if="disabled">
        <div class="disabledShadow"></div>
      </template>

      <!-- 上传按钮 -->
      <template #footer>
        <el-upload
          ref="uploadRef"
          class="uploadBox"
          v-show="!limit || (imgList.length < limit)"
          :style="{ 'width': showWidth + 'px', 'height': showHeight + 'px' }"
          :action="uploadHttp.url"
          :headers="uploadHttp.headers"
          :data="uploadHttp.data"
          :with-credentials="uploadHttp.withCredentials"
          accept=".jpg,.jpeg,.png,.gif"
          :show-file-list="false"
          :multiple="!isSingle"
          :limit="limit || 999"
          :disabled="disabled"
          :before-upload="beforeUpload"
          :on-success="onSuccessUpload"
          :on-exceed="onExceed"
          :on-error="onError"
        >
          <i class="el-icon-plus uploadIcon">
            <span class="uploading" v-show="isUploading">正在上传...</span>
            <span class="limitTxt" v-if="isShowLimit && !isUploading && limit && !isSingle">
              最多{{ limit }}张
            </span>
          </i>
        </el-upload>
      </template>
    </Vuedraggable>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, toRefs, onMounted, } from 'vue'
import Vuedraggable from 'vuedraggable'
import utils from './utils'
import { ElMessage, ElMessageBox, } from 'element-plus'

const props = defineProps({
  // 图片数据，数据格式：[url1, url2, url3]，通过v-model传递
  modelValue: {
    type: Array,
    default () {
      return []
    }
  },
  // 限制上传图片的最大数量
  limit: {
    type: Number,
    default: 0
  },
  // 限制数量文字是否展示
  isShowLimit: {
    type: Boolean,
    default: true,
  },
  // 限制单张图片的文件存储大小最大值(kb)
  maxSize: {
    type: Number,
    default: 0
  },
  // 图片显示的宽度(px)
  showWidth: {
    type: Number,
    default: 100
  },
  // 图片显示的高度(px)
  showHeight: {
    type: Number,
    default: 100
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 限定图片分辨率宽度值(px)
  screenWidth: {
    type: Number,
    default: 0
  },
  // 限定图片分辨率高度值(px)
  screenHeight: {
    type: Number,
    default: 0
  },
  // 限制图片分辨率宽度最大值(px)
  maxScreenWidth: {
    type: Number,
    default: 0
  },
  // 限制图片分辨率高度最大值(px)
  maxScreenHeight: {
    type: Number,
    default: 0
  },
})
const emit = defineEmits({
  'update:modelValue': null,
  'change': null,
})

const uploadHttp = ref({
  url: 'https://httpbin.org/post', // 接口url
  headers: {}, // 请求header
  data: {}, // 额外参数
  withCredentials: true, // 跨域时允许携带cookie
})

const isUploading = ref(false) // 正在上传状态
const isFirstMount = ref(true) // 控制防止重复回显

const uploadRef = ref<any>(null)

// 图片数组数据
const imgList = computed({
  get (): any {
    return props.modelValue
  },
  set (val: any) {
    emit('update:modelValue', val)
  }
})
// 是否是单图上传
const isSingle = computed(() => {
  return +props.limit === 1
})

// watch监听
const { modelValue } = toRefs(props)
watch(modelValue, () => {
  if (!isFirstMount.value) {
    return
  }
  // 异步数据的回显
  if (props.modelValue.length > 0) {
    syncElUpload()
  }
}, { deep: true })

// mounted事件
onMounted(() => {
  // 同步数据的回显
  if (props.modelValue.length > 0) {
    syncElUpload()
  }
})

// 同步el-upload数据
function syncElUpload (val?: any) {
  const list: any = val || imgList.value
  if (uploadRef.value) {
    uploadRef.value.uploadFiles = list.map((v: string, i: number) => {
      return {
        name: 'pic' + i,
        percentage: 100,
        status: 'success',
        uid: utils.createUniqueString()
      }
    })
  }
  isFirstMount.value = false
}

// 上传图片之前
function beforeUpload (file: any) {
  isFirstMount.value = false
  if (props.maxSize) {
    // 校验图片占用大小
    return validateSize(file)
  } else if (props.screenWidth || props.screenHeight || props.maxScreenWidth || props.maxScreenHeight) {
    // 校验图片分辨率尺寸
    return validateImgScreen(file)
  } else {
    isUploading.value = true
    return true
  }
}

// 上传完单张图片
function onSuccessUpload (res: any, file: any) {
  if (res.files) {
    // 上传成功的数据处理，根据你自己接口返回的数据格式自行修改
    if (!props.limit || (props.limit > imgList.value.length)) {
      imgList.value.push(res.files.file)
      emit('change', {
        type: 'add',
        data: imgList.value
      })
    }
  } else {
    syncElUpload()
    ElMessage({
      type: 'error',
      message: res.msg
    })
  }
  isUploading.value = false
}

// 上传出错
function onError (err: any, file: any) {
  ElMessage({
    type: 'error',
    message: file.name + ' 上传失败'
  })
  isUploading.value = false
  console.log(err)
}

// 移除单张图片
function onRemoveHandler (index: number) {
  ElMessageBox.confirm('确定删除该图片?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    imgList.value.splice(index, 1)
    syncElUpload()
    emit('change', {
      type: 'remove',
      data: imgList.value
    })
  }).catch(() => {})
}

// 超限
function onExceed () {
  uploadRef.value.abort() // 取消剩余接口请求
  syncElUpload()
  ElMessage({
    type: 'warning',
    message: `图片超限，最多可上传${props.limit}张图片`
  })
}

function onDragStart (e: any) {
  e.target.classList.add('hideShadow')
}
function onDragEnd (e: any) {
  e.target.classList.remove('hideShadow')
}

function getItemKey () {
  return utils.createUniqueString()
}

// 校验图片占用大小
function validateSize (file: any) {
  const size = +props.maxSize
  const isSizeOut = file.size / 1024 > size
  if (isSizeOut) {
    ElMessage({
      type: 'error',
      message: '上传图片大小不能超过' + utils.formatStorage(size * 1024)
    })
    return false
  } else {
    isUploading.value = true
    return true
  }
}
// 校验上传图片分辨率
function validateImgScreen (file: any) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e: any) => {
      const base64Url = e.target.result
      const img = new Image()
      img.onload = () => {
        // console.log(img.width, img.height)
        if (props.screenWidth && +img.width !== +props.screenWidth) {
          reject()
          ElMessage({
            type: 'error',
            message: '上传图片宽度限制只能为' + props.screenWidth + '像素'
          })
        } else if (props.screenHeight && +img.height !== +props.screenHeight) {
          reject()
          ElMessage({
            type: 'error',
            message: '上传图片高度限制只能为' + props.screenHeight + '像素'
          })
        } else if (props.maxScreenWidth && +img.width > +props.maxScreenWidth) {
          reject()
          ElMessage({
            type: 'error',
            message: '上传图片宽度不能超过' + props.maxScreenWidth + '像素'
          })
        } else if (props.maxScreenHeight && +img.height > +props.maxScreenHeight) {
          reject()
          ElMessage({
            type: 'error',
            message: '上传图片高度不能超过' + props.maxScreenHeight + '像素'
          })
        } else {
          isUploading.value = true
          resolve(true)
        }
      }
      img.src = base64Url
    }
    fileReader.readAsDataURL(file)
  })
}
</script>

<style lang="less" scoped>
.vue-draggable {
  display: flex;
  flex-wrap: wrap;

  .draggable-item {
    margin-right: 5px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
    border-radius: 6px;
    position: relative;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }
    .shadow {
      position: absolute;
      top: 0;
      right: 0;
      background-color: rgba(0,0,0,.5);
      opacity: 0;
      transition: opacity .3s;
      color: #fff;
      font-size: 20px;
      line-height: 20px;
      padding: 2px;
      cursor: pointer;
      border-bottom-left-radius: 6px;
    }
    &:hover {
      .shadow {
        opacity: 1;
      }
    }
  }
  &.hideShadow {
    .shadow {
      display: none;
    }
  }

  &.disabled {
    position: relative;

    .disabledShadow {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 9;
      background-color: rgba(255, 255, 255, 0.4);

      &:hover {
        cursor: not-allowed;
      }
    }
  }
}

:deep(.el-upload) {
  width: 100%;
  height: 100%;
}

// 上传按钮
.uploadIcon {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #c0ccda;
  background-color: #fbfdff;
  border-radius: 6px;
  font-size: 20px;
  color: #999;

  .limitTxt,
  .uploading {
    position: absolute;
    bottom: 10%;
    left: 0;
    width: 100%;
    font-size: 12px;
    text-align: center;
    color: #aaa;
  }
}
</style>
