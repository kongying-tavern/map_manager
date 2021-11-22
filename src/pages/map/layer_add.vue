<!-- 打点页 -->
<template>
  <base-content>
    <!-- 上方状态切换 -->
    <div class="layer_add">
      <div class="row items-center edit_switch">
        <div>
          <q-toggle v-model="edit_state" size="50px" />
          <span class="edit_text">操作窗口</span>
        </div>
        <div>
          <q-toggle v-model="table_list_window" size="50px" />
          <span class="edit_text">列表模式</span>
        </div>
      </div>

      <!-- 地图容器 -->
      <div id="map"></div>
      <!-- 加载状态组件 -->
      <q-inner-loading style="z-index: 9999" :showing="map_loading">
        <q-spinner-gears size="50px" color="primary" />
        <span style="margin-top: 20px; font-size: 25px">加载中...</span>
        <span style="margin-top: 20px; font-size: 25px"
          >若长时间未响应，请刷新页面...</span
        >
      </q-inner-loading>
    </div>
    <!-- 右侧筛选器 -->
    <transition name="fade">
      <q-card class="selector" v-show="edit_state">
        <layer-select @select_layer="layer_draw"></layer-select>
        <q-inner-loading style="z-index: 9999" :showing="selector_loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </transition>
    <!-- 点位编辑弹窗 -->
    <q-dialog v-model="layer_window">
      <q-card>
        <q-card-section>
          <q-list bordered separator style="width: 500px">
            <q-item>
              <q-item-section> 点位名称 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="layer_data.name"
                  placeholder="点位名称"
                >
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> 点位描述 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="layer_data.desc"
                  placeholder="点位描述"
                >
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> 点位图片 </q-item-section>
              <q-item-section>
                <q-img
                  :src="layer_img"
                  class="layer_img"
                  @click="upload_function"
                >
                </q-img>
                <q-file
                  v-show="false"
                  ref="img_upload"
                  v-model="upload_img"
                  label="Standard"
                  max-file-size="5242880"
                  accept="image/png, image/jpeg"
                  @rejected="onRejected"
                  @input="file_switch"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section>
          <q-btn color="primary" label="确认" />
          <q-btn
            color="white"
            text-color="primary"
            label="取消"
            v-close-popup
            style="margin-left: 30px"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 图片裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <div class="cropper_containor">
        <div class="cropper_area">
          <img-cut :crooper_img="crooper_img"></img-cut>
        </div>
      </div>
    </q-dialog>
    <q-dialog v-model="table_list_window" seamless position="bottom">
      <q-card style="width: 50vw; height: 40vh"></q-card>
    </q-dialog>
  </base-content>
</template>

