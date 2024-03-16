import { createRouter, createWebHashHistory } from "vue-router"

import HomeView from "../views/Homepage/HomeView.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/About/AboutView.vue"),
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import("../views/Blog/BlogsView.vue"),
    },
    {
      path: "/blog/:post",
      name: "blogPost",
      component: () => import("../views/Blog/BlogPostView.vue"),
      props: true,
    },
    {
      path: "/fun",
      name: "funList",
      component: () => import("../views/Fun/FunsView.vue"),
    },
    {
      path: "/fun/:name",
      name: "funItem",
      component: () => import("../views/Fun/FunView.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/Contact/ContactView.vue"),
    },
    {
      path: "/atmosphere.fm/about",
      name: "atmosphereAbout",
      component: () => import("../views/Fun/Atmosphere.fm/About.vue"),
    },
    { path: "/:catchAll(.*)", redirect: "/" },
  ],
})

export default router
