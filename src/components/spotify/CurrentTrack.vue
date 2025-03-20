<template>
  <div v-if="track" class="mini-player" @mouseenter="isExpanded = true" @mouseleave="isExpanded = false">
    <a :href="track.externalUrl" target="_blank">
      <div class="artwork-container">
        <img :src="track.cover" :alt="track.name" class="artwork spinning" />
      </div>

      <div class="info-container" :class="{ expanded: isExpanded }">
        <div class="info">
          <p class="track-link">
            {{ track.name }}
            <small>{{ track.artist }}</small>
          </p>
        </div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue"

  const isExpanded = ref(false)
  const track = ref()

  async function fetchCurrentTrack() {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/spotify/current-track`)
      if (!response.ok) throw new Error("Failed to fetch current track")

      const data = await response.json()
      if (!data.name) throw new Error("No track data found")

      console.log(`Currently, I'm listening to ${data.name} by ${data.artist} 🎵`)
      track.value = data
    } catch {
      console.log("Currently, I'm not listening to anything.")
      track.value = null
    }
  }

  onMounted(() => {
    fetchCurrentTrack()
    setInterval(fetchCurrentTrack, 30000)
  })
</script>

<style scoped>
  .mini-player {
  z-index: 2;
  position: fixed;
  top: 1rem;
  right: 1rem;
  backdrop-filter: blur(8px);
  padding: 0.25rem;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  height: fit-content;
  width: fit-content;
  max-width: calc(100% - 2rem);
}

body.dark .mini-player:hover {
  background: rgba(255, 255, 255, 0.01);
}

.mini-player a {
  display: flex;
  align-items: center;
  text-decoration: none;
  border: none;
}

.artwork-container {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  flex-shrink: 0;
}

.artwork {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spinning {
  animation: spin 20s linear infinite;
}

.info-container {
  max-width: 0;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-container.expanded {
  max-width: 125px;
  margin-left: 0.75rem;
}

.info {
  padding-right: 0.75rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

.track-link {
  display: flex;
  flex-direction: column;
  color: black;
  line-height: 1.2;
  margin: 0;
}

.track-link small {
  opacity: 0.7;
  font-size: 0.65rem;
  margin-top: 1px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

body.dark .track-link {
  color: white;
}

body.dark .mini-player {
  background: rgba(255, 255, 255, 0.01);
}

@media (hover: hover) {
  .mini-player:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

@media (max-width: 1024px) {
  .mini-player {
    position: relative;
    display: flex;
    width: fit-content;
    padding: 0.5rem;
    top: 0;
    right: 0;
  }

  .mini-player a {
    gap: 0.5rem;
    width: auto;
  }

  .info-container {
    width: auto;
    margin-left: 0;
    max-width: 300px;
  }

  .info {
    padding-right: 0.75rem;
  }

}

@media (max-width: 600px) {
  .info-container {
    max-width: 150px;
  }
}
</style>
