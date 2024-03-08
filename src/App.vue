<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToggleTheme from './components/ToggleTheme.vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <RouterLink v-if="$route.path !== '/'" to="#" @click="navigateToParent" id="back-arrow">
    <FontAwesomeIcon icon="fa-solid fa-arrow-left" size="2x" />

  </RouterLink>

  <header>
    <div id="icons">
      <a href="https://github.com/fxn-m" target="_blank">
        <FontAwesomeIcon icon="fa-brands fa-github" size="2x" class="fa-github" />
      </a>
      <a href="https://x.com/fxn__m" target="_blank">
        <FontAwesomeIcon icon="fa-brands fa-x-twitter" size="2x" class="fa-twitter" />
      </a>
      <a href="https://www.strava.com/athletes/29743058" target="_blank">
        <FontAwesomeIcon icon="fa-brands fa-strava" size="2x" class="fa-strava" />
      </a>
      <a href="https://www.polarsteps.com/FelixNewportMangell" target="_blank">
        <FontAwesomeIcon icon="fa-regular fa-compass" size="2x" class="fa-compass" />
      </a>
      <ToggleTheme />
    </div>
  </header>

  <div id="main">
    <h2><span style="white-space: nowrap">
        <RouterLink to="/" style="border: none; font-weight: bold;">fxn-m</RouterLink>
      </span>
      <span style="user-select: none;">{{ pageTitle }}</span>
    </h2>
    <RouterView />
  </div>
</template>


<script lang="ts">
export default {
  computed: {
    pageTitle() {
      const currentRoute = this.$route.path !== '/' ? this.$route.path : '';
      return `${currentRoute}`.replace(':', '');
    },
  },
  methods: {
    navigateToParent() {
      const pathSegments = this.$route.path.split('/');
      pathSegments.pop();
      const parentPath = pathSegments.join('/') || '/';
      this.$router.push(parentPath);
    }
  }
};
console.log(`
   __                                                 
  / _|_  ___ __        _ __ ___    ___ ___  _ __ ___  
 | |_\\ \\/ / '_ \\ _____| '_ ' _ \\  / __/ _ \\| '_ ' _ \\ 
 |  _|>  <| | | |_____| | | | | || (_| (_) | | | | | |
 |_| /_/\\_\\_| |_|     |_| |_| |_(_)___\\___/|_| |_| |_|              
                                                     
`)
</script>
