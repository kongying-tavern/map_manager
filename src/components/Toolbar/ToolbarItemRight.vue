<template>
  <div class="q-gutter-sm row items-center no-wrap q-electron-drag--exception">
    <q-btn round dense flat
           :icon="this.$q.fullscreen.isActive?'fullscreen_exit':'fullscreen'"
           v-if="$q.screen.gt.sm" @click="fullScreen">
      <q-tooltip v-if="!this.$q.fullscreen.isActive">全屏</q-tooltip>
      <q-tooltip v-if="this.$q.fullscreen.isActive">退出全屏</q-tooltip>
    </q-btn>
    <q-btn round flat>
      <q-menu>
        <div class="row no-wrap q-pa-md">

          <div class="column items-center">
            <q-btn
              color="primary"
              label="登出"
              size="sm"
              v-close-popup
              @click="logout"
            />
          </div>
        </div>
      </q-menu>
      <q-avatar size="26px">
        <img :src="this.$PUBLIC_PATH + 'data/avatar.jpg'">
      </q-avatar>
      <q-tooltip>账号</q-tooltip>
    </q-btn>
    <div class="electron-only">
      <q-btn dense flat icon="minimize" @click="minimize"/>
      <q-btn dense flat :icon="isMaximize?'crop_square':'flip_to_front'"  @click="maximize"/>
      <q-btn dense flat icon="close" @click="closeApp"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolbarItemRight',
  data () {
    return {
      search: '',
      mobileData: false,
      bluetooth: true,
      isMaximize: true
    }
  },
  methods: {
    fullScreen () {
      if (this.$q.fullscreen.isActive) {
        // 退出全屏模式：
        this.$q.fullscreen.exit()
          .then(() => { // v1.5.0+
            // success!
          })
          // eslint-disable-next-line handle-callback-err
          .catch(err => { // v1.5.0+
            // oh, no!!!
          })
      } else {
        // 请求全屏模式：
        this.$q.fullscreen.request()
          .then(() => { // v1.5.0+
            // success!
          })
          // eslint-disable-next-line handle-callback-err
          .catch(err => { // v1.5.0+
            // oh, no!!!
          })
      }
    },

    logout () {
      this.$q.cookies.remove('active');
      this.$router.push('/logon');
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.getCurrentWindow().setSize(500, 490)
        this.$q.electron.remote.getCurrentWindow().center()
      }
    },

    // electron
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },

    maximize () {
      if (process.env.MODE === 'electron') {
        const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()
        if (win.isMaximized()) {
          win.unmaximize()
          this.isMaximize = !this.isMaximize
        } else {
          win.maximize()
          this.isMaximize = !this.isMaximize
        }
      }
    },

    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    }
  }
}
</script>
