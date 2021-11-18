import layout from '../components/Layout/Layout'

/**
 * Routes that require authorized access
 */
const asyncRoutesChildren = [
  {
    path: '/',
    name: 'home',
    meta: {
      roles: ['admin', 'editor', 'test'],
      title: '主页',
      icon: 'home',
      keepAlive: true
    },
    component: () => import('pages/home/home')
  },
  {
    path: '/authorization',
    name: 'authorization',
    meta: {
      roles: ['admin'],
      title: '权限管理',
      icon: 'account_circle',
      keepAlive: true
    },
    component: () => import('pages/account/authorization.vue')
  },
  {
    path: '/map',
    name: 'map',
    meta: {
      roles: ['admin'],
      title: '原神地图',
      icon: 'dashboard',
      keepAlive: true
    },
    component: layout,
    children: [
      {
        path: 'layer_add',
        name: 'layer_add',
        meta: {
          roles: ['admin'],
          title: '点位维护',
          icon: 'add_location',
        },
        component: () => import('pages/map/layer_add.vue')
      },
      {
        path: 'layer_exam',
        name: 'layer_exam',
        meta: {
          roles: ['admin'],
          title: '点位审核',
          icon: 'flaky',
        },
        component: () => import('pages/map/layer_exam.vue')
      },
      {
        path: 'layer_type_edit',
        name: 'layer_type_edit',
        meta: {
          roles: ['admin'],
          title: '点位类型维护',
          icon: 'auto_fix_high',
        },
        component: () => import('pages/map/layer_type_edit.vue')
      },
    ]
  },
  {
    path: '/achievement',
    name: 'achievement',
    meta: {
      roles: ['admin'],
      title: '成就系统',
      icon: 'accessible_forward',
      keepAlive: true
    },
    component: layout,
    children: [
      {
        path: 'edit',
        name: 'edit',
        meta: {
          roles: ['admin'],
          title: '成就项编辑',
          icon: 'create',
        },
        component: () => import('pages/achievement/edit.vue')
      },
    ]
  },
  {
    path: '*', // This must be placed at the bottom
    redirect: '/NoFound404',
    meta: {
      roles: ['admin', 'test'],
      isHidden: true
    }
  }
]

const asyncRoutes = [
  {
    path: '/',
    name: 'index',
    redirect: '/',
    component: () => import('layouts/MainLayout'),
    children: asyncRoutesChildren
  }
]

export default asyncRoutes

export { asyncRoutesChildren }
