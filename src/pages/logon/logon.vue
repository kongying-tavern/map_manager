<template>
  <div
    class="flex justify-center items-center q-electron-drag"
    style="height: 100%"
  >
    <div
      class="row base-card-shadow electron-hide"
      style="width: 30vw; min-width: 300px"
    >
      <div class="col flex justify-center items-center">
        <q-card
          square
          style="min-width: 290px; height: 100%; width: 60%"
          class="no-shadow"
        >
          <q-card-section align="center">
            <h3 class="text-uppercase">原神后台管理系统</h3>
            <!-- 用户名 -->
            <q-input
              class="logon-input"
              clearable
              standout="bg-cyan text-white"
              bottom-slots
              v-model="username"
              label="账号"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>
            <!-- 密码 -->
            <q-input
              class="logon-input"
              standout="bg-cyan text-white"
              bottom-slots
              v-model="password"
              label="密码"
              :type="isPwd ? 'password' : 'text'"
              hint=""
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <!-- 登录按钮 -->
            <q-btn
              :loading="loading"
              class="logon-btn bg-logon-card-input"
              text-color="white"
              unelevated
              label=""
              style="font-size: large"
              @click="logon"
              >登 录 系 统
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from "../../services/normal_request";
import LottieWebCimo from "../../components/LottieWebCimo/LottieWebCimo";
export default {
  name: "logon",
  components: { LottieWebCimo },
  data() {
    return {
      isPwd: true,
      username: "",
      password: "",
      loading: false,
      percentage: 0,
    };
  },
  methods: {
    logon() {
      if (this.username == "" || this.password == "") {
        this.$q.notify({
          icon: "announcement",
          message: "请填写用户名或密码",
          color: "red",
          position: "top",
          timeout: 3500,
        });
      } else {
        this.loading = !this.loading;
        login(this.username, this.password)
          .then((res) => {
            this.loading = !this.loading;
            localStorage.setItem(
              "user_token",
              `${res.data.token_type} ${res.data.access_token}`
            );
            localStorage.setItem("refresh_token", `${res.data.refresh_token}`);
            this.$q.cookies.set(
              "active",
              `${Date.now() + res.data.expires_in * 1000}`,
              {
                expires: `${res.data.expires_in}s`,
              }
            );
            this.$router.push("/").then((e) => {
              this.$q.notify({
                icon: "insert_emoticon",
                message: "登录成功",
                color: "green",
                position: "top",
                timeout: 1500,
              });
            });
          })
          .catch((error) => {
            this.loading = !this.loading;
            this.$q.notify({
              icon: "announcement",
              message: `登录失败：${error.response.data.error_description}`,
              color: "red",
              position: "top",
              timeout: 3500,
            });
          });
      }
      // if (this.username === "admin" || this.username === "test") {
      //   sessionStorage.setItem("access_token", 972784674);
      //   sessionStorage.setItem("user_role", this.username);
      //   const lt = setTimeout(() => {
      //     this.$router.push("/").then((e) => {
      //       this.$q.notify({
      //         icon: "insert_emoticon",
      //         message: "hi，cimo 欢迎回来",
      //         color: "green",
      //         position: "top",
      //         timeout: 1500,
      //       });
      //       clearTimeout(lt);
      //       this.loading = !this.loading;
      //       // 如果是 electron 则改变窗口大小
      //       if (process.env.MODE === "electron") {
      //         this.$q.electron.remote.getCurrentWindow().setSize(1023, 768);
      //         this.$q.electron.remote.getCurrentWindow().center();
      //       }
      //     });
      //   }, Math.random() * 3000);
      // } else {
      //   this.loading = !this.loading;
      //   this.$q.notify({
      //     icon: "announcement",
      //     message: "账号错误",
      //     color: "red",
      //     position: "top",
      //     timeout: 1500,
      //   });
      // }
    },
  },
  mounted() {},
};
</script>

<style scoped>
.logon-btn {
  font-size: large;
  margin-top: 0px;
  margin-bottom: 20px;
  width: 100%;
}

.bg-logon-card-input {
  background: linear-gradient(to right, #36d1dc 1%, #5b86e5 99%);
  transition: all 0.3s ease-in-out;
  background-size: 200% auto;
}

.bg-logon-card-input:hover {
  background-position: right center;
  box-shadow: 0 12px 20px -11px #5b86e5;
}
.text-uppercase {
  font-size: 30px;
  font-weight: bold;
}
</style>
