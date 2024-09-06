import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("@/views/Homepage/HomeView.vue")
        },
        {
            path: "/writing",
            name: "writing",
            component: () => import("@/views/Writing/BlogsView.vue")
        },
        {
            path: "/writing/:post",
            name: "writingPost",
            component: () => import("@/views/Writing/BlogPostView.vue"),
            props: true
        },
        {
            path: "/fun",
            name: "funList",
            component: () => import("@/views/Fun/FunsView.vue")
        },
        {
            path: "/fun/:name",
            name: "funItem",
            component: () => import("@/views/Fun/FunView.vue")
        },
        {
            path: "/contact",
            name: "contact",
            component: () => import("@/views/Contact/ContactView.vue")
        },
        {
            path: "/fun/atmosphere-fm-about",
            name: "atmosphereAbout",
            component: () => import("@/views/Fun/Atmosphere.fm/About.vue")
        },
        { path: "/:catchAll(.*)", redirect: "/" }
    ]
})

export default router
