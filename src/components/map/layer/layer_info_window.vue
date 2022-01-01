<template>
  <div class="layer_info">
    <q-card-section>
      <q-list bordered separator style="width: 500px">
        <q-item v-show="state == 3 ? true : false">
          <q-item-section> 点位名称 </q-item-section>
          <q-item-section>
            <q-input outlined v-model="datainfo.name" placeholder="点位名称">
            </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> 点位描述 </q-item-section>
          <q-item-section>
            <q-input outlined v-model="datainfo.content" placeholder="点位描述">
            </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section> 点位图片 </q-item-section>
          <q-item-section>
            <q-img
              :src="
                show_img == null
                  ? 'https://assets.yuanshen.site/images/noImage.png'
                  : show_img
              "
              class="layer_img"
              @click="upload_function"
              spinner-color="red"
            >
              <template v-slot:error>
                <div
                  class="absolute-full flex flex-center bg-primary text-white"
                >
                  没有相关图片
                </div>
              </template>
            </q-img>
            <q-file
              v-show="false"
              ref="img_upload"
              v-model="upload_img"
              label="Standard"
              max-file-size="5242880"
              accept="image/png, image/jpeg"
              @rejected="onRejected"
            />
          </q-item-section>
        </q-item>
        <q-item v-show="state == 2 || state == 3 ? true : false">
          <q-item-section> 点位坐标 </q-item-section>
          <q-item-section>
            <q-input
              :readonly="state == 3 ? false : true"
              outlined
              v-model="datainfo.position"
              placeholder="点位坐标"
            >
            </q-input>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section class="row">
      <q-btn label="确认" color="primary" @click="return_layerdata"></q-btn>
      <q-btn label="关闭" style="margin-left: 15px" v-close-popup></q-btn>
    </q-card-section>
    <!-- 图片裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <img-cut :crooper_img="crooper_img" @screenshot="cut_img"></img-cut>
    </q-dialog>
  </div>
</template>

<script>
import ImgCut from "../layer/img_crooper.vue";
export default {
  name: "LayerInfoWindow",
  data() {
    return {
      datainfo: {
        content: "",
        itemId: 0,
        markerId: 0,
        name: "",
        position: "",
        resource: null,
        resourceBase64: null,
        time: 0,
      },
      show_img: null,
      upload_img: null,
      cropper_window: false,
      crooper_img: null,
    };
  },
  components: {
    ImgCut,
  },
  methods: {
    //触发选取文件事件
    upload_function() {
      //触发选取文件事件（框架自带的文件上传器难以定义样式，故直接调用事件）
      this.$refs.img_upload.pickFiles();
    },
    //上传失败所用弹窗
    onRejected(rejectedEntries) {
      //上传类型检测
      if (
        rejectedEntries[0].file.type != "image/png" &&
        rejectedEntries[0].file.type != "image/jpeg"
      ) {
        //提示弹窗
        this.showNotif(`上传的不是图片类型文件，请确认后重新上传`);
      } else {
        this.showNotif(`上传的图片文件不能大于2MB，请重新截图或压缩后再上传`);
      }
    },
    //上传后图片转换为base64
    file_switch() {
      if (this.upload_img != null) {
        let img = this.upload_img;
        let fr = new FileReader();
        fr.readAsDataURL(img);
        fr.onload = (res) => {
          this.crooper_img = res.target.result;
          //在转换完成后清除file，否则当用户再次上传同一图片时，由于未触发model变化，会导致函数不被调用从而不弹出截图框
          this.upload_img = null;
        };
        this.cropper_window = true;
      }
    },
    //截图返回函数
    cut_img(data) {
      this.cropper_window = false;
      this.show_img = data;
      this.datainfo.resourceBase64 = data;
    },
    return_layerdata() {
      this.$emit("callback", this.datainfo);
    },
  },
  props: ["layerdata", "state"],
  watch: {
    //检测文件上传事件（不使用@input，触发时间节点有差异，可能会导致奇怪的bug）
    upload_img: function (val) {
      if (val != null) {
        this.file_switch();
      }
    },
  },
  mounted() {
    this.show_img = this.layerdata.resource;
    this.datainfo = Object.assign(this.datainfo, this.layerdata);
  },
};
</script>

<style scoped>
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.layer_img:hover {
  cursor: pointer;
}
</style>