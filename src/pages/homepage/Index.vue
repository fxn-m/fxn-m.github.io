<template>
  <div id="content">
    <p style="margin-top: 0">
      Founding Engineer @
      <a href="https://kenobi.ai" target="_blank">Kenobi</a>
      (YC W22).
    </p>

    <p>Based in London.</p>

    <footer>
      <p>Last updated: {{ buildDate }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { format } from "date-fns"

  const buildDate = format(
    // eslint-disable-next-line no-undef
    new Date(__BUILD_DATE__),
    "dd-MM-yyyy"
  )
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

p {
    margin: 0.4em 0;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: inherit;
    z-index: 1;
    text-align: right;
    position: relative;
    left: 0;
    bottom: 0;
    width: 100%;
    margin-top: auto;
    padding: 4rem 0 1rem 0;
}

footer p {
    color: #b3b3b3;
    font-size: 0.8rem;
    margin-left: auto;
}

.asterisk {
    display: inline-block;
    position: relative;
    text-align: center;
    right: 20px;
    width: 100px;
    transform: translateX(-25px);
    cursor: pointer;
    color: #d97757;
    font-size: larger;
}

.asterisk .popover {
    font-size: 14px;
    text-wrap: wrap;
    min-width: 500px;
    max-width: 800px;
    position: absolute;
    text-align: left;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f9f9f9;
    color: #333;
    border: 1px solid #ccc;
    padding: 5px 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

body.dark .asterisk .popover,
body.dark .asterisk .popover a {
    color: #333;
    background-color: #bbbbbb;
    border-color: #4f4f4f;
}

.popover .popover-close {
    display: none;
    color: #555555;
}

.popover .inner-asterisk {
    display: none;
}

@media (max-width: 800px) {
    .asterisk .popover {
        position: fixed;
        bottom: 2%;
        left: 5vw;
        max-width: none;
        min-width: 10px;
        width: calc(90vw - 40px);
        padding: 20px;
        transform: none;
        border-radius: 0;
        white-space: normal;
        z-index: 1000;
        border-radius: 15px;
    }

    .popover .popover-close {
        display: block;
        position: absolute;
        top: 5px;
        right: 9px;
        cursor: pointer;
    }

    .popover .inner-asterisk {
        display: block;
        position: absolute;
        top: 15px;
        left: 8px;
        font-size: 1.5em !important;
    }
}
</style>
