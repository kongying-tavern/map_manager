<!-- 打点审核页 -->
<template>
  <!-- 地图容器 -->
  <div class="main row">
    <div id="map" class="col-6"></div>
    <div class="table col-6" style="padding: 10px 10px 0">
      <div class="row" style="margin-bottom: 20px">
        <q-btn
          label="批量审核"
          :disable="selected.length == 0 ? true : false"
          color="primary"
        ></q-btn>
      </div>
      <q-table
        title="点位审核表"
        style="height: 80vh"
        :data="addlayer_table_data"
        :columns="addlayer_table_columns"
        row-key="id"
        virtual-scroll
        selection="multiple"
        :selected.sync="selected"
        :rows-per-page-options="[0]"
      >
        <!-- 表格头插槽 -->
        <template v-slot:top-right>
          <div class="row">
            <q-input
              outlined
              v-model="search_value"
              placeholder="请输入点位ID搜索"
            />
            <q-btn color="primary" label="搜索" style="margin-left: 20px" />
          </div>
        </template>
        <!-- 表格内操作按钮插槽 -->
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center">
            <a
              href="javascript:;"
              style="margin-right: 20px"
              @click="details_handle(props.row)"
              >查看详情</a
            >
            <a href="javascript:;" @click="exam_handle(props.row)">审核</a>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { initmap } from "../../api/map";
import { select_addlayer, addlayer_handle } from "../../services/check_request";
import { layer_register } from "../../api/layer";
export default {
  data() {
    return {
      selected: [],
      addlayer_table_columns: [
        {
          name: "id",
          label: "点位id",
          field: "id",
          align: "center",
        },
        {
          name: "itemName",
          label: "点位类型",
          field: "itemName",
          align: "center",
        },
        {
          name: "content",
          label: "点位描述",
          field: "content",
          align: "center",
        },
        {
          name: "creatorId",
          label: "上传人",
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
      addlayer_table_data: [],
      search_value: "",
      layergroup: [],
    };
  },
  watch: {
    selected: function (val) {
      this.layergroup.clearLayers();
      for (let i of val) {
        let marker = layer_register(i.position, "marker");
        marker.addTo(this.layergroup);
      }
      this.layergroup.addTo(this.map);
    },
  },
  mounted() {
    //注册地图
    this.map = initmap(this.map);
    this.layergroup = L.layerGroup();
    select_addlayer().then((res) => {
      for (let i of res.data.data) {
        i.position = i.position.split(",");
        i.position = {
          lat: i.position[0],
          lng: i.position[1],
        };
        this.addlayer_table_data.push(i);
      }
    });
  },
};
</script>

<style scoped>
#map {
  position: relative;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
}
.main {
  height: 100%;
  overflow: hidden;
}
</style>