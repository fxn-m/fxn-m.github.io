import { createRouter, createWebHashHistory } from "vue-router"

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("@/views/Homepage/index.vue")
        },
        {
            path: "/writing",
            name: "writing",
            component: () => import("@/views/Writing/index.vue")
        },
        {
            path: "/writing/:post",
            name: "writingPost",
            component: () => import("@/views/Writing/post.vue"),
            props: true
        },
        {
            path: "/fun",
            name: "funList",
            component: () => import("@/views/Fun/index.vue")
        },
        {
            path: "/fun/:name",
            name: "funItem",
            component: () => import("@/views/Fun/project.vue")
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
