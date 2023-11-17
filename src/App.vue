<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToggleTheme from './components/ToggleTheme.vue';
</script>

<template>
  <RouterLink v-if="$route.path !== '/'" to="#" @click="navigateToParent" id="back-arrow">
      <i class="fa-solid fa-arrow-left fa-2x" style="font-size: 18px;"></i>
    </RouterLink>

  <header>
    <div id="icons">
      <a href="https://github.com/fxn-m" target="_blank"><i class="fa-brands fa-github fa-2x"></i></a>
      <a href="https://x.com/fxn__m" target="_blank"><i class="fa-brands fa-x-twitter fa-2x"></i></a>
      <a href="https://www.strava.com/athletes/29743058" target="_blank"><i class="fa-brands fa-strava fa-2x"></i></a>
    </div>
    <ToggleTheme />
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
      const currentRoute = this.$route.path !=='/' ? this.$route.path : '';
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
</script>

