<template class="flex flex-col">
  <NavBar />
  <RouterView class="text-primary-light dark:text-primary-dark" />
  <CurrentTrack />
</template>

<script setup lang="ts">
  import { RouterView } from "vue-router"

  import NavBar from "@/client/components/NavBar.vue"
  import CurrentTrack from "@/client/components/spotify/CurrentTrack.vue"

  console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
  console.info("...il faut cultiver notre jardin 🌱")
</script>
