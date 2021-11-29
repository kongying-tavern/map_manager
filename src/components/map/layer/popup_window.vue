<!-- 地图弹窗组件 -->
<template>
  <div class="popup">
    <div class="text">
      <p>
        {{ layerdata.feature.properties.popTitle }} id:{{
          layerdata.feature.id
        }}
      </p>
      <img
        class="layer_img"
        src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage.biaobaiju.com%2Fuploads%2F20190705%2F23%2F1562339421-qBMEIovHsu.jpg&refer=http%3A%2F%2Fimage.biaobaiju.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639815497&t=6efef5d609896fdcf02496ad07e94478"
      />
      <p>
        {{ layerdata.feature.properties.popupContent }}
      </p>
    </div>
    <div class="btns">
      <q-btn flat label="修改" color="primary" @click="layer_handel(1)"></q-btn>
      <q-btn flat label="标记" color="primary" @click="layer_mark"></q-btn>
    </div>
  </div>
</template>

<script>
//由于未在父组件使用，所以无法使用this.$store来指向全局的Vuex.Store对象
//故这里需要主动调用全局的Vuex.Store对象来使用vuex
import store from "../../../store/index";
import { icon_bg } from "../../../api/layer";
export default {
  name: "PopupWindow",
  data() {
    return {};
  },
  props: ["layerdata", "map"],
  mounted() {},
  methods: {
    //将操作点位的数据传至vuex state
    //type=>1,修改;2,删除
    layer_handel(type) {
      store.commit("layer_edit", {
        type: type,
        data: this.layerdata.feature,
      });
    },
    //点位标记
    layer_mark() {
      let layer_icondata = this.layerdata.getIcon();
      switch (layer_icondata.options.state) {
        case "off":
          layer_icondata.options.state = "on";
          break;
        case "on":
          layer_icondata.options.state = "off";
          break;
      }
      let icondata = icon_bg(`border_${layer_icondata.options.state}`);
      this.layerdata.setIcon(new icondata({ ...layer_icondata.options }));
    },
  },
};
</script>
<style scoped>
p {
  margin: 10px auto;
}
</style>
<style>
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.text
{
  width: 90%;
  margin: 10px auto;
}
</style>