<script>
import Vue from "vue";
import BaseContent from "../../components/BaseContent/BaseContent";
import { layer_data_select } from "../../services/map_request";
import { initmap } from "../../api/map";
import { layergroup_register } from "../../api/layer";
import LayerSelect from "../../components/map/layer/layer_select.vue";
import PopupWindow from "../../components/map/layer/popup_window.vue";
import ImgCut from "../../components/map/layer/img_crooper.vue";
export default {
  data() {
    return {
      map: "",
      edit_state: true,
      table_list_window: false,
      model: null,
      options: [],
      layer_data: null,
      map_loading: false,
      layer_window: false,
      layer_data: {
        name: "",
        desc: "",
      },
      cropper_window: false,
      selector_loading: false,
      layer_img: require("../../assets/img/default.png"),
      upload_img: null,
      crooper_img: null,
    };
  },
  components: {
    BaseContent,
    LayerSelect,
    ImgCut,
  },
  methods: {
    layer_draw(val) {
      if (val != null) {
        this.selector_loading = true;
        layer_data_select(val).then((res) => {
          let layerdata = [
            {
              type: "FeatureCollection",
              features: [],
            },
          ];
          //生成对应点位类型下所有点位数据的对象
          for (let i of res.data.data) {
            layerdata[0].features.push({
              geometry: {
                type: "Point",
                coordinates: i.position.split(","),
              },
              type: "Feature",
              properties: {
                popTitle: i.title,
                popupContent: i.content,
              },
              imgsrc: "",
              id: i.id,
            });
          }
          //每次切换点位时清空地图上已有点位
          if (this.callback_layer != null) {
            this.map.removeLayer(this.callback_layer.select_Layer);
          }
          //将点位传入处理函数进行处理，返回leaflet的layer对象,同时对组件挂载
          this.callback_layer = layergroup_register(layerdata[0], this.map);
          //给点位绑定弹窗的相关处理
          this.callback_layer.select_Layer.eachLayer(function (layer) {
            //需要指定一个dom元素用于绑定组件，且需要为其指定宽度，否则leaflet弹窗无法获取容器宽度导致组件内容无法完全展示
            layer.bindPopup(`<div id="popup_window"></div>`);
            layer.on("click", function () {
              console.log(layer.feature);
              //使用extend将popup组件挂载至popup弹窗内id为popup_window的dom对象上
              var Profile = Vue.extend(PopupWindow);
              //将对应点位的数据传入组件做进一步处理
              new Profile({
                propsData: {
                  layerdata: layer.feature,
                },
              }).$mount("#popup_window");
            });
          });
          //在地图上挂载点位
          this.map.addLayer(this.callback_layer.select_Layer);
          this.selector_loading = false;
        });
      }
    },
    upload_function() {
      this.$refs.img_upload.pickFiles();
    },
    //上传失败所用弹窗
    onRejected(rejectedEntries) {
      console.log(rejectedEntries[0].file.type);
      if (
        rejectedEntries[0].file.type != "image/png" &&
        rejectedEntries[0].file.type != "image/jpeg"
      ) {
        this.$q.notify({
          type: "negative",
          message: `上传的不是图片类型文件，请确认后重新上传`,
          position: "top",
          timeout: 3000,
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: `上传的图片文件不能大于2MB，请重新截图或压缩后再上传`,
          position: "top",
          timeout: 3000,
        });
      }
    },
    //上传后图片转换为base64
    file_switch() {
      console.log(this.upload_img);
      let img = this.upload_img;
      let fr = new FileReader();
      fr.readAsDataURL(img);
      let that = this;
      fr.onload = function (res) {
        that.crooper_img = res.target.result;
      };
      this.cropper_window = true;
    },
  },
  mounted() {
    this.map = initmap(this.map);
  },
  watch: {
    "$store.state.layer_handel_data": function (val) {
      switch (val.handel_type) {
        case 1:
          this.layer_window = true;
          break;
      }
    },
  },
};
</script>

<style scoped>
#map {
  position: relative;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
}
.edit_switch {
  position: absolute;
  z-index: 1000;
}
.edit_text {
  font-weight: bold;
  color: white;
}
.selector {
  position: absolute;
  overflow: hidden scroll;
  z-index: 1000;
  top: 5vh;
  right: 10px;
  width: 350px;
  height: 80vh;
}
.selector::-webkit-scrollbar {
  width: 5px;
  background: #fff;
}
.selector::-webkit-scrollbar-thumb {
  background: #1976d2;
}
.layer_img {
  height: 140px;
  max-width: 150px;
}
.layer_img:hover {
  cursor: pointer;
}
.cropper_containor {
  position: relative;
  width: 80vw;
  max-width: 80vw;
  height: 75vh;
  background: #fff;
}
.cropper_area {
  position: absolute;
  left: 0;
  top: 0;
  width: 70%;
  height: 100%;
}
</style>

<style>
#popup_window {
  width: 300px;
}
.popup {
  width: 300px;
  font-size: 16px;
}
.leaflet-container a.leaflet-popup-close-button {
  position: absolute;
  top: 8px;
  right: 16px;
  padding: 4px 4px 0 0;
  border: none;
  text-align: center;
  width: 18px;
  height: 14px;
  font: 30px/14px Tahoma, Verdana, sans-serif;
  color: #c3c3c3;
  text-decoration: none;
  font-weight: bold;
  background: transparent;
}
</style>
