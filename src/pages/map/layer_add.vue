<!-- 打点页 -->
<template>
  <base-content>
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
      <div id="map"></div>
      <q-inner-loading style="z-index: 9999" :showing="visible">
        <q-spinner-gears size="50px" color="primary" />
        <span style="margin-top: 20px; font-size: 25px">加载中...</span>
        <span style="margin-top: 20px; font-size: 25px"
          >若长时间未响应，请刷新页面...</span
        >
      </q-inner-loading>
    </div>
    <transition name="fade">
      <q-card class="selector" v-show="edit_state">
        <layer-select :map="map" @select_layer="layer_draw"></layer-select>
      </q-card>
    </transition>

    <q-dialog v-model="table_list_window" seamless position="bottom">
      <q-card style="width: 50vw; width: 50vw; height: 40vh"> </q-card>
    </q-dialog>
  </base-content>
</template>

<script>
import BaseContent from "../../components/BaseContent/BaseContent";
import { initmap } from "../../api/map";
import LayerSelect from "../../components/map/layer_select.vue";
export default {
  data() {
    return {
      map: "",
      edit_state: false,
      table_list_window: false,
      model: null,
      options: [],
      layer_data: null,
      visible: false,
    };
  },
  methods: {},
  components: {
    BaseContent,
    LayerSelect,
  },
  methods: {
    loading(val) {
      this.visible = val;
    },
    layer_draw(val){
      
    }
  },
  mounted() {
    this.map = initmap(this.map);
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
  z-index: 9999;
}
.edit_text {
  font-weight: bold;
  color: white;
}
.selector {
  position: absolute;
  overflow: hidden scroll;
  z-index: 9999;
  top: 5vh;
  right: 10px;
  width: 350px;
  height: 80vh;
}
.selector::-webkit-scrollbar
{
  width: 5px;
  background: #fff;
}
.selector::-webkit-scrollbar-thumb
{
  background: #1976d2;
}
</style>