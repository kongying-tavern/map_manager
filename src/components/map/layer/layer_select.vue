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
          style="max-width: 40vw; max-height: 700px"
          title="审核点位列表"
          :data="examing_laterlist_data"
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
    <q-inner-loading :showing="selector_loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import {
  layer_type_keyword_select,
  options_type_select,
  layer_data_select,
} from "../../../services/map_request";
import { user_addlayer_select } from "../../../services/check_request";
export default {
  name: "LayerSelect",
  data() {
    return {
      layerdata: [],
      layertype_keyword_value: "",
      layertype_options: [],
      selected_layer_type: "",
      select_layerlist_data: [],
      examing_laterlist_data: [],
      select_layerlist_columns: [
        {
          name: "id",
          label: "点位id",
          field: "id",
          align: "center",
        },
        {
          name: "itemName",
          label: "点位名称",
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
          name: "status",
          label: "审核状态",
          field: "status",
          align: "center",
          format: (val) => {
            switch (val) {
              case 0:
                val = "审核中";
                break;
              case 1:
                val = "通过";
                break;
              case 2:
                val = "被退回";
                break;
            }
            return val;
          },
        },
        {
          name: "auditRemark",
          label: "审核意见",
          field: "auditRemark",
          align: "center",
        },
      ],
      layeritem_keyword_value: "",
      layer_list_selected: [],
      selector_loading: false,
      cancel_trigger: true,
      clear_trigger: false,
    };
  },
  props: ["refresh", "add_mode"],
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
    //点位查询
    markers_select(val) {
      this.cancel_trigger = true;
      this.select_layerlist_data = [];
      this.selector_loading = true;
      layer_data_select(val).then((res) => {
        this.selector_loading = false;
        let array1 = res.data.data;
        for (let i of array1) {
          i.check_in = false;
        }
        this.select_layerlist_data = array1;
        user_addlayer_select(val).then((res) => {
          this.examing_laterlist_data = res.data.data;
          let array2 = [];
          for (let i of res.data.data) {
            if (i.status != 1) {
              i.mlayer = this.select_layerlist_data[0].mlayer;
              i.title = i.itemName;
              i.check_in = true;
              array2.push(i);
            }
          }
          this.select_layerlist_data =
            this.select_layerlist_data.concat(array2);
          this.$emit("callback", {
            id: val,
            data: this.select_layerlist_data,
          });
        });
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
    selected_layer_type: function (val, oldval) {
      if (this.add_mode == true) {
        if (this.cancel_trigger == true) {
          if (
            confirm(
              "你确定要切换点位么，这会使你所有未提交的点位（红色边框）丢失"
            )
          ) {
            this.markers_select(val);
            this.$emit("clear", true);
          } else {
            this.selected_layer_type = oldval;
            this.cancel_trigger = false;
            return;
          }
        }
      } else {
        this.markers_select(val);
        this.$emit("clear", true);
      }
      this.cancel_trigger = true;
    },
    refresh: function () {
      this.markers_select(this.selected_layer_type);
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