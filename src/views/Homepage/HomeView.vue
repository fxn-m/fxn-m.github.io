<template>
  <div id="content">
    <br>
    <p>Welcome to my plot of internet real estate.</p>
    <ul>
      <li>
        <RouterLink to="/about">About Me</RouterLink>
      </li>
      <li>
        <RouterLink to="/blog">Blog</RouterLink>
      </li>
      <li>
        <RouterLink to="/fun" id="fun">Fun</RouterLink>
      </li>
      <li>
        <RouterLink to="/contact">Contact</RouterLink>
      </li>
    </ul>
  </div>
</template>


<style scoped>

ul {
  list-style-type: none;
  margin-top: 30px;
}

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