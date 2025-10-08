import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/HomePage.vue")
    },
    {
      path: "/writing",
      name: "writing",
      component: () => import("@/pages/WritingPage.vue")
    },
    {
      path: "/writing/:slug",
      name: "writingPost",
      component: () => import("@/pages/WritingPost.vue"),
      props: true
    },
    {
      path: "/fun",
      name: "funList",
      component: () => import("@/pages/FunPage.vue")
    },
    {
      path: "/fun/:name",
      name: "funItem",
      component: () => import("@/pages/ProjectPage.vue")
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("@/pages/ContactPage.vue")
    },
    { path: "/:catchAll(.*)", redirect: "/" }
  ]
})

export default router
