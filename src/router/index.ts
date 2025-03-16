import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/Homepage/Index.vue")
    },
    {
      path: "/writing",
      name: "writing",
      component: () => import("../views/Writing/Index.vue")
    },
    {
      path: "/writing/:post",
      name: "writingPost",
      component: () => import("../views/Writing/Post.vue"),
      props: true
    },
    {
      path: "/fun",
      name: "funList",
      component: () => import("../views/Fun/Index.vue")
    },
    {
      path: "/fun/:name",
      name: "funItem",
      component: () => import("../views/Fun/Project.vue")
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/Contact/Index.vue")
    },
    { path: "/:catchAll(.*)", redirect: "/" }
  ]
})

export default router
