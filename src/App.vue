<template>
  <Navbar />
  <RouterView class="text-primary-light dark:text-primary-dark" />
  <CurrentTrack />
  <ServerStatus />
</template>

<script setup lang="ts">
  import { RouterView } from "vue-router"
  import Navbar from "@/components/navbar/Index.vue"
  import CurrentTrack from "@/components/spotify/CurrentTrack.vue"
  import ServerStatus from "@/components/serverStatus/Index.vue"
  console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
</script>
