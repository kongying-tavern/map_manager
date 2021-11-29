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
        <div v-show="select_layer_id == null ? false : true">
          <q-toggle v-model="add_mode" size="50px" />
          <span class="edit_text">打点模式</span>
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
    <!-- 点位弹窗 -->
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
      <img-cut :crooper_img="crooper_img" @screenshot="cut_img"></img-cut>
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
import {
  create_geojson,
  layer_register,
  layergroup_register,
} from "../../api/layer";
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
      map_loading: false,
      layer_window: false,
      layer_data: {
        name: "",
        desc: "",
        img: "",
      },
      item_id: null,
      item_list: null,
      add_mode: false,
      select_layer_id: null,
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
    //在地图上绘制所选点位下的所有点位
    layer_draw(val) {
      if (val != null) {
        this.selector_loading = true;
        layer_data_select(val).then((res) => {
          if (res.data.data.length != 0) {
            this.select_layer_id = val;
          } else {
            this.select_layer_id = null;
          }
          this.item_list = create_geojson(res.data.data);
          //每次切换点位时清空地图上已有点位
          if (this.callback_layer != null) {
            this.map.removeLayer(this.callback_layer.select_Layer);
          }
          //将点位传入处理函数进行处理，返回leaflet的layer对象,同时对组件挂载
          this.callback_layer = layergroup_register(
            this.item_list[0],
            this.map
          );
          //给点位绑定弹窗的相关处理
          this.callback_layer.select_Layer.eachLayer((layer) => {
            //需要指定一个dom元素用于绑定组件，且需要为其指定宽度，否则leaflet弹窗无法获取容器宽度导致组件内容无法完全展示
            layer.bindPopup(`<div id="popup_window"></div>`);
            layer.on("popupopen", () => {
              //使用extend将popup组件挂载至popup弹窗内id为popup_window的dom对象上
              var Profile = Vue.extend(PopupWindow);
              //将对应点位的数据传入组件做进一步处理
              new Profile({
                propsData: {
                  layerdata: layer,
                  map: this.map,
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
    //触发选取文件事件
    upload_function() {
      //触发选取文件事件（框架自带的文件上传器难以定义样式，故直接调用事件）
      this.$refs.img_upload.pickFiles();
    },
    //上传失败所用弹窗
    onRejected(rejectedEntries) {
      console.log(rejectedEntries[0].file.type);
      //上传类型检测
      if (
        rejectedEntries[0].file.type != "image/png" &&
        rejectedEntries[0].file.type != "image/jpeg"
      ) {
        //提示弹窗
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
      this.layer_img = data;
    },
    //单位操作弹窗函数
    layer_modify(state) {
      switch (state) {
        case 1:
      }
    },
  },
  mounted() {
    //注册地图
    this.map = initmap(this.map);
  },
  watch: {
    //检测文件上传事件（不使用@input，触发时间节点有差异，可能会导致奇怪的bug）
    upload_img: function (val) {
      if (val != null) {
        this.file_switch();
      }
    },
    //检测弹窗产生的vuex变量变化，从而触发不同的事件
    "$store.state.layer_handel_data": function (val) {
      switch (val.handel_type) {
        case 1:
          this.layer_window = true;
          break;
      }
    },
    //打点函数
    add_mode(val) {
      if (val == true) {
        this.map.on("click", (event) => {
          var marker = layer_register(
            event.latlng,
            "marker",
            this.item_list[0]
          );
          marker.addTo(this.callback_layer.select_Layer).on("click", () => {
            this.layer_window = true;
          });
        });
      } else {
        this.map.off("click");
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
