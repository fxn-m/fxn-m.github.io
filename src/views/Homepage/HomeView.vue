<template>
  <div id="content">
    <p style="font-size: 20px">Hey 👋</p>
    <p>My name's Felix.</p>
    <p>I'm an engineer based in Cambridge/London, open to work.</p>
    <p>
      For the past few months, I've been freelancing as a developer, building AI
      wrappers at
      <a href="https://www.sanctuaryhealth.io/">Sanctuary Health</a>.
    </p>
    <p>
      Before that, I studied Engineering Design, and did a research internship
      at Dyson where I worked on designing high-performance lithium-battery
      packs (see my full
      <a
        href="https://fxn-m.notion.site/resum-c5ac0413bd41470897875c72f55013f4"
        target="_blank"
        >resumé</a
      >).
    </p>
    <p>
      <RouterLink to="/contact">Get in touch</RouterLink> if you'd like a call
      and I might be able to help you with your project!
    </p>
    <p>
      Outside of building stuff I like to read about technology, philosophy, and
      economics. I've started
      <RouterLink to="/writing">writing</RouterLink> about ideas I get from
      reading and working on projects.
    </p>
    <p></p>
    <footer>Last updated: 29-07-2024</footer>
  </div>
</template>

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
  margin: 2rem 0;
  font-size: 0.8rem;
  color: #b3b3b3;
  text-align: right;
}
</style>
