<!-- 打点页操作窗口组件 -->
<template>
  <div class="layer_select">
    <q-card-section>
      <div class="row">
        <q-input
          v-model="search"
          debounce="200"
          filled
          clearable
          placeholder="输入关键字以搜索"
          style="width: 70%"
          @keyup.enter="search_layer"
          @clear="search_layer"
        >
        </q-input>
        <q-btn
          color="primary"
          style="margin-left: 10px"
          label="搜索"
          @click="search_layer"
        ></q-btn>
      </div>
    </q-card-section>
    <q-card-section
      class="search_options"
      v-show="search_options.length == 0 ? false : true"
    >
      <q-option-group
        v-model="selected_layer"
        :options="search_options"
        color="primary"
      />
    </q-card-section>
    <q-card-section>
      <q-list>
        <q-expansion-item v-for="i in propdata" :key="i.id">
          <template v-slot:header>
            <q-item-section> {{ i.name }} </q-item-section>
          </template>
          <q-expansion-item v-for="j in i.types" :key="j.id">
            <template v-slot:header>
              <q-item-section>
                <span style="text-indent: 25px"> {{ j.name }} </span>
              </q-item-section>
            </template>
            <div style="margin-left: 55px">
              <q-option-group
                v-model="selected_layer"
                :options="format_options(j.items)"
                color="primary"
              />
            </div>
          </q-expansion-item>
        </q-expansion-item>
      </q-list>
    </q-card-section>
    <q-inner-loading style="z-index: 9999" :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import Vue from "vue";
import {
  layer_data_select,
  layer_keyword_select,
  options_type_select,
} from "../../services/map_request";
import { layergroup_register } from "../../api/layer";
import PopupWindow from "../map/popup_window.vue";
export default {
  name: "LayerSelect",
  data() {
    return {
      propdata: [],
      loading: false,
      search: "",
      search_options: [],
      layer_group: [],
      selected_layer: "",
      options: [],
      callback_layer: null,
    };
  },
  components: {
    PopupWindow,
  },
  methods: {
    //渲染下拉菜单中单选项目的函数
    format_options(data) {
      let option_group = [];
      if (data != null) {
        for (let i of data) {
          option_group.push({
            label: i.name,
            value: i.id,
          });
        }
      }
      return option_group;
    },
    //关键字查询功能
    search_layer() {
      if (this.search == "") {
        this.search_options = [];
        return;
      }
      this.loading = true;
      layer_keyword_select(this.search).then((res) => {
        this.search_options = [];
        for (let i of res.data.data) {
          for (let j of i.types) {
            for (let x of j.items) {
              this.search_options.push({
                label: `${i.name}-${j.name}-${x.name}`,
                value: x.id,
              });
            }
          }
        }
        this.loading = false;
      });
    },
  },
  components: {
    PopupWindow,
  },
  props: ["map"],
  mounted() {
    options_type_select().then((res) => {
      this.propdata = res.data.data;
    });
  },
  watch: {
    selected_layer: function (val) {
      this.$emit("load", true);
      if (val != null) {
        layer_data_select(val).then((res) => {
          this.$emit("load", false);
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
        });
      }
    },
    "$store.state.layer_handel_data":function(val)
    {
      
    }
  },
};
</script>

<style scoped>
.search_options {
  max-height: 300px;
  margin-right: 10px;
  overflow: hidden scroll;
  padding-top: 0;
  padding-bottom: 0;
}
.search_options::-webkit-scrollbar {
  width: 5px;
  background: #fff;
}
.search_options::-webkit-scrollbar-thumb {
  background: #1976d2;
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
</style>