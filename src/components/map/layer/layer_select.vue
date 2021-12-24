 <!-- 打点页操作窗口组件 -->
<template>
  <div class="layer_select" style="height: 100%">
    <q-card class="row" style="height: 100%">
      <!-- 筛选器 -->
      <q-card-section class="type_selector">
        <q-card-section>
          <div class="row">
            <q-input
              v-model="layertype_keyword_value"
              debounce="200"
              filled
              clearable
              placeholder="输入关键字以搜索"
              style="width: 70%"
              @keyup.enter="search_layertype"
              @clear="search_layertype"
            >
            </q-input>
            <q-btn
              color="primary"
              style="margin-left: 10px"
              label="搜索"
              @click="search_layertype"
            ></q-btn>
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
      <q-card-section class="type_table">
        <q-table
          style="max-width:40vw;max-height: 700px"
          title="点位列表"
          :data="select_layerlist_data"
          :columns="select_layerlist_columns"
          selection="multiple"
          :selected.sync="layer_list_selected"
          row-key="id"
          :rows-per-page-options="[0]"
        >
          <template v-slot:top-right>
            <div class="row">
              <q-input
                outlined
                v-model="layeritem_keyword_value"
                placeholder="请输入关键字搜索"
              />
              <q-btn color="primary" label="搜索" style="margin-left: 20px" />
            </div>
          </template>
          
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import {
  layer_type_keyword_select,
  options_type_select,
  layer_data_select,
} from "../../../services/map_request";
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
      ],
      layeritem_keyword_value: "",
      layer_list_selected: [],
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
      this.loading = true;
      layer_type_keyword_select(this.layertype_keyword_value).then((res) => {
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
    options_type_select().then((res) => {
      this.layerdata = res.data.data;
    });
  },
  watch: {
    selected_layer_type: function (val) {
      this.$emit("select_layer", val);
      this.select_layerlist_data = [];
      layer_data_select(val).then((res) => {
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