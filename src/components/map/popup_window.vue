<!-- 地图弹窗组件 -->
<template>
  <div class="popup">
    <p>{{ layerdata.properties.popTitle }}</p>
    <p>id:{{ layerdata.id }}</p>
    <p>
      {{ layerdata.properties.popupContent }}
    </p>
    <div>
      <q-btn label="修改" color="primary" @click="layer_handel(1)"></q-btn>
    </div>
  </div>
</template>

<script>
//由于未在父组件使用，所以无法使用this.$store来指向全局的Vuex.Store对象
//故这里需要主动调用全局的Vuex.Store对象来使用vuex？
import store from "../../store/index";
export default {
  name: "PopupWindow",
  data() {
    return {};
  },
  props: ["layerdata"],
  methods: {
    //将操作点位的数据传至vuex state
    //type=>1,修改;2,删除
    layer_handel(type) {
      console.log(this);
      console.log(this.$store);
      store.commit("layer_edit", {
        type: type,
        data: this.layerdata,
      });
    },
  },
};
</script>

<style>
</style>