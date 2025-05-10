<template>

  <div class="notice-container">
     <img src="/rain.svg" class="notice-icon" />
    <h1 class="notice-title">Atmosphere.fm Discontinued</h1>

    <p class="notice-text">
       Due to updates to the Spotify API, the functionality
      of this app can no longer be extended and is no longer
      supported. For more information, visit <a
        href="https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api"
        target="_blank"
        rel="noopener noreferrer"
        class="notice-link"
        > Spotify Web API Changes </a
      >.
    </p>

    <p class="notice-text">
       While it was a great experience and a fun project,
      Atmosphere.fm is now officially discontinued as of
      28-11-2024.
    </p>

    <footer class="notice-footer">
       Thank you for your support.
    </footer>

  </div>

</template>

<style scoped>
  .notice-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 1rem;
    text-align: center;
}

.notice-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 1rem;
}

.notice-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.notice-text {
    font-size: 1rem;
    line-height: 1.75;
    margin-bottom: 2rem;
    max-width: 600px;
}

.notice-link {
    color: #0070f3;
    border: none;
}

.notice-link:hover {
    color: #3392ff;
    border: none;
}

.notice-footer {
    font-size: 0.9rem;
}
</style>

