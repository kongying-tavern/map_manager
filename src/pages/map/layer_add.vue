<!-- 打点页 -->
<template>
  <base-content>
    <!-- 上方状态切换 -->
    <div class="layer_add">
      <div class="items-center edit_switch">
        <div class="row">
          <div>
            <q-toggle v-model="edit_state" size="50px" />
            <span class="edit_text">操作窗口</span>
          </div>
          <div v-show="edit_state">
            <div>
              <q-toggle
                v-model="right_card_state.selector"
                :disable="!right_card_state.table"
                size="50px"
              />
              <span class="edit_text">显示筛选器</span>
            </div>
            <div>
              <q-toggle
                v-model="right_card_state.table"
                :disable="!right_card_state.selector"
                size="50px"
              />
              <span class="edit_text">显示表格</span>
            </div>
          </div>
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
      <q-card class="selector_main row" v-show="edit_state">
        <div v-show="right_card_state.selector" class="selector">
          <layer-select @select_layer="layer_draw"></layer-select>
        </div>
        <q-separator
          v-show="right_card_state.table && right_card_state.selector"
          :vertical="true"
        />
        <div
          v-show="right_card_state.table"
          style="max-width: 1000px; margin: 10px 10px 0 10px"
        >
          <q-table
            style="max-height: 700px"
            title="点位列表"
            :data="select_layerlist_data"
            :columns="select_layerlist_columns"
            selection="multiple"
            :selected.sync="selected"
            row-key="id"
            virtual-scroll
            :rows-per-page-options="[0]"
          >
            <template v-slot:top-right>
              <div class="row">
                <q-input
                  outlined
                  v-model="keyword_value"
                  placeholder="请输入关键字搜索"
                />
                <q-btn color="primary" label="搜索" style="margin-left: 20px" />
              </div>
            </template>
            <!-- 表格内操作按钮插槽 -->
            <template v-slot:body-cell-handle>
              <q-td class="text-center">
                <a href="javascript:;" style="margin-right: 20px">查看详情</a>
                <a href="javascript:;">审核</a>
              </q-td>
            </template>
          </q-table>
          <div style="margin-top: 20px">
            <q-btn
              label="批量修改"
              color="primary"
              :disable="selected.length == 0 ? true : false"
              @click="layer_modify(3)"
            ></q-btn>
          </div>
        </div>
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
            <q-item v-show="handle_state != 3 ? true : false">
              <q-item-section> 点位图片 </q-item-section>
              <q-item-section>
                <q-img
                  :src="show_img"
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
          <q-btn
            color="primary"
            label="确认"
            @click="update_add_layer(handle_state)"
          />
          <q-btn
            color="white"
            text-color="primary"
            label="取消"
            v-close-popup
            style="margin-left: 30px"
          />
          <q-btn
            v-show="this.handle_state == 2 ? true : false"
            color="red"
            text-color="white"
            label="撤销新增"
            @click="remove_add_layer"
            v-close-popup
            style="margin-left: 30px"
          />
          <q-btn
            color="red"
            v-show="this.handle_state != 2 ? true : false"
            text-color="white"
            label="删除点位"
            v-close-popup
            style="margin-left: 30px"
          />
        </q-card-section>
        <q-inner-loading :showing="add_loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-dialog>
    <!-- 图片裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <img-cut :crooper_img="crooper_img" @screenshot="cut_img"></img-cut>
    </q-dialog>
    <!-- 拖拽提示 -->
    <q-dialog v-model="drag_hint" seamless position="top">
      <q-card>
        <q-card-section class="row items-center">
          <q-circular-progress
            indeterminate
            size="20px"
            color="primary"
            :thickness="0.2"
            class="q-ma-md"
          />
          <span>拖动标记以改动点位的位置</span>
          <q-btn
            color="primary"
            style="margin-left: 20px"
            @click="layer_drag_cancel"
            >取消</q-btn
          ></q-card-section
        >
      </q-card>
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
import { addlayer_handle } from "../../services/check_request";
import LayerSelect from "../../components/map/layer/layer_select.vue";
import PopupWindow from "../../components/map/layer/popup_window.vue";
import ImgCut from "../../components/map/layer/img_crooper.vue";
import { icon_bg } from "../../api/layer";
export default {
  data() {
    return {
      selected: [],
      select_layerlist_columns: [
        {
          name: "id",
          label: "点位id",
          field: "id",
          align: "center",
        },
        {
          name: "title",
          label: "点位名称",
          field: "title",
          align: "center",
        },
        {
          name: "content",
          label: "点位描述",
          field: "content",
          align: "center",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "center",
        },
      ],
      select_layerlist_data: [],
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
      drag_mode: false,
      select_layer_id: null,
      select_layer_object: null,
      cropper_window: false,
      selector_loading: false,
      show_img: require("../../assets/img/default.png"),
      upload_img: null,
      crooper_img: "",
      handle_state: "",
      drag_hint: false,
      add_loading: false,
      right_card_state: {
        selector: true,
        table: true,
      },
      keyword_value: "",
    };
  },
  components: {
    BaseContent,
    LayerSelect,
    ImgCut,
  },
  methods: {
    //提示
    showNotif(msg, time = 3000) {
      this.$q.notify({
        message: msg,
        color: "white",
        icon: "check",
        textColor: "black",
        position: "top",
        timeout: time,
      });
    },
    //在地图上绘制所选点位下的所有点位
    layer_draw(val) {
      if (val != null) {
        this.selector_loading = true;
        layer_data_select(val).then((res) => {
          this.select_layerlist_data = [];
          for (let i of res.data.data) {
            this.select_layerlist_data.push(i);
          }
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
              this.select_layer_object = layer;
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
      this.layer_data.img = data;
    },
    //单位操作弹窗函数
    //1，修改打点 2，新增打点 3，批量修改
    layer_modify(state, data) {
      this.handle_state = state;
      switch (state) {
        case 1:
          this.layer_window = true;
          break;
        case 2:
          this.layer_window = true;
          break;
        case 3:
          this.layer_window = true;
      }
    },
    //点位拖拽函数
    layer_drag() {
      this.map.closePopup();
      this.drag_hint = true;
      this.selector_loading = true;
      this.select_layer_object.dragging.enable();
      this.select_layer_object.on("dragend", () => {
        this.drag_hint = false;
        this.showNotif("点位坐标更新成功");
        this.select_layer_object.dragging.disable();
      });
    },
    //取消拖拽
    layer_drag_cancel() {
      this.drag_hint = false;
      this.selector_loading = false;
      this.select_layer_object.dragging.disable();
    },
    //撤销新增点位函数
    remove_add_layer() {
      this.map.removeLayer(this.select_layer_object);
    },
    //点位标记
    layer_mark(layer) {
      let layer_icondata = layer.getIcon();
      switch (layer_icondata.options.state) {
        case "off":
          layer_icondata.options.state = "on";
          break;
        case "on":
          layer_icondata.options.state = "off";
          break;
      }
      let icondata = icon_bg(`border_${layer_icondata.options.state}`);
      layer.setIcon(new icondata({ ...layer_icondata.options }));
    },
    //提交新增点位
    update_add_layer() {
      let data = {
        itemId: this.select_layer_id,
        content: this.layer_data.desc,
        title: "",
        resourceBase64: this.layer_data.img,
        position: this.select_layer_object.options.alt,
        time: 0,
      };
      this.add_loading = true;
      addlayer_handle("put", data).then((res) => {
        this.add_loading = false;
        this.layer_window = false;
        if (res.data.data == true) {
          this.layer_mark(this.select_layer_object);
          this.showNotif("新增成功!");
        } else {
          this.showNotif("新增失败!");
        }
      });
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
          this.layer_modify(1, val.handel_data);
          break;
        case 2:
          this.layer_drag();
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
            this.select_layer_object = marker;
            this.layer_modify(2, marker);
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
.layer_add {
  overflow: hidden;
}
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
.selector_main {
  position: absolute;
  z-index: 1000;
  top: 5vh;
  right: 5px;
  max-width: 100vw;
  height: 80vh;
}
.selector {
  height: 100%;
  overflow: scroll;
}
.selector::-webkit-scrollbar {
  width: 2px;
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
  width: 250px;
}
.popup {
  width: 250px;
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
