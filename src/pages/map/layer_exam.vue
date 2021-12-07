<!-- 打点审核页 -->
<template>
  <!-- 地图容器 -->
  <div class="main row">
    <div id="map" class="col-6"></div>
    <div class="table col-6" style="padding: 10px 10px 0">
      <q-table
        title="点位审核表"
        :data="addlayer_table_data"
        :columns="addlayer_table_columns"
        row-key="name"
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
      </q-table>
    </div>
  </div>
</template>

<script>
import { initmap } from "../../api/map";
import { select_addlayer, addlayer_handle } from "../../services/check_request";

export default {
  data() {
    return {
      addlayer_table_columns: [
        {
          name: "id",
          label: "点位id",
          field: "id",
          align: "center",
        },
        {
          name: "type",
          label: "点位类型",
          field: "type",
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
    };
  },
  mounted() {
    //注册地图
    this.map = initmap(this.map);
    select_addlayer().then((res) => {
      console.log(res);
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