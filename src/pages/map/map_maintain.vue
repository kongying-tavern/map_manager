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
        <template v-slot:top-right>
          <div class="row">
            <q-btn
              color="primary"
              label="新增"
              @click="add_data('area', 'put')"
              style="margin-left: 20px"
            />
          </div>
        </template>
        <!-- 表格内冻结按钮插槽 -->
        <template v-slot:body-cell-visibility="props">
          <q-td class="text-center">
            <q-checkbox
              v-model="props.row.visibility"
              :true-value="1"
              :false-value="-1"
              @input="data_freeze('area', props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center">
            <a
              href="javascript:;"
              @click="edit_data('area', 'post', props.row)"
              style="margin-right: 20px"
              >编辑</a
            >
            <a href="javascript:;" @click="delete_data('area', props.row)"
              >删除</a
            >
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
        <template v-slot:top-right>
          <div class="row">
            <q-btn
              color="primary"
              :disable="area_selected.length == 0 ? true : false"
              label="新增"
              @click="add_data('type', 'put')"
              style="margin-left: 20px"
            />
          </div>
        </template>
        <!-- 表格内冻结按钮插槽 -->
        <template v-slot:body-cell-visibility="props">
          <q-td class="text-center">
            <q-checkbox
              v-model="props.row.visibility"
              :true-value="1"
              :false-value="-1"
              @input="data_freeze('type', props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center">
            <a
              href="javascript:;"
              @click="edit_data('type', 'post', props.row)"
              style="margin-right: 20px"
              >编辑</a
            >
            <a href="javascript:;" @click="delete_data('type', props.row)"
              >删除</a
            >
          </q-td>
        </template>
      </q-table>
      <q-table
        style="margin-top: 20px"
        title="点位列表"
        :data="item_data"
        :columns="item_columns"
        row-key="id"
        :rows-per-page-options="[0]"
      >
        <!-- 表格内冻结按钮插槽 -->
        <template v-slot:body-cell-visibility="props">
          <q-td class="text-center">
            <q-checkbox
              v-model="props.row.visibility"
              :true-value="1"
              :false-value="-1"
              @input="data_freeze('item', props.row)"
            />
          </q-td>
        </template>
        <template v-slot:top-right>
          <div class="row">
            <q-btn
              color="primary"
              :disable="type_selected.length == 0 ? true : false"
              @click="add_data('item', 'put')"
              label="新增"
              style="margin-left: 20px"
            />
          </div>
        </template>
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center">
            <a
              href="javascript:;"
              @click="edit_data('item', 'post', props.row)"
              style="margin-right: 20px"
              >编辑</a
            >
            <a href="javascript:;" @click="delete_data('item', props.row)"
              >删除</a
            >
          </q-td>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="update_window">
      <q-card>
        <q-card-section>
          <q-list bordered separator style="width: 500px">
            <q-item>
              <q-item-section> 名称 </q-item-section>
              <q-item-section>
                <q-input
                  outlined
                  v-model="update_data.name"
                  placeholder="请输入名称"
                  lazy-rules
                  :rules="[(val) => (val && val.length > 0) || '请输入名称']"
                >
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> 图标 </q-item-section>
              <q-item-section>
                <q-avatar size="50px" class="add_icon" @click="upload_function">
                  <q-icon
                    size="50px"
                    name="control_point"
                    v-show="update_data.icon != null ? false : true"
                  />
                  <img
                    :src="
                      upload_base64 == undefined
                        ? update_data.icon
                        : upload_base64
                    "
                    v-show="update_data.icon == null ? false : true"
                  />
                </q-avatar>
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
          </q-list>
        </q-card-section>
        <q-card-section>
          <q-btn color="primary" label="确认" @click="save_update" />
          <q-btn
            color="white"
            text-color="primary"
            label="取消"
            v-close-popup
            style="margin-left: 30px"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
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
  map_area_switch,
  map_type_switch,
  map_item_switch,
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
      option_type: "",
      handle_type: "",
      update_data: {
        name: "",
        icon: null,
        area_id: undefined,
        type_id: undefined,
        item_id: undefined,
      },
      update_window: false,
      upload_img: null,
      upload_base64: undefined,
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
    //新增
    add_data(type1, type2) {
      this.option_type = type1;
      this.handle_type = type2;
      this.update_data = {
        name: "",
        icon: null,
        area_id: undefined,
        type_id: undefined,
        item_id: undefined,
      };
      this.update_window = true;
    },
    //编辑
    edit_data(type1, type2, data) {
      this.update_data = {
        name: "",
        icon: null,
        area_id: undefined,
        type_id: undefined,
        item_id: undefined,
        version: "",
      };
      this.option_type = type1;
      this.handle_type = type2;
      this.update_data.name = data.name;
      this.update_data.icon = data.icon;
      this.update_data.version = data.version;
      switch (this.option_type) {
        case "area":
          this.update_data.area_id = data.id;
          break;
        case "type":
          this.update_data.area_id = this.area_selected[0].id;
          this.update_data.type_id = data.id;
          break;
        case "item":
          this.update_data.area_id = this.area_selected[0].id;
          this.update_data.type_id = this.type_selected[0].id;
          this.update_data.item_id = data.id;
          break;
      }
      this.update_window = true;
    },
    //删除
    delete_data(type, data) {
      if (confirm("你真的要删除这条记录么？") == true) {
        this.page_loading = true;
        switch (type) {
          case "area":
            map_area_handle("delete", undefined, data.id).then((res) => {
              this.showNotif(res.data.msg);
              this.map_area_select();
            });
            break;
          case "type":
            map_type_handle("delete", undefined, data.id).then((res) => {
              this.showNotif(res.data.msg);
              this.map_type_select();
            });
            break;
          case "item":
            map_item_handle("delete", undefined, data.id).then((res) => {
              this.showNotif(res.data.msg);
              this.map_item_select();
            });
            break;
        }
        this.page_loading = false;
      }
    },
    //冻结
    data_freeze(type, data) {
      this.page_loading = true;
      switch (type) {
        case "area":
          map_area_switch(data.id).then((res) => {
            this.showNotif(res.data.msg);
            this.map_area_select();
          });
          break;
        case "type":
          map_type_switch(data.id).then((res) => {
            this.showNotif(res.data.msg);
            this.map_type_select();
          });
          break;
        case "item":
          map_item_switch(data.id).then((res) => {
            this.showNotif(res.data.msg);
            this.map_item_select();
          });
          break;
      }
      this.page_loading = false;
    },
    //上传至库
    save_update() {
      let update_data = {
        areaId: this.update_data.area_id,
        content: "string",
        icon: this.update_data.icon,
        iconBase64: this.upload_base64,
        itemId: this.update_data.item_id,
        name: this.update_data.name,
        typeId: this.update_data.type_id,
        version: this.update_data.version,
      };
      //1为地区，2为选项类型，3为点位类型
      switch (this.option_type) {
        case "area":
          map_area_handle(this.handle_type, update_data).then((res) => {
            this.showNotif(res.data.msg);
            this.map_area_select();
            this.update_window = false;
          });
          break;
        case "type":
          map_type_handle(this.handle_type, update_data).then((res) => {
            this.showNotif(res.data.msg);
            this.map_type_select();
            this.update_window = false;
          });
          break;
        case "item":
          map_item_handle(this.handle_type, update_data).then((res) => {
            this.showNotif(res.data.msg);
            this.map_item_select();
            this.update_window = false;
          });
          break;
      }
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
          this.upload_base64 = res.target.result;
          //在转换完成后清除file，否则当用户再次上传同一图片时，由于未触发model变化，会导致函数不被调用从而不弹出截图框
          this.upload_img = null;
        };
      }
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
    upload_img: function (val) {
      if (val != null) {
        this.file_switch();
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
.icon_img {
  width: 30px;
  height: 30px;
}
.add_icon:hover {
  cursor: pointer;
}
</style>