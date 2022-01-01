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
        <div>
          <div class="row" style="margin-right: 50px">
            <q-input
              outlined
              v-model="layeritem_keyword_value"
              @keyup.enter="marker_search"
              placeholder="请输入搜索信息"
            />
            <q-btn
              color="primary"
              label="搜索"
              @click="marker_search"
              style="margin-left: 20px"
            />
          </div>
          <div class="search_type" style="margin: 10px 0 10px -10px">
            <q-radio
              v-model="search_type"
              :disable="selected_layer_type == null ? true : false"
              val="keyword"
              label="按关键字搜索"
            />
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
          <!-- 表格内冻结按钮插槽 -->
          <template v-slot:body-cell-visibility="props">
            <q-td class="text-center">
              <q-checkbox
                v-model="props.row.visibility"
                @input="data_freeze(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <!-- 点位详细信息 -->
    <q-dialog v-model="selected_layer_window">
      <q-card>
        <q-card-section>
          <q-list bordered separator style="width: 500px">
            <q-item>
              <q-item-section> 点位名称 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="selected_layer_data.name"
                  placeholder="点位名称"
                >
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> 点位描述 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="selected_layer_data.content"
                  placeholder="点位描述"
                >
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> 点位图片 </q-item-section>
              <q-item-section>
                <q-img
                  :src="
                    show_img == null
                      ? 'https://assets.yuanshen.site/images/noImage.png'
                      : show_img
                  "
                  class="layer_img"
                  @click="upload_function"
                  spinner-color="red"
                >
                  <template v-slot:error>
                    <div
                      class="
                        absolute-full
                        flex flex-center
                        bg-primary
                        text-white
                      "
                    >
                      没有相关图片
                    </div>
                  </template>
                </q-img>
                <q-file
                  v-show="false"
                  ref="img_upload"
                  v-model="upload_img"
                  label="Standard"
                  max-file-size="5242880"
                  accept="image/png, image/jpeg"
                  @rejected="onRejected"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> 点位坐标 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="selected_layer_data.position"
                  placeholder="点位坐标"
                >
                </q-input>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <q-btn
              color="primary"
              label="提交修改"
              @click="edit_update"
              style="margin-right: 30px"
            ></q-btn>
            <q-btn v-close-popup label="取消"></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 图片裁剪弹窗 -->
    <q-dialog v-model="cropper_window">
      <img-cut :crooper_img="crooper_img" @screenshot="cut_img"></img-cut>
    </q-dialog>
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
import {
  map_markers_select,
  map_markers_switch,
  map_markers_signle_select,
  map_markers_handle,
} from "../../services/map_basic_request";
import ImgCut from "../../components/map/layer/img_crooper.vue";
export default {
  name: "LayerSelect",
  data() {
    return {
      layerdata: [],
      layertype_keyword_value: "",
      layertype_options: [],
      selected_layer_type: null,
      select_layerlist_data: [],
      selected_layer_data: {},
      select_layerlist_columns: [
        {
          name: "id",
          label: "点位id",
          field: "id",
          align: "center",
        },
        {
          name: "name",
          label: "点位名称",
          field: "name",
          align: "center",
        },
        {
          name: "content",
          label: "点位描述",
          field: "content",
          align: "center",
        },
        {
          name: "visibility",
          label: "启用",
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
      show_img: require("../../assets/img/default.png"),
      layeritem_keyword_value: "",
      layer_list_selected: [],
      selector_loading: false,
      search_type: "id",
      stuck_trigger: true,
      selected_layer_window: false,
      upload_img: null,
      crooper_img: null,
      cropper_window: false,
    };
  },
  components: {
    ImgCut,
  },
  methods: {
    //提示
    showNotif(msg, time = 3000) {
      this.$q.notify({
        message: msg,
        color: "white",
        icon: "check",
        textColor: "black",
        position: "top",
        timeout: time,
      });
    },
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
    //点位关键字或ID查询
    marker_search() {
      this.select_layerlist_data = [];
      switch (this.search_type) {
        case "keyword":
          map_markers_select(
            this.selected_layer_type,
            this.layeritem_keyword_value
          ).then((res) => {
            this.select_layerlist_data = res.data.data;
          });
          break;
        case "id":
          this.stuck_trigger = false;
          map_markers_signle_select(this.layeritem_keyword_value).then(
            (res) => {
              this.select_layerlist_data.push(res.data.data);
              this.selected_layer_type = null;
            }
          );
          break;
      }
    },
    //查询点位列表
    marker_select() {
      if (this.selected_layer_type != null) {
        this.select_layerlist_data = [];
        this.selector_loading = true;
        map_markers_select(this.selected_layer_type).then((res) => {
          this.selector_loading = false;
          this.select_layerlist_data = res.data.data;
        });
      }
    },
    //修改点位信息
    edit_marker(data) {
      this.selected_layer_data = data;
      this.show_img = this.selected_layer_data.resource;
      this.selected_layer_window = true;
    },
    //修改上传
    edit_update() {
      console.log(this.selected_layer_data);
      let update_data = [];
      update_data.push({
        content: this.selected_layer_data.content,
        itemId: this.selected_layer_data.mitemId,
        markerId: this.selected_layer_data.id,
        position: this.selected_layer_data.position,
        resource:
          this.selected_layer_data.resource == null
            ? undefined
            : this.selected_layer_data.resource,
        resourceBase64: this.selected_layer_data.resourceBase64,
        version: this.selected_layer_data.version,
        time: -1,
      });
      console.log(update_data);
      map_markers_handle("post", update_data).then((res) => {
        this.showNotif(res.data.msg);
        this.selected_layer_window = false;
        this.marker_select();
      });
    },
    //删除点位
    delete_marker(data) {
      map_markers_handle("delete", undefined, data.id).then((res) => {
        this.showNotif(res.data.msg);
      });
    },
    //点位冻结/解冻
    data_freeze(data) {
      map_markers_switch(data.id).then((res) => {
        this.marker_select();
        this.showNotif(res.data.msg);
      });
    },
    //触发选取文件事件
    upload_function() {
      //触发选取文件事件（框架自带的文件上传器难以定义样式，故直接调用事件）
      this.$refs.img_upload.pickFiles();
    },
    //上传失败所用弹窗
    onRejected(rejectedEntries) {
      //上传类型检测
      if (
        rejectedEntries[0].file.type != "image/png" &&
        rejectedEntries[0].file.type != "image/jpeg"
      ) {
        //提示弹窗
        this.showNotif(`上传的不是图片类型文件，请确认后重新上传`);
      } else {
        this.showNotif(`上传的图片文件不能大于2MB，请重新截图或压缩后再上传`);
      }
    },
    //上传后图片转换为base64
    file_switch() {
      if (this.upload_img != null) {
        let img = this.upload_img;
        let fr = new FileReader();
        fr.readAsDataURL(img);
        fr.onload = (res) => {
          this.crooper_img = res.target.result;
          //在转换完成后清除file，否则当用户再次上传同一图片时，由于未触发model变化，会导致函数不被调用从而不弹出截图框
          this.upload_img = null;
        };
        this.cropper_window = true;
      }
    },
    //截图返回函数
    cut_img(data) {
      this.cropper_window = false;
      this.show_img = data;
      this.selected_layer_data.resourceBase64 = data;
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
    selected_layer_type: function () {
      this.marker_select();
    },
    //检测文件上传事件（不使用@input，触发时间节点有差异，可能会导致奇怪的bug）
    upload_img: function (val) {
      if (val != null) {
        this.file_switch();
      }
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
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.layer_img:hover {
  cursor: pointer;
}
</style>