<!-- 地图弹窗组件 -->
<template>
  <div class="popup">
    <div class="text">
      <p>
        {{ layerdata.feature.properties.popTitle }} id:{{
          layerdata.feature.id
        }}
      </p>
      <q-img
        class="layer_img"
        :src="
          layerdata.feature.imgsrc == null
            ? 'https://assets.yuanshen.site/images/noImage.png'
            : layerdata.feature.imgsrc
        "
        spinner-color="primary"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-primary text-white">
            没有相关图片
          </div>
        </template>
      </q-img>
      <p>
        点位描述：{{ layerdata.feature.properties.popupContent }}
      </p>
    </div>
    <div
      class="btns row justify-between"
      v-show="this.layerdata.feature.check_in == true ? false : true"
    >
      <q-btn flat label="修改" color="primary" @click="layer_handel(1)"></q-btn>
      <q-btn flat label="标记" color="primary" @click="layer_mark"></q-btn>
      <q-btn
        flat
        label="更改坐标"
        color="primary"
        @click="layer_handel(2)"
      ></q-btn>
    </div>
    <div
      class="btns row justify-between"
      v-show="this.layerdata.feature.check_in == true ? true : false"
    >
      <p style="width: 100%">
        审核状态：{{ this.layerdata.feature.data.status | status_filter }}
      </p>
      <p style="width: 100%">
        审核意见：{{ this.layerdata.feature.data.auditRemark }}
      </p>
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
  mounted() {
  },
  methods: {
    //将操作点位的数据传至vuex state
    //type=>1,修改信息;2,更改坐标
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
  filters: {
    status_filter: function (val) {
      switch (val) {
        case 0:
          val = "审核中";
          break;
        case 1:
          val = "审核通过";
          break;
        case 2:
          val = "审核被退回";
          break;
      }
      return val;
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
</style>