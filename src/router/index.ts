import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/work',
      name: 'work',
      component: () => import('../views/WorkView.vue')
    },
    {
      path: '/essays',
      name: 'essays',
      component: () => import('../views/EssaysView.vue')
    },
    {
      path: '/essay/:name',
      name: 'essay',
      component: () => import('../views/EssayView.vue')
    },
    // {
    //   path: '/blogs',
    //   name: 'blogs',
    //   component: () => import('../views/BlogsView.vue')
    // },
    // {
    //   path: '/blog/:name',
    //   name: 'blog',
    //   component: () => import('../views/BlogView.vue')
    // },
    {
      path: '/fun',
      name: 'funList',
      component: () => import('../views/FunsView.vue')
    },
    {
      path: '/fun/:name',
      name: 'funItem',
      component: () => import('../views/FunView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    }
  ]
})

export default router
