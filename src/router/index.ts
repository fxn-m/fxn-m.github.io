import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "../views/Homepage/HomeView.vue";

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
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/About/AboutView.vue"),
    },
    {
      path: "/work",
      name: "work",
      component: () => import("../views/Work/WorkView.vue"),
    },
    {
      path: "/essays",
      name: "essays",
      component: () => import("../views/Essays/EssaysView.vue"),
    },
    {
      path: "/essay/:name",
      name: "essay",
      component: () => import("../views/Essays/EssayView.vue"),
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
  ],
});

export default router;
