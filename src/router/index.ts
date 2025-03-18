import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../pages/Homepage/Index.vue")
    },
    {
      path: "/writing",
      name: "writing",
      component: () => import("../pages/Writing/Index.vue")
    },
    {
      path: "/writing/:post",
      name: "writingPost",
      component: () => import("../pages/Writing/Post.vue"),
      props: true
    },
    {
      path: "/fun",
      name: "funList",
      component: () => import("../pages/Fun/Index.vue")
    },
    {
      path: "/fun/:name",
      name: "funItem",
      component: () => import("../pages/Fun/Project/Index.vue")
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../pages/Contact/Index.vue")
    },
    { path: "/:catchAll(.*)", redirect: "/" }
  ]
})

export default router
