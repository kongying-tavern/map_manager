<!-- 角色权限管理 -->
<template>
  <base-content>
    <div class="user_authorization">
      <div class="contain er q-pa-lg q-col-gutter-md">
        <div class="row justify-between q-col-gutter-md">
          <div class="col-xs-12 col-md-12 q-gutter-md">
            <q-table
              style="max-height: 50vh"
              title="角色权限管理"
              :data="role_data"
              :columns="role_columns"
              row-key="roleCode"
              :rows-per-page-options="[0]"
            >
            </q-table>
          </div>
        </div>
      </div>
    </div>
  </base-content>
</template>

<script>
import { role_list_select } from "../../services/admin_request";
import BaseContent from "../../components/BaseContent/BaseContent";
export default {
  name: "user_authorization",
  data() {
    return {
      role_columns: [
        {
          name: "roleCode",
          label: "角色权限编码",
          field: "roleCode",
          align: "center",
        },
        {
          name: "roleName",
          label: "角色权限名称",
          field: "roleName",
          align: "center",
        },
        {
          name: "roleDesc",
          label: "角色权限备注",
          field: "roleDesc",
          align: "center",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "center",
        },
      ],
      role_data: [],
    };
  },
  components: {
    BaseContent,
  },
  mounted() {
    role_list_select().then((res) => {
      this.role_data = res.data.data;
    });
  },
};
</script>

<style>
</style>