<template>
  <div id="content">
    <div class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-image">
          <img :src="project.image" :alt="project.title" />
          <a v-if="project.id === 1" :href="project.link" target="_blank">
            <div class="project-overlay">
              <h3>
                <a
                  v-if="project.id === 1"
                  :href="project.link"
                  target="_blank"
                  >{{ project.title }}</a
                >
                <RouterLink v-else :to="project.link">{{
                  project.title
                }}</RouterLink>
              </h3>
              <a
                v-if="project.aboutLink"
                :href="project.aboutLink"
                class="about-link"
                >About</a
              >
            </div>
          </a>
          <RouterLink v-else :to="project.link">
            <div class="project-overlay">
              <h3>
                <a
                  v-if="project.id === 1"
                  :href="project.link"
                  target="_blank"
                  >{{ project.title }}</a
                >
                <RouterLink v-else :to="project.link">{{
                  project.title
                }}</RouterLink>
              </h3>
              <a
                v-if="project.aboutLink"
                :href="project.aboutLink"
                class="about-link"
                >About</a
              >
            </div>
          </RouterLink>
        </div>
        <div class="project-info">
          <p>{{ project.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const frontendUrl = ref(import.meta.env.VITE_FRONTEND_URL)

const projects = ref([
  {
    id: 1,
    title: "Atmosphere.fm",
    description: "Soundtracks shaped by skies",
    image: "/images/sunset2.webp",
    link: "https://www.fxn-m.com/atmosphere.fm",
    aboutLink: "#/fun/atmosphere.fm-about",
  },
  {
    id: 2,
    title: "ReadMe",
    description: "For reading at random",
    image: "/images/image.webp",
    link: "/fun/:readme",
    aboutLink: "",
  },
  {
    id: 3,
    title: "Hall of Fame",
    description: "Test your luck",
    image: "/images/hof.webp",
    link: "/fun/:hall-of-fame",
    aboutLink: "",
  },
  // Add more projects as needed
])
</script>

<style scoped>
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 3rem 0;
}

.project-card {
  border-radius: 8px;
  border: 1px solid white;
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
  overflow: hidden;
  transition: all 0.5s ease-in-out;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.project-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 5/4;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-overlay h3 {
  margin: 0;
}

.project-overlay h3 a {
  color: #cecece;
  text-decoration: none;
  font-size: 1.5rem;
  border: none;
  padding: 0rem 1rem 1rem 0rem;

  transition: color 0.3s ease-in-out;
}

.project-overlay h3 a:hover {
  color: #fff;
}

.about-link {
  align-self: flex-end;
  color: #cecece;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: none;
  transition: background-color 0.3s ease-in-out;
  border-radius: 15px;
}

.about-link:hover {
  color: #fff;
}

.project-info {
  padding: 1rem;
}

.project-info p {
  color: #3c3c3c;
  margin: 0;
  text-align: center;
}

body.dark .project-card {
  border: 1px solid #4f4f4f;
  transition: all 0.5s ease-in-out;
}

body.dark .project-info p {
  color: #ababab;
}

@media screen and (max-width: 1024px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 4rem;
  }
}

@media screen and (max-width: 700px) {
  .project-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 2rem;
  }

  .project-info {
    display: none;
  }
}
</style>
