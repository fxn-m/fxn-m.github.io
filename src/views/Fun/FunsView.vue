<script setup lang="ts">
</script>

<template>
  <div id="content">
    <ul>
      <li>
        <a href="https://www.fxn-m.com/atmosphere.fm" target="_blank">Atmosphere.fm</a> - <span>pathetic fallacy for spotify playlists.</span>
      </li>
      <li>
        <RouterLink to="/fun/:anyhtml">AnyHTML</RouterLink> - <span>get HTML from anywhere with a CORS proxy.</span>
      </li>
      <li>
        <RouterLink to="/fun/:readme">ReadMe</RouterLink> - <span>suggest a random item from my Notion reading list.</span>
      </li>

    </ul>
  </div>
</template>

<style scoped>
ul li {
  line-height: 1.5rem;
  margin: 2rem 0;
}

span {
  color: #828282;
  font-size: 0.95em;
  transition: color 1s ease-in-out;
}

body.dark span {
  color: #afafaf;
  transition: color 1s ease-in-out;
}

</style>

