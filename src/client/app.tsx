import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import NavBar from "@/client/components/nav-bar"
import CurrentTrack from "@/client/components/spotify/current-track"

export default function App() {
  const location = useLocation()

  useEffect(() => {
    console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
    console.info("...il faut cultiver notre jardin 🌱")
  }, [])

  useEffect(() => {
    const isFunRoute =
      location.pathname === "/fun" || location.pathname.startsWith("/fun/")

    document.documentElement.classList.toggle("fun-route", isFunRoute)
    document.body.classList.toggle("fun-route", isFunRoute)

    return () => {
      document.documentElement.classList.remove("fun-route")
      document.body.classList.remove("fun-route")
    }
  }, [location.pathname])

  return (
    <div className="mx-auto flex min-h-dvh w-11/12 flex-col px-0 sm:w-xl lg:w-4xl">
      <NavBar />
      <main className="flex flex-1 flex-col sm:pb-8" id="app-shell">
        <Outlet />
      </main>
      <CurrentTrack />
    </div>
  )
}
