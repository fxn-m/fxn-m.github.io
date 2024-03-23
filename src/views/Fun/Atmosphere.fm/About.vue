<template>
  <div id="content">
    <h3 id="tutorial">User guide</h3>
    <ol>
      <li>
        Go to
        <a href="http://fxn-m.com/atmosphere.fm">fxn-m.com/atmosphere.fm</a>.
      </li>
      <li>
        Enable location services: the app needs to figure out the weather near
        you!
      </li>
      <img
        src="/public/images/enable-location.png"
        alt="Enable location services"
      />
      <li>
        You should see a page like this. Now's a good time to make sure your
        volume isn't too high because music will automatically start playing
        after you log in.
      </li>
      <img src="/public/images/atmosphere-fm.png" alt="Atmosphere.fm" />
      <li>
        Login with your Spotify account. You’ll need a premium subscription for
        this app to work - the same goes for any application built on Spotify’s
        API and SDK.
      </li>
      <img src="/public/images/spotify-login.png" alt="Spotify login" />
      <li>
        Once you’re logged in, music will start playing. You can control audio
        either with your keyboard, or with the clickable user interface in the
        bottom left corner.:
        <ul class="keymap">
          <li>Spacebar or Enter - Play/Pause</li>
          <li>RightArrow - Next track</li>
          <li>LeftArrow - Prev track</li>
        </ul>
        Hopefully it’s quite intuitive.
        <p>
          Clicking the heart will add the current song to your liked songs. If
          it’s already in your liked songs, it will remove it, so be careful!
        </p>
      </li>
      <img src="/public/images/playback-controls.png" alt="Playback controls" />
      <li>
        For a better experience, go fullscreen! This includes removing the
        bookmarks and address bars. If you're not sure how to do this,
        <a
          href="https://www.google.com/search?q=how+do+i+go+full+screen+on+my+browser&oq=how+do+i+go+full+screen+on+my+browser&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORigATIHCAEQIRigATIHCAIQIRigAdIBCDY2MTZqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8"
          target="_blank"
          >start here</a
        >.
      </li>
      <li>
        See what’s playing by clicking on the Now Playing dropdown at the
        top-left of the page. Clicking it will reveal a side-bar showing all the
        tracks in the current playlist. Clicking on a track will play it.
      </li>
      <img src="/public/images/now-playing.png" alt="Now playing" />
      <li>
        The atmosphere will update depending on the weather detected near you,
        and the playlist that plays will update depending on the atmosphere, but
        if you really can’t wait for a sunny day to come around, the drop-down
        in the top right lets you choose.
      </li>
      <div>
        <img src="/public/images/i-wish-it-was-1.png" alt="Weather dropdown" />
        <img
          src="/public/images/i-wish-it-was-2-2.png"
          alt="Weather dropdown"
        />
      </div>
      <li>
        <p>
          Hover around the icon (”atmosphere”) in the middle of the page. A menu
          will appear. Click on the icon to keep the menu there when you move
          your mouse away. This menu lets you choose what plays depending on the
          weather.
        </p>
        <p>
          Defaults have been set to be Spotify mixes because they are relevant
          to their description (and hopefully to the atmosphere), tailored to
          your tastes, and are updated daily. Feel free to customise them to
          your liking.
        </p>
      </li>
      <img src="/public/images/atmosphere-menu.png" alt="Atmosphere menu" />
      <img
        src="/public/images/customize-playlist.png"
        alt="Customize Playlist"
      />
    </ol>
    <h3 id="howitworks">How It Works</h3>
    <p>The app has two main parts:</p>
    <ol>
      <li>
        React App, hosted on GitHub Pages (Front-End). This is where all the
        HTML, CSS, and TypeScript that powers the interactive nature of the
        application is written.
      </li>
      <li>
        Express.js server, hosted on Heroku (Back-end). The backend is used as a
        proxy, obscuring the users from sensitive data like the secrets used to
        get data from the APIs. User authentication is done through this server.
      </li>
    </ol>
    <p>Speaking of which - there are two APIs at the core of the application</p>
    <ol>
      <li>
        The Spotify API is used to fetch Spotify data and allows you to
        customise your experience, selecting a weather-playlist relationship and
        liking songs.
      </li>
      <li>
        The OpenWeather API is used once in every session to detect the user’s
        local weather
      </li>
    </ol>
    <p>
      The Spotify Web Playback SDK allows music to be played through the
      browser, and has a few methods that allow the user to control playback
      (play, pause, skip, volume). These are controlled either via clickable UI
      or keyboard events.
    </p>
    <p>
      There are a few other dependencies that handle general tasks like icons,
      types, and linting, nothing major.
    </p>
    <p>
      If you’re interested in the story of
      <a href="http://Atmosphere.fm">Atmosphere.fm</a> - with some more of the
      gory details - here’s the <strong>blog post</strong> (coming soon).
    </p>
    <h3 id="notes">Notes</h3>
    <p>
      Thanks goes to <a href="https://github.com/basmilius">Bas Milius</a> for
      allowing free use of his icons library -
      <a href="https://bas.dev/work/meteocons">meteocons</a>.
    </p>
    <p>
      If there's anything you'd like to see added to atmosphere.fm,
      <a href="http://fxn-m.com/#/contact">let me know</a>.
    </p>
    <p>
      If you really fancy it - please share the app on your favourite social
      media platform!
    </p>
  </div>
</template>

<style scoped>
h3 {
  color: black;
  transition: color 0.5s;
  font-size: 1.1em;
  margin-top: 1.5em;
  font-weight: bold;
  width: 100%;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 5px;
  transition: all 0.5s ease-in-out;
}

body.dark h3 {
  transition: all 0.5s ease-in-out;
  border-bottom: 1px solid #4f4f4f;
}

ol li,
ol li ul li,
body.dark ol li,
body.dark ol li ul li {
  transition: all 0.5s ease-in-out;
}

a {
  transition: all 0.5s ease-in-out;
}

ul {
  margin-left: 20px;
  line-height: 1.5em;
}

ul.keymap,
ul.keymap li {
  list-style-type: disc;
}

ol,
li {
  line-height: 1.5em;
  margin: 1em 0;
}

ol {
  padding: 0 0 0 1.3em;
}

img {
  width: 500px;
  margin: 2em auto;
  display: block;
  border-radius: 5px;
}
</style>
