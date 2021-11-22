<!-- 图片裁剪 -->
<template>
  <vueCropper
    ref="cropper"
    :img="crooper_img"
    :outputSize="option.size"
    :outputType="option.outputType"
    :info="true"
    :autoCropWidth="option.autoCropWidth"
    :autoCropHeight="option.autoCropHeight"
    :canMove="option.canMove"
    :canMoveBox="option.canMoveBox"
    :original="option.original"
    :autoCrop="option.autoCrop"
    :centerBox="option.centerBox"
    :infoTrue="option.infoTrue"
    :fixed="option.fixed"
    :fixedBox="option.fixedBox"
  ></vueCropper>
</template>

<script>
import { VueCropper } from "vue-cropper";
export default {
  name: "ImgCut",
  data() {
    return {
      option: {
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg", // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 512, // 默认生成截图框宽度
        autoCropHeight: 512, // 默认生成截图框高度
        fixed: true,
        fixedBox: false, // 固定截图框大小 不允许改变
        canMoveBox: true, // 截图框能否拖动
        original: true, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        infoTrue: false, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
    };
  },
  components: {
    VueCropper,
  },
  props: ["crooper_img"],
  mounted() {
    console.log(this.crooper_img);
  },
};
</script>