<!-- 打点页操作窗口组件 -->
<template>
  <div class="layer_select">
    <q-card-section>
      <div class="row">
        <q-input
          v-model="search"
          debounce="200"
          filled
          clearable
          placeholder="输入关键字以搜索"
          style="width: 70%"
          @keyup.enter="search_layer"
          @clear="search_layer"
        >
        </q-input>
        <q-btn
          color="primary"
          style="margin-left: 10px"
          label="搜索"
          @click="search_layer"
        ></q-btn>
      </div>
    </q-card-section>
    <q-card-section
      class="search_options"
      v-show="search_options.length == 0 ? false : true"
    >
      <q-option-group
        v-model="selected_layer"
        :options="search_options"
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
                v-model="selected_layer"
                :options="format_options(j.items)"
                color="primary"
              />
            </div>
          </q-expansion-item>
        </q-expansion-item>
      </q-list>
    </q-card-section>
  </div>
</template>

<script>
import {
  layer_keyword_select,
  options_type_select,
} from "../../services/map_request";
export default {
  name: "LayerSelect",
  data() {
    return {
      layerdata: [],
      search: "",
      search_options: [],
      selected_layer: "",
      options: [],
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
    search_layer() {
      if (this.search == "") {
        this.search_options = [];
        return;
      }
      this.loading = true;
      layer_keyword_select(this.search).then((res) => {
        this.search_options = [];
        for (let i of res.data.data) {
          for (let j of i.types) {
            for (let x of j.items) {
              this.search_options.push({
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
    selected_layer: function (val) {
      this.$emit("select_layer", val);
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
</style>