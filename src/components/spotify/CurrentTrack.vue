<template>
  <div
    v-if="track"
    class="mini-player hidden lg:flex"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <a :href="track.externalUrl" target="_blank">
      <div class="artwork-container">
        <img
          :src="track.cover"
          :alt="track.name"
          class="artwork spinning"
        />
      </div>

      <div
        class="info-container"
        :class="{ expanded: isExpanded }"
      >
        <div class="info">
          <p class="track-link">
            {{ track.name }}
            <small>{{ track.artist }}</small>
          </p>
        </div>
      </div>
    </a>
    <div class="sub-info-wrapper">
      <transition name="fade-slide">
        <div
          v-if="delayedExpanded"
          class="flex gap-1 items-center text-gray-400 text-xs"
        >
          <p>Now playing on Spotify</p>
          <WaveForm />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from "vue"
  import WaveForm from "./WaveForm.vue"

  const isExpanded = ref(false)
  const delayedExpanded = ref(false)
  let timer: number | null = null

  watch(isExpanded, (newVal) => {
    if (newVal) {
      timer = window.setTimeout(() => {
        delayedExpanded.value = true
      }, 1000)
    } else {
      if (timer !== null) {
        clearTimeout(timer)
      }
      delayedExpanded.value = false
    }
  })

  const track = ref()

  async function fetchCurrentTrack() {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/spotify/current-track`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch current track")
      }

      const data = await response.json()
      if (!data.name) {
        throw new Error("No track data found")
      }

      track.value = data
    } catch {
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

  .mini-player a,
  .track-link,
  .track-link * {
    text-decoration: none !important;
  }

  .mini-player a {
    display: flex;
    align-items: center;
    border: none;
    color: inherit;
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
    border: none;
    outline: none;
  }

  .track-link small {
    opacity: 0.7;
    font-size: 0.65rem;
    margin-top: 1px;
  }

  .sub-info-wrapper { 
    position: absolute; 
    right: 0; 
    top: 100%; 
    white-space: nowrap; 
    width: auto; 
    max-width: none;
    margin-top: 0.5rem;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  .fade-slide-enter-to,
  .fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
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

  body.dark .mini-player:hover {
    background: rgba(255, 255, 255, 0.01);
  }

  @media (hover: hover) {
    .mini-player:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  @media (max-width: 600px) {
    .info-container {
      max-width: 150px;
    }
  }
</style>
