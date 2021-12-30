 <!-- 打点页操作窗口组件 -->
<template>
  <div class="layer_select" style="height: 100%">
    <q-card class="row col-12" style="height: 100%">
      <!-- 筛选器 -->
      <q-card-section class="type_selector col-3">
        <q-card-section style="padding-bottom: 0">
          <div class="row">
            <q-input
              v-model="layertype_keyword_value"
              debounce="200"
              filled
              clearable
              placeholder="输入关键字以搜索"
              style="width: 100%"
              @keyup.enter="search_layertype"
              @clear="search_layertype"
            >
            </q-input>
          </div>
        </q-card-section>
        <q-card-section
          class="search_options"
          v-show="layertype_options.length == 0 ? false : true"
        >
          <q-option-group
            v-model="selected_layer_type"
            :options="layertype_options"
            color="primary"
          />
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-expansion-item v-for="i in layerdata" :key="i.id">
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
                    v-model="selected_layer_type"
                    :options="format_options(j.items)"
                    color="primary"
                  />
                </div>
              </q-expansion-item>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card-section>
      <!-- 表格 -->
      <q-card-section class="type_table col-9">
        <div v-show="select_layerlist_data.length == 0 ? false : true">
          <div class="row" style="margin-right: 50px">
            <q-input
              outlined
              v-model="layeritem_keyword_value"
              placeholder="请输入搜索信息"
            />
            <q-btn color="primary" label="搜索" style="margin-left: 20px" />
          </div>
          <div class="search_type" style="margin: 10px 0 10px -10px">
            <q-radio v-model="search_type" val="keyword" label="按关键字搜索" />
            <q-radio
              v-model="search_type"
              val="id"
              label="按点位ID搜索"
              style="margin-left: 30px"
            />
          </div>
        </div>
        <q-table
          style="max-height: 700px"
          title="点位列表"
          :data="select_layerlist_data"
          :columns="select_layerlist_columns"
          selection="multiple"
          :selected.sync="layer_list_selected"
          row-key="id"
          :rows-per-page-options="[0]"
        >
          <!-- 表格内操作按钮插槽 -->
          <template v-slot:body-cell-handle="props">
            <q-td class="text-center">
              <a
                href="javascript:;"
                @click="edit_marker(props.row)"
                style="margin-right: 20px"
                >修改</a
              >
              <a href="javascript:;" @click="delete_marker(props.row)">删除</a>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-inner-loading :showing="selector_loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import {
  layer_type_keyword_select,
  options_type_select,
} from "../../services/map_request";
import { map_markers_handle } from "../../services/map_basic_request";
export default {
  name: "LayerSelect",
  data() {
    return {
      layerdata: [],
      layertype_keyword_value: "",
      layertype_options: [],
      selected_layer_type: "",
      select_layerlist_data: [],
      select_layerlist_columns: [
        {
          name: "id",
          label: "点位id",
          field: "id",
          align: "center",
        },
        {
          name: "title",
          label: "点位名称",
          field: "title",
          align: "center",
        },
        {
          name: "content",
          label: "点位描述",
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
      layeritem_keyword_value: "",
      layer_list_selected: [],
      selector_loading: false,
      search_type: "keyword",
    };
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
    search_layertype() {
      if (this.layertype_keyword_value == "") {
        this.layertype_options = [];
        return;
      }
      this.selector_loading = true;
      layer_type_keyword_select(this.layertype_keyword_value).then((res) => {
        this.selector_loading = false;
        this.layertype_options = [];
        for (let i of res.data.data) {
          for (let j of i.types) {
            for (let x of j.items) {
              this.layertype_options.push({
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
  mounted() {
    this.selector_loading = true;
    options_type_select().then((res) => {
      this.selector_loading = false;
      this.layerdata = res.data.data;
    });
  },
  watch: {
    selected_layer_type: function (val) {
      this.select_layerlist_data = [];
      this.selector_loading = true;
      map_markers_handle(val).then((res) => {
        this.selector_loading = false;
        this.select_layerlist_data = res.data.data;
      });
    },
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
.type_selector {
  padding: 5px 5px;
  max-height: 80vh;
  overflow-y: scroll;
}
.type_selector::-webkit-scrollbar {
  width: 2px;
  background: #fff;
}
.type_selector::-webkit-scrollbar-thumb {
  background: #1976d2;
}
</style>