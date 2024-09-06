<template>
  <div id="content">
    <p style="font-size: 20px">Hey 👋</p>
    <p>My name's Felix.</p>
    <p>I'm a full-stack engineer based in London. </p>
    
    <p>
      Born and raised in Chippenham, East Cambridgeshire.
    </p> 
    
    <p> 
        Went to school in Cambridge, and studied Engineering Design at the University of Bristol.
    </p>

    <br />

    <p>
      I discovered that software development was my passion towards the end of my studies. In my final year I went through Codecademy and with some of what I learned, I built <a href="https://fxn-m.com/atmosphere.fm" target="_blank">atmosphere.fm</a>.
    </p>

    <p>
      Straight after graduating in 2023, I solo-backpacked around Asia for a few months, before I fractured my collarbone in a motorbike accident. <span 
      class="asterisk" 
      @mouseenter="showPopover" 
      @mouseleave="hidePopover"
    >*
      <span v-if="isPopoverVisible" class="popover">
        Thankfully, I made a full recovery and learned to always wear a helmet!
      </span>
    </span>
    </p>
    
    <p>
      Over the past year I freelanced. Between September and May I spent a lot of time at <a href="https://www.sanctuaryhealth.io/"
        target="_blank">Sanctuary Health</a>, implementing features powered by LLMs and learning Next.js. 
    </p>

    <br />

    <p>
      Having returned to the U.K., I'm now looking for a full-time role in London as a product/full-stack engineer.
    </p>

    <p>
      If you're looking for one, I'd love to chat about how I might help you build your product.
    </p>

    <p>Email me at <a href="mailto:fnewportmangell@gmail.com">fnewportmangell@gmail.com</a> or <RouterLink to="/contact">get in touch</RouterLink> here.
    Here's my <a href="https://fxn-m.notion.site/resum-c5ac0413bd41470897875c72f55013f4" target="_blank">resumé</a>.
    </p>

    <br />

    <p>
      In my spare time I like to read about technology, philosophy, and
      economics. I've started
      <RouterLink to="/writing">writing</RouterLink> about ideas I get from
      reading and working on projects.
    </p>
    
    <footer>
      <p>
        Last updated: 06-09-2024
      </p>
    </footer>

  </div>



</template>

<script setup>
import { ref } from 'vue'

const isPopoverVisible = ref(false)

const showPopover = () => {
  isPopoverVisible.value = true
}

const hidePopover = () => {
  isPopoverVisible.value = false
}
</script>

<style scoped>
span.date {
  font-weight: bold;
}

li {
  margin-top: 1rem;
}

h3 {
  font-size: 1.1rem;
}

#experience {
  font-weight: bold;
  margin-top: 2rem;
  width: 100%;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 2px;
  transition: all 0.5s ease-in-out;
}

body.dark #experience {
  border-bottom: 1px solid #4f4f4f;
}

footer {
  font-size: 0.8rem;
  color: #b3b3b3;
  background-color: inherit;
  z-index: 1;
  text-align: right;
  position: relative;
  left: 0;
  bottom: 0;
  width: 100%;
}

footer p {
  color: inherit;
  margin-top: 5rem;
  padding: 0.5rem;
}

.asterisk {
  position: relative;
  cursor: pointer;
  color: #d97757;
}

.asterisk .popover {
  font-size: 0.9em;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f9f9f9;
  color: #333;
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

</style>
