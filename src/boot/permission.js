import { setBreadcrumbs } from 'components/Breadcrumbs/BreadcrumbsUtils'
import LoadingBar from '../components/LoadingBar/LoadingBar'
import constantRoutes from '../router/constantRoutes'
import { addTagView, setTagView } from 'components/TagView/TagViewUtils'
import { date_request } from "../services/normal_request";
import { Cookies } from "quasar";
import { refresh_token } from "../services/normal_request";

/**
 * Navigation guard and permission verification
 * @param app
 * @param router
 * @param Vue
 * @param store
 * @returns {Promise<void>}
 */
export default async ({ app, router, Vue, store }) => {
  router.beforeEach((to, from, next) => {
    // Process TAGVIEW and breadcrumbs after successful login
    handleTagViewAndBreadcrumbsAndKeepAlive(from, to, store, Vue)
    if (Cookies.get("time_difference") == null) {
      date_request().then((res) => {
        //默认时间戳有效期为一天
        Cookies.set("time_difference", Date.now() - res.data.data, {
          expires: 1,
        });
      });
    }
    // console.log(Cookies.get('active'))
    if (Cookies.get('active') == null && to.path != '/logon') {
      next({ path: '/logon' });
    }
    else if ((Cookies.get('active') - Date.now()) < 3600000 && to.path != '/logon') {
      refresh_token(localStorage.getItem('refresh_token')).then(res => {
        localStorage.setItem(
          "user_token",
          `${res.data.token_type} ${res.data.access_token}`
        );
        Cookies.set("active",
          `${Date.now() + res.data.expires_in * 1000}`,
          {
            expires: `${res.data.expires_in}s`,
          });
        localStorage.setItem("refresh_token", `${res.data.refresh_token}`);
        next();
      })
    }
    else {
      const userRole = localStorage.getItem('user_role')
      if (userRole && store.getters.getRoutes.length) {
        next()
      } else {
        // Simulate when user permissions do not exist, obtain user permissions
        // And set the corresponding route according to the permissions
        store.commit('SET_ROLES_AND_ROUTES', userRole)
        // If you are prompted that addRoutes is deprecated, use the spread operator to complete the operation
        // router.addRoute(...store.getters.getRoutes)
        router.addRoute(...store.getters.getRoutes)
        // If addRoutes is not completed, the guard will execute it again
        LoadingBar.stop();
        next({ ...to, replace: true });
      }
    }
  })
  router.afterEach(() => {
    // Use multiple stop() to ensure that LoadingBar is properly closed after dynamically adding routes
    LoadingBar.stop();
    LoadingBar.stop();
  })
}

/**
 * Processing tagView and breadcrumbs
 * @param to
 */
function handleTagViewAndBreadcrumbsAndKeepAlive(from, to, store, Vue) {
  if (to.name != null) {
    document.title = to.meta.title + Vue.prototype.$title
    LoadingBar.start()
    // is a public route ?
    for (let i = 0; i < constantRoutes.length; i++) {
      if (constantRoutes[i].path === to.path) {
        return
      }
    }
    // Determine whether it is a refresh operation,
    // if it is a refresh operation, get the saved tagView information from sessionStorage
    let tagViewOnSS = []
    JSON.parse(window.sessionStorage.getItem('tagView')) === null ? window.sessionStorage.setItem('tagView', '[]') : tagViewOnSS = JSON.parse(window.sessionStorage.getItem('tagView'))
    if (store.getters.getTagView.length === 0 && tagViewOnSS.length !== 0) {
      setTagView(tagViewOnSS)
      store.commit('SET_KEEPALIVE_LIST', tagViewOnSS)
    } else if (from.fullPath !== to.fullPath) {
      addTagView(to)
    }
    setBreadcrumbs(to.matched, to.query)
    handleKeepAlive(to)
  }
}

/**
 * Handle redundant layout: router-view and keep the current component under the first layer index <router-view>
 * This method cannot filter the on-demand loading <layout> used for nested routing
 * @param to
 */
function handleKeepAlive(to) {
  if (to.matched && to.matched.length > 2) {
    for (let i = 0; i < to.matched.length; i++) {
      const element = to.matched[i]
      if (element.components.default.name === 'Layout') {
        to.matched.splice(i, 1)
        handleKeepAlive(to)
      }
    }
  }
}

/**
 * This method can filter on-demand loading <layout> used for nested routing
 * @param to
 */
// async function handleKeepAlive (to) {
//   if (to.matched && to.matched.length > 2) {
//     for (let i = 0; i < to.matched.length; i++) {
//       const element = to.matched[i]
//       if (element.components.default.name === 'Layout') {
//         to.matched.splice(i, 1)
//         await handleKeepAlive(to)
//       }
//       if (typeof element.components.default === 'function') {
//         await element.components.default()
//         await handleKeepAlive(to)
//       }
//     }
//   }
// }
