<script setup lang="ts">
import { onMounted, ref } from "vue"
const experienceRef = ref()

const experiences = [
  {
    id: 1,
    date: "2023-Present",
    detail: "Freelance Full-Stack Developer @ Sanctuary Health",
  },
  {
    id: 2,
    date: "2022",
    detail: "Technical Research Intern @ Dyson (3 months)",
  },
  {
    id: 3,
    date: "2020-2021",
    detail: "Mechanical Engineer @ Babcock (12 months)",
  },
  { id: 4, date: "2019", detail: "Front of House @ Hotel Du Vin (2 months)" },
  { id: 5, date: "2018", detail: "Summer Intern @ Arup (2 months)" },
]

onMounted(() => {
  experienceRef.value = experiences
})
</script>

<template>
  <div id="content">
    <p>
      You've reached Felix Newport-Mangell's homepage. Welcome to my plot of
      internet real estate!
    </p>
    <p>
      I studied Engineering Design at the University of Bristol, graduating in
      2023. There I had the flexibility to work on projects across domains,
      exploring fields from product design to artificial intelligence. It's like
      a 'liberal arts' approach but within the engineering discipline.
    </p>
    <p>
      While studying, I picked up programming, and began incorporating it in as
      many projects as I could. My gateway was data science & machine learning,
      but soon became interested in full-stack web development, building on the
      worlds largest platform: the internet.
    </p>
    <p>
      Now, I'm at <a href="https://sanctuaryhealth.io">Sanctuary Health</a> as a
      freelance full-stack developer.
    </p>
    <p id="experience">Experience</p>
    <ul>
      <li v-for="exp in experienceRef" :key="exp.id">
        <span class="date">{{ exp.date }}</span> &bull; {{ exp.detail }}
      </li>
    </ul>
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
</style>
