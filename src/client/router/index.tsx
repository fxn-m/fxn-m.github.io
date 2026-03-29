import { createHashRouter, Navigate } from "react-router-dom"

import App from "@/client/app"
import ContactPage from "@/client/pages/contact-page"
import FunPage from "@/client/pages/fun-page"
import HomePage from "@/client/pages/home-page"
import ProjectPage from "@/client/pages/project-page"
import TabOverflow from "@/client/pages/tab-overflow"
import WritingPage from "@/client/pages/writing-page"
import WritingPost from "@/client/pages/writing-post"

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "writing",
        element: <WritingPage />
      },
      {
        path: "writing/:slug",
        element: <WritingPost />
      },
      {
        path: "fun",
        element: <FunPage />
      },
      {
        path: "fun/tab-overflow",
        element: <TabOverflow />
      },
      {
        path: "fun/:name",
        element: <ProjectPage />
      },
      {
        path: "contact",
        element: <ContactPage />
      },
      {
        path: "*",
        element: <Navigate replace to="/" />
      }
    ]
  }
])

export default router
