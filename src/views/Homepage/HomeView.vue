<template>
  <div id="content">
    <ul>
      <li>
        <RouterLink to="/about">About</RouterLink>
      </li>
      <li>
        <RouterLink to="/fun" id="fun">Fun</RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
#fun:hover {
  animation: lightColorCycle 5s infinite;
}

body.dark #fun:hover {
  animation: darkColorCycle 5s infinite;
}

@keyframes lightColorCycle {
  0% {
    color: black;
  }

  25% {
    color: blue;
  }

  50% {
    color: green;
  }

  75% {
    color: yellow;
  }

  100% {
    color: red;
  }
}

@keyframes darkColorCycle {
  0% {
    color: #cecece;
  }

  25% {
    color: rgb(143, 143, 208);
  }

  50% {
    color: rgb(88, 253, 88);
  }

  75% {
    color: rgb(251, 115, 78);
  }

  100% {
    color: rgb(255, 199, 248);
  }
}
</style>
