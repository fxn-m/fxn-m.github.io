<script setup lang="ts">
</script>

<template>
  <div id="content">
    <ul>
      <li>
        <a href="https://www.fxn-m.com/atmosphere.fm" target="_blank">Atmosphere.fm</a> - pathetic fallacy for spotify playlists.
      </li>
      <li>
        <RouterLink to="/fun/:anyhtml">AnyHTML</RouterLink> - fetches and renders HTML with a CORS proxy.
      </li>
      <li>
        <RouterLink to="/fun/:reading-suggestion">Reading Suggestion</RouterLink> - a random reading suggestion from my reading list.
      </li>

    </ul>
  </div>
</template>

<style scoped>
ul li {
  line-height: 1.5rem;
  margin: 2rem 0;
}

</style>

