<!-- 角色权限管理 -->
<template>
  <base-content>
    <div class="user_authorization">
      <div class="container q-pa-lg q-col-gutter-md">
        <div class="row justify-between q-col-gutter-md">
          <div class="col-xs-12 col-md-12 q-gutter-md">
            <q-table
              title="角色权限管理"
              :data="data"
              :columns="columns"
              row-key="name"
            >
              <!-- 表格内操作按钮插槽 -->
              <template v-slot:body-cell-handle="props">
                <q-td class="text-center">
                  <a
                    href="javascript:;"
                    >编辑</a
                  >
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </div>
    </div>
  </base-content>
</template>

<script>
import BaseContent from "../../components/BaseContent/BaseContent";
export default {
  name: "user_authorization",
  data() {
    return {
      columns: [
        {
          name: "role_code",
          label: "角色权限编码",
          field: "role_code",
          align: "center",
        },
        {
          name: "role_name",
          label: "角色权限编码名称",
          field: "role_name",
          align: "center",
        },
        {
          name: "role_menu",
          label: "角色权限菜单",
          field: "role_menu",
          align: "center",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "center",
        },
      ],
      data: [],
    };
  },
  components: {
    BaseContent,
  },
};
</script>

<style>
</style>