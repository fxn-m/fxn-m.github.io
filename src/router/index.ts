import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/homepage/Index.vue")
    },
    {
      path: "/writing",
      name: "writing",
      component: () => import("@/pages/writing/Index.vue")
    },
    {
      path: "/writing/:slug",
      name: "writingPost",
      component: () => import("@/pages/writing/Post.vue"),
      props: true
    },
    {
      path: "/fun",
      name: "funList",
      component: () => import("@/pages/fun/Index.vue")
    },
    {
      path: "/fun/:name",
      name: "funItem",
      component: () => import("@/pages/fun/project/Index.vue")
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("@/pages/contact/Index.vue")
    },
    { path: "/:catchAll(.*)", redirect: "/" }
  ]
})

export default router
