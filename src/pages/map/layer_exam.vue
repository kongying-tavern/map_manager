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
        <q-btn
          label="批量退回"
          style="margin-left: 30px"
          :disable="selected.length == 0 ? true : false"
          color="red"
        ></q-btn>
      </div>
      <q-table
        title="点位审核表"
        style="max-height: 80vh"
        :data="addlayer_table_data"
        :columns="addlayer_table_columns"
        row-key="id"
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
            <a href="javascript:;" @click="delete_layer(props.row)">删除</a>
          </q-td>
        </template>
      </q-table>
    </div>
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
                  v-model="selected_layer_data.itemName"
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
                    selected_layer_data.resource == null
                      ? 'https://assets.yuanshen.site/images/noImage.png'
                      : selected_layer_data.resource
                  "
                  class="layer_img"
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
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <q-btn
              color="primary"
              label="审核通过"
              style="margin-right: 30px"
              @click="exam_pass"
            ></q-btn>
            <q-btn
              color="red"
              label="审核拒绝"
              style="margin-right: 30px"
              @click="refuse_window = true"
            ></q-btn>
            <q-btn v-close-popup label="取消"></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 点位详细信息 -->
    <q-dialog v-model="refuse_window">
      <q-card>
        <q-card-section>
          <q-list bordered separator style="width: 500px">
            <q-item>
              <q-item-section> 退回理由 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="refuse_reason"
                  placeholder="请输入退回理由"
                >
                </q-input>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <q-btn
              :disable="refuse_reason == '' ? true : false"
              color="primary"
              label="确定"
              style="margin-right: 30px"
              @click="exam_refuse"
            ></q-btn>
            <q-btn v-close-popup label="返回"></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { initmap } from "../../api/map";
import {
  select_addlayer,
  delete_addlayer,
  pass_addlayer,
  refuse_addlayer,
} from "../../services/check_request";
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
          name: "optionType",
          label: "操作类型",
          field: "optionType",
          align: "center",
          format:(val) => {
            switch (val) {
              case 1:
                val = "新增";
                break;
              case 2:
                val = "修改";
                break;
              case 3:
                val = "删除";
                break;
            }
            return val;
          },
        },
        {
          name: "creatorId",
          label: "上传人",
          field: "creatorId",
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
      selected_layer_data: {},
      search_value: "",
      selected_layer_window: false,
      layergroup: [],
      refuse_reason: "",
      refuse_window: false,
    };
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
    //生成点位
    layer_request() {
      this.selected=[];
      select_addlayer().then((res) => {
        this.addlayer_table_data = [];
        for (let i of res.data.data) {
          i.position = i.position.split(",");
          i.position = {
            lat: i.position[0],
            lng: i.position[1],
          };
          if (i.status == 0) {
            this.addlayer_table_data.push(i);
          }
        }
      });
    },
    //查看详情
    details_handle(data) {
      this.selected_layer_data = data;
      this.selected_layer_window = true;
    },
    //通过点位
    exam_pass() {
      pass_addlayer({
        auditRemark: "null",
        punctuateIds: [this.selected_layer_data.id],
      }).then((res) => {
        this.refuse_window = false;
        this.selected_layer_window = false;
        this.showNotif(res.data.msg);
        this.layer_request();
      });
    },
    exam_refuse() {
      refuse_addlayer({
        auditRemark: this.refuse_reason,
        punctuateIds: [this.selected_layer_data.id],
      }).then((res) => {
        this.refuse_window = false;
        this.selected_layer_window = false;
        this.showNotif(res.data.msg);
        this.layer_request();
      });
    },
    batch_process(type) {
      switch (type) {
        case "pass":
          break;
        case "refuse":
          break;
      }
    },
    //删除点位
    delete_layer(data) {
      if (confirm("你确定要删除这个待审核点位吗？") == true) {
        delete_addlayer(data.id).then((res) => {
          this.showNotif(res.data.msg);
          this.layer_request();
        });
      }
    },
  },
  watch: {
    //地图上绘制点位
    selected: function (val) {
      this.layergroup.clearLayers();
      for (let i of val) {
        let marker = layer_register(
          i.position,
          "marker",
          "border_checking",
          i.itemId,
          i.icon
        );
        marker.addTo(this.layergroup);
      }
      this.layergroup.addTo(this.map);
    },
  },
  mounted() {
    //注册地图
    this.map = initmap(this.map);
    this.layergroup = L.layerGroup();
    this.layer_request();
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