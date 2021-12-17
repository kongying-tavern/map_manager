<!-- 地图基础信息维护 -->
<template>
  <div class="map_maintain row q-pa-md">
    <div class="col-5 q-pa-md">
      <q-table
        title="地区维护表"
        :data="area_data"
        :columns="area_columns"
        row-key="id"
        selection="single"
        :selected.sync="area_selected"
        :rows-per-page-options="[5]"
      >
        <template v-slot:body-cell-handle>
          <q-td class="text-center">
            <a href="javascript:;" style="margin-right: 20px">编辑</a>
            <a href="javascript:;">删除</a>
          </q-td>
        </template>
      </q-table>
    </div>
    <div class="col-7 q-pa-md right-area">
      <q-table
        title="点位维护类型表"
        :data="type_data"
        :columns="type_columns"
        row-key="id"
        selection="single"
        :selected.sync="type_selected"
        :rows-per-page-options="[5]"
      >
        <template v-slot:body-cell-handle>
          <q-td class="text-center">
            <a href="javascript:;" style="margin-right: 20px">编辑</a>
            <a href="javascript:;">删除</a>
          </q-td>
        </template>
      </q-table>
      <q-table
        style="margin-top: 20px"
        title="点位列表"
        :data="item_data"
        :columns="item_columns"
        row-key="id"
        :rows-per-page-options="[5]"
      >
        <template v-slot:body-cell-handle>
          <q-td class="text-center">
            <a href="javascript:;" style="margin-right: 20px">编辑</a>
            <a href="javascript:;">删除</a>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-inner-loading :showing="page_loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import {
  map_area_handle,
  map_type_handle,
  map_item_handle,
} from "../../services/map_basic_request";
export default {
  data() {
    return {
      page_loading: true,
      area_data: [],
      area_columns: [
        {
          name: "id",
          label: "地区id",
          field: "id",
          align: "center",
        },
        {
          name: "name",
          label: "地区名称",
          field: "name",
          align: "center",
        },
        {
          name: "visibility",
          label: "是否启用",
          field: "visibility",
          align: "center",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "center",
        },
      ],
      type_data: [],
      type_columns: [
        {
          name: "id",
          label: "选项类型id",
          field: "id",
          align: "center",
        },
        {
          name: "name",
          label: "选项类型名称",
          field: "name",
          align: "center",
        },
        {
          name: "visibility",
          label: "是否启用",
          field: "visibility",
          align: "center",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "center",
        },
      ],
      item_data: [],
      item_columns: [
        {
          name: "id",
          label: "点位类型id",
          field: "id",
          align: "center",
        },
        {
          name: "name",
          label: "点位类型名称",
          field: "name",
          align: "center",
        },
        {
          name: "visibility",
          label: "是否启用",
          field: "visibility",
          align: "center",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "center",
        },
      ],
      area_selected: [],
      type_selected: [],
    };
  },
  methods: {
    //查询地区
    map_area_select() {
      this.area_data = [];
      this.page_loading = true;
      map_area_handle("get").then((res) => {
        for (let i of res.data.data) {
          this.area_data.push(i);
        }
        this.page_loading = false;
      });
    },
    //查询选项类型
    map_type_select() {
      this.type_data = [];
      this.item_data = [];
      this.page_loading = true;
      map_type_handle("get", undefined, this.area_selected[0].id).then(
        (res) => {
          for (let i of res.data.data) {
            this.type_data.push(i);
          }
          this.page_loading = false;
        }
      );
    },
    //查询点位类型
    map_item_select() {
      this.item_data = [];
      this.page_loading = true;
      map_item_handle("get", undefined, this.type_selected[0].id).then(
        (res) => {
          for (let i of res.data.data) {
            this.item_data.push(i);
          }
          this.page_loading = false;
        }
      );
    },
  },
  watch: {
    area_selected: function (val) {
      if (val.length != 0) {
        this.map_type_select();
      } else {
        this.item_data = [];
      }
    },
    type_selected: function (val) {
      if (val.length != 0) {
        this.map_item_select();
      } else {
        this.type_data = [];
      }
    },
  },
  mounted() {
    this.map_area_select();
  },
};
</script>
<style scoped>
.right-area {
  max-height: 85vh;
  overflow-y: scroll;
}
.right-area::-webkit-scrollbar {
  width: 3px;
  background: none;
}
.right-area::-webkit-scrollbar-thumb {
  background: #1976d2;
}
</style>