<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToggleTheme from './components/ToggleTheme.vue';
</script>

<template>
  <RouterLink v-if="$route.path !== '/'" to="#" @click="$router.go(-1)" id="back-arrow"><i
      class="fa-solid fa-arrow-left fa-2x"></i></RouterLink>

  <header>
    <div id="icons">
      <a href="https://github.com/fxn-m" target="_blank"><i class="fa-brands fa-github fa-2x"></i></a>
      <a href="https://twitter.com/fxn__m" target="_blank"><i class="fa-brands fa-twitter fa-2x"></i></a>
      <a href="https://stackoverflow.com/users/16246457/fxn-m" target="_blank"><i
          class="fa-brands fa-stack-overflow fa-2x"></i></a>
      <a href="https://www.strava.com/athletes/29743058" target="_blank"><i class="fa-brands fa-strava fa-2x"></i></a>
      <a href="https://www.linkedin.com/in/felix-newport-mangell-0a89a8150/" target="_blank"><i
          class="fa-brands fa-linkedin-in fa-2x"></i></a>
      <a href="https://www.kaggle.com/felixnewportmangell" target="_blank" id="kaggle"><i
          class="fa-brands fa-kaggle fa-2x"></i></a>
    </div>
    <ToggleTheme />
  </header>

  <div id="main">
    <h2><span style="white-space: nowrap">
        <RouterLink to="/" style="border: none; font-weight: bold;">fxn-m</RouterLink>
      </span>
      <span>{{ pageTitle }}</span>
    </h2>
    <RouterView />
  </div>
</template>


<script lang="ts">
export default {
  computed: {
    pageTitle() {
      // Use the $route object to access the current route's path
      const currentRoute = this.$route.path !=='/' ? this.$route.path : '';
      return `${currentRoute}`.replace(':', '');
    },
  },
};
</script>

