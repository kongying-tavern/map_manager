<!-- 地图弹窗组件 -->
<template>
  <div class="popup">
      <q-card-section>
        <p>{{ layerdata.properties.popTitle }} id:{{ layerdata.id }}</p>
        <p>
          {{ layerdata.properties.popupContent }}
        </p>
        <img
          class="layer_img"
          src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage.biaobaiju.com%2Fuploads%2F20190705%2F23%2F1562339421-qBMEIovHsu.jpg&refer=http%3A%2F%2Fimage.biaobaiju.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639815497&t=6efef5d609896fdcf02496ad07e94478"
        />
      </q-card-section>
      <q-card-section>
        <q-btn label="修改" color="primary" @click="layer_handel(1)"></q-btn>
      </q-card-section>
  </div>
</template>

<script>
//由于未在父组件使用，所以无法使用this.$store来指向全局的Vuex.Store对象
//故这里需要主动调用全局的Vuex.Store对象来使用vuex
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
      store.commit("layer_edit", {
        type: type,
        data: this.layerdata,
      });
    },
  },
};
</script>

<style>
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
</style>