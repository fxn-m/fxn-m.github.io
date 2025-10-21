import { createRouter, createWebHashHistory } from "vue-router"

import { usePostHog } from "@/client/analytics/posthog"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/client/pages/HomePage.vue")
    },
    {
      path: "/writing",
      name: "writing",
      component: () => import("@/client/pages/WritingPage.vue")
    },
    {
      path: "/writing/:slug",
      name: "writingPost",
      component: () => import("@/client/pages/WritingPost.vue"),
      props: true
    },
    {
      path: "/fun",
      name: "funList",
      component: () => import("@/client/pages/FunPage.vue")
    },
    {
      path: "/fun/:name",
      name: "funItem",
      component: () => import("@/client/pages/ProjectPage.vue")
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("@/client/pages/ContactPage.vue")
    },
    { path: "/:catchAll(.*)", redirect: "/" }
  ]
})

export const { posthog } = usePostHog()

export default router
