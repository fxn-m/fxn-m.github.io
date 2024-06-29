<template>
  <div id="content">
    <p>Studied Engineering Design at the University of Bristol.</p>
    <p>
      It's a course than allows students to work on projects across disciplines
      - like a 'liberal arts' for engineers.
    </p>
    <p>
      In my third year, I worked on submarine defence systems at Babock. I
      designed battery packs at Dyson during my internship there.
    </p>
    <p>
      Picked up programming towards the end of my studies and set to writing
      code in as many projects as I reasonably could. I started in data science
      & machine learning, but wanted to build products, so I moved to web
      development.
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
const experienceRef = ref()

const experiences = [
  {
    id: 1,
    date: "2023-2024",
    detail: "Freelance Full-Stack Developer @ Sanctuary Health (8 months)",
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
