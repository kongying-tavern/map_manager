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
        </div>
        <div v-show="select_layer_id == null ? false : true">
          <q-toggle v-model="add_mode" size="50px" />
          <span class="edit_text">打点模式</span>
        </div>
        <q-btn
          v-show="select_layer_id == null ? false : true"
          style="margin: 10px 0 0 10px"
          color="primary"
          label="刷新当前点位"
          @click="refresh_layer"
        ></q-btn>
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
    <q-dialog v-model="layer_info_window" position="left">
      <q-card>
        <layer-info-window
          :layerdata="layer_data"
          :state="handle_state"
          @callback="get_callback_data"
        >
        </layer-info-window>
        <q-card-section style="padding-top: 0">
          <q-btn
            label="撤销新增点位"
            color="red"
            @click="remove_add_layer"
            v-close-popup
            v-show="handle_state == 2 ? false : true"
          ></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 右侧筛选器 -->
    <transition name="fade">
      <div class="selector_main" v-show="edit_state">
        <layer-select
          :refresh="refresh_trigger"
          :add_mode="add_mode"
          :map="map"
          @area_data="get_area_data"
          @callback="layer_draw"
          @clear="clear_cache"
          @focus_layer="focus_layer_popup"
        ></layer-select>
        <q-inner-loading :showing="selector_loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </div>
    </transition>
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
import { initmap, switch_map } from "../../api/map";
import {
  create_geojson,
  layer_register,
  layergroup_register,
} from "../../api/layer";
import { addlayer_handle } from "../../services/check_request";
import LayerSelect from "../../components/map/layer/layer_select.vue";
import PopupWindow from "../../components/map/layer/popup_window.vue";
import LayerInfoWindow from "../../components/map/layer/layer_info_window.vue";
import { icon_bg } from "../../api/layer";
export default {
  data() {
    return {
      map: "",
      edit_state: true,
      map_loading: false,
      layer_window: false,
      layer_data: {
        desc: "",
        img: "",
      },
      item_list: null,
      add_mode: false,
      drag_mode: false,
      select_layer_data: null,
      select_layer_id: null,
      select_layer_object: null,
      selector_loading: false,
      handle_state: "",
      drag_hint: false,
      add_loading: false,
      selected_item_id: "",
      callback_layer: undefined,
      addlayer_cache: undefined,
      refresh_trigger: true,
      layer_info_window: false,
      area_data: "",
      selected_popup_layer: null,
    };
  },
  components: {
    BaseContent,
    LayerSelect,
    LayerInfoWindow,
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
    //获取要绘制的点位参数
    //在地图上绘制所选点位下的所有点位
    layer_draw(val) {
      if (this.area_data.name == "渊下宫") {
        switch_map(this.map, "YXG");
      } else {
        switch_map(this.map, "mainworld");
      }
      if (val.data.length != 0) {
        this.select_layer_data = val;
        this.selector_loading = true;
        this.select_layer_id = val.id;
        this.selected_item_id = val.data[0].mlayer;
        this.item_list = create_geojson(val.data);
        //每次切换点位时清空地图上已有点位
        if (this.callback_layer != null) {
          this.map.removeLayer(this.callback_layer.select_Layer);
        }
        //将点位传入处理函数进行处理，返回leaflet的layer对象,同时对组件挂载
        this.callback_layer = layergroup_register(this.item_list[0], this.map);
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
      } else {
        this.map.removeLayer(this.callback_layer.select_Layer);
      }
    },
    //单位操作弹窗函数
    //1，新增 2，修改
    layer_modify(state, data) {
      this.handle_state = state;
      switch (state) {
        case 1:
          this.layer_data = {};
          this.layer_info_window = true;
          break;
        case 2:
          this.layer_data = data.data;
          this.layer_info_window = true;
          break;
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
    update_add_layer(data) {
      this.add_loading = true;
      addlayer_handle("put", {
        optionType: this.handle_state,
        punctuates: [data],
      }).then((res) => {
        this.add_loading = false;
        this.layer_window = false;
        if (res.data.data == true) {
          this.showNotif("操作成功!");
          switch (this.handle_state) {
            case 1:
              this.refresh_trigger = !this.refresh_trigger;
              this.addlayer_cache.removeLayer(this.select_layer_object);
              break;
          }
        } else {
          this.showNotif("操作失败!");
        }
      });
    },
    //删除缓存
    clear_cache() {
      this.addlayer_cache.clearLayers();
    },
    //刷新点位
    refresh_layer() {
      if (confirm("你确定要刷新当前点位么？")) {
        this.refresh_trigger = !this.refresh_trigger;
      }
    },
    get_callback_data(val) {
      let data = {};
      switch (this.handle_state) {
        case 1:
          data = {
            itemId: this.select_layer_id,
            content: val.content,
            name: "",
            resourceBase64:
              val.resourceBase64 == null ? undefined : val.resourceBase64,
            position: this.select_layer_object.options.alt,
            time: 0,
          };
          break;
        case 2:
          data = {
            itemId: this.select_layer_id,
            content: val.content,
            name: val.name,
            resourceBase64:
              val.resourceBase64 == null ? undefined : val.resourceBase64,
            position: val.position,
            time: 0,
          };
          break;
      }
      this.update_add_layer(data);
      this.layer_info_window = false;
    },
    get_area_data(data) {
      this.area_data = data;
    },
    focus_layer_popup(data) {
      let list = this.callback_layer.select_Layer.getLayers();
      for (let i of list) {
        if (i.feature.id == data.id) {
          i.openPopup();
        }
      }
    },
  },
  mounted() {
    //注册地图
    this.map = initmap(this.map);
    this.map.setView([3200, -3000], -3);
    //注册打点缓存组
    this.addlayer_cache = L.layerGroup();
  },
  watch: {
    //检测弹窗产生的vuex变量变化，从而触发不同的事件
    "$store.state.layer_handel_data": function (val) {
      switch (val.handel_type) {
        case 1:
          this.layer_modify(2, val.handel_data);
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
            "border_unsubmit",
            this.selected_item_id,
            this.item_list[0].features[0].icon_src
          );
          marker.addTo(this.addlayer_cache).on("click", () => {
            this.select_layer_object = marker;
            this.layer_modify(1, marker);
          });
          this.map.addLayer(this.addlayer_cache);
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
  height: 91vh;
  background: rgba(85, 63, 63, 0.5);
  cursor: pointer;
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
.selector_main {
  overflow: hidden;
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
.leaflet-marker-pane img {
  cursor: move;
}
</style>
