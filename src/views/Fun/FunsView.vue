<template>
  <div id="content">
    <ul>
      <li>
        <a href="https://www.fxn-m.com/atmosphere.fm" target="_blank"
          >Atmosphere.fm</a
        >
        - <span>soundtracks powered by skies. </span>
        <span class="subText"
          ><a :href="`#/atmosphere.fm/about`">(About)</a></span
        >
      </li>
      <li>
        <RouterLink to="/fun/:anyhtml">AnyHTML</RouterLink> -
        <span>get HTML from anywhere with a CORS proxy.</span>
      </li>
      <li>
        <RouterLink to="/fun/:readme">ReadMe</RouterLink> -
        <span>suggest a random item from my Notion reading list.</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
const frontendUrl = ref("")
frontendUrl.value = import.meta.env.VITE_FRONTEND_URL
</script>

<style scoped>
span {
  color: #828282;
  font-size: 0.95em;
  transition: color 1s ease-in-out;
}

span.subText {
  color: #afafaf;
  font-size: small;
  margin-left: 15px;
}

body.dark span {
  color: #afafaf;
  transition: color 1s ease-in-out;
}

body.dark span.subText a {
  color: #cecece;

  &:hover {
    color: white;
  }
}
</style>
