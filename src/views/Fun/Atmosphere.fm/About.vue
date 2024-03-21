<template>
  <div id="content">
    <h3 id="tutorial">User guide</h3>
    <ol>
      <li>
        Go to
        <a href="http://fxn-m.com/atmosphere.fm">Atmosphere.fm</a> (supported on
        desktop/laptop).
      </li>
      <li>
        Enable location services: the app needs to figure out the weather near
        you!.
      </li>
      <li>
        You should see a page like this (images coming soon). Now's a good time
        to make sure your volume isn't too high because music will automatically
        start playing after you log in.
      </li>
      <li>
        Login with your Spotify account. You’ll need a premium subscription for
        this app to work - the same goes for any application built on Spotify’s
        API and SDK.
      </li>
      <li>
        Once you’re logged in, music will start playing. You can control audio
        either with your keyboard:
        <ul class="keymap">
          <li>Spacebar or Enter - Play/Pause</li>
          <li>RightArrow - Next track</li>
          <li>
            LeftArrow - Prev track or with the clickable user interface in the
            bottom left corner. Hopefully it’s quite intuitive. Clicking the
            heart will add the current song to your liked songs. If it’s already
            in your liked songs, it will remove it, so be careful!
          </li>
        </ul>
      </li>
      <li>
        For a better experience, go fullscreen by clicking the full screen link
        that appears at the top of the page. Or don’t, your call. You can always
        revert by pushing Esc, and if you change your mind and do want to go
        full screen, there are
        <a
          href="https://www.google.com/search?q=how+do+i+go+full+screen+on+my+browser&oq=how+do+i+go+full+screen+on+my+browser&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORigATIHCAEQIRigATIHCAIQIRigAdIBCDY2MTZqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8"
          >other ways</a
        >.
      </li>
      <li>
        See what’s playing by clicking on the Now Playing dropdown at the
        top-left of the page. Clicking it will reveal a side-bar showing all the
        tracks in the current playlist. Clicking on a track will play it.
      </li>
      <li>
        Hover around the icon (”atmosphere”) in the middle of the page. A menu
        will appear. Click on the icon to keep the menu there when you move your
        mouse away. This menu lets you choose what plays depending on the
        weather. Defaults have been set to be Spotify mixes. These were chosen
        because they are relevant to their description (and hopefully to the
        atmosphere), they are tailored to your tastes, and are updated daily.
      </li>
      <li>
        The atmosphere will update depending on the weather detected near you,
        but if you really can’t wait for a sunny day to come around, the
        drop-down in the top right lets you choose.
      </li>
      <li>
        If you want to hide the tracklist for a slightly more minimal
        experience, click the playlist name in the track description section.
      </li>
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

li {
  transition: all 0.5s ease-in-out;
}

a {
  transition: all 0.5s ease-in-out;
}

ul {
  margin-left: 20px;
  line-height: 1.5em;
  transition: all 0.5s ease-in-out;
}

ul li {
  list-style-type: disc;
  transition: all 0.5s ease-in-out;
}

body.dark ul {
  transition: all 0.5s ease-in-out;
}

ol,
li {
  line-height: 1.5em;
  margin: 1em 0;
}

ol {
  padding: 0 0 0 1.3em;
}
</style>
