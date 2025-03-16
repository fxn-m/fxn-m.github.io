<template>
  <div id="content">
    <p>
      Feel free to get in touch using the form below, or just send me an
      <a href="mailto:fnewportmangell@gmail.com">e-mail</a>
    </p>
    <form @submit.prevent="sendEmail()">
      <div id="input-fields">
        <input type="name" id="name" v-model="name" autocomplete="nope" placeholder="Your name" />
        <input type="email" id="email" v-model="email" autocomplete="off" placeholder="Your email" required />
      </div>
      <textarea id="message" v-model="message" rows="4" placeholder="Your message" required @keydown.enter.prevent="submitFormOnEnter"></textarea>
      <button type="submit">Send{{ sendingEllipses }}</button>
    </form>
    <ContactToast :sent="toastSent" v-if="toastVisible" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import axios from "axios"
  import ContactToast from "./Toast.vue"

  const email = ref("")
  const message = ref("")
  const name = ref("")
  const toastVisible = ref(false)
  const toastSent = ref(false)
  const sendingEllipses = ref("")

  const showToast = (sent: boolean) => {
    toastVisible.value = true
    toastSent.value = sent
    setTimeout(() => {
      toastVisible.value = false
    }, 5000)
  }

  const sendEmail = () => {
    let counter = 0
    const ending = "ing"
    const sendingLoader = setInterval(() => {
      if (counter > 6) {
        sendingEllipses.value = "ing."
        counter = 3
      } else if (counter > 2) {
        sendingEllipses.value += "."
      } else {
        sendingEllipses.value += ending[counter]
      }
      counter++
    }, 400)

    const clearUp = (success: boolean) => {
      clearInterval(sendingLoader)
      sendingEllipses.value = ""

      if (success) {
        email.value = ""
        message.value = ""
        name.value = ""
      }
    }

    axios
      .post("https://fxnm-backend-5c0b9af08231.herokuapp.com/send-email", {
        name: name.value,
        email: email.value,
        message: message.value
      })
      .then(() => {
        showToast(true)
        clearUp(true)
      })
      .catch(() => {
        showToast(false)
        clearUp(false)
      })
  }

  const submitFormOnEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      sendEmail()
    }
  }
</script>

<style scoped>
  div#input-fields {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

form {
    display: flex;
    flex-direction: column;
    margin: 1.5em 0;
    align-items: left;
    transition:
        color 1s ease-in-out,
        background-color 0.5s ease-in-out,
        border-color 0.5s ease-in-out;
    gap: 1em;
    border-radius: 5px;
}

input,
textarea {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    transition:
        color 1s ease-in-out,
        background-color 0.5s ease-in-out,
        border-color 0.5s ease-in-out;
    font-size: 0.9em;

    &:focus,
    &:focus-visible {
        outline: 1px auto rgba(179, 179, 179, 0.449);
    }
}

input:-webkit-autofill,
textarea:-webkit-autofill {
    background-color: inherit !important;
}

textarea {
    resize: vertical;
    min-height: 100px;
}

body.dark input,
body.dark textarea {
    border: 1px solid #9ea9eb69;
    background-color: #0d121a;
    color: #c3e3f1;
}

button {
    margin-left: auto;
    min-width: 200px;
}

@media (max-width: 600px) {
    p {
        font-size: small;
    }
}
</style>